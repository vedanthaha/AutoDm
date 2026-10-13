import { AppShell } from '@/components/AppShell';
import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchAccounts } from '@/lib/storage';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMetaLive = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
  const isLive = isSupabaseConfigured && isMetaLive;
  const initialAccounts = await fetchAccounts();

  return (
    <AppShell initialAccounts={initialAccounts} isLiveConfigured={isLive}>
      {children}
    </AppShell>
  );
}
