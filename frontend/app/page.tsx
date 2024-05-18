import Image from "next/image";
// import { Boxes } from "@/components/ui/Boxes";
import { cn } from "@/lib/utils";
import { Boxes } from "@/components/ui/background-boxes";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Hero } from "@/components/Hero";
import OnSaleNFTsList from "@/components/nfts/OnSaleNFTsList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-col w-full container">
        <Hero />
        <OnSaleNFTsList className={'mt-10'} />
      </div>
    </main>
  );
}
