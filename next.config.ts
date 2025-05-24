// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/python/:path*',
        destination: 'http://python-backend:5000/:path*',
      },
      {
        source: '/api/node/:path*',
        destination: 'http://node-backend:3001/:path*',
      },
    ];
  },
};

export default nextConfig;