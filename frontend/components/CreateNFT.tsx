"use client"

import { useEffect, useState } from "react"
import { useRef } from 'react';
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
import { Textarea } from "@/components/ui/textarea"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SquareX } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import axios from "axios";
import { toast } from "react-toastify";
import { mintNFT } from "@/services/blockchain";

import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { RootState } from "@/types";

import { getNFTCategories, getNFTByCategoryId } from '@/lib/nft-categories'

type NFTData = {
    name: string;
    description: string;
    price: number;
    category: string;
    attributes: any;
}

export const CreateNFT = () => {
    const dispatch = useDispatch()
    const { toggleCreateNFTModal } = globalActions
    const { createNFTModal } = useSelector((states: RootState) => states.globalStates)
    const [data, setData] = useState<NFTData>({
        name: "",
        description: "",
        price: 0,
        category: '',
        attributes: []
    })
    const [categories] = useState<string[]>(getNFTCategories() || [])

    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef<any>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const onCategoryChange = (category: string) => {
        const attributes = getNFTByCategoryId(category)
        // console.log(attributes)
        if (attributes?.attributes) {
            setData({
                ...data,
                category,
                attributes: [...attributes?.attributes]
            })
        }
    }

    const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            fileInputRef.current = file as File | null;
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };




    const removeImage = () => {
        setImagePreview('');
    }

    const handleSubmit = async () => {
        let formattedAttributes = data.attributes.map((attr: any) => {
            return {
                trait_type: attr.name,
                value: attr.value
            }
        })

        formattedAttributes.unshift({ trait_type: 'Category', value: `${data.category[0].toUpperCase()}${data.category.slice(1)}` })

        if (!fileInputRef.current) {
            toast.error('Please select an image');
            return;
        }

        if (!data.name || !data.description || !data.price) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            setIsLoading(true);
            const file = fileInputRef.current;
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const pinataResponse = await axios.post("/api/upload", {
                bytes,
                contentType: file.type,
                fileName: file.name.replace(/\.[^/.]+$/, ""),
                body: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    attributes: formattedAttributes
                }
            })
            const tokenURI = 'https://gateway.pinata.cloud/ipfs/' + pinataResponse.data.IpfsHash;

            await toast.promise(
                new Promise<void>((resolve, reject) => {
                    mintNFT({ tokenURI, price: data.price })
                        .then((tx) => {
                            dispatch(toggleCreateNFTModal(false))
                            resolve(tx)
                        })
                        .catch((error) => reject(error))
                }),
                {
                    pending: 'Approve transaction...',
                    success: 'NFT created successfully 🎉',
                    error: 'Encountered error 🤯',
                }
            )
        } catch (error) {
            console.error(error)
            toast.error('Error creating NFT')
        }
        finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        if (!createNFTModal) {
            setData({
                name: "",
                description: "",
                price: 0,
                category: '',
                attributes: []
            })
            setImagePreview('');
        }
    }, [createNFTModal])

    const onOpenChange = (open: boolean) => {
        dispatch(toggleCreateNFTModal(!open))
    }

    return (
        <Dialog
            open={createNFTModal}
            onOpenChange={() => onOpenChange(createNFTModal)}
        >
            {/* <Button onClick={() => toggleCreateNFTModal(true)} variant="outline" className="z-50 mt-3">Create NFT</Button> */}

            <DialogContent className="sm:max-w-[750px]">
                <DialogHeader>
                    <DialogTitle>Create your NFT</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4" suppressHydrationWarning>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            disabled={isLoading}
                            className="col-span-3"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            placeholder="Enter the name of your NFT"
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            disabled={isLoading}
                            className="col-span-3"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            placeholder="Enter the description of your NFT"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Image
                        </Label>
                        <Input
                            disabled={isLoading}
                            className="col-span-3"
                            name="file"
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileUpload}
                        />

                        <div className="col-span-4 flex justify-center items-start">
                            <div className="flex items-start gap-x-2">
                                <img
                                    className="max-w-[250px] rounded-lg"
                                    src={imagePreview}
                                />
                                {imagePreview ?
                                    <button type="button" onClick={removeImage}>
                                        <SquareX className="text-red-500" />
                                    </button>
                                    : ''}
                            </div>
                        </div>

                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Category
                        </Label>
                        <div className="col-span-3 flex flex-col">
                            <Select
                                disabled={isLoading}
                                value={data.category}
                                onValueChange={(e) => onCategoryChange(e)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((category: string, index: number) => (
                                        <SelectItem disabled={category === 'all'} key={index} value={category}>
                                            {`${category[0].toUpperCase()}${category.slice(1)}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Attributes
                        </Label>
                        <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-3 p-4 rounded-xl border-[1px] border-slate-700 bg-slate-900">
                            {data.attributes.map((attribute: any, index: number) => {
                                if (attribute.type === 'select') {
                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col items-start gap-y-2"
                                        >
                                            <Label htmlFor="username" className="text-right">
                                                {attribute.name}
                                            </Label>
                                            <Select
                                                disabled={isLoading}
                                                value={attribute.value}
                                                onValueChange={(e) => setData({
                                                    ...data,
                                                    attributes: data.attributes.map((attr: any, i: number) => {
                                                        if (i === index) {
                                                            return {
                                                                ...attr,
                                                                value: e
                                                            }
                                                        }
                                                        return attr
                                                    })
                                                })}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={attribute.name} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {attribute.options.map((option: string, i: number) => (
                                                        <SelectItem key={i} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                }
                                if (attribute.type === 'number') {
                                    return (
                                        <div key={index} className='flex flex-col gap-y-2 items-start'>
                                            <Label htmlFor="username" className="text-right">
                                                {attribute.name}
                                            </Label>
                                            <Input
                                                disabled={isLoading}
                                                type="number"
                                                value={attribute.value}
                                                onChange={(e) => setData({
                                                    ...data,
                                                    attributes: data.attributes.map((attr: any, i: number) => {
                                                        if (i === index) {
                                                            return {
                                                                ...attr,
                                                                value: e.target.value
                                                            }
                                                        }
                                                        return attr
                                                    })
                                                })}
                                                placeholder={attribute.name}
                                            />
                                        </div>
                                    )
                                }
                                if (attribute.type === 'text') {
                                    return (
                                        <div key={index} className='flex flex-col gap-y-2 items-start'>
                                            <Label htmlFor="username" className="text-right">
                                                {attribute.name}
                                            </Label>
                                            <Input
                                                disabled={isLoading}
                                                type="text"
                                                value={attribute.value}
                                                onChange={(e) => setData({
                                                    ...data,
                                                    attributes: data.attributes.map((attr: any, i: number) => {
                                                        if (i === index) {
                                                            return {
                                                                ...attr,
                                                                value: e.target.value
                                                            }
                                                        }
                                                        return attr
                                                    })
                                                })}
                                                placeholder={attribute.name}
                                            />
                                        </div>
                                    )
                                }
                                return null
                            })}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        disabled={isLoading}
                        variant={'secondary'}
                        onClick={() => toggleCreateNFTModal(false)}>Close</Button>
                    <Button
                        disabled={isLoading}
                        variant={'default'}
                        onClick={handleSubmit}>
                        {isLoading ?
                            <>
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                Please wait...
                            </>
                            : 'Mint NFT'}

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}