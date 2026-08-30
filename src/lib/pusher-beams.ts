export interface BeamsNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  deepLink?: string;
  data?: Record<string, any>;
}

export async function publishBeamsNotification(
  interests: string[],
  notification: BeamsNotificationPayload,
) {
  const instanceId =
    process.env.PUSHER_BEAMS_INSTANCE_ID ||
    process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID ||
    'e73529a8-e692-47fb-b5f7-2c72864c654e';
  const secretKey =
    process.env.PUSHER_BEAMS_SECRET_KEY ||
    'D755F41F76CD88E8B5583E9B6E83544615522084B4843E286F3FE7143E4B209D';

  const url = `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes`;

  const payload: any = {
    interests,
    web: {
      notification: {
        title: notification.title,
        body: notification.body,
        deep_link: notification.deepLink || undefined,
        data: notification.data || undefined,
      },
    },
  };

  if (notification.icon && notification.icon.startsWith('http')) {
    payload.web.notification.icon = notification.icon;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pusher Beams Publish Failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
