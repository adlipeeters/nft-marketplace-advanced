import { Auction as AuctionInterface, Bidder } from '@/types'
import React, { useEffect } from 'react'
import { random_attributes_colors } from '@/lib/nft-attributes-colors'
import { Badge } from '../ui/badge'
import { getBidders, pickWinner, placeBid, truncate } from '@/services/blockchain'
import { Button } from '../ui/button'
import { toast } from 'react-toastify'

import { useSelector } from 'react-redux'
import { RootState } from '@/types'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

const Auction = ({ auction }: { auction: AuctionInterface }) => {
    const { wallet } = useSelector((states: RootState) => states.globalStates)
    const [counter, setCounter] = React.useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    const [bidders, setBidders] = React.useState<Bidder[]>([])
    const [disabled, setDisabled] = React.useState(false)
    const [hasBid, sethasBid] = React.useState(false)

    const getAuctionBidders = async () => {
        const bidders = await getBidders(auction.tokenId)
        setBidders(bidders)

        const hasBid = bidders.some((bidder: Bidder) => bidder.bidder.toLowerCase() === wallet.toLowerCase())

        sethasBid(hasBid)
    }

    const placeAuctionBid = async () => {
        try {
            setDisabled(true)
            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    placeBid(auction.tokenId, Number(auction.price))
                        .then((tx) => {
                            // getAuctionBidders()
                            resolve(tx)
                        })
                        .catch((error) => { reject(error) })
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'Bid placed successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )

        } catch (error) { }
        finally {
            setDisabled(false)
        }
    }

    const pickAuctionWinner = async () => {
        try {
            setDisabled(true)
            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    pickWinner(auction.tokenId)
                        .then((tx) => {
                            // getAuctionBidders()
                            resolve(tx)
                        })
                        .catch((error) => { reject(error) })
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'Winner picked successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )

        } catch (error) { }
        finally {
            setDisabled(false)
        }

    }

    useEffect(() => {
        const calculateTimeLeft = () => {
            const countDownDate = new Date(auction?.duration * 1000).getTime();
            const now = new Date().getTime();
            const distance = countDownDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCounter({ days, hours, minutes, seconds });
        }

        // Update the countdown every second
        const interval = setInterval(calculateTimeLeft, 1000);

        // Initial calculation
        calculateTimeLeft();

        // Cleanup the interval on component unmount
        return () => clearInterval(interval);
    }, [auction.duration]);

    useEffect(() => {
        getAuctionBidders()
    }, [auction.tokenId, auction.bids])

    // useEffect

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
                    className="w-full object-cover h-[250px] max-h-[250px]"
                    src={auction?.nft?.meta?.image}
                    alt="NFT"
                />
                <div className='flex flex-col gap-y-5 w-full p-4'>
                    <div className='flex flex-col gap-y-2'>
                        <h3>{auction?.nft?.meta?.name}</h3>
                        <p className='opacity-75'>{auction?.nft?.meta?.description}</p>
                        {/* <p className='opacity-75'>{nft?.owner ? truncate(nft?.owner, 4, 4, 11) : ''}</p> */}
                        <p className='opacity-75'>Seller: {auction?.seller ? truncate({ text: auction?.seller, startChars: 4, endChars: 4, maxLength: 11 }) : ''}</p>
                    </div>
                    <div className='flex flex-wrap gap-2 border-t-[1px] pt-2'>
                        {auction?.nft?.meta?.attributes?.map((attr: { trait_type: string, value: string }, index: number) => (
                            <div key={index} className='flex justify-between items-center gap-1'>
                                {/* <p className='text-sm'>{attr.trait_type}</p> */}
                                <Badge className={`text-white ${random_attributes_colors[index]}`}>{attr.value}</Badge>
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-between items-center gap-2 border-t-[1px] pt-2'>
                        Bids: <span>{auction?.bids}</span>
                    </div>
                    <div className='flex justify-between items-center gap-2 border-t-[1px] pt-2'>
                        Bid Cost: <span>{auction?.price} ETH</span>
                    </div>
                    <div className='flex justify-between items-center gap-2 border-t-[1px] pt-2'>
                        <div>
                            Ending in: <span>{counter.days}d</span> <span>{counter.hours}h</span> <span>{counter.minutes}m</span> <span>{counter.seconds}s</span>
                        </div>
                    </div>

                    <ScrollArea className="h-48 w-full rounded-md border">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm font-medium leading-none">Bidders</h4>
                            {bidders?.map((item, _index) => (
                                <div key={_index}>
                                    <div className="text-sm flex justify-between">
                                        <div>
                                            <p>{truncate({ text: item?.bidder, startChars: 4, endChars: 4, maxLength: 11 })}</p>
                                            <Badge>{item.price} ETH</Badge>
                                        </div>
                                        <p>{item.date}</p>
                                        {/* <span className="ml-2 text-muted-foreground">{item.bid} ETH</span> */}
                                    </div>
                                    <Separator className="my-2" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className='flex w-full justify-center text-center'>
                        {
                            wallet?.toLowerCase() !== auction?.seller?.toLowerCase() ?
                                <Button
                                    variant={hasBid ? 'destructive' : 'default'}
                                    disabled={disabled || hasBid}
                                    onClick={placeAuctionBid}
                                    className='w-full'>
                                    {hasBid ? 'You have placed a bid'
                                        : 'Place Bid'}
                                </Button>
                                :
                                // <Badge variant={'destructive'} className='w-full text-center'>You are the owner of this NFT</Badge>
                                <Button disabled={disabled} onClick={pickAuctionWinner}>Pick Winner</Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auction