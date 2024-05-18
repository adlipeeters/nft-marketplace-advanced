import MyNFTsList from "@/components/nfts/MyNFTsList";
import { getOwnerNFTs } from "@/services/blockchain";
import { RootState } from "@/types";
import Image from "next/image";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function page() {


  return (
    <main className="flex flex-col items-center justify-between container w-full">
      <MyNFTsList />
    </main>
  );
}
