"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
// import { Icons } from "@/components/icons"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useSelector } from 'react-redux'
import { RootState } from '@/types'
import { connectWallet, truncate } from '@/services/blockchain'
import { Button } from "./ui/button"
import { useRouter } from "next/router"
import { usePathname } from "next/navigation"


export function Navbar() {
    const { wallet } = useSelector((states: RootState) => states.globalStates)
    // const router = useRouter();
    const currentRoute = usePathname();
    return (
        <div className="container w-full flex flex-col md:flex-row items-center justify-center gap-4 fixed z-[999] mt-5">
            <NavigationMenu className="bg-slate-900 py-3 px-12 rounded-full w-full flex-col md:flex-row gap-x-6 z-[100]  border-[1px] border-slate-700 flex-1">
                <NavigationMenuList className="w-full">
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), currentRoute == "/" ? "bg-transaprent underline underline-offset-8" : "bg-transparent")}>
                                Home
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/my-nfts" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), currentRoute == "/my-nfts" ? "bg-transaprent underline underline-offset-8" : "bg-transparent")}>
                                My NFTs
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/auctions" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), currentRoute == "/auctions" ? "bg-transaprent underline underline-offset-8" : "bg-transparent")}>
                                Auctions
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex">
                {wallet ?
                    (<Button onClick={connectWallet} className="rounded-full">{truncate({ text: wallet, startChars: 4, endChars: 4, maxLength: 11 })}</Button>)
                    : (
                        <Button className="rounded-full" onClick={connectWallet}> Connect Wallet</Button>
                    )}
            </div>
        </div>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
