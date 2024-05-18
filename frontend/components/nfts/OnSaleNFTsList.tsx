"use client"

import React, { useEffect } from 'react'
import { NFT as NFTInterface, RootState } from '@/types'
import { useSelector } from 'react-redux'
import { getNftsOnSale } from '@/services/blockchain'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from '@/lib/utils'
import NFT, { NFTActionsFor } from './NFT'
import { getNFTCategories, getNFTByCategoryId } from '@/lib/nft-categories'
import { stringify } from 'querystring'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const OnSaleNFTsList = ({ className }: { className?: string }) => {
    const { onSaleNFTs } = useSelector((states: RootState) => states.globalStates)

    useEffect(() => {
        getNftsOnSale();
    }, [])
    return (
        <div className='py-10'>
            <Tabs defaultValue="all" className="w-full mt-20">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-transparent border-[1px] border-slate-700 h-auto p-2">
                    {getNFTCategories().map((category, key) => (
                        <TabsTrigger key={key} value={category}>{`${category[0].toUpperCase()}${category.slice(1)}`}</TabsTrigger>
                    ))}
                </TabsList>
                {getNFTCategories().map((category, key) => (
                    <TabsContent key={key} value={category}>
                        <CardContentByCategory category={category} nfts={onSaleNFTs} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

const CardContentByCategory = ({ category, nfts }: { category: string, nfts: NFTInterface[] }) => {
    console.log('nfts', nfts)
    console.log('category', category)
    const [componentNFTS, setComponentNFTS] = React.useState<NFTInterface[]>([])
    const [filteredNFTS, setFilteredNFTS] = React.useState<NFTInterface[]>([])
    const [activeFilters, setActiveFilters] = React.useState<any>({})
    const filters = getNFTByCategoryId(category);

    const onFilterChange = (trait_type: string, value: string | number) => {
        setActiveFilters((prevFilters: any) => ({
            ...prevFilters,
            [trait_type]: value
        }));
    };

    const resetFilters = () => {
        setActiveFilters({});
        setFilteredNFTS(componentNFTS);
    };

    useEffect(() => {
        if (category !== 'all') {
            const findNFTsByCategory = nfts.filter(nft =>
                nft.meta.attributes.find((attr: any) =>
                    attr.trait_type.toLowerCase() === 'category' && attr.value.toLowerCase() === category.toLowerCase()
                )
            );
            setComponentNFTS(findNFTsByCategory);
        } else {
            setComponentNFTS(nfts);
        }
    }, [nfts, category]);

    useEffect(() => {
        setFilteredNFTS(componentNFTS.filter(nft =>
            Object.entries(activeFilters).every(([key, value]) =>
                nft.meta.attributes.some((attr: any) =>
                    attr.trait_type.toLowerCase() === key.toLowerCase() && attr.value.toString() === value?.toString()
                )
            )
        ));
    }, [componentNFTS, activeFilters]);
    return (
        <Card className='py-6 border-0'>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4 items-end">
                    {filters?.attributes.map((attribute, key) => {
                        if (attribute.type === 'select') {
                            return (
                                <div key={key} className='flex flex-col gap-y-2 items-start'>
                                    <Label htmlFor="username" className="text-right">
                                        {attribute.name}
                                    </Label>
                                    <Select
                                        value={activeFilters[attribute.name] || null}
                                        onValueChange={(value: string) => onFilterChange(attribute.name, value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={attribute.name} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {attribute && attribute?.options ? attribute?.options.map((option: string, i: number) => (
                                                <SelectItem key={i} value={option}>
                                                    {option}
                                                </SelectItem>
                                            )) : ''}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        }
                        if (attribute.type === 'text') {
                            return (
                                <div key={key} className='flex flex-col gap-y-2 items-start'>
                                    <Label htmlFor="username" className="text-right">
                                        {attribute.name}
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder={attribute.name}
                                        onChange={(e) => onFilterChange(attribute.name, e.target.value)}
                                        value={activeFilters[attribute.name] || ''}
                                    />
                                </div>
                            )
                        }
                        if (attribute.type === 'number') {
                            return (
                                <div key={key} className='flex flex-col gap-y-2 items-start'>
                                    <Label htmlFor="username" className="text-right">
                                        {attribute.name}
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder={attribute.name}
                                        onChange={(e) => onFilterChange(attribute.name, e.target.value)}
                                        value={activeFilters[attribute.name] || ''}
                                    />
                                </div>
                            )
                        }
                    })}
                    <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
                <div className={
                    `
                    mt-10
                    pt-8
                    w-full
                    grid 
                    grid-cols-1 
                    md:grid-cols-2 
                    lg:grid-cols-3 
                    2xl:grid-cols-4
                    gap-8
                    `}>
                    {filteredNFTS?.map((nft: NFTInterface, key: number) => (
                        <NFT key={key} nft={nft} page={NFTActionsFor.saleNFTList} />
                    ))}
                </div>
            </CardContent >
            {/* <CardFooter>
            </CardFooter> */}
        </Card >
    )
}

export default OnSaleNFTsList