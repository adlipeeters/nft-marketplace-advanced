import { GlobalState } from '@/types'

export const globalStates: GlobalState = {
    wallet: '',
    createNFTModal: false,
    ownerNFTs: [],
    onSaleNFTs: [],
    auctions: [],
    changeNFTPriceModal: {
        open: false,
        tokenId: 0,
        oldPrice: 0
    },
    toggleNFTListModal: {
        open: false,
        tokenId: 0,
        isListed: false
    },
    offerAuctionModal: {
        open: false,
        tokenId: 0,
    },
    // contestModal: 'scale-0',
    // chatModal: 'scale-0',
    // polls: [],
    // poll: null,
    // group: null,
    // contestants: [],
    // currentUser: null,
}