import { NFT as NFTInterface, RootState } from '@/types'
import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Switch } from "@/components/ui/switch"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { globalActions } from '@/store/globalSlices'
import { useDispatch, useSelector } from 'react-redux'
import { buyNFT, toggleNFTListing } from '@/services/blockchain'
import { toast } from 'react-toastify'
import { truncate } from '@/services/blockchain'
import { random_attributes_colors } from '@/lib/nft-attributes-colors'

// const random_attributes_colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-purple-500', 'bg-gray-500', 'bg-slate-500', 'bg-slate-700', 'bg-slate-900']

export enum NFTActionsFor {
    myNFTList = 1,
    saleNFTList = 2,
    auctionNFTList = 3,
}

// const NFT = ({ nft, myNFTPage = false, auctionPage = false }: { nft: NFTInterface, myNFTPage?: boolean, auctionPage?: boolean }) => {
const NFT = ({ nft, page }: { nft: NFTInterface, page: NFTActionsFor }) => {
    // console.log(nft)
    const [isListed, setIsListed] = React.useState<boolean>(nft?.isListed || false)
    const [disabled, setDisabled] = React.useState<boolean>(false)
    const { changeNFTPrice, toggleAuctionModal } = globalActions
    const { wallet } = useSelector((states: RootState) => states.globalStates)
    // console.log('heeeere', wallet, nft.owner)
    const dispatch = useDispatch()

    const openPriceModal = (tokenId: number, oldPrice?: number) => {
        dispatch(changeNFTPrice({ tokenId, open: true, oldPrice: oldPrice }))
    }

    const openAuctionModal = (tokenId: number) => {
        dispatch(toggleAuctionModal({ tokenId, open: true }))
    }

    const toggleListedNft = async () => {
        setIsListed(!isListed)
        setDisabled(true)

        try {
            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    toggleNFTListing(nft.tokenId)
                        .then((tx) => {
                            resolve(tx)
                        })
                        .catch((error) => { reject(error) })
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'NFT listed successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )
        } catch (error) { }
        finally {
            setDisabled(false)
        }
    }

    const buyListedNFT = async () => {
        setDisabled(true)
        try {
            if (!nft.price && nft.price == undefined) {
                toast.error('Error. Something went wrong')
            }
            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    buyNFT(nft.tokenId, Number(nft.price))
                        .then((tx) => {
                            resolve(tx)
                        })
                        .catch((error) => { reject(error) })
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'NFT bought successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )

        } catch (error) { }
        finally {
            setDisabled(false)
        }
    }

    const offerAuction = async () => {
        console.log('Offering Auction:', nft.tokenId)
    }

    return (
        <div className={
            `
            border-[1px] 
            rounded-xl 
            border-slate-700
            duration-300
            hover:-translate-y-[5px]
            cursor-pointer
            `}>
            <div className="flex flex-col items-center gap-y-3 overflow-hidden bg-slate-900 rounded-xl h-full">
                <img
                    className="w-full object-cover h-[350px] max-h-[350px]"
                    src={nft?.meta?.image}
                    alt="NFT"
                />
                <div className='flex flex-col gap-y-10 w-full p-4 '>
                    <div className='flex flex-col gap-y-2'>
                        <h3>{nft?.meta?.name}</h3>
                        <p className='opacity-75'>{nft?.meta?.description}</p>
                        {/* <p className='opacity-75'>{nft?.owner ? truncate(nft?.owner, 4, 4, 11) : ''}</p> */}
                        <p className='opacity-75'>Owner: {nft?.owner ? truncate({ text: nft?.owner, startChars: 4, endChars: 4, maxLength: 11 }) : ''}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        {nft?.meta?.attributes?.map((attr: { trait_type: string, value: string }, index: number) => (
                            <div key={index} className='flex justify-between items-center gap-1'>
                                <p className='text-sm'>{attr.trait_type}</p>
                                <Badge className={`text-white ${random_attributes_colors[index]}`}>{attr.value}</Badge>
                            </div>
                        ))}
                    </div>
                    {page === NFTActionsFor.saleNFTList ?
                        (
                            <div className="flex justify-between">
                                <p>{nft.price} ETH</p>
                                {nft.isListed ?
                                    <Badge className='bg-green-500 text-white'>NFT On Sale</Badge>
                                    :
                                    <Badge variant={'destructive'}>Not Listed</Badge>
                                }
                            </div>
                        )
                        : ''}
                    {page === NFTActionsFor.myNFTList ?
                        <div className="flex justify-between">
                            <div className='flex flex-col gap-2'>
                                <Button disabled={disabled || nft.isListed} onClick={() => openPriceModal(nft.tokenId, nft.price)}>{nft.isListed ? 'NFT is listed' : 'Update Price'}</Button>
                                <Button variant={'secondary'} disabled={disabled || nft.isListed} onClick={() => openAuctionModal(nft.tokenId)}>{nft.isListed ? 'NFT is listed' : 'Auction NFT'}</Button>
                            </div>
                            {/* <Switch id="airplane-mode" /> */}
                            {/* <Label htmlFor="airplane-mode">Airplane Mode</Label> */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center justify-center">
                                            <Switch onClick={toggleListedNft} checked={nft.isListed} disabled={disabled} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Toggle listed</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        :
                        <div>
                            <Button disabled={disabled || wallet.toLowerCase() === (nft?.owner?.toLowerCase() || '')} onClick={buyListedNFT}>
                                {wallet.toLowerCase() === (nft?.owner?.toLowerCase() || '') ? "You can't buy your own NFT" : "Buy NFT"}
                            </Button>
                        </div>
                    }
                    {page === NFTActionsFor.auctionNFTList ? '' : ''}
                </div>
            </div>
        </div >
    )
}

export default NFT