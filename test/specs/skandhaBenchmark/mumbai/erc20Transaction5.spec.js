import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with erc20 token transaction from wallet 5 on the mumbai network', function () {

    it('Perform the concurrent erc20 token transactions from wallet 5 on the mumbai network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let mumbaiTestNetSdk5;
        let mumbaiConcurrentUseropsCount_erc205 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 5
            try {
                mumbaiTestNetSdk5 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY5 },
                    {
                        chainId: Number(data.mumbai_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 5 is not initialled successfully.');
            }

            // get the respective provider details for wallet 5
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_mumbai,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly for wallet 5.');
            }

            // get erc20 Contract Interface for wallet 5
            let erc20Instance;
            try {
                erc20Instance = new ethers.Contract(
                    data.tokenAddress_mumbaiUSDC,
                    ERC20_ABI,
                    provider,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The get erc20 Contract Interface is not performed for wallet 5.');
            }

            // get decimals from erc20 contract for wallet 5
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 5.');
            }

            // get transferFrom encoded data for wallet 5
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient5, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 5.');
            }

            // clear the transaction batch for wallet 5
            try {
                await mumbaiTestNetSdk5.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 5.');
            }

            // add transactions to the batch for wallet 5
            try {
                await mumbaiTestNetSdk5.addUserOpsToBatch({
                    to: data.tokenAddress_mumbaiUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 5.');
            }

            // estimate transactions added to the batch for wallet 5
            let op_erc205;
            let estimationCount_erc205 = 0;
            const userops_erc205 = [];

            try {
                while (--mumbaiConcurrentUseropsCount_erc205 >= 0) {
                    op_erc205 = await mumbaiTestNetSdk5.estimate({ key: mumbaiConcurrentUseropsCount_erc205 });
                    userops_erc205.push(op_erc205);
                    estimationCount_erc205++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 5.');
            }

            // submit the transaction for wallet 5
            let submitCount_erc205 = 0;
            const uoHashes_erc205 = [];
            try {
                for (const op_erc205 of userops_erc205) {
                    const uoHash_erc205 = await mumbaiTestNetSdk5.send(op_erc205);
                    uoHashes_erc205.push(uoHash_erc205);
                    submitCount_erc205++;
                }

                addContext(test, 'Total ' + submitCount_erc205 + ' erc20 token transactions are submitted on mumbai network from wallet 5 out of ' + estimationCount_erc205 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc205 + ' erc20 token transactions are submitted on mumbai network from wallet 5 out of ' + estimationCount_erc205 + ' estimated erc20 token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_erc205 + ' erc20 token transactions are submitted on mumbai network from wallet 5 out of ' + estimationCount_erc205 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc205 + ' erc20 token transactions are submitted on mumbai network from wallet 5 out of ' + estimationCount_erc205 + ' estimated erc20 token transactions')
            }

            // get block number from the transaction details of wallet 5
            try {
                console.log('Waiting for transactions of wallet 5 ...');
                const userOpsReceipts_erc205 = new Array(uoHashes_erc205.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc205.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc205.length; ++i) {
                        if (userOpsReceipts_erc205[i]) continue;
                        const uoHash_erc205 = uoHashes_erc205[i];
                        userOpsReceipts_erc205[i] = await mumbaiTestNetSdk5.getUserOpReceipt(uoHash_erc205);
                        if (userOpsReceipts_erc205[i] != null) {
                            let decimalNumber_erc205 = parseInt(userOpsReceipts_erc205[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc205 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the mumbai network of wallet 5.')
                            console.log(decimalNumber_erc205 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the mumbai network of wallet 5.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction of wallet 5.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});