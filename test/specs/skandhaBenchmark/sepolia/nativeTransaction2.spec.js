import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with native token transaction from wallet 2 on the sepolia network', function () {

    it('Perform the concurrent native token transactions from wallet 2 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk2;
        let sepoliaConcurrentUseropsCount_native2 = 10;

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

            // clear the transaction batch of wallet 2
            try {
                await sepoliaTestNetSdk2.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 2.');
            }

            // add transactions to the batch of wallet 2
            try {
                await sepoliaTestNetSdk2.addUserOpsToBatch({
                    to: data.recipient1,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed for wallet 2.');
            }

            // estimate transactions added to the batch for wallet 2
            let op_native2;
            let estimationCount_native2 = 0;
            const userops_native2 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_native2 >= 0) {
                    op_native2 = await sepoliaTestNetSdk2.estimate({ key: sepoliaConcurrentUseropsCount_native2 });
                    userops_native2.push(op_native2);
                    estimationCount_native2++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 2.');
            }

            // submit the transaction for wallet 2
            let submitCount_native2 = 0;
            const uoHashes_native2 = [];
            try {
                for (const op_native2 of userops_native2) {
                    const uoHash_native2 = await sepoliaTestNetSdk2.send(op_native2);
                    uoHashes_native2.push(uoHash_native2);
                    submitCount_native2++;
                }

                addContext(test, 'Total ' + submitCount_native2 + ' native token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_native2 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native2 + ' native token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_native2 + ' estimated native token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_native2 + ' native token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_native2 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native2 + ' native token transactions are submitted on sepolia network from wallet 2 out of ' + estimationCount_native2 + ' estimated native token transactions')
            }

            // get block number from the transaction details of wallet 2
            try {
                console.log('Waiting for transactions of wallet 2 ...');
                const userOpsReceipts_native2 = new Array(uoHashes_native2.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native2.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native2.length; ++i) {
                        if (userOpsReceipts_native2[i]) continue;
                        const uoHash_native2 = uoHashes_native2[i];
                        userOpsReceipts_native2[i] = await sepoliaTestNetSdk2.getUserOpReceipt(uoHash_native2);
                        if (userOpsReceipts_native2[i] != null) {
                            let decimalNumber_native2 = parseInt(userOpsReceipts_native2[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native2 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network of wallet 2.')
                            console.log(decimalNumber_native2 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network of wallet 2.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction of wallet 2.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});