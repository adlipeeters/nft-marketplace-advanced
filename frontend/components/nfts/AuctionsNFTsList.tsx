"use client"

import { cn } from '@/lib/utils'
import React, { useEffect } from 'react'
import NFT, { NFTActionsFor } from './NFT'
import { NFT as NFTInterface, RootState } from '@/types'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { Button } from '../ui/button'
import { getAuctions, getOwnerNFTs } from '@/services/blockchain'
import Auction from './Auction'

const AuctionsNFTsList = ({ className }: { className?: string }) => {
    const dispatch = useDispatch()
    const { toggleCreateNFTModal } = globalActions
    const { auctions } = useSelector((states: RootState) => states.globalStates)

    useEffect(() => {
        getAuctions()
    }, [])
    console.log(auctions)
    return (
        <div className={
            cn(className,
                `
                w-full
                grid 
                grid-cols-1 
                md:grid-cols-2 
                lg:grid-cols-3 
                gap-8
                py-8
                `)}>
            {/* <div className='col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-4 bg-slate-900 p-4 rounded-xl'>
                <Button className='px-12' variant={'secondary'} onClick={() => dispatch(toggleCreateNFTModal(true))}>Add NFT</Button>
            </div>
        */}
            {auctions?.map((auction, key) => (
                <Auction key={key} auction={auction} />
                // <NFT key={key} nft={nft} page={NFTActionsFor.myNFTList} />
            ))}
        </div>
    )
}

export default AuctionsNFTsList