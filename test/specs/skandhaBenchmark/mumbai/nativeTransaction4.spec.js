import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with native token transaction from wallet 4 on the mumbai network', function () {

    it('Perform the concurrent native token transactions from wallet 4 on the mumbai network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let mumbaiTestNetSdk4;
        let mumbaiConcurrentUseropsCount_native4 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 4
            try {
                mumbaiTestNetSdk4 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY4 },
                    {
                        chainId: Number(data.mumbai_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 4 is not initialled successfully.');
            }

            // clear the transaction batch of wallet 4
            try {
                await mumbaiTestNetSdk4.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 4.');
            }

            // add transactions to the batch of wallet 4
            try {
                await mumbaiTestNetSdk4.addUserOpsToBatch({
                    to: data.recipient1,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed for wallet 4.');
            }

            // estimate transactions added to the batch for wallet 4
            let op_native4;
            let estimationCount_native4 = 0;
            const userops_native4 = [];

            try {
                while (--mumbaiConcurrentUseropsCount_native4 >= 0) {
                    op_native4 = await mumbaiTestNetSdk4.estimate({ key: mumbaiConcurrentUseropsCount_native4 });
                    userops_native4.push(op_native4);
                    estimationCount_native4++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 4.');
            }

            // submit the transaction for wallet 4
            let submitCount_native4 = 0;
            const uoHashes_native4 = [];
            try {
                for (const op_native4 of userops_native4) {
                    const uoHash_native4 = await mumbaiTestNetSdk4.send(op_native4);
                    uoHashes_native4.push(uoHash_native4);
                    submitCount_native4++;
                }

                addContext(test, 'Total ' + submitCount_native4 + ' native token transactions are submitted on mumbai network from wallet 4 out of ' + estimationCount_native4 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native4 + ' native token transactions are submitted on mumbai network from wallet 4 out of ' + estimationCount_native4 + ' estimated native token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_native4 + ' native token transactions are submitted on mumbai network from wallet 4 out of ' + estimationCount_native4 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native4 + ' native token transactions are submitted on mumbai network from wallet 4 out of ' + estimationCount_native4 + ' estimated native token transactions')
            }

            // get block number from the transaction details of wallet 4
            try {
                console.log('Waiting for transactions of wallet 4 ...');
                const userOpsReceipts_native4 = new Array(uoHashes_native4.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native4.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native4.length; ++i) {
                        if (userOpsReceipts_native4[i]) continue;
                        const uoHash_native4 = uoHashes_native4[i];
                        userOpsReceipts_native4[i] = await mumbaiTestNetSdk4.getUserOpReceipt(uoHash_native4);
                        if (userOpsReceipts_native4[i] != null) {
                            let decimalNumber_native4 = parseInt(userOpsReceipts_native4[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native4 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the mumbai network of wallet 4.')
                            console.log(decimalNumber_native4 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the mumbai network of wallet 4.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction of wallet 4.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});