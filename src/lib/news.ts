import Parser from "rss-parser";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: string;
  isoDate?: string;
}

const FEEDS: { name: string; url: string; category: string }[] = [
  {
    name: "Google Security Blog",
    url: "https://security.googleblog.com/feeds/posts/default",
    category: "ciberseguridad",
  },
  {
    name: "Microsoft Security Blog",
    url: "https://www.microsoft.com/en-us/security/blog/feed/",
    category: "ciberseguridad",
  },
  {
    name: "CISA",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    category: "ciberseguridad",
  },
  {
    name: "Cloudflare Blog",
    url: "https://blog.cloudflare.com/rss/",
    category: "cloud",
  },
  {
    name: "Google Cloud Blog",
    url: "https://cloudblog.withgoogle.com/rss/",
    category: "cloud",
  },
  {
    name: "Kubernetes Blog",
    url: "https://kubernetes.io/feed.xml",
    category: "cloud",
  },
  {
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
    category: "desarrollo",
  },
];

const parser = new Parser({ timeout: 8000 });

export async function getNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.slice(0, 6).map(
        (item): NewsItem => ({
          title: item.title ?? "",
          link: item.link ?? "",
          source: feed.name,
          category: feed.category,
          isoDate: item.isoDate,
        }),
      );
    }),
  );

  const items = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((item) => item.title && item.link);

  return items.sort((a, b) => {
    const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
    const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
    return dateB - dateA;
  });
}
