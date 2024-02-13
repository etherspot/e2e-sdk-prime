import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let mumbaiTestNetSdk;
let sepoliaTestNetSdk;
let sparknetTestNetSdk;
let concurrentUseropsCount = 50;
let count_nativemumbai = 0;
let count_nativesepolia = 0;
let count_nativesparknet = 0;
let count_erc20mumbai = 0;
let count_erc20sepolia = 0;
let count_erc20sparknet = 0;
let duration = 1000 // duration in milliseconds

describe('The PrimeSDK, Determine benchmarks on Skandha', function () {

    it('Perform the number of transfers with native and erc20 tokens on the mumbai network for determine benchmarks on skandha', async function () {
        var test = this;

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
            assert.fail(
                'The addition of transaction in the batch is not performed.',
            );
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        const startTime_native = performance.now();
        const endTime_native = startTime_native + duration;
        let op_native;
        const userops_native = [];
        const uoHashes_native = [];
        try {
            while (--concurrentUseropsCount >= 0 && performance.now() < endTime_native) {
                op_native = await mumbaiTestNetSdk.estimate({ key: concurrentUseropsCount });
                userops_native.push(op_native);
                count_nativemumbai++;
            }

            addContext(test, 'Total ' + count_nativemumbai + ' userops are processed in ' + duration + ' milliseconds for native token in mumbai network.');
            console.log('Total ' + count_nativemumbai + ' userops are processed in ' + duration + ' milliseconds for native token in mumbai network.')

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
            );
        }

        // sign the UserOp and sending to the bundler
        try {
            console.log("Sending userops...");

            for (const op_native of userops_native) {
                const uoHash_native = await mumbaiTestNetSdk.send(op_native);
                uoHashes_native.push(uoHash_native);
            }
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The sign the UserOp and sending to the bundler action is not performed.',
            );
        }

        // PERFORM THE ERC20 TOKEN

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
            assert.fail(
                'The decimals from erc20 contract is not displayed correctly.',
            );
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
            assert.fail(
                'The decimals from erc20 contract is not displayed correctly.',
            );
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
        const startTime_erc20 = performance.now();
        const endTime_erc20 = startTime_erc20 + duration
        let op_erc20;
        const userops_erc20 = [];
        const uoHashes_erc20 = [];
        try {
            while (--concurrentUseropsCount >= 0 && performance.now() < endTime_erc20) {
                op_erc20 = await mumbaiTestNetSdk.estimate({ key: concurrentUseropsCount });
                userops_erc20.push(op_erc20);
                count_erc20mumbai++;
            }

            addContext(test, 'Total ' + count_erc20mumbai + ' userops are processed in ' + duration + ' milliseconds for ERC20 token in mumbai network.');
            console.log('Total ' + count_erc20mumbai + ' userops are processed in ' + duration + ' milliseconds for ERC20 token in mumbai network.')

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
            );
        }

        // sign the UserOp and sending to the bundler
        try {
            console.log("Sending userops...");

            for (const op_erc20 of userops_erc20) {
                const uoHash_erc20 = await mumbaiTestNetSdk.send(op_erc20);
                uoHashes_erc20.push(uoHash_erc20);
            }
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The sign the UserOp and sending to the bundler action is not performed.',
            );
        }

        addContext(test, 'The total number of transactions of the native token and erc20 token are ' + (count_erc20mumbai + count_nativemumbai) + ' on the mumbai network in ' + duration + ' milliseconds each.');
        console.log('The total number of transactions of the native token and erc20 token are ' + (count_erc20mumbai + count_nativemumbai) + ' on the mumbai network in ' + duration + ' milliseconds each.')
    });

    it('Perform the number of transfers with native and erc20 tokens on the sepolia network for determine benchmarks on skandha', async function () {
        var test = this;

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
            assert.fail(
                'The addition of transaction in the batch is not performed.',
            );
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        const startTime_native = performance.now();
        const endTime_native = startTime_native + duration;
        let op_native;
        const userops_native = [];
        const uoHashes_native = [];
        try {
            while (--concurrentUseropsCount >= 0 && performance.now() < endTime_native) {
                op_native = await sepoliaTestNetSdk.estimate({ key: concurrentUseropsCount });
                userops_native.push(op_native);
                count_nativesepolia++;
            }

            addContext(test, 'Total ' + count_nativesepolia + ' userops are processed in ' + duration + ' milliseconds for native token in sepolia network.');
            console.log('Total ' + count_nativesepolia + ' userops are processed in ' + duration + ' milliseconds for native token in sepolia network.')

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
            );
        }

        // sign the UserOp and sending to the bundler
        try {
            console.log("Sending userops...");

            for (const op_native of userops_native) {
                const uoHash_native = await sepoliaTestNetSdk.send(op_native);
                uoHashes_native.push(uoHash_native);
            }
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The sign the UserOp and sending to the bundler action is not performed.',
            );
        }

        // PERFORM THE ERC20 TOKEN

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
            assert.fail(
                'The decimals from erc20 contract is not displayed correctly.',
            );
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
            assert.fail(
                'The decimals from erc20 contract is not displayed correctly.',
            );
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
        const startTime_erc20 = performance.now();
        const endTime_erc20 = startTime_erc20 + duration
        let op_erc20;
        const userops_erc20 = [];
        const uoHashes_erc20 = [];
        try {
            while (--concurrentUseropsCount >= 0 && performance.now() < endTime_erc20) {
                op_erc20 = await sepoliaTestNetSdk.estimate({ key: concurrentUseropsCount });
                userops_erc20.push(op_erc20);
                count_erc20sepolia++;
            }

            addContext(test, 'Total ' + count_erc20sepolia + ' userops are processed in ' + duration + ' milliseconds for ERC20 token in sepolia network.');
            console.log('Total ' + count_erc20sepolia + ' userops are processed in ' + duration + ' milliseconds for ERC20 token in sepolia network.')

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
            );
        }

        // sign the UserOp and sending to the bundler
        try {
            console.log("Sending userops...");

            for (const op_erc20 of userops_erc20) {
                const uoHash_erc20 = await sepoliaTestNetSdk.send(op_erc20);
                uoHashes_erc20.push(uoHash_erc20);
            }
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The sign the UserOp and sending to the bundler action is not performed.',
            );
        }

        addContext(test, 'The total number of transactions of the native token and erc20 token are ' + (count_erc20sepolia + count_nativesepolia) + ' on the sepolia network in ' + duration + ' milliseconds each.');
        console.log('The total number of transactions of the native token and erc20 token are ' + (count_erc20sepolia + count_nativesepolia) + ' on the sepolia network in ' + duration + ' milliseconds each.')
    });

    it.skip('Perform the number of transfers with native and erc20 tokens on the sparknet network for determine benchmarks on skandha', async function () {
        var test = this;

        // initializating sdk
        try {
            sparknetTestNetSdk = new PrimeSdk(
                { privateKey: process.env.PRIVATE_KEY },
                {
                    chainId: Number(data.sparknet_chainid),
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
            await sparknetTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
            await sparknetTestNetSdk.addUserOpsToBatch({
                to: data.recipient,
                value: ethers.utils.parseEther(data.value),
            });
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The addition of transaction in the batch is not performed.',
            );
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        const startTime_native = performance.now();
        const endTime_native = startTime_native + duration;
        let op_native;
        const userops_native = [];
        const uoHashes_native = [];
        try {
            while (--concurrentUseropsCount >= 0 && performance.now() < endTime_native) {
                op_native = await sparknetTestNetSdk.estimate({ key: concurrentUseropsCount });
                userops_native.push(op_native);
                count_nativesparknet++;
            }

            addContext(test, 'Total ' + count_nativesparknet + ' userops are processed in ' + duration + ' milliseconds for native token in sparknet network.');
            console.log('Total ' + count_nativesparknet + ' userops are processed in ' + duration + ' milliseconds for native token in sparknet network.')

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
            );
        }

        // sign the UserOp and sending to the bundler
        try {
            console.log("Sending userops...");

            for (const op_native of userops_native) {
                const uoHash_native = await sparknetTestNetSdk.send(op_native);
                uoHashes_native.push(uoHash_native);
            }
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The sign the UserOp and sending to the bundler action is not performed.',
            );
        }

        // PERFORM THE ERC20 TOKEN

        // get the respective provider details
        let provider;
        try {
            provider = new ethers.providers.JsonRpcProvider(
                data.providerNetwork_sparknet,
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
                data.tokenAddress_sparknetUSDC,
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
            assert.fail(
                'The decimals from erc20 contract is not displayed correctly.',
            );
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
            assert.fail(
                'The decimals from erc20 contract is not displayed correctly.',
            );
        }

        // clear the transaction batch
        try {
            await sparknetTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
            await sparknetTestNetSdk.addUserOpsToBatch({
                to: data.tokenAddress_sparknetUSDC,
                data: transactionData,
            });

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        const startTime_erc20 = performance.now();
        const endTime_erc20 = startTime_erc20 + duration
        let op_erc20;
        const userops_erc20 = [];
        const uoHashes_erc20 = [];
        try {
            while (--concurrentUseropsCount >= 0 && performance.now() < endTime_erc20) {
                op_erc20 = await sparknetTestNetSdk.estimate({ key: concurrentUseropsCount });
                userops_erc20.push(op_erc20);
                count_erc20sparknet++;
            }

            addContext(test, 'Total ' + count_erc20sparknet + ' userops are processed in ' + duration + ' milliseconds for ERC20 token in sparknet network.');
            console.log('Total ' + count_erc20sparknet + ' userops are processed in ' + duration + ' milliseconds for ERC20 token in sparknet network.')

        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
            );
        }

        // sign the UserOp and sending to the bundler
        try {
            console.log("Sending userops...");

            for (const op_erc20 of userops_erc20) {
                const uoHash_erc20 = await sparknetTestNetSdk.send(op_erc20);
                uoHashes_erc20.push(uoHash_erc20);
            }
        } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
                'The sign the UserOp and sending to the bundler action is not performed.',
            );
        }

        addContext(test, 'The total number of transactions of the native token and erc20 token are ' + (count_erc20sparknet + count_nativesparknet) + ' on the sparknet network in ' + duration + ' milliseconds each.');
        console.log('The total number of transactions of the native token and erc20 token are ' + (count_erc20sparknet + count_nativesparknet) + ' on the sparknet network in ' + duration + ' milliseconds each.')
    });
});