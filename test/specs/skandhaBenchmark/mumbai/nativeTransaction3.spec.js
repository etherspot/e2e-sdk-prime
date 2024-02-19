import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with native token transaction from wallet 3 on the mumbai network', function () {

    it('Perform the concurrent native token transactions from wallet 3 on the mumbai network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let mumbaiTestNetSdk3;
        let mumbaiConcurrentUseropsCount_native3 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 3
            try {
                mumbaiTestNetSdk3 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY3 },
                    {
                        chainId: Number(data.mumbai_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 3 is not initialled successfully.');
            }

            // clear the transaction batch of wallet 3
            try {
                await mumbaiTestNetSdk3.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 3.');
            }

            // add transactions to the batch of wallet 3
            try {
                await mumbaiTestNetSdk3.addUserOpsToBatch({
                    to: data.recipient1,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed for wallet 3.');
            }

            // estimate transactions added to the batch for wallet 3
            let op_native3;
            let estimationCount_native3 = 0;
            const userops_native3 = [];

            try {
                while (--mumbaiConcurrentUseropsCount_native3 >= 0) {
                    op_native3 = await mumbaiTestNetSdk3.estimate({ key: mumbaiConcurrentUseropsCount_native3 });
                    userops_native3.push(op_native3);
                    estimationCount_native3++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 3.');
            }

            // submit the transaction for wallet 3
            let submitCount_native3 = 0;
            const uoHashes_native3 = [];
            try {
                for (const op_native3 of userops_native3) {
                    const uoHash_native3 = await mumbaiTestNetSdk3.send(op_native3);
                    uoHashes_native3.push(uoHash_native3);
                    submitCount_native3++;
                }

                addContext(test, 'Total ' + submitCount_native3 + ' native token transactions are submitted on mumbai network from wallet 3 out of ' + estimationCount_native3 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native3 + ' native token transactions are submitted on mumbai network from wallet 3 out of ' + estimationCount_native3 + ' estimated native token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_native3 + ' native token transactions are submitted on mumbai network from wallet 3 out of ' + estimationCount_native3 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native3 + ' native token transactions are submitted on mumbai network from wallet 3 out of ' + estimationCount_native3 + ' estimated native token transactions')
            }

            // get block number from the transaction details of wallet 3
            try {
                console.log('Waiting for transactions of wallet 3 ...');
                const userOpsReceipts_native3 = new Array(uoHashes_native3.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native3.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native3.length; ++i) {
                        if (userOpsReceipts_native3[i]) continue;
                        const uoHash_native3 = uoHashes_native3[i];
                        userOpsReceipts_native3[i] = await mumbaiTestNetSdk3.getUserOpReceipt(uoHash_native3);
                        if (userOpsReceipts_native3[i] != null) {
                            let decimalNumber_native3 = parseInt(userOpsReceipts_native3[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native3 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the mumbai network of wallet 3.')
                            console.log(decimalNumber_native3 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the mumbai network of wallet 3.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction of wallet 3.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});