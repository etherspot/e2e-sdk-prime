import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with native token transaction from wallet 1 on the sepolia network', function () {

    it('Perform the concurrent native token transactions from wallet 1 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk1;
        let sepoliaConcurrentUseropsCount_native1 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 1
            try {
                sepoliaTestNetSdk1 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY1 },
                    {
                        chainId: Number(data.sepolia_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 1 is not initialled successfully.');
            }

            // clear the transaction batch of wallet 1
            try {
                await sepoliaTestNetSdk1.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 1.');
            }

            // add transactions to the batch of wallet 1
            try {
                await sepoliaTestNetSdk1.addUserOpsToBatch({
                    to: data.recipient1,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed for wallet 1.');
            }

            // estimate transactions added to the batch for wallet 1
            let op_native1;
            let estimationCount_native1 = 0;
            const userops_native1 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_native1 >= 0) {
                    op_native1 = await sepoliaTestNetSdk1.estimate({ key: sepoliaConcurrentUseropsCount_native1 });
                    userops_native1.push(op_native1);
                    estimationCount_native1++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 1.');
            }

            // submit the transaction for wallet 1
            let submitCount_native1 = 0;
            const uoHashes_native1 = [];
            try {
                for (const op_native1 of userops_native1) {
                    const uoHash_native1 = await sepoliaTestNetSdk1.send(op_native1);
                    uoHashes_native1.push(uoHash_native1);
                    submitCount_native1++;
                }

                addContext(test, 'Total ' + submitCount_native1 + ' native token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_native1 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native1 + ' native token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_native1 + ' estimated native token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_native1 + ' native token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_native1 + ' estimated native token transactions')
                console.log('Total ' + submitCount_native1 + ' native token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_native1 + ' estimated native token transactions')
            }

            // get block number from the transaction details of wallet 1
            try {
                console.log('Waiting for transactions of wallet 1 ...');
                const userOpsReceipts_native1 = new Array(uoHashes_native1.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native1.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native1.length; ++i) {
                        if (userOpsReceipts_native1[i]) continue;
                        const uoHash_native1 = uoHashes_native1[i];
                        userOpsReceipts_native1[i] = await sepoliaTestNetSdk1.getUserOpReceipt(uoHash_native1);
                        if (userOpsReceipts_native1[i] != null) {
                            let decimalNumber_native1 = parseInt(userOpsReceipts_native1[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native1 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network of wallet 1.')
                            console.log(decimalNumber_native1 + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network of wallet 1.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction of wallet 1.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});