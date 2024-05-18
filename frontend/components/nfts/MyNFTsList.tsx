"use client"

import { cn } from '@/lib/utils'
import React, { useEffect } from 'react'
import NFT, { NFTActionsFor } from './NFT'
import { NFT as NFTInterface, RootState } from '@/types'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { Button } from '../ui/button'
import { getOwnerNFTs } from '@/services/blockchain'

const MyNFTsList = ({ className }: { className?: string }) => {
    const dispatch = useDispatch()
    const { toggleCreateNFTModal } = globalActions
    const { ownerNFTs } = useSelector((states: RootState) => states.globalStates)

    useEffect(() => {
        getOwnerNFTs();
    }, [])
    // console.log(ownerNFTs)
    return (
        <div className={
            cn(className,
                `
                w-full
                grid 
                grid-cols-1 
                md:grid-cols-2 
                lg:grid-cols-3 
                2xl:grid-cols-4
                gap-8
                py-10
                `)}>
            <div className='col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-4 bg-slate-900 p-4 rounded-xl'>
                <Button className='px-12' variant={'secondary'} onClick={() => dispatch(toggleCreateNFTModal(true))}>Add NFT</Button>
            </div>
            {ownerNFTs?.map((nft, key) => (
                <NFT key={key} nft={nft} page={NFTActionsFor.myNFTList} />
            ))}
        </div>
    )
}

export default MyNFTsList