require('@nomiclabs/hardhat-waffle')
require('dotenv').config()

// const fs = require('fs-extra');
// const path = require('path');

// task('copy-artifacts', 'Copy artifacts to multiple directories')
//     .addOptionalParam('dest', 'The destination directory', '../frontend/abis,../backend/contract_data/abis')
//     .setAction(async ({ dest }, hre) => {
//         const destinations = dest.split(',');

//         for (const destination of destinations) {
//             const fullPath = path.resolve(__dirname, destination);
//             await fs.ensureDir(fullPath);
//             await fs.copy(hre.config.paths.artifacts, fullPath);
//             console.log(`Artifacts copied to ${fullPath}`);
//         }
//     });

module.exports = {
    defaultNetwork: 'localhost',
    networks: {
        localhost: {
            url: 'http://127.0.0.1:8545',
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