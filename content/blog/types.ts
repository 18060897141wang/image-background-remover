export type BlogBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      type: "list";
      ordered?: boolean;
      items: string[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
    };

export interface BlogPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  updatedDate: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  readingTime: string;
  published: boolean;
  content: BlogBlock[];
}
