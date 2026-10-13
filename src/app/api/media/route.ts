/**
 * Instagram Media API
 * Path: /api/media
 *
 * Fetches the connected account's posts and Reels for the visual selector.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramMedia } from '@/lib/meta';
import { decryptToken } from '@/lib/crypto';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { InstagramMedia } from '@/lib/types';

export const runtime = 'nodejs';

// Demo media fixtures for interactive demo mode
const DEMO_MEDIA: InstagramMedia[] = [
  {
    id: 'post_reel_99182',
    caption: 'How we scaled our automation engine to 50k followers in 90 days #growth #saas',
    media_type: 'VIDEO',
    media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/reel/C89xYz',
    timestamp: '2026-10-10T14:00:00Z',
  },
  {
    id: '18116468645326656',
    caption: 'New Open Source Release: Zero-cost Instagram DM engine starter kit. Drop "link" below!',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/p/C90aBc',
    timestamp: '2026-10-08T18:30:00Z',
  },
  {
    id: 'post_photo_33891',
    caption: 'Behind the scenes at BuildBybits Labs building autonomous agentic coding tools.',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/p/C91dEf',
    timestamp: '2026-10-05T11:15:00Z',
  },
  {
    id: 'post_reel_77210',
    caption: 'Reel: 3 common mistakes creators make with Meta Graph API webhooks.',
    media_type: 'VIDEO',
    media_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/reel/C92gHi',
    timestamp: '2026-10-02T16:45:00Z',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id');

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase && accountId) {
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('instagram_user_id, encrypted_access_token')
      .eq('id', accountId)
      .maybeSingle();

    if (account) {
      const token = decryptToken(account.encrypted_access_token);
      if (token) {
        const media = await getInstagramMedia(account.instagram_user_id, token, 20);
        if (media.length > 0) {
          return NextResponse.json({ media });
        }
      }
    }
  }

  return NextResponse.json({ media: DEMO_MEDIA });
}
