import { Auction, GlobalState, NFT } from '@/types'
import { PayloadAction } from '@reduxjs/toolkit'

export const globalActions = {
    setWallet: (state: GlobalState, action: PayloadAction<string>) => {
        state.wallet = action.payload
    },
    toggleCreateNFTModal: (state: GlobalState, action: PayloadAction<boolean>) => {
        state.createNFTModal = action.payload
    },
    changeNFTPrice: (state: GlobalState, action: PayloadAction<{ tokenId: number, open: boolean, oldPrice?: number }>) => {
        state.changeNFTPriceModal = action.payload
    },
    toggleNFTList: (state: GlobalState, action: PayloadAction<{ tokenId: number, open: boolean, oldPrice?: number }>) => {
        state.toggleNFTListModal = action.payload
    },
    setOwnerNFTs: (state: GlobalState, action: PayloadAction<NFT[]>) => {
        state.ownerNFTs = action.payload
    },
    setOnSaleNFTs: (state: GlobalState, action: PayloadAction<NFT[]>) => {
        state.onSaleNFTs = action.payload
    },
    setAuctions: (state: GlobalState, action: PayloadAction<Auction[]>) => {
        state.auctions = action.payload
    },
    toggleAuctionModal: (state: GlobalState, action: PayloadAction<{ tokenId: number, open: boolean }>) => {
        state.offerAuctionModal = action.payload
    }
    // setDeleteModal: (state: GlobalState, action: PayloadAction<string>) => {
    //     state.deleteModal = action.payload
    // },
    // setContestModal: (state: GlobalState, action: PayloadAction<string>) => {
    //     state.contestModal = action.payload
    // },
    // setChatModal: (state: GlobalState, action: PayloadAction<string>) => {
    //     state.chatModal = action.payload
    // },
    // setPolls: (state: GlobalState, action: PayloadAction<PollStruct[]>) => {
    //     state.polls = action.payload
    // },
    // setPoll: (state: GlobalState, action: PayloadAction<PollStruct>) => {
    //     state.poll = action.payload
    // },
    // setGroup: (state: GlobalState, action: PayloadAction<any>) => {
    //     state.group = action.payload
    // },
    // setContestants: (state: GlobalState, action: PayloadAction<ContestantStruct[]>) => {
    //     state.contestants = action.payload
    // },
    // setCurrentUser: (state: GlobalState, action: PayloadAction<any>) => {
    //     state.currentUser = action.payload
    // },
}