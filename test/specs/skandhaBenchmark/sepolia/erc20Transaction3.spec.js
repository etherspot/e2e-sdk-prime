import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with erc20 token transaction from wallet 3 on the sepolia network', function () {

    it('Perform the concurrent erc20 token transactions from wallet 3 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk3;
        let sepoliaConcurrentUseropsCount_erc203 = 10;

        await customRetryAsync(async function () {
            // initializating sdk for wallet 3
            try {
                sepoliaTestNetSdk3 = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY3 },
                    {
                        chainId: Number(data.sepolia_chainid),
                        projectKey: process.env.PROJECT_KEY_TESTNET
                    },
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The SDK of wallet 3 is not initialled successfully.');
            }

            // get the respective provider details for wallet 3
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_sepolia,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly for wallet 3.');
            }

            // get erc20 Contract Interface for wallet 3
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
                assert.fail('The get erc20 Contract Interface is not performed for wallet 3.');
            }

            // get decimals from erc20 contract for wallet 3
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 3.');
            }

            // get transferFrom encoded data for wallet 3
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient3, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 3.');
            }

            // clear the transaction batch for wallet 3
            try {
                await sepoliaTestNetSdk3.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 3.');
            }

            // add transactions to the batch for wallet 3
            try {
                await sepoliaTestNetSdk3.addUserOpsToBatch({
                    to: data.tokenAddress_sepoliaUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 3.');
            }

            // estimate transactions added to the batch for wallet 3
            let op_erc203;
            let estimationCount_erc203 = 0;
            const userops_erc203 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_erc203 >= 0) {
                    op_erc203 = await sepoliaTestNetSdk3.estimate({ key: sepoliaConcurrentUseropsCount_erc203 });
                    userops_erc203.push(op_erc203);
                    estimationCount_erc203++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 3.');
            }

            // submit the transaction for wallet 3
            let submitCount_erc203 = 0;
            const uoHashes_erc203 = [];
            try {
                for (const op_erc203 of userops_erc203) {
                    const uoHash_erc203 = await sepoliaTestNetSdk3.send(op_erc203);
                    uoHashes_erc203.push(uoHash_erc203);
                    submitCount_erc203++;
                }

                addContext(test, 'Total ' + submitCount_erc203 + ' erc20 token transactions are submitted on sepolia network from wallet 3 out of ' + estimationCount_erc203 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc203 + ' erc20 token transactions are submitted on sepolia network from wallet 3 out of ' + estimationCount_erc203 + ' estimated erc20 token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_erc203 + ' erc20 token transactions are submitted on sepolia network from wallet 3 out of ' + estimationCount_erc203 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc203 + ' erc20 token transactions are submitted on sepolia network from wallet 3 out of ' + estimationCount_erc203 + ' estimated erc20 token transactions')
            }

            // get block number from the transaction details of wallet 3
            try {
                console.log('Waiting for transactions of wallet 3 ...');
                const userOpsReceipts_erc203 = new Array(uoHashes_erc203.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc203.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc203.length; ++i) {
                        if (userOpsReceipts_erc203[i]) continue;
                        const uoHash_erc203 = uoHashes_erc203[i];
                        userOpsReceipts_erc203[i] = await sepoliaTestNetSdk3.getUserOpReceipt(uoHash_erc203);
                        if (userOpsReceipts_erc203[i] != null) {
                            let decimalNumber_erc203 = parseInt(userOpsReceipts_erc203[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc203 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 3.')
                            console.log(decimalNumber_erc203 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 3.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction of wallet 3.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});