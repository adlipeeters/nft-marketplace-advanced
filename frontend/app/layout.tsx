import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import { CreateNFT } from "@/components/CreateNFT";
import { ChangeNFTPrice } from "@/components/ChangeNFTPrice";
import { AuctionOffer } from "@/components/AuctionOffer";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import BgLayout from "@/components/BgLayout";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const navItems = [
  { name: "Home", link: "/", },
  { name: "About", link: "/about", },
  { name: "Profile", link: "/profile", },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + 'relative'}>
        {/* <ThemeProvider attribute='class' defaultTheme='dark' enableSystem> */}
        <Providers>
          <nav className="flex justify-center w-full mb-40">
            <Navbar />
          </nav>
          <CreateNFT />
          <ChangeNFTPrice />
          <AuctionOffer />
          {children}
          {/* </ThemeProvider> */}
        </Providers>
      </body>
    </html>
  );
}
