import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";

export const metadata: Metadata = {
  title: "Digital Alpha – Credit Card Bills & Rewards",
  description: "Pay bills, track spending, earn and redeem rewards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}