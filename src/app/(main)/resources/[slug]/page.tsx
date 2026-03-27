import { getResourceBySlug, getAllResourceSlugs } from "@/lib/content";
import { ResourceDetailPage } from "@/components/pages/resource-detail-page";
import { ResourceJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return {};
  return {
    title: resource.titleZh,
    description: resource.descriptionZh,
    openGraph: {
      title: resource.titleZh,
      description: resource.descriptionZh,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: resource.titleZh,
      description: resource.descriptionZh,
    },
    alternates: {
      canonical: `/resources/${slug}`,
    },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();
  return (
    <>
      <ResourceJsonLd resource={resource} />
      <ResourceDetailPage resource={resource} />
    </>
  );
}
