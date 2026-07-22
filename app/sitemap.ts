import type { MetadataRoute } from "next";
import { existsSync, readdirSync, statSync } from "fs";
import path from "path";
import { assertUniqueBlogSlugs, getPublishedBlogPosts } from "../content/blog";

const siteUrl = "https://remove.services";
const appDirectory = path.join(process.cwd(), "app");
const excludedRouteSegments = new Set([
  "api",
  "checkout",
  "login",
  "register",
  "account",
  "dashboard",
  "admin",
  "test",
  "tests"
]);

export const dynamic = "force-static";

function isPublicStaticPageRoute(routeSegments: string[]) {
  if (routeSegments.length === 0) {
    return true;
  }

  return routeSegments.every((segment) => {
    if (segment.startsWith("[") || segment.startsWith("(") || segment.startsWith("_")) {
      return false;
    }

    return !excludedRouteSegments.has(segment);
  });
}

function routeSegmentsToPath(routeSegments: string[]) {
  return routeSegments.length === 0 ? "/" : `/${routeSegments.join("/")}`;
}

function getPublicPageRoutes(directory = appDirectory, routeSegments: string[] = []): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const routes: string[] = [];

  if (
    entries.some((entry) => entry.isFile() && entry.name === "page.tsx") &&
    isPublicStaticPageRoute(routeSegments)
  ) {
    routes.push(routeSegmentsToPath(routeSegments));
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    routes.push(...getPublicPageRoutes(path.join(directory, entry.name), [
      ...routeSegments,
      entry.name
    ]));
  }

  return routes;
}

function getRouteLastModified(routePath: string) {
  const pagePath =
    routePath === "/"
      ? path.join(appDirectory, "page.tsx")
      : path.join(appDirectory, ...routePath.slice(1).split("/"), "page.tsx");

  if (!existsSync(pagePath)) {
    return new Date().toISOString();
  }

  return statSync(pagePath).mtime.toISOString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  assertUniqueBlogSlugs();

  const staticRoutes: MetadataRoute.Sitemap = getPublicPageRoutes().map((routePath) => ({
    url: routePath === "/" ? `${siteUrl}/` : `${siteUrl}${routePath}`,
    lastModified: getRouteLastModified(routePath),
    changeFrequency: routePath === "/" || routePath === "/blog" ? "weekly" : "yearly",
    priority: routePath === "/" ? 1 : routePath === "/pricing" ? 0.8 : routePath === "/blog" ? 0.7 : 0.3
  }));

  const blogRoutes: MetadataRoute.Sitemap = getPublishedBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedDate,
    changeFrequency: "monthly",
    priority: 0.6
  }));

  return [...staticRoutes, ...blogRoutes];
}
