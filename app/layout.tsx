import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TubeSwipe — Vole le sujet. Adapte à ta niche.",
  description: "Analyse une vidéo YouTube tendance, comprends pourquoi elle fonctionne, et génère un script adapté à ta niche.",
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
        </div>
      </body>
    </html>
  );
}
