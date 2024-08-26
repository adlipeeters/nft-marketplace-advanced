require('@nomiclabs/hardhat-waffle')
require('dotenv').config()
const { ALCHEMY_API_URL, PRIVATE_KEY } = process.env;

module.exports = {
    // defaultNetwork: 'localhost',
    networks: {
        // localhost: {
        //     url: 'http://127.0.0.1:8545',
        // },
        sepolia: {
            url: ALCHEMY_API_URL,
            accounts: [`0x${PRIVATE_KEY}`],
        },
    },
    solidity: {
        version: '0.8.11',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    paths: {
        sources: './contracts',
        artifacts: './abis',
        // artifacts: '../backend/contract_data/abis',
    },
    mocha: {
        timeout: 40000,
    },
}