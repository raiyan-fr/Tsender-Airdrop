import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tsender - Multi-Chain ERC-20 Token Airdrop",
  description: "Efficient bulk ERC-20 token distribution powered by Wagmi, RainbowKit, and the Tsender smart contract.",
  keywords: ["airdrop", "ERC-20", "tokens", "crypto", "blockchain", "ethereum"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
