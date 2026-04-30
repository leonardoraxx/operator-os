export const dynamic = "force-dynamic";

import { getContentPipeline } from "@/lib/db";
import { ContentClient } from "./content-client";

export default async function ContentPage() {
  const items = await getContentPipeline();
  return <ContentClient initialItems={items} />;
}
