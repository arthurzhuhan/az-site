import { HomePage } from "@/components/pages/home-page";
import { getAllPosts, getWhatsNew, getAllResources } from "@/lib/content";
import { WebsiteJsonLd } from "@/components/seo/json-ld";

export default async function Home() {
  const posts = await getAllPosts();
  const whatsNew = await getWhatsNew();
  const resources = await getAllResources();
  return (
    <>
      <WebsiteJsonLd />
      <HomePage posts={posts} whatsNew={whatsNew} resources={resources} />
    </>
  );
}
