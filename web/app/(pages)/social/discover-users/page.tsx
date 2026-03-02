import { getUser } from "@/lib/supabase/server";
import DiscoverUsersClient from "@/components/social/DiscoverUsersClient";

export default async function DiscoverUsersPage() {
  const user = await getUser();

  return <DiscoverUsersClient currentUserId={user?.id ?? ""} />;
}
