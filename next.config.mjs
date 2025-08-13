/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 关闭SSR模式以避免地图组件的window is not defined错误
  // 强制客户端渲染
  reactStrictMode: true,
}

export default nextConfig
