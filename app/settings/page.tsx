export const dynamic = "force-dynamic";

import { getOperator, getOperatorPreferences } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [operator, preferences] = await Promise.all([
    getOperator(),
    getOperatorPreferences(),
  ]);

  return <SettingsClient operator={operator} preferences={preferences} />;
}
