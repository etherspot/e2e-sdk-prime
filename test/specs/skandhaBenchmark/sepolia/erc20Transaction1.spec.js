import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

describe('The PrimeSDK, Determine benchmarks of Skandha with erc20 token transaction from wallet 1 on the sepolia network', function () {

    it('Perform the concurrent erc20 token transactions from wallet 1 on the sepolia network for determine benchmarks of skandha', async function () {
        // NOTE: assume the sender wallet is deployed
        var test = this;
        let sepoliaTestNetSdk1;
        let sepoliaConcurrentUseropsCount_erc201 = 10;

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

            // get the respective provider details for wallet 1
            let provider;
            try {
                provider = new ethers.providers.JsonRpcProvider(
                    data.providerNetwork_sepolia,
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The provider response is not displayed correctly for wallet 1.');
            }

            // get erc20 Contract Interface for wallet 1
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
                assert.fail('The get erc20 Contract Interface is not performed for wallet 1.');
            }

            // get decimals from erc20 contract for wallet 1
            let decimals;
            try {
                decimals = await erc20Instance.functions.decimals();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 1.');
            }

            // get transferFrom encoded data for wallet 1
            let transactionData;
            try {
                transactionData = erc20Instance.interface.encodeFunctionData(
                    'transfer',
                    [data.recipient1, ethers.utils.parseUnits(data.erc20_value, decimals)],
                );
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The decimals from erc20 contract is not displayed correctly for wallet 1.');
            }

            // clear the transaction batch for wallet 1
            try {
                await sepoliaTestNetSdk1.clearUserOpsFromBatch();
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 1.');
            }

            // add transactions to the batch for wallet 1
            try {
                await sepoliaTestNetSdk1.addUserOpsToBatch({
                    to: data.tokenAddress_sepoliaUSDC,
                    data: transactionData,
                });

            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The transaction of the batch is not clear correctly for wallet 1.');
            }

            // estimate transactions added to the batch for wallet 1
            let op_erc201;
            let estimationCount_erc201 = 0;
            const userops_erc201 = [];

            try {
                while (--sepoliaConcurrentUseropsCount_erc201 >= 0) {
                    op_erc201 = await sepoliaTestNetSdk1.estimate({ key: sepoliaConcurrentUseropsCount_erc201 });
                    userops_erc201.push(op_erc201);
                    estimationCount_erc201++;
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('The estimate of transaction is not performed for wallet 1.');
            }

            // submit the transaction for wallet 1
            let submitCount_erc201 = 0;
            const uoHashes_erc201 = [];
            try {
                for (const op_erc201 of userops_erc201) {
                    const uoHash_erc201 = await sepoliaTestNetSdk1.send(op_erc201);
                    uoHashes_erc201.push(uoHash_erc201);
                    submitCount_erc201++;
                }

                addContext(test, 'Total ' + submitCount_erc201 + ' erc20 token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_erc201 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc201 + ' erc20 token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_erc201 + ' estimated erc20 token transactions')
            } catch (e) {
                addContext(test, 'Total ' + submitCount_erc201 + ' erc20 token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_erc201 + ' estimated erc20 token transactions')
                console.log('Total ' + submitCount_erc201 + ' erc20 token transactions are submitted on sepolia network from wallet 1 out of ' + estimationCount_erc201 + ' estimated erc20 token transactions')
            }

            // get block number from the transaction details of wallet 1
            try {
                console.log('Waiting for transactions of wallet 1 ...');
                const userOpsReceipts_erc201 = new Array(uoHashes_erc201.length).fill(null);
                const timeout = Date.now() + 60000; // 1 minute timeout
                while ((userOpsReceipts_erc201.some(receipt => receipt == null)) && (Date.now() < timeout)) {
                    for (let i = 0; i < uoHashes_erc201.length; ++i) {
                        if (userOpsReceipts_erc201[i]) continue;
                        const uoHash_erc201 = uoHashes_erc201[i];
                        userOpsReceipts_erc201[i] = await sepoliaTestNetSdk1.getUserOpReceipt(uoHash_erc201);
                        if (userOpsReceipts_erc201[i] != null) {
                            let decimalNumber_erc201 = parseInt(userOpsReceipts_erc201[i].receipt.blockNumber, 16); // Convert hexadecimal to decimal
                            addContext(test, decimalNumber_erc201 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 1.')
                            console.log(decimalNumber_erc201 + ' is the block number of the erc20 token transaction count ' + (i + 1) + ' on the sepolia network of wallet 1.');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while validating the userops receipts of the erc20 token transaction of wallet 1.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});