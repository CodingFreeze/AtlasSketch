import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AtlasSketch",
  description: "A compiled taste atlas and deterministic interface-art workbench."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>{children}</body>
    </html>
  );
}
