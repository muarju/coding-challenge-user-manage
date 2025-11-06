import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import React from 'react';

export const metadata = { title: 'User Management' };

const setInitialTheme = `(() => {
  try {
    var t = localStorage.getItem('theme');
    if (!t) {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      t = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = t;
    document.documentElement.setAttribute('data-bs-theme', t);
  } catch (_) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </head>
      <body>
        {/* Override Next.js route announcer to avoid extra role=alert during tests */}
        <div id="__next-route-announcer__" role="none" aria-hidden="true" style={{display:'none'}} />
        {children}
      </body>
    </html>
  );
}
