import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Lab | Pavan Kumar",
  description:
    "A visual showcase of selected projects by Pavan Kumar.",
};

export default function ConnectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
