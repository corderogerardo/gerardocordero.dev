/** @type {import('next').NextConfig} */
// Static export mounted at academy.gerardocordero.dev/reactnative/. CI copies `out/`
// into apps/learn/reactnative/ before the Pages upload, so basePath must match that
// directory name. `<Link>` picks up basePath automatically; raw <a href> does not.
const nextConfig = {
  output: 'export',
  basePath: '/reactnative',
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
