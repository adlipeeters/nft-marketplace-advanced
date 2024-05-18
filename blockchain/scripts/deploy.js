const { ethers } = require('hardhat');
const fs = require('fs-extra');
const path = require('path');

async function main() {
    const deployArray = [
        {
            'deployment_folder': '../frontend/contracts',
            'deployment_abis_folder': '../frontend/abis',
            'contract_address': '../frontend/contracts',
        },
        {
            'deployment_folder': '../backend/contract_data/contracts',
            'deployment_abis_folder': '../backend/contract_data/abis',
            'contract_address': '../backend/contract_data/contracts',
        },
    ];

    const contractName = 'NFTMarketplace';
    const Contract = await ethers.getContractFactory(contractName);
    const contract = await Contract.deploy();

    await contract.deployed();

    const address = JSON.stringify({ address: contract.address }, null, 4);

    for (const deploy of deployArray) {

        if (!fs.existsSync(deploy.deployment_folder)) {
            fs.mkdirSync(deploy.deployment_folder, { recursive: true });
        }

        if (!fs.existsSync(deploy.deployment_abis_folder)) {
            fs.mkdirSync(deploy.deployment_abis_folder, { recursive: true });
        }

        // Copy ABI file
        const abiSrcPath = path.join(__dirname, '..', 'abis', 'contracts', `${contractName}.sol`, `${contractName}.json`);
        const abiDestPath = path.join(deploy.deployment_abis_folder, `${contractName}.json`);

        try {
            await fs.copy(abiSrcPath, abiDestPath);
            console.log(`Copied ABI to ${abiDestPath}`);
        } catch (err) {
            console.error(`Failed to copy ABI to ${abiDestPath}`, err);
        }

        // Write contract address
        const contractAddressPath = path.join(deploy.contract_address, 'contractAddress.json');
        fs.writeFileSync(contractAddressPath, address, 'utf8');
        console.log('Deployed contract address', contract.address);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
