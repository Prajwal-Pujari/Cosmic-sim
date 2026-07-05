import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enjoy",
  description:
    "Just circle and square moving around .",
};

export default function EnjoyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
