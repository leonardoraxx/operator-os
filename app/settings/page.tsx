import { getOperator } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const operator = await getOperator();
  return <SettingsClient operator={operator ?? { name: "Operator", handle: "", role: "", focusScore: { value: 0, delta: 0, sparkline: [], label: "Focus" }, executionScore: { value: 0, delta: 0, sparkline: [], label: "Execution" } }} />;
}
