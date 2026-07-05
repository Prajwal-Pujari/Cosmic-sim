import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enjoy | Hypnotic Minimalist Motion",
  description:
    "An ultra-minimalistic animation of a single circle moving along a square path on a pure ivory background with dynamic speed phases.",
};

export default function EnjoyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
