/**
 * Official Meta Instagram API Client Adapter
 *
 * Flow: Instagram Login for Business (Direct Instagram Graph API)
 * Target host: graph.instagram.com
 * Default version: v26.0 (Latest active version verified against Meta changelog)
 *
 * Endpoints:
 * - Authorization: https://www.instagram.com/oauth/authorize
 * - Short-Lived Token Exchange: POST https://api.instagram.com/oauth/access_token
 * - Long-Lived Token Exchange: GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token
 * - Token Refresh: GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token
 * - Subscribed Apps: POST https://graph.instagram.com/{v}/{user_id}/subscribed_apps
 * - Profile: GET https://graph.instagram.com/{v}/me
 * - Media: GET https://graph.instagram.com/{v}/{user_id}/media
 * - Private Reply: POST https://graph.instagram.com/{v}/{user_id}/messages
 */

import type { PrivateReplyResult, InstagramMedia, PublicCommentReplyResult } from './types.ts';

export const META_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v26.0';
export const META_API_HOST = process.env.META_API_HOST || 'graph.instagram.com';

export const INSTAGRAM_OAUTH_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize';
export const INSTAGRAM_TOKEN_EXCHANGE_URL = 'https://api.instagram.com/oauth/access_token';

/**
 * Required permissions strictly for Instagram Login for Business
 */
export const INSTAGRAM_BUSINESS_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments'
];

/**
 * Step 1: Exchange OAuth authorization code for a short-lived Instagram User Access Token (1 hour)
 */
