"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReloadIcon } from "@radix-ui/react-icons"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import axios from "axios";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { RootState } from "@/types";
import { offerAuction } from "@/services/blockchain"

export const AuctionOffer = () => {
    const dispatch = useDispatch()
    const { toggleAuctionModal } = globalActions
    const { offerAuctionModal } = useSelector((states: RootState) => states.globalStates)
    const [data, setData] = useState<{ price: number, date: any }>({
        price: 0,
        date: '',
    })

    const [isLoading, setIsLoading] = useState(false);

    console.log(offerAuctionModal)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {
        const now = new Date();
        const endDate = new Date(data.date);
        const diff = endDate.getTime() - now.getTime();
        const sec = Math.floor((diff / 1000) % 60);
        const min = Math.floor((diff / (1000 * 60)) % 60);
        const hour = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const day = Math.floor(diff / (1000 * 60 * 60 * 24));
        console.log(sec, min, hour, day)
        // if (!data.price) {
        //     toast.error('Please fill all fields');
        //     return;
        // }

        // if (data.price <= 0) {
        //     toast.error('Price must be greater than 0');
        //     return;
        // }


        try {
            setIsLoading(true);
            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    // offerAuction(offerAuctionModal.tokenId, day, hour, min, sec)
                    offerAuction(offerAuctionModal.tokenId, sec, min, hour, day)
                        .then((tx) => {
                            setIsLoading(false);
                            // dispatch(changeNFTPrice({ tokenId: 0, open: false, oldPrice: 0 }))
                            dispatch(toggleAuctionModal({ tokenId: 0, open: false }))
                            resolve(tx)
                        })
                        .catch((error) => reject(error))
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'NFT placed on Auction successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )
        } catch (error) {
            console.error(error)
            setIsLoading(false);
            toast.error('Error placing NFT on Auction')
        }
    };

    useEffect(() => {
        if (!toggleAuctionModal) {
            setData({
                price: 0,
                date: '',
            })
        }
    }, [toggleAuctionModal])

    const onOpenChange = (open: boolean) => {
        dispatch(toggleAuctionModal({ tokenId: 0, open: !open }))
    }

    return (
        <Dialog
            open={offerAuctionModal.open}
            onOpenChange={() => onOpenChange(offerAuctionModal.open)}
        >
            <DialogContent className="sm:max-w-[750px]">
                <DialogHeader>
                    <DialogTitle>
                        Auction Offer
                    </DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4" suppressHydrationWarning>
                    {/* <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Minimum Price
                        </Label>
                        <Input
                            disabled={isLoading}
                            className="col-span-3"
                            name="price"
                            value={data.price}
                            onChange={handleChange}
                            type="number"
                            step={0.01}
                            placeholder="Enter the price of your NFT"
                        />
                    </div> */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Select Auction End Date
                        </Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !data.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.date ? format(data.date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-full" align="start">
                                    <Calendar
                                        className="w-full"
                                        mode="single"
                                        selected={data?.date}
                                        onSelect={(date) => setData({ ...data, date })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        disabled={isLoading}
                        variant={'secondary'}
                        onClick={() => dispatch(toggleAuctionModal({ tokenId: 0, open: false }))}>Close</Button>
                    <Button
                        disabled={isLoading}
                        variant={'default'}
                        onClick={handleSubmit}>
                        {isLoading ?
                            <>
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                Please wait...
                            </>
                            : 'Place Auction'}

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}