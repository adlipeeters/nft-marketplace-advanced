import { ethers } from 'ethers';
import dotenv from 'dotenv';
import address from '../contract_data/contracts/contractAddress.json';
import abi from '../contract_data/abis/NFTMarketplace.json'
dotenv.config();



const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = address.address
const CONTRACT_ABI = abi.abi

if (!PRIVATE_KEY || !RPC_URL) {
    console.error('Please set PRIVATE_KEY and RPC_URL in .env file');
    process.exit(1);
}

if (!CONTRACT_ADDRESS || !CONTRACT_ABI) {
    console.error('Please set CONTRACT_ADDRESS and CONTRACT_ABI in **contract_data** folder');
    process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);


const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

export const getAuctions = async () => {
    console.log('Getting auctions...');
    try {
        const auctions = await contract.getAuctions();
        return auctions;
    } catch (error) {
        console.error('Error getting auctions:', error);
    }
}

export const pickWinners = async () => {
    try {
        const tx = await contract.closeAuctionsFromCronjob();
        await tx.wait();

        // for (const auction of auctions) {
        //     if (auction.duration < Date.now() / 1000 && auction.live) {
        //         const tx = await contract.pickWinner(auction.tokenId);
        //         await tx.wait();
        //         console.log(`Winner picked for auction ${auction.tokenId}`);
        //     }
        // }
    } catch (error) {
        console.error('Error picking winners:', error);
    }
};
