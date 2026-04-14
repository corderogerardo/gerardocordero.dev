export interface ContactItem {
  label: string;
  value: string;
  href?: string;
}

export const contactInfo: ContactItem[] = [
  { label: "Phone", value: "+584129156498", href: "tel:+584129156498" },
  { label: "Email", value: "mail@gerardocordero.dev", href: "mailto:mail@gerardocordero.dev" },
  { label: "Email", value: "cordero.gerard@gmail.com", href: "mailto:cordero.gerard@gmail.com" },
  { label: "English", value: "C1 Advanced (EF SET)" },
];

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  { platform: "GitHub", url: "https://github.com/corderogerardo", icon: "github" },
  { platform: "LinkedIn", url: "https://www.linkedin.com/in/corderogerardo/", icon: "linkedin" },
  { platform: "Twitter", url: "https://twitter.com/officelocation", icon: "twitter" },
];
