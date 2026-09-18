import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MERX",
  description: "MERX Fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
