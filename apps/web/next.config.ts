import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const framerMock = path.resolve(__dirname, 'src/lib/framer-motion-mock.js');
const springMock = path.resolve(__dirname, 'src/lib/react-spring-mock.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'qghedphicvdbeafcosrv.supabase.co',
      }
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Replace animation libraries with server-safe mocks during SSG/SSR
      // to prevent useContext crashes when prerendering static pages
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /framer-motion/,
          framerMock
        ),
        new webpack.NormalModuleReplacementPlugin(
          /@react-spring/,
          springMock
        )
      );
    }
    return config;
  },
};

export default nextConfig;
