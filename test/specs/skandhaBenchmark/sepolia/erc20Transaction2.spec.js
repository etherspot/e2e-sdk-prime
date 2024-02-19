import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with erc20 token transaction from wallet 2 on the sepolia network', function () {

    it('Perform the concurrent erc20 token transactions from wallet 2 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk2;
        let sepoliaConcurrentUseropsCount_erc202 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 2
            try {
                sepoliaTestNetSdk2 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY2 },
                    {
                        chainId: Number(data.sepolia_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 2 is not initialled successfully.');
            }

            // get the respective provider details for wallet 2
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_sepolia,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly for wallet 2.');
            }

            // get erc20 Contract Interface for wallet 2
            let erc20Instance;
            try {
                erc20Instance = new ethers.Contract(
                    data.tokenAddress_sepoliaUSDC,
                    ERC20_ABI,
                    provider,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The get erc20 Contract Interface is not performed for wallet 2.');
            }

            // get decimals from erc20 contract for wallet 2
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 2.');
            }

            // get transferFrom encoded data for wallet 2
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient2, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 2.');
            }

            // clear the transaction batch for wallet 2
            try {
                await sepoliaTestNetSdk2.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 2.');
            }

            // add transactions to the batch for wallet 2
            try {
                await sepoliaTestNetSdk2.addUserOpsToBatch({
                    to: data.tokenAddress_sepoliaUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 2.');
            }

            // estimate transactions added to the batch for wallet 2
            let op_erc202;
            let estimationCount_erc202 = 0;
            const userops_erc202 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_erc202 >= 0) {
                    op_erc202 = await sepoliaTestNetSdk2.estimate({ key: sepoliaConcurrentUseropsCount_erc202 });
                    userops_erc202.push(op_erc202);
                    estimationCount_erc202++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 2.');
            }

            // submit the transaction for wallet 2
            let submitCount_erc202 = 0;
            const uoHashes_erc202 = [];
            try {
                for (const op_erc202 of userops_erc202) {
                    const uoHash_erc202 = await sepoliaTestNetSdk2.send(op_erc202);
                    uoHashes_erc202.push(uoHash_erc202);
                    submitCount_erc202++;
                }

                addContext(test, 'Total ' + submitCount_erc202 + ' erc20 token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_erc202 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc202 + ' erc20 token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_erc202 + ' estimated erc20 token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_erc202 + ' erc20 token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_erc202 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc202 + ' erc20 token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_erc202 + ' estimated erc20 token transactions')
            }

            // get block number from the transaction details of wallet 2
            try {
                console.log('Waiting for transactions of wallet 2 ...');
                const userOpsReceipts_erc202 = new Array(uoHashes_erc202.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc202.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc202.length; ++i) {
                        if (userOpsReceipts_erc202[i]) continue;
                        const uoHash_erc202 = uoHashes_erc202[i];
                        userOpsReceipts_erc202[i] = await sepoliaTestNetSdk2.getUserOpReceipt(uoHash_erc202);
                        if (userOpsReceipts_erc202[i] != null) {
                            let decimalNumber_erc202 = parseInt(userOpsReceipts_erc202[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc202 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 2.')
                            console.log(decimalNumber_erc202 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 2.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction of wallet 2.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});