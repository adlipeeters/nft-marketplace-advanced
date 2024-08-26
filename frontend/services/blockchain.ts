import { store } from '@/store'
import { ethers } from 'ethers'
import { globalActions } from "@/store/globalSlices"
import address from '@/contracts/contractAddress.json'
// import abi from '@/abis/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import abi from '@/abis/NFTMarketplace.json'
import { Bidder, TruncateParams } from '@/types'
import { format } from "date-fns";
import { config } from 'dotenv';
config();

const { setWallet, setOwnerNFTs, setOnSaleNFTs, setAuctions } = globalActions
const ContractAddress = address.address
const ContractAbi = abi.abi
let ethereum: any
let tx: any

if (typeof window !== 'undefined') {
    ethereum = (window as any).ethereum
}

const toWei = (num: any) => ethers.utils.parseEther(num.toString())
const fromWei = (num: any) => ethers.utils.formatEther(num)

const getEthereumContract = async () => {
    const accounts = await ethereum?.request?.({ method: 'eth_accounts' })
    const provider = accounts?.[0]
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_APP_RPC_URL)
        // : new ethers.providers.JsonRpcProvider('http://localhost:8545')
    const wallet = accounts?.[0] ? null : ethers.Wallet.createRandom()
    const signer = provider.getSigner(accounts?.[0] ? undefined : wallet?.address)

    const contract = new ethers.Contract(ContractAddress, ContractAbi, signer)
    return contract
}

const connectWallet = async () => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        const accounts = await ethereum.request?.({ method: 'eth_requestAccounts' })
        store.dispatch(setWallet(accounts?.[0]))
    } catch (error) {
        reportError(error)
    }
}

const checkWallet = async () => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        const accounts = await ethereum.request?.({ method: 'eth_accounts' })

        ethereum.on('chainChanged', () => {
            window.location.reload()
        })

        ethereum.on('accountsChanged', async () => {
            store.dispatch(setWallet(accounts?.[0]))
            await checkWallet()
        })

        if (accounts?.length) {
            store.dispatch(setWallet(accounts[0]))
            getOwnerNFTs()
            getNftsOnSale()
        } else {
            store.dispatch(setWallet(''))
            reportError('Please connect wallet, no accounts found.')
        }
    } catch (error) {
        reportError(error)
    }
}

const mintNFT = async (data: any) => {
    if (!ethereum) {
        reportError('Please install Metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const { tokenURI, price } = data
        const tx = await contract?.mintToken(
            tokenURI,
            ethers.utils.parseEther(price),
            {
                value: ethers.utils.parseEther(0.025.toString())
            }
        );

        const res = await tx.wait()
        const tokenIdEvent = res.events?.find((e: any) => e?.event === 'NftItemCreated');
        const tokenId = tokenIdEvent?.args?.tokenId;

        if (tokenId) {
            console.log('Minted Token ID:', tokenId.toString());
        }
        // const polls = await getPolls()
        // store.dispatch(setPolls(polls))
        getOwnerNFTs()
        return Promise.resolve(tx)
    } catch (error) {
        reportError(error)
        return Promise.reject(error)
    }
}

const changeNFTPricing = async (tokenId: number, price: number) => {
    console.log('Changing Price:', tokenId)
    // return
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract?.changeNFTPrice(tokenId, ethers.utils.parseEther(price.toString()));
        const res = await tx.wait();
        // console.log('Price Changed:', res);
        getOwnerNFTs()
    } catch (error) {
        console.error("Error changing price:", error);
    }
}

const toggleNFTListing = async (tokenId: number) => {
    console.log('Toggling Listing:', tokenId)
    // return
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract?.toggleNFTListing(tokenId);
        const res = await tx.wait();
        // console.log('NFT Listed:', res);
        getOwnerNFTs()
    } catch (error) {
        console.error("Error listing NFT:", error);
    }
}

const buyNFT = async (tokenId: number, price: number) => {
    console.log('Buying NFT:', tokenId)
    console.log('Buying NFT price:', price)
    console.log(ethers.utils.parseEther(price.toString()))
    // return
    let fee = 2
    price += (price / 100 * fee)
    // price = 3
    // console.log(ethers.utils.parseEther(price.toString()))
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract?.buyNFT(tokenId, {
            value: ethers.utils.parseEther(price.toString())
        });
        const res = await tx.wait();
        // console.log('NFT Bought:', res);
        getOwnerNFTs()
        getNftsOnSale()
    } catch (error) {
        console.error("Error buying NFT:", error);
    }
}


const getOwnerNFTs = async () => {
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const nfts = await contract.getOwnedNfts();
        // console.log('Owned NFTs:', nfts);

        let ownerTokens = []
        if (nfts.length > 0) {
            for (let i = 0; i < nfts.length; i++) {
                const item = nfts[i];
                const tokenURI = await contract!.tokenURI(item.tokenId);
                const metaRes = await fetch(tokenURI);
                const meta = await metaRes.json();
                ownerTokens.push({
                    tokenId: Number(item.tokenId),
                    tokenURI,
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    isListed: item.isListed,
                    meta
                });
            }
        }
        console.log(ownerTokens)
        store.dispatch(setOwnerNFTs(ownerTokens))
    } catch (error) {
        console.error("Error fetching NFTs:", error);
    }
};

