import { ethers } from 'ethers';
import dotenv from 'dotenv';
import address from '../contract_data/contracts/contractAddress.json';
import abi from '../contract_data/abis/NFTMarketplace.json'


dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !RPC_URL) {
    console.error('Please set PRIVATE_KEY and RPC_URL in .env file');
    process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ContractAddress = address.address
const ContractAbi = abi.abi

const contract = new ethers.Contract(ContractAddress, ContractAbi, wallet);

export const getAuctions = async () => {
    console.log('Getting auctions...');
    try {
        const auctions = await contract.getAuctions();
        console.log('Auctions:', auctions);
        // return
        return auctions;
    } catch (error) {
        console.error('Error getting auctions:', error);
    }
}

export const pickWinners = async () => {
    try {
        // const tx = await contract.pickWinner(1);
        const tx = await contract.closeAuctionsFromCronjob();
        await tx.wait();
        // const auctions = await contract.getAuctions();

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
