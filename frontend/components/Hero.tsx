// "use client"

// import React from 'react'
// import { Boxes } from './ui/background-boxes'
// import { cn } from '@/lib/utils'
// import { useDispatch } from 'react-redux'
// import { globalActions } from '@/store/globalSlices'
// import { Button } from './ui/button'
// import { BackgroundBeams } from './ui/background-beams'

// const Hero = () => {
//     const dispatch = useDispatch()
//     const { toggleCreateNFTModal } = globalActions
//     return (
//         // <div className="h-[400px] lg:min-h-[calc(100vh-300px)] relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
//         //     <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
//         //     {/* <Boxes /> */}
//         //     <h1 className={cn("md:text-4xl text-xl text-white relative z-20")}>
//         //         NFT Marketplace
//         //     </h1>
//         //     <p className="text-center mt-2 text-neutral-300">
//         //         Create and sell your NFTs
//         //     </p>

//         //     <Button className='mt-4 px-12' variant={'secondary'} onClick={() => dispatch(toggleCreateNFTModal(true))}>Mint your First NFT</Button>

//         // </div>
//         <div className="h-[40rem] w-full rounded-md  relative flex flex-col items-center justify-center antialiased">
//             <div className="max-w-2xl mx-auto p-4">
//                 <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
//                     Join the waitlist
//                 </h1>
//                 <p></p>
//                 <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
//                     Welcome to MailJet, the best transactional email service on the web.
//                     We provide reliable, scalable, and customizable email solutions for
//                     your business. Whether you&apos;re sending order confirmations,
//                     password reset emails, or promotional campaigns, MailJet has got you
//                     covered.
//                 </p>
//                 <input
//                     type="text"
//                     placeholder="hi@manuarora.in"
//                     className="rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500  w-full relative z-10 mt-4  bg-neutral-950 placeholder:text-neutral-700"
//                 />
//             </div>
//             <BackgroundBeams />
//         </div>
//     )
// }

// export default Hero

"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

export function Hero({ className }: { className?: string }) {
    return (
        <HeroHighlight className={className}>
            <motion.h1
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: [20, -5, 0],
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                }}
                className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
            >
                <Highlight className="text-black dark:text-white">
                    Welcome to NFT Haven
                </Highlight>
                <br />
                Start your journey with NFT Haven today and become part of the future of digital art.
            </motion.h1>
        </HeroHighlight>
    );
}