const getNftsOnSale = async () => {
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const nfts = await contract.getNftsOnSale();

        let nftsOnSale = []
        if (nfts.length > 0) {
            for (let i = 0; i < nfts.length; i++) {
                const item = nfts[i];
                const tokenURI = await contract!.tokenURI(item.tokenId);
                const owner = await contract!.ownerOf(item.tokenId);
                const metaRes = await fetch(tokenURI);
                const meta = await metaRes.json();
                nftsOnSale.push({
                    tokenId: Number(item.tokenId),
                    owner,
                    tokenURI, price: parseFloat(ethers.utils.formatEther(item.price)),
                    isListed: item.isListed,
                    meta
                });
            }
        }
        store.dispatch(setOnSaleNFTs(nftsOnSale))
    } catch (error) {
        console.error("Error fetching NFTs:", error);
    }
}

const offerAuction = async (tokenId: number, sec: number, min: number, hour: number, day: number) => {
    // console.log('offerAuction:', tokenId)
    // return
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract?.offerAuction(tokenId, sec, min, hour, day);
        const res = await tx.wait();
        getAuctions();
        getOwnerNFTs();
    } catch (error) {
        console.error("Error listing NFT:", error);
    }
}

const getAuctions = async () => {
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const auctions = await contract.getAuctions();
        console.log('Auctionssssssssssssssssssssssssss:', auctions);
        console.log('Auctions:', auctions);

        let auctionsList = []
        if (auctions.length > 0) {
            for (let i = 0; i < auctions.length; i++) {
                const item = auctions[i];
                const tokenURI = await contract!.tokenURI(item.tokenId);
                const metaRes = await fetch(tokenURI);
                const meta = await metaRes.json();
                auctionsList.push({
                    tokenId: Number(item.tokenId),
                    duration: Number(item.duration),
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    seller: item.seller,
                    winner: item.winner,
                    bids: Number(item.bids),
                    nft: {
                        tokenId: Number(item.tokenId),
                        tokenURI, meta,
                        price: parseFloat(ethers.utils.formatEther(item.price)),
                        isListed: false
                    }
                });
            }
        }
        store.dispatch(setAuctions(auctionsList))
    } catch (error) {
        console.error("Error fetching NFTs:", error);
    }
};

const placeBid = async (tokenId: number, price: number) => {
    console.log('Placing Bid:', tokenId, price)
    // return
    try {
        // const tx = await contract?.buyNFT(tokenId, {
        //     value: ethers.utils.parseEther(price.toString())
        // });
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract?.placeBid(tokenId, {
            value: ethers.utils.parseEther(price.toString())
        });
        const res = await tx.wait();
        // console.log('NFT Bought:', res);
        getAuctions();
    } catch (error) {
        console.error("Error buying NFT:", error);
    }
}

const pickWinner = async (tokenId: number) => {
    console.log('Picking Winner:', tokenId)
    // return
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract?.pickWinner(tokenId);
        const res = await tx.wait();
        // console.log('NFT Bought:', res);
        getAuctions();
    } catch (error) {
        console.error("Error buying NFT:", error);
    }

}

const getBidders = async (tokenId: number) => {
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const bidders = await contract.getBidders(tokenId);

        console.log('Bidders:', bidders);
        const formattedBidders: Bidder[] = [];

        if (bidders.length > 0) {
            for (let i = 0; i < bidders.length; i++) {
                const item = bidders[i];
                formattedBidders.push({
                    bidder: item.bidder,
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    date: format(new Date(item.timestamp * 1000), "dd.MM.yyyy HH:mm:ss")
                });
            }
        }

        return formattedBidders
        return bidders
    } catch (error) {
        console.error("Error fetching Bidders:", error);
    }

}

const truncate = ({ text, startChars, endChars, maxLength }: TruncateParams): string => {
    if (text.length > maxLength) {
        let start = text.substring(0, startChars)
        let end = text.substring(text.length - endChars, text.length)
        while (start.length + end.length < maxLength) {
            start = start + '.'
        }
        return start + end
    }
    return text
}

export {
    connectWallet,
    checkWallet,
    truncate,
    mintNFT,
    getOwnerNFTs,
    changeNFTPricing,
    toggleNFTListing,
    getNftsOnSale,
    buyNFT,
    offerAuction,
    getAuctions,
    placeBid,
    getBidders,
    pickWinner
    // formatDate,
    // formatTimestamp,
    // createPoll,
    // updatePoll,
    // deletePoll,
    // getPolls,
    // getPoll,
    // contestPoll,
    // getContestants,
    // voteCandidate,
}