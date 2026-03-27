import { ResourceListPage } from "@/components/pages/resource-list-page";
import { getAllResources } from "@/lib/content";

export default async function ResourcesPage() {
  const resources = await getAllResources();
  return <ResourceListPage resources={resources} />;
}
