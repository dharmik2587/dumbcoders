"""
Feature 1: Hackathon Loader (Apify + Direct Unstop Extractor & Daily Automation)
Filename: hackathon_loader_1.py

Extracts active hackathons from Unstop, normalizes all details
(prizes, deadlines, direct Unstop redirection links, mode, themes, organizers),
and syncs them to HackMate PostgreSQL database via internal ingest endpoint.
"""

import os
import sys
import re
import json
import time
import argparse
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

import requests
from bs4 import BeautifulSoup

try:
    from apify_client import ApifyClient
    HAS_APIFY = True
except ImportError:
    HAS_APIFY = False

try:
    import schedule
    HAS_SCHEDULE = True
except ImportError:
    HAS_SCHEDULE = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("hackathon_loader")

# Environment & Default Configs
APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
INGEST_SECRET = os.getenv("N8N_INGEST_SECRET", "6f1937335954a1a0bbd7685ffea7c8189ca4a26f08a7eeaec671b3ad7d9ab895")
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN", "")
APIFY_ACTOR_ID = os.getenv("APIFY_ACTOR_ID", "apify/web-scraper")

UNSTOP_HACKATHONS_API = "https://unstop.com/api/public/opportunity/search-result"
UNSTOP_BASE_URL = "https://unstop.com"


def clean_currency_amount(raw_text: Optional[str]) -> Optional[str]:
    """Extract numeric prize amount from strings like '₹5,00,000' or '$10,000'."""
    if not raw_text:
        return None
    cleaned = re.sub(r"[^\d.]", "", str(raw_text))
    if not cleaned:
        return None
    try:
        val = float(cleaned)
        return f"{val:.2f}"
    except ValueError:
        return None


def parse_date_to_iso(date_str: Optional[str]) -> Optional[str]:
    """Parse raw dates into ISO-8601 with UTC timezone."""
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
        return dt.isoformat()
    except Exception:
        pass

    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d %b %y, %I:%M %p %Z",
        "%d %b %Y, %I:%M %p",
        "%d %b %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(str(date_str).strip(), fmt)
            return dt.replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue

    days_match = re.search(r"(\d+)\s*days?\s*left", str(date_str).lower())
    if days_match:
        days = int(days_match.group(1))
        future_dt = datetime.now(timezone.utc) + timedelta(days=days)
        return future_dt.isoformat()

    return None


