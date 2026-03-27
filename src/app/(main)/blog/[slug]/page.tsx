import { getPostBySlug, getAllPostSlugs } from "@/lib/content";
import { BlogPostPage } from "@/components/pages/blog-post-page";
import { BlogPostJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.titleZh,
    description: post.excerptZh,
    openGraph: {
      title: post.titleZh,
      description: post.excerptZh,
      type: "article",
      publishedTime: post.date,
      authors: ["Arthur Zhu"],
      images: post.image ? [{ url: post.image, alt: post.titleZh }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.titleZh,
      description: post.excerptZh,
      images: post.image ? [post.image] : [],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return (
    <>
      <BlogPostJsonLd post={post} />
      <BlogPostPage post={post} />
    </>
  );
}
