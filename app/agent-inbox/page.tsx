export const dynamic = "force-dynamic";

import { getAgentTasks } from "@/lib/db";
import { AgentInboxClient } from "./agent-inbox-client";

export default async function AgentInboxPage() {
  const tasks = await getAgentTasks();
  return <AgentInboxClient tasks={tasks} />;
}
