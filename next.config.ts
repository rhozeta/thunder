import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply CSP headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ilydnbdnnipoxwxwvrkh.supabase.co https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com",
              "img-src 'self' data: https: https://accounts.google.com https://ssl.gstatic.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://ilydnbdnnipoxwxwvrkh.supabase.co wss://ilydnbdnnipoxwxwvrkh.supabase.co https://accounts.google.com https://oauth2.googleapis.com",
              "frame-src 'self' https://accounts.google.com https://ilydnbdnnipoxwxwvrkh.supabase.co",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://ilydnbdnnipoxwxwvrkh.supabase.co https://accounts.google.com"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
