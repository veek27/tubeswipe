import type { Metadata } from "next";
import "./globals.css";
import GlobalSocialProof from "@/components/GlobalSocialProof";

export const metadata: Metadata = {
  title: "TubeSwap — Vole le sujet. Adapte à ta niche.",
  description: "Analyse une vidéo YouTube tendance, comprends pourquoi elle fonctionne, et génère un script adapté à ta niche.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="min-h-screen">
          {children}
          <GlobalSocialProof />
        </div>
      </body>
    </html>
  );
}