def extract_from_unstop_api(limit: int = 100) -> List[Dict[str, Any]]:
    """
    Direct High-Speed Unstop API Extractor.
    Extracts 50-100 real active hackathons from Unstop search results.
    """
    logger.info(f"Extracting active hackathons from Unstop API (target: {limit})...")
    hackathons = []
    page = 1
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://unstop.com/hackathons",
    }

    while len(hackathons) < limit and page <= 5:
        try:
            params = {
                "opportunity": "hackathons",
                "per_page": min(30, limit - len(hackathons)),
                "page": page,
                "oppstatus": "open",
            }
            res = requests.get(UNSTOP_HACKATHONS_API, params=params, headers=headers, timeout=12)
            if res.status_code != 200:
                logger.warning(f"Unstop API returned status {res.status_code} for page {page}")
                break

            data = res.json()
            data_obj = data.get("data", {})
            if isinstance(data_obj, dict):
                items = data_obj.get("data", [])
            elif isinstance(data_obj, list):
                items = data_obj
            else:
                items = []

            if not items:
                logger.info(f"No more items found on Unstop page {page}.")
                break

            for item in items:
                source_id = str(item.get("id") or item.get("slug") or item.get("short_id") or "")
                if not source_id:
                    continue

                title = str(item.get("title") or item.get("name") or "Unstop Hackathon")
                slug = item.get("seo_url") or item.get("public_url") or item.get("slug") or ""
                
                # Build canonical link directly back to Unstop
                if str(slug).startswith("http"):
                    registration_url = str(slug)
                elif slug:
                    registration_url = f"{UNSTOP_BASE_URL}/{slug.lstrip('/')}"
                else:
                    registration_url = f"{UNSTOP_BASE_URL}/hackathons/{source_id}"

                org_val = item.get("organisation")
                if isinstance(org_val, dict):
                    organizer = org_val.get("name")
                elif isinstance(org_val, str):
                    organizer = org_val
                else:
                    organizer = item.get("author") or "Unstop Organizer"

                raw_desc = (
                    item.get("details")
                    or item.get("description")
                    or item.get("short_description")
                    or f"Join {title} on Unstop. Showcase your skills, build projects, and compete for exciting prizes."
                )

                if "<" in str(raw_desc) and ">" in str(raw_desc):
                    description = BeautifulSoup(str(raw_desc), "html.parser").get_text(separator=" ").strip()
                else:
                    description = str(raw_desc).strip()

                # Deadlines & Dates
                reg_req = item.get("regnRequirements", {})
                reg_end = None
                if isinstance(reg_req, dict):
                    reg_end = reg_req.get("end_regn_dt")
                if not reg_end:
                    reg_end = item.get("end_date") or item.get("registration_end_date")

                start_dt = item.get("approved_date") or item.get("start_date") or item.get("updated_at")
                end_dt = item.get("end_date")

                # Prizes
                prizes = item.get("prizes", [])
                prize_display = None
                prize_amount = None
                if isinstance(prizes, list) and prizes:
                    first_prize = prizes[0]
                    if isinstance(first_prize, dict):
                        prize_display = first_prize.get("title") or first_prize.get("prize_amount")
                        prize_amount = clean_currency_amount(str(first_prize.get("amount") or prize_display))
                elif item.get("prizes_total") or item.get("prize_money"):
                    prize_display = str(item.get("prizes_total") or item.get("prize_money"))
                    prize_amount = clean_currency_amount(prize_display)

                # Mode (Online / In-Person / Hybrid)
                region_str = str(item.get("region") or item.get("type") or "Online").lower()
                mode = "Online" if "online" in region_str else "In-Person" if "offline" in region_str else "Hybrid" if "hybrid" in region_str else "Online"
                location = "Online" if mode == "Online" else "India"

                # Team sizes
                team_min = 1
                team_max = 4
                if isinstance(reg_req, dict):
                    team_min = int(reg_req.get("min_team_size") or 1)
                    team_max = int(reg_req.get("max_team_size") or 4)

                # Themes / Tags
                themes = []
                tags_list = item.get("tags") or []
                if isinstance(tags_list, list):
                    for t in tags_list:
                        tag_name = t.get("name") if isinstance(t, dict) else str(t)
                        if tag_name and len(tag_name) <= 50:
                            themes.append(tag_name)
                
                # Check skills
                skills = item.get("required_skills") or []
                tech_stack = []
                if isinstance(skills, list):
                    for s in skills:
                        skill_name = s.get("name") if isinstance(s, dict) else str(s)
                        if skill_name and len(skill_name) <= 50:
                            tech_stack.append(skill_name)

                if not themes:
                    themes = ["AI/ML", "Web Development", "Innovation"]
                if not tech_stack:
                    tech_stack = ["React", "Node.js", "Python", "Full Stack"]

                hackathons.append({
                    "source": "unstop",
                    "sourceId": source_id,
                    "canonicalKey": f"unstop:{source_id}",
                    "title": title.strip()[:200],
                    "description": description[:10000],
                    "organizer": str(organizer)[:200] if organizer else "Unstop",
                    "startAt": parse_date_to_iso(start_dt),
                    "endAt": parse_date_to_iso(end_dt),
                    "registrationDeadlineAt": parse_date_to_iso(reg_end),
                    "timezone": "UTC",
                    "mode": mode,
                    "location": location[:200],
                    "teamSizeMin": team_min,
                    "teamSizeMax": team_max,
                    "prizeAmount": prize_amount,
                    "prizeCurrency": "INR",
                    "prizeDisplay": str(prize_display)[:200] if prize_display else (f"₹{prize_amount}" if prize_amount else "Cash & Certificates"),
                    "themes": themes[:10],
                    "techStack": tech_stack[:8],
                    "registrationUrl": registration_url,
                    "sourceUrl": registration_url,
                    "rawPayload": {"source_provider": "unstop_api", "id": source_id},
                })

            page += 1
            time.sleep(0.3)
        except Exception as e:
            logger.error(f"Error fetching from Unstop API page {page}: {e}")
            break

    logger.info(f"Successfully extracted {len(hackathons)} active hackathons from Unstop API.")
    return hackathons


