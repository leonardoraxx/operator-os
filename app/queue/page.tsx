export const dynamic = "force-dynamic";

import { getImplementationQueue } from "@/lib/db";
import { QueueClient } from "./queue-client";

export default async function QueuePage() {
  const items = await getImplementationQueue();
  return <QueueClient initialItems={items} />;
}
