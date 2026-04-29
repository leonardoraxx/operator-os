import { OPERATOR } from "@/data/operator";
import { getOperator } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const dbOperator = await getOperator();
  return <SettingsClient operator={dbOperator ?? OPERATOR} />;
}
