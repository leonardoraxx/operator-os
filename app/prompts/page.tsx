export const dynamic = "force-dynamic";

import { getPromptLibrary } from "@/lib/db";
import { PromptsClient } from "./prompts-client";

export default async function PromptsPage() {
  const entries = await getPromptLibrary();
  return <PromptsClient initialEntries={entries} />;
}