export async function exchangeInstagramCode(
  code: string,
  redirectUri: string,
  appId: string,
  appSecret: string
): Promise<{ access_token?: string; user_id?: string; error?: any }> {
  try {
    const params = new URLSearchParams();
    params.append('client_id', appId);
    params.append('client_secret', appSecret);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);
    params.append('code', code);

    const res = await fetch(INSTAGRAM_TOKEN_EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error_type || data.error_message) {
      return { error: data.error_message || data.error || data };
    }

    return {
      access_token: data.access_token,
      user_id: data.user_id ? String(data.user_id) : undefined,
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Step 2: Exchange short-lived token for a long-lived Instagram User Access Token (60 days)
 */
export async function getLongLivedInstagramToken(
  shortLivedToken: string,
  appSecret: string
): Promise<{ access_token?: string; token_type?: string; expires_in?: number; error?: any }> {
  try {
    const url = `https://${META_API_HOST}/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(appSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (!res.ok || data.error) {
      return { error: data.error || data };
    }

    return {
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 5184000, // 60 days in seconds
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Step 3: Refresh an active long-lived Instagram User Access Token before it expires
 */
export async function refreshLongLivedInstagramToken(
  longLivedToken: string
): Promise<{ access_token?: string; token_type?: string; expires_in?: number; error?: any }> {
  try {
    const url = `https://${META_API_HOST}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(longLivedToken)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (!res.ok || data.error) {
      return { error: data.error || data };
    }

    return {
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 5184000,
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Step 4: Retrieve authenticated user profile metadata
 */
export async function getInstagramUserProfile(
  accessToken: string
): Promise<{ user_id?: string; username?: string; name?: string; profile_picture_url?: string; account_type?: 'BUSINESS' | 'CREATOR'; error?: any }> {
  try {
    const url = `https://${META_API_HOST}/${META_API_VERSION}/me?fields=user_id,username,name,profile_picture_url,account_type&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (!res.ok || data.error) {
      return { error: data.error || data };
    }

    const rawType = String(data.account_type || '').toUpperCase();
    const accountType: 'BUSINESS' | 'CREATOR' = rawType.includes('CREATOR') ? 'CREATOR' : 'BUSINESS';

    return {
      user_id: data.user_id || data.id,
      username: data.username,
      name: data.name || data.username,
      profile_picture_url: data.profile_picture_url || null,
      account_type: accountType,
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Step 5: Subscribes the Instagram account to Webhooks (Per-Account Webhook Subscription)
 *
 * Required for the app to receive comment and message notifications for this specific account.
 * Endpoint: POST https://graph.instagram.com/{version}/{user_id}/subscribed_apps
 */
export async function subscribeAccountWebhooks(
  userId: string,
  accessToken: string,
  fields = 'comments,messages'
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = `https://${META_API_HOST}/${META_API_VERSION}/${userId}/subscribed_apps?subscribed_fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Check active webhook subscriptions for an account
 */
export async function getAccountWebhookSubscriptions(
  userId: string,
  accessToken: string
): Promise<{ success: boolean; subscribed_fields?: string[]; error?: any }> {
  try {
    const url = `https://${META_API_HOST}/${META_API_VERSION}/${userId}/subscribed_apps?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (res.ok && Array.isArray(data.data)) {
      const entry = data.data[0];
      return {
        success: true,
        subscribed_fields: entry?.subscribed_fields || [],
      };
    }
    return { success: false, error: data.error || data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Unsubscribe account from webhooks (used during disconnection)
 */
export async function unsubscribeAccountWebhooks(
  userId: string,
  accessToken: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = `https://${META_API_HOST}/${META_API_VERSION}/${userId}/subscribed_apps?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();
    return { success: Boolean(res.ok && data.success) };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Step 6: Fetches recent Posts & Reels for the account
 */
export async function getInstagramMedia(
  userId: string,
  accessToken: string,
  limit = 20
): Promise<InstagramMedia[]> {
  try {
    const url = `https://${META_API_HOST}/${META_API_VERSION}/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (res.ok && Array.isArray(data.data)) {
      return data.data as InstagramMedia[];
    }
    return [];
  } catch (err) {
    console.error('[Meta] Failed to fetch media:', (err as Error).message);
    return [];
  }
}

/**
 * Step 7: Sends an official Private Reply to an Instagram Comment
 *
 * Endpoint: POST https://graph.instagram.com/{version}/{user_id}/messages
 * Payload: { recipient: { comment_id: "..." }, message: { text: "..." } }
 */
export async function sendPrivateReply(
  instagramUserId: string,
  accessToken: string,
  commentId: string,
  replyText: string
): Promise<PrivateReplyResult> {
  const endpoint = `https://${META_API_HOST}/${META_API_VERSION}/${instagramUserId}/messages`;
  const payload = {
    recipient: {
      comment_id: commentId,
    },
    message: {
      text: replyText,
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const fbTraceId = res.headers.get('x-fb-trace-id') || data?.error?.fbtrace_id || undefined;

    if (res.ok && data.message_id) {
      return {
        success: true,
        status: res.status,
        message_id: data.message_id,
        recipient_id: data.recipient_id,
        fb_trace_id: fbTraceId,
      };
    } else {
      return {
        success: false,
        status: res.status,
        error: data.error || { message: 'Meta rejected message' },
        fb_trace_id: fbTraceId,
      };
    }
  } catch (err) {
    return {
      success: false,
      error: {
        message: (err as Error).message,
        type: 'NetworkError',
      },
    };
  }
}

/**
 * Step 8: Posts a Public Comment Reply directly under an Instagram Comment
 *
 * Endpoint: POST https://graph.facebook.com/{version}/{comment_id}/replies
 * Fallback: POST https://graph.instagram.com/{version}/{comment_id}/replies
 * Parameters: message
 */
export async function sendPublicCommentReply(
  commentId: string,
  accessToken: string,
  message: string
): Promise<PublicCommentReplyResult> {
  const hosts = ['graph.facebook.com', META_API_HOST];
  let lastError: any = null;
  let lastStatus = 0;
  let lastTraceId: string | undefined = undefined;

  for (const host of hosts) {
    try {
      const endpoint = `https://${host}/${META_API_VERSION}/${commentId}/replies`;

      // 1. Try JSON body with Authorization Bearer header
      const jsonRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message }),
      });

      const jsonData = await jsonRes.json();
      const fbTraceId = jsonRes.headers.get('x-fb-trace-id') || jsonData?.error?.fbtrace_id || undefined;
      lastStatus = jsonRes.status;
      lastTraceId = fbTraceId;

      if (jsonRes.ok && jsonData.id) {
        return {
          success: true,
          status: jsonRes.status,
          id: jsonData.id,
          fb_trace_id: fbTraceId,
        };
      }

      // 2. If rejected with JSON, try application/x-www-form-urlencoded
      const formParams = new URLSearchParams();
      formParams.append('message', message);
      formParams.append('access_token', accessToken);

      const formRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });

      const formData = await formRes.json();
      const formTraceId = formRes.headers.get('x-fb-trace-id') || formData?.error?.fbtrace_id || undefined;
      lastStatus = formRes.status;
      lastTraceId = formTraceId;

      if (formRes.ok && formData.id) {
        return {
          success: true,
          status: formRes.status,
          id: formData.id,
          fb_trace_id: formTraceId,
        };
      }

      lastError = formData.error || jsonData.error || { message: 'Meta rejected comment reply' };
    } catch (err) {
      lastError = { message: (err as Error).message, type: 'NetworkError' };
    }
  }

  return {
    success: false,
    status: lastStatus,
    error: lastError,
    fb_trace_id: lastTraceId,
  };
}
