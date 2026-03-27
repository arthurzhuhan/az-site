import { BlogListPage } from "@/components/pages/blog-list-page";
import { getAllPosts } from "@/lib/content";

export default async function BlogPage() {
  const posts = await getAllPosts();
  return <BlogListPage posts={posts} />;
}