def extract_from_apify(token: str, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Extracts hackathons using Apify Client Actor.
    """
    if not HAS_APIFY:
        logger.warning("apify-client library not installed. Falling back to direct extractor.")
        return extract_from_unstop_api(limit)

    if not token:
        logger.info("No APIFY_API_TOKEN provided. Using built-in Unstop live crawler.")
        return extract_from_unstop_api(limit)

    logger.info(f"Running Apify Actor: {APIFY_ACTOR_ID} for Unstop Hackathons...")
    try:
        client = ApifyClient(token)
        run_input = {
            "startUrls": [{"url": "https://unstop.com/hackathons"}],
            "maxItems": limit,
        }
        run = client.actor(APIFY_ACTOR_ID).call(run_input=run_input, timeout_secs=120)
        dataset_items = client.dataset(run["defaultDatasetId"]).list_items().items
        logger.info(f"Apify returned {len(dataset_items)} items from dataset.")
        
        if dataset_items and len(dataset_items) >= 5:
            return dataset_items
        else:
            return extract_from_unstop_api(limit)
    except Exception as e:
        logger.warning(f"Apify Actor execution error: {e}. Falling back to direct Unstop extractor.")
        return extract_from_unstop_api(limit)


def sync_to_database(hackathons: List[Dict[str, Any]], app_url: str = APP_URL, secret: str = INGEST_SECRET) -> Dict[str, Any]:
    """
    Posts normalized hackathons to HackMate internal ingestion API.
    """
    if not hackathons:
        logger.warning("No hackathons to sync.")
        return {"inserted": 0, "updated": 0, "rejected": 0}

    endpoint = f"{app_url.rstrip('/')}/api/internal/ingest/hackathons"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {secret}",
        "x-ingestion-run-id": f"unstop-loader-{int(time.time())}",
    }

    payload = {
        "source": "unstop",
        "hackathons": hackathons[:100],  # sync top 50-100
    }

    logger.info(f"Syncing {len(payload['hackathons'])} hackathons to {endpoint}...")
    try:
        res = requests.post(endpoint, json=payload, headers=headers, timeout=120)
        if res.status_code == 200:
            result = res.json()
            logger.info(f"Sync successful! Inserted: {result.get('data', {}).get('inserted')}, Updated: {result.get('data', {}).get('updated')}")
            return result
        else:
            logger.error(f"Ingest API failed with status {res.status_code}: {res.text}")
            return {"error": res.text, "status_code": res.status_code}
    except Exception as e:
        logger.error(f"Failed to connect to HackMate ingest endpoint: {e}")
        return {"error": str(e)}


def run_hackathon_loader_job():
    """Main job executed for daily sync or one-shot command."""
    logger.info("=" * 60)
    logger.info(f"Starting Feature 1 Hackathon Loader Job at {datetime.now(timezone.utc).isoformat()}")
    logger.info("=" * 60)

    token = os.getenv("APIFY_API_TOKEN", APIFY_API_TOKEN)
    hackathons = extract_from_apify(token=token, limit=100)

    if not hackathons:
        logger.warning("Loader could not extract any hackathons.")
        return

    sync_result = sync_to_database(hackathons)
    logger.info(f"Feature 1 Job Finished. Processed: {len(hackathons)} hackathons.")
    return sync_result


def main():
    parser = argparse.ArgumentParser(description="Feature 1: HackMate Hackathon Loader (Apify & Unstop)")
    parser.add_argument("--sync", action="store_true", help="Run a one-time synchronization immediately")
    parser.add_argument("--schedule", action="store_true", help="Run in daemon mode with daily automated refresh")
    parser.add_argument("--limit", type=int, default=100, help="Number of hackathons to extract (50-100)")
    args = parser.parse_args()

    if args.sync or not args.schedule:
        run_hackathon_loader_job()

    if args.schedule:
        if not HAS_SCHEDULE:
            logger.error("Schedule library not installed. Install with `pip install schedule`.")
            sys.exit(1)

        logger.info("Scheduling Hackathon Loader to refresh everyday at 00:00 UTC...")
        schedule.every().day.at("00:00").do(run_hackathon_loader_job)
        schedule.every(12).hours.do(run_hackathon_loader_job)

        while True:
            schedule.run_pending()
            time.sleep(60)


if __name__ == "__main__":
    main()
