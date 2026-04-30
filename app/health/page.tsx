export const dynamic = "force-dynamic";

import { getSystemHealth } from "@/lib/db";
import { HealthClient } from "./health-client";

export default async function HealthPage() {
  const health = await getSystemHealth();
  return <HealthClient initialHealth={health} />;
}
