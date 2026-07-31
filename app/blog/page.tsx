import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "../../content/blog";

export const metadata: Metadata = {
  title: "Background Removal Guides & Image Editing Tips | Remove.Services",
  description:
    "Learn how to remove image backgrounds, create transparent PNGs, improve product photos, and prepare images for ecommerce and social media.",
  alternates: {
    canonical: "https://remove.services/blog"
  },
  openGraph: {
    title: "Background Removal Guides & Image Editing Tips | Remove.Services",
    description:
      "Learn how to remove image backgrounds, create transparent PNGs, improve product photos, and prepare images for ecommerce and social media.",
    url: "https://remove.services/blog",
    siteName: "Remove.Services",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Background Removal Guides & Image Editing Tips | Remove.Services",
    description:
      "Learn how to remove image backgrounds, create transparent PNGs, improve product photos, and prepare images for ecommerce and social media."
  }
};

export default function BlogIndexPage() {
  const posts = getPublishedBlogPosts();

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
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

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12">
        <p className="mb-4 inline-flex rounded-full border border-teal-700/30 bg-white px-3 py-1 text-sm font-medium text-teal-800">
          Resources
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] text-neutral-950 sm:text-6xl">
          Background Removal Guides & Image Editing Tips
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Practical guides for removing image backgrounds, creating transparent PNGs,
          improving product photos, and preparing visual content for the web.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            className="flex overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg shadow-neutral-900/5"
            key={post.slug}
          >
            <div className="flex w-full flex-col">
              <Link href={`/blog/${post.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={post.coverImageAlt}
                  className="aspect-[16/9] w-full object-cover"
                  height={675}
                  src={post.coverImage}
                  width={1200}
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-neutral-600">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">
                    {post.category}
                  </span>
                  <span className="px-1 py-1">{post.date}</span>
                  <span className="px-1 py-1">{post.readingTime}</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold leading-7 text-neutral-950">
                  <Link className="hover:text-teal-800" href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">
                  {post.description}
                </p>
                <Link
                  className="mt-5 inline-flex text-sm font-semibold text-teal-800 hover:text-neutral-950"
                  href={`/blog/${post.slug}`}
                >
                  Read article
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="border-t border-neutral-200 bg-white px-5 py-8 text-center text-sm text-neutral-600">
        <div className="flex flex-wrap justify-center gap-4">
          <Link className="font-medium hover:text-neutral-950" href="/">
            Tool
          </Link>
          <Link className="font-medium hover:text-neutral-950" href="/pricing">
            Pricing
          </Link>
          <Link className="font-medium text-neutral-950" href="/blog">
            Blog
          </Link>
          <Link className="font-medium hover:text-neutral-950" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="font-medium hover:text-neutral-950" href="/terms">
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}
