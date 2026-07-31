import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  assertUniqueBlogSlugs,
  getBlogPostBySlug,
  getPublishedBlogPosts,
  getRelatedBlogPosts
} from "../../../content/blog";
import type { BlogBlock } from "../../../content/blog/types";

const siteUrl = "https://remove.services";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  assertUniqueBlogSlugs();

  return getPublishedBlogPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Remove.Services`,
    description: post.description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "Remove.Services",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      images: [
        {
          url: `${siteUrl}${post.coverImage}`,
          width: 1200,
          height: 675,
          alt: post.coverImageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${siteUrl}${post.coverImage}`]
    }
  };
}

function renderBlock(block: BlogBlock) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2 className="mt-10 text-3xl font-semibold tracking-normal text-neutral-950" key={block.text}>
          {block.text}
        </h2>
      );
    }

    return (
      <h3 className="mt-7 text-2xl font-semibold tracking-normal text-neutral-950" key={block.text}>
        {block.text}
      </h3>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";

    return (
      <ListTag
        className={`mt-5 space-y-2 pl-6 text-base leading-8 text-neutral-700 ${
          block.ordered ? "list-decimal" : "list-disc"
        }`}
        key={block.items.join("|")}
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white" key={block.src}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={block.alt}
          className="aspect-[16/9] w-full object-cover"
          height={block.height}
          src={block.src}
          width={block.width}
        />
      </figure>
    );
  }

  return (
    <p className="mt-5 text-base leading-8 text-neutral-700" key={block.text}>
      {block.text}
    </p>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post.slug);
  const url = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = `${siteUrl}${post.coverImage}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: imageUrl,
      datePublished: post.date,
      dateModified: post.updatedDate,
      author: {
        "@type": "Organization",
        name: post.author
      },
      publisher: {
        "@type": "Organization",
        name: "Remove.Services"
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url
      },
      url
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${siteUrl}/blog`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
          <Link className="flex items-center" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Remove.Services" className="h-8 w-auto" src="/logo.png" />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link className="text-neutral-700 transition hover:text-neutral-950" href="/">
              Tool
            </Link>
            <Link
              className="text-neutral-700 transition hover:text-neutral-950"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link className="rounded-md bg-neutral-950 px-4 py-2 text-white" href="/blog">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 pb-14 pt-10">
        <Link className="text-sm font-semibold text-teal-800 hover:text-neutral-950" href="/blog">
          Back to blog
        </Link>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-neutral-600">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">
            {post.category}
          </span>
          <span className="px-1 py-1">Published {post.date}</span>
          <span className="px-1 py-1">Updated {post.updatedDate}</span>
          <span className="px-1 py-1">{post.readingTime}</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-neutral-950 sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-neutral-700">{post.description}</p>
        <p className="mt-4 text-sm text-neutral-600">By {post.author}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={post.coverImageAlt}
          className="mt-8 aspect-[16/9] w-full rounded-lg border border-neutral-200 object-cover"
          height={675}
          src={post.coverImage}
          width={1200}
        />

        <div className="mt-10">{post.content.map(renderBlock)}</div>

        <section className="mt-12 rounded-lg border border-teal-800 bg-neutral-950 p-6 text-white">
          <h2 className="text-2xl font-semibold">Remove Your Image Background in Seconds</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            Upload an image and create a clean, transparent background with Remove.Services.
          </p>
          <Link
            className="mt-5 inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-teal-50"
            href="/"
          >
            Try Background Remover
          </Link>
        </section>
      </article>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <h2 className="text-2xl font-semibold text-neutral-950">Related articles</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {relatedPosts.map((relatedPost) => (
            <Link
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-lg shadow-neutral-900/5 transition hover:border-teal-700"
              href={`/blog/${relatedPost.slug}`}
              key={relatedPost.slug}
            >
              <p className="text-sm font-semibold text-teal-800">{relatedPost.category}</p>
              <h3 className="mt-2 text-xl font-semibold text-neutral-950">
                {relatedPost.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {relatedPost.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
