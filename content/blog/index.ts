import { howToCreateCleanProductPhotos } from "./how-to-create-clean-product-photos";
import { howToMakeImageBackgroundTransparent } from "./how-to-make-image-background-transparent";
import { howToRemoveBackgroundFromImage } from "./how-to-remove-background-from-image";
import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  howToRemoveBackgroundFromImage,
  howToMakeImageBackgroundTransparent,
  howToCreateCleanProductPhotos
];

export function getPublishedBlogPosts() {
  return blogPosts
    .filter((post) => post.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug && post.published) ?? null;
}

export function getRelatedBlogPosts(currentSlug: string, limit = 2) {
  return getPublishedBlogPosts()
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);
}

export function assertUniqueBlogSlugs() {
  const slugs = new Set<string>();

  for (const post of blogPosts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate blog slug: ${post.slug}`);
    }

    slugs.add(post.slug);
  }
}
