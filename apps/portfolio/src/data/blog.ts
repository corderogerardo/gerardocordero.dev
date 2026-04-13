export interface BlogPost {
  title: string;
  url: string;
}

export const blogPosts: BlogPost[] = [
  { title: "What is tab-napping attacks?", url: "https://blog.gerardocordero.dev" },
  { title: "React Native Architecture", url: "https://blog.gerardocordero.dev" },
];

export const externalLinks = {
  blog: "https://blog.gerardocordero.dev",
  resume: "https://resume.gerardocordero.dev",
  website: "https://me.gerardocordero.dev",
};
