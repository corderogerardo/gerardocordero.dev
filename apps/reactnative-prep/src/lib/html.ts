/** Wrap inner HTML (extracted from a callout/map/meta block) back in its
 *  styled container so the `.rich .callout` descendant styles apply. */
export const box = (cls: string, inner: string) =>
  `<div class="${cls}">${inner}</div>`;
