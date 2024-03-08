import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with erc20 token transaction from wallet 4 on the sepolia network', function () {

    it('Perform the concurrent erc20 token transactions from wallet 4 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk4;
        let sepoliaConcurrentUseropsCount_erc204 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 4
            try {
                sepoliaTestNetSdk4 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY4 },
                    {
                        chainId: Number(data.sepolia_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 4 is not initialled successfully.');
            }

            // get the respective provider details for wallet 4
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_sepolia,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly for wallet 4.');
            }

            // get erc20 Contract Interface for wallet 4
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
                assert.fail('The get erc20 Contract Interface is not performed for wallet 4.');
            }

            // get decimals from erc20 contract for wallet 4
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 4.');
            }

            // get transferFrom encoded data for wallet 4
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient4, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 4.');
            }

            // clear the transaction batch for wallet 4
            try {
                await sepoliaTestNetSdk4.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 4.');
            }

            // add transactions to the batch for wallet 4
            try {
                await sepoliaTestNetSdk4.addUserOpsToBatch({
                    to: data.tokenAddress_sepoliaUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 4.');
            }

            // estimate transactions added to the batch for wallet 4
            let op_erc204;
            let estimationCount_erc204 = 0;
            const userops_erc204 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_erc204 >= 0) {
                    op_erc204 = await sepoliaTestNetSdk4.estimate({ key: sepoliaConcurrentUseropsCount_erc204 });
                    userops_erc204.push(op_erc204);
                    estimationCount_erc204++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 4.');
            }

            // submit the transaction for wallet 4
            let submitCount_erc204 = 0;
            const uoHashes_erc204 = [];
            try {
                for (const op_erc204 of userops_erc204) {
                    const uoHash_erc204 = await sepoliaTestNetSdk4.send(op_erc204);
                    uoHashes_erc204.push(uoHash_erc204);
                    submitCount_erc204++;
                }

                addContext(test, 'Total ' + submitCount_erc204 + ' erc20 token transactions are submitted on sepolia network from wallet 4 out of ' + estimationCount_erc204 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc204 + ' erc20 token transactions are submitted on sepolia network from wallet 4 out of ' + estimationCount_erc204 + ' estimated erc20 token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_erc204 + ' erc20 token transactions are submitted on sepolia network from wallet 4 out of ' + estimationCount_erc204 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc204 + ' erc20 token transactions are submitted on sepolia network from wallet 4 out of ' + estimationCount_erc204 + ' estimated erc20 token transactions')
            }

            // get block number from the transaction details of wallet 4
            try {
                console.log('Waiting for transactions of wallet 4 ...');
                const userOpsReceipts_erc204 = new Array(uoHashes_erc204.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc204.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc204.length; ++i) {
                        if (userOpsReceipts_erc204[i]) continue;
                        const uoHash_erc204 = uoHashes_erc204[i];
                        userOpsReceipts_erc204[i] = await sepoliaTestNetSdk4.getUserOpReceipt(uoHash_erc204);
                        if (userOpsReceipts_erc204[i] != null) {
                            let decimalNumber_erc204 = parseInt(userOpsReceipts_erc204[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc204 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 4.')
                            console.log(decimalNumber_erc204 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 4.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction of wallet 4.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});