import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with native token transaction from wallet 5 on the sepolia network', function () {

    it('Perform the concurrent native token transactions from wallet 5 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk5;
        let sepoliaConcurrentUseropsCount_native5 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 5
            try {
                sepoliaTestNetSdk5 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY5 },
                    {
                        chainId: Number(data.sepolia_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 5 is not initialled successfully.');
            }

            // clear the transaction batch of wallet 5
            try {
                await sepoliaTestNetSdk5.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 5.');
            }

            // add transactions to the batch of wallet 5
            try {
                await sepoliaTestNetSdk5.addUserOpsToBatch({
                    to: data.recipient1,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed for wallet 5.');
            }

            // estimate transactions added to the batch for wallet 5
            let op_native5;
            let estimationCount_native5 = 0;
            const userops_native5 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_native5 >= 0) {
                    op_native5 = await sepoliaTestNetSdk5.estimate({ key: sepoliaConcurrentUseropsCount_native5 });
                    userops_native5.push(op_native5);
                    estimationCount_native5++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 5.');
            }

            // submit the transaction for wallet 5
            let submitCount_native5 = 0;
            const uoHashes_native5 = [];
            try {
                for (const op_native5 of userops_native5) {
                    const uoHash_native5 = await sepoliaTestNetSdk5.send(op_native5);
                    uoHashes_native5.push(uoHash_native5);
                    submitCount_native5++;
                }

                addContext(test, 'Total ' + submitCount_native5 + ' native token transactions are submitted on sepolia network from wallet 5 out of ' + estimationCount_native5 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native5 + ' native token transactions are submitted on sepolia network from wallet 5 out of ' + estimationCount_native5 + ' estimated native token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_native5 + ' native token transactions are submitted on sepolia network from wallet 5 out of ' + estimationCount_native5 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native5 + ' native token transactions are submitted on sepolia network from wallet 5 out of ' + estimationCount_native5 + ' estimated native token transactions')
            }

            // get block number from the transaction details of wallet 5
            try {
                console.log('Waiting for transactions of wallet 5 ...');
                const userOpsReceipts_native5 = new Array(uoHashes_native5.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native5.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native5.length; ++i) {
                        if (userOpsReceipts_native5[i]) continue;
                        const uoHash_native5 = uoHashes_native5[i];
                        userOpsReceipts_native5[i] = await sepoliaTestNetSdk5.getUserOpReceipt(uoHash_native5);
                        if (userOpsReceipts_native5[i] != null) {
                            let decimalNumber_native5 = parseInt(userOpsReceipts_native5[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native5 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network of wallet 5.')
                            console.log(decimalNumber_native5 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network of wallet 5.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction of wallet 5.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});