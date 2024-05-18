import { offerAuction } from "@/services/blockchain"

export interface GlobalState {
    wallet: string
    createNFTModal: boolean
    changeNFTPriceModal: {
        open: boolean
        tokenId: number,
        oldPrice?: number
    }
    toggleNFTListModal: {
        open: boolean
        tokenId: number,
        isListed?: boolean
    }
    offerAuctionModal: {
        open: boolean
        tokenId: number,
        // sec: number,
        // min: number,
        // hour: number,
        // day: number
    }
    ownerNFTs: NFT[],
    onSaleNFTs: NFT[],
    auctions: Auction[]
    // deleteModal: string
    // contestModal: string
    // chatModal: string
    // polls: PollStruct[]
    // poll: PollStruct | null
    // group: PollStruct | null
    // contestants: ContestantStruct[]
    // currentUser: PollStruct | null
}

export interface TruncateParams {
    text: string
    startChars: number
    endChars: number
    maxLength: number
}

export interface NFT {
    tokenId: number
    tokenURI: string
    price?: number
    owner?: string
    isListed?: boolean
    description?: string
    attributes?: any[]
    meta?: any
}

export interface Auction {
    tokenId: number
    duration: number
    price: number
    seller: string
    winner: string
    bids: number
    nft: NFT
}

export interface Bidder {
    bidder: string
    price: number
    date: string
}
//   export interface PollParams {
//     image: string
//     title: string
//     description: string
//     startsAt: number | string
//     endsAt: number | string
//   }

//   export interface PollStruct {
//     id: number
//     image: string
//     title: string
//     description: string
//     votes: number
//     contestants: number
//     deleted: boolean
//     director: string
//     startsAt: number
//     endsAt: number
//     timestamp: number
//     avatars: string[]
//     voters: string[]
//   }

//   export interface ContestantStruct {
//     id: number
//     image: string
//     name: string
//     voter: string
//     votes: number
//     voters: string[]
//   }

//   export interface GlobalState {
//     wallet: string
//     createModal: string
//     updateModal: string
//     deleteModal: string
//     contestModal: string
//     chatModal: string
//     polls: PollStruct[]
//     poll: PollStruct | null
//     group: PollStruct | null
//     contestants: ContestantStruct[]
//     currentUser: PollStruct | null
//   }

export type FileReq = {
    bytes: Uint8Array;
    contentType: string;
    fileName: string;
}

export interface RootState {
    globalStates: GlobalState
}