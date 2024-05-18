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

import axios from "axios";
import { toast } from "react-toastify";
import { changeNFTPricing } from "@/services/blockchain";

import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { RootState } from "@/types";

export const ChangeNFTPrice = () => {
    const dispatch = useDispatch()
    const { changeNFTPrice } = globalActions
    const { changeNFTPriceModal } = useSelector((states: RootState) => states.globalStates)
    const [data, setData] = useState({
        price: 0,
    })

    const [isLoading, setIsLoading] = useState(false);

    // console.log(changeNFTPriceModal)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {
        if (!data.price) {
            toast.error('Please fill all fields');
            return;
        }

        if (data.price <= 0) {
            toast.error('Price must be greater than 0');
            return;
        }

        try {
            setIsLoading(true);
            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    changeNFTPricing(changeNFTPriceModal.tokenId, data.price)
                        .then((tx) => {
                            setIsLoading(false);
                            dispatch(changeNFTPrice({ tokenId: 0, open: false, oldPrice: 0 }))
                            resolve(tx)
                        })
                        .catch((error) => reject(error))
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'NFT Price Updated successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )
        } catch (error) {
            console.error(error)
            setIsLoading(false);
            toast.error('Error updating NFT Price')
        }
    };

    useEffect(() => {
        if (!changeNFTPriceModal) {
            setData({
                price: 0,
            })
        }
    }, [changeNFTPriceModal])

    const onOpenChange = (open: boolean) => {
        dispatch(changeNFTPrice({ tokenId: 0, open: !open }))
    }

    return (
        <Dialog
            open={changeNFTPriceModal.open}
            onOpenChange={() => onOpenChange(changeNFTPriceModal.open)}
        >
            <DialogContent className="sm:max-w-[750px]">
                <DialogHeader>
                    <DialogTitle>Change your NFT's price</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4" suppressHydrationWarning>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="old_price" className="text-right">
                            Old Price
                        </Label>
                        <Input
                            disabled={true}
                            className="col-span-3"
                            name="old_price"
                            value={changeNFTPriceModal?.oldPrice + ' ETH' || '- ETH'}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price
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
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        disabled={isLoading}
                        variant={'secondary'}
                        onClick={() => dispatch(changeNFTPrice({ tokenId: 0, open: false }))}>Close</Button>
                    <Button
                        disabled={isLoading}
                        variant={'default'}
                        onClick={handleSubmit}>
                        {isLoading ?
                            <>
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                Please wait...
                            </>
                            : 'Change NFT Price'}

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}