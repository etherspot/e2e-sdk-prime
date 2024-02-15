import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../data/testData.json' assert { type: 'json' };

let mumbaiTestNetSdk;
let sepoliaTestNetSdk;
let mumbaiConcurrentUseropsCount_native = 10;
let mumbaiConcurrentUseropsCount_erc20 = 10;
let sepoliaConcurrentUseropsCount_native = 10;
let sepoliaConcurrentUseropsCount_erc20 = 10;

describe('The PrimeSDK, Determine benchmarks on Skandha', function () {

    it('Validate the number of blocks and transactions with native and erc20 tokens on the mumbai network for determine benchmarks on skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;

        await customRetryAsync(async function () {
            // initializating sdk
            try {
                mumbaiTestNetSdk = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY },
                    {
                        chainId: Number(data.mumbai_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK is not initialled successfully.');
            }

            // PERFORM THE NATIVE TOKEN

            // clear the transaction batch
            try {
                await mumbaiTestNetSdk.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly.');
            }

            // add transactions to the batch
            try {
                await mumbaiTestNetSdk.addUserOpsToBatch({
                    to: data.recipient,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed.');
            }

            // estimate transactions added to the batch and get the fee data for the UserOp
            let estimationCount_native = 0;
            let submitCount_native = 0;
            let blockCount_native = 0;
            let op_native;
            const userops_native = [];
            const uoHashes_native = [];

            try {
                while (--mumbaiConcurrentUseropsCount_native >= 0) {
                    op_native = await mumbaiTestNetSdk.estimate({ key: mumbaiConcurrentUseropsCount_native });
                    userops_native.push(op_native);
                    estimationCount_native++;
                }

                for (const op_native of userops_native) {
                    const uoHash_native = await mumbaiTestNetSdk.send(op_native);
                    uoHashes_native.push(uoHash_native);
                    submitCount_native++;
                }

                addContext(test, 'The estimated native token transaction count on mumbai network: ' + estimationCount_native);
                addContext(test, 'The submitted native token transaction count on mumbai network: ' + submitCount_native)
                console.log('The estimated native token transaction count on mumbai network: ' + estimationCount_native)
                console.log('The submitted native token transaction count on mumbai network: ' + submitCount_native)
            } catch (e) {
                addContext(test, 'The estimated native token transaction count on mumbai network: ' + estimationCount_native);
                addContext(test, 'The submitted native token transaction count on mumbai network: ' + submitCount_native)
                console.log('The estimated native token transaction count on mumbai network: ' + estimationCount_native)
                console.log('The submitted native token transaction count on mumbai network: ' + submitCount_native)
            }

            // get block number from the transaction details
            try {
                console.log('Waiting for transactions...');
                const userOpsReceipts_native = new Array(uoHashes_native.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native.length; ++i) {
                        if (userOpsReceipts_native[i]) continue;
                        const uoHash_native = uoHashes_native[i];
                        userOpsReceipts_native[i] = await mumbaiTestNetSdk.getUserOpReceipt(uoHash_native);
                        if (userOpsReceipts_native[i] != null) {
                            let decimalNumber_native = parseInt(userOpsReceipts_native[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native + ' is the block number of the native token transaction count ' + (i + 1) + ' on the mumbai network.')
                            console.log(decimalNumber_native + ' is the block number of the native token transaction count ' + (i + 1) + ' on the mumbai network.');
                            blockCount_native++;
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction.')
            }

            // get the respective provider details
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_mumbai,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly.');
            }

            // get erc20 Contract Interface
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
                assert.fail('The get erc20 Contract Interface is not performed.');
            }

            // get decimals from erc20 contract
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly.');
            }

            // get transferFrom encoded data
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly.');
            }

            // clear the transaction batch
            try {
                await mumbaiTestNetSdk.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly.');
            }

            // add transactions to the batch
            try {
                await mumbaiTestNetSdk.addUserOpsToBatch({
                    to: data.tokenAddress_mumbaiUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly.');
            }

            // estimate transactions added to the batch and get the fee data for the UserOp
            let estimationCount_erc20 = 0;
            let submitCount_erc20 = 0;
            let blockCount_erc20 = 0;
            let op_erc20;
            const userops_erc20 = [];
            const uoHashes_erc20 = [];

            try {
                while (--mumbaiConcurrentUseropsCount_erc20 >= 0) {
                    op_erc20 = await mumbaiTestNetSdk.estimate({ key: mumbaiConcurrentUseropsCount_erc20 });
                    userops_erc20.push(op_erc20);
                    estimationCount_erc20++;
                }

                for (const op_erc20 of userops_erc20) {
                    const uoHash_erc20 = await mumbaiTestNetSdk.send(op_erc20);
                    uoHashes_erc20.push(uoHash_erc20);
                    submitCount_erc20++;
                }
                addContext(test, 'The estimated erc20 token transaction count on mumbai network: ' + estimationCount_erc20);
                addContext(test, 'The submitted erc20 token transaction count on mumbai network: ' + submitCount_erc20)
                console.log('The estimated erc20 token transaction count on mumbai network: ' + estimationCount_erc20)
                console.log('The submitted erc20 token transaction count on mumbai network: ' + submitCount_erc20)
            } catch (e) {
                addContext(test, 'The estimated erc20 token transaction count on mumbai network: ' + estimationCount_erc20);
                addContext(test, 'The submitted erc20 token transaction count on mumbai network: ' + submitCount_erc20)
                console.log('The estimated erc20 token transaction count on mumbai network: ' + estimationCount_erc20)
                console.log('The submitted erc20 token transaction count on mumbai network: ' + submitCount_erc20)
            }

            // get block number from the transaction details
            try {
                console.log('Waiting for transactions...');
                const userOpsReceipts_erc20 = new Array(uoHashes_erc20.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc20.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc20.length; ++i) {
                        if (userOpsReceipts_erc20[i]) continue;
                        const uoHash_erc20 = uoHashes_erc20[i];
                        userOpsReceipts_erc20[i] = await mumbaiTestNetSdk.getUserOpReceipt(uoHash_erc20);
                        if (userOpsReceipts_erc20[i] != null) {
                            let decimalNumber_erc20 = parseInt(userOpsReceipts_erc20[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc20 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the mumbai network.')
                            console.log(decimalNumber_erc20 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the mumbai network.');
                            blockCount_erc20++;
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction.')
            }

            addContext(test, 'Total ' + (submitCount_native + submitCount_erc20) + ' transactions of the native token and erc20 token are submitted with ' + (blockCount_native + blockCount_erc20) + ' block numbers on the mumbai network.');
            console.log('Total ' + (submitCount_native + submitCount_erc20) + ' transactions of the native token and erc20 token are submitted with ' + (blockCount_native + blockCount_erc20) + ' block numbers on the mumbai network.')

        }, data.retry); // Retry this async test up to 5 times
    });

    it('Validate the number of blocks and transactions with native and erc20 tokens on the sepolia network for determine benchmarks on skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;

        await customRetryAsync(async function () {
            // initializating sdk
            try {
                sepoliaTestNetSdk = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY },
                    {
                        chainId: Number(data.sepolia_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK is not initialled successfully.');
            }

            // PERFORM THE NATIVE TOKEN

            // clear the transaction batch
            try {
                await sepoliaTestNetSdk.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly.');
            }

            // add transactions to the batch
            try {
                await sepoliaTestNetSdk.addUserOpsToBatch({
                    to: data.recipient,
                    value: ethers.utils.parseEther(data.value),
                });
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The addition of transaction in the batch is not performed.');
            }

            // estimate transactions added to the batch and get the fee data for the UserOp
            let estimationCount_native = 0;
            let submitCount_native = 0;
            let blockCount_native = 0;
            let op_native;
            const userops_native = [];
            const uoHashes_native = [];

            try {
                while (--sepoliaConcurrentUseropsCount_native >= 0) {
                    op_native = await sepoliaTestNetSdk.estimate({ key: sepoliaConcurrentUseropsCount_native });
                    userops_native.push(op_native);
                    estimationCount_native++;
                }

                for (const op_native of userops_native) {
                    const uoHash_native = await sepoliaTestNetSdk.send(op_native);
                    uoHashes_native.push(uoHash_native);
                    submitCount_native++;
                }

                addContext(test, 'The estimated native token transaction count on sepolia network: ' + estimationCount_native);
                addContext(test, 'The submitted native token transaction count on sepolia network: ' + submitCount_native)
                console.log('The estimated native token transaction count on sepolia network: ' + estimationCount_native)
                console.log('The submitted native token transaction count on sepolia network: ' + submitCount_native)
            } catch (e) {
                addContext(test, 'The estimated native token transaction count on sepolia network: ' + estimationCount_native);
                addContext(test, 'The submitted native token transaction count on sepolia network: ' + submitCount_native)
                console.log('The estimated native token transaction count on sepolia network: ' + estimationCount_native)
                console.log('The submitted native token transaction count on sepolia network: ' + submitCount_native)
            }

            // get block number from the transaction details
            try {
                console.log('Waiting for transactions...');
                const userOpsReceipts_native = new Array(uoHashes_native.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_native.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_native.length; ++i) {
                        if (userOpsReceipts_native[i]) continue;
                        const uoHash_native = uoHashes_native[i];
                        userOpsReceipts_native[i] = await sepoliaTestNetSdk.getUserOpReceipt(uoHash_native);
                        if (userOpsReceipts_native[i] != null) {
                            let decimalNumber_native = parseInt(userOpsReceipts_native[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_native + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network.')
                            console.log(decimalNumber_native + ' is the block number of the native token transaction count ' + (i + 1) + ' on the sepolia network.');
                            blockCount_native++;
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the native token transaction.')
            }

            // get the respective provider details
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_sepolia,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly.');
            }

            // get erc20 Contract Interface
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
                assert.fail('The get erc20 Contract Interface is not performed.');
            }

            // get decimals from erc20 contract
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly.');
            }

            // get transferFrom encoded data
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly.');
            }

            // clear the transaction batch
            try {
                await sepoliaTestNetSdk.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly.');
            }

            // add transactions to the batch
            try {
                await sepoliaTestNetSdk.addUserOpsToBatch({
                    to: data.tokenAddress_sepoliaUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly.');
            }

            // estimate transactions added to the batch and get the fee data for the UserOp
            let estimationCount_erc20 = 0;
            let submitCount_erc20 = 0;
            let blockCount_erc20 = 0;
            let op_erc20;
            const userops_erc20 = [];
            const uoHashes_erc20 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_erc20 >= 0) {
                    op_erc20 = await sepoliaTestNetSdk.estimate({ key: sepoliaConcurrentUseropsCount_erc20 });
                    userops_erc20.push(op_erc20);
                    estimationCount_erc20++;
                }

                for (const op_erc20 of userops_erc20) {
                    const uoHash_erc20 = await sepoliaTestNetSdk.send(op_erc20);
                    uoHashes_erc20.push(uoHash_erc20);
                    submitCount_erc20++;
                }
                addContext(test, 'The estimated erc20 token transaction count on sepolia network: ' + estimationCount_erc20);
                addContext(test, 'The submitted erc20 token transaction count on sepolia network: ' + submitCount_erc20)
                console.log('The estimated erc20 token transaction count on sepolia network: ' + estimationCount_erc20)
                console.log('The submitted erc20 token transaction count on sepolia network: ' + submitCount_erc20)
            } catch (e) {
                addContext(test, 'The estimated erc20 token transaction count on sepolia network: ' + estimationCount_erc20);
                addContext(test, 'The submitted erc20 token transaction count on sepolia network: ' + submitCount_erc20)
                console.log('The estimated erc20 token transaction count on sepolia network: ' + estimationCount_erc20)
                console.log('The submitted erc20 token transaction count on sepolia network: ' + submitCount_erc20)
            }

            // get block number from the transaction details
            try {
                console.log('Waiting for transactions...');
                const userOpsReceipts_erc20 = new Array(uoHashes_erc20.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc20.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc20.length; ++i) {
                        if (userOpsReceipts_erc20[i]) continue;
                        const uoHash_erc20 = uoHashes_erc20[i];
                        userOpsReceipts_erc20[i] = await sepoliaTestNetSdk.getUserOpReceipt(uoHash_erc20);
                        if (userOpsReceipts_erc20[i] != null) {
                            let decimalNumber_erc20 = parseInt(userOpsReceipts_erc20[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc20 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network.')
                            console.log(decimalNumber_erc20 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network.');
                            blockCount_erc20++;
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction.')
            }

            addContext(test, 'Total ' + (submitCount_native + submitCount_erc20) + ' transactions of the native token and erc20 token are submitted with ' + (blockCount_native + blockCount_erc20) + ' block numbers on the sepolia network.');
            console.log('Total ' + (submitCount_native + submitCount_erc20) + ' transactions of the native token and erc20 token are submitted with ' + (blockCount_native + blockCount_erc20) + ' block numbers on the sepolia network.')

        }, data.retry); // Retry this async test up to 5 times
    });
});