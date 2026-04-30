export const dynamic = "force-dynamic";

import { getLeads } from "@/lib/db";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadsClient initialLeads={leads} />;
}
