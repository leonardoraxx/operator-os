export const dynamic = "force-dynamic";

import { getOperator, getOperatorPreferences } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [operator, preferences] = await Promise.all([
    getOperator(),
    getOperatorPreferences(),
  ]);

  const safeOperator = operator ?? {
    name:           "Operator",
    handle:         "",
    role:           "",
    focusScore:     { value: 0, delta: 0, sparkline: [], label: "Focus" },
    executionScore: { value: 0, delta: 0, sparkline: [], label: "Execution" },
  };

  return <SettingsClient operator={safeOperator} preferences={preferences} />;
}
