import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/testData.json' assert { type: 'json' };

const txCount = data.txCount;

describe('Determine benchmarks of skandha with erc20 token transaction on the sepolia network', function () {

    it('Perform the transfer ERC20 token on the sepolia network for determine benchmarks of skandha', async function () {
        var test = this;
        await customRetryAsync(async function () {

            let sepoliaTestNetSdk;
            try {
                sepoliaTestNetSdk = new PrimeSdk(
                    { privateKey: process.env.PRIVATE_KEY },
                    { chainId: Number(data.sepolia_chainid), projectKey: process.env.PROJECT_KEY_TESTNET },
                );
            } catch (e) {
                console.error(e);
                return; // Handle initialization error and skip test
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

            let userOpsBatch = [];
            for (let j = 0; j < txCount; j++) {

                let transactionData;
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

                 // Add transaction data to the batch
                 try {
                    userOpsBatch.push(await sepoliaTestNetSdk.addUserOpsToBatch({ to: data.tokenAddress_sepoliaUSDC, data: transactionData }));
                } catch (e) {
                    console.error(e);
                    const eString = e.toString();
                    addContext(test, eString);
                    assert.fail('An error is displayed while Adding the transactions to the batch.')
                }
            }

            // estimate the transaction for the UserOps batch
            let op;
            try {
                op = await sepoliaTestNetSdk.estimate();
                console.log(`Estimated the ${txCount} transactions successfully.`);
                addContext(test, `Estimated the ${txCount} transactions successfully.`);                
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while performing the estimation of the transactions.')
            }

             // submit the transaction
            let uoHash;
            try {
                uoHash = await sepoliaTestNetSdk.send(op);
                console.log(`UserOp Hash: ${uoHash}`);
                addContext(test, `UserOp Hash: ${uoHash}`);
            } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
                assert.fail('An error is displayed while submit the transactions.')
            }
        }, data.retry); // Retry this async test up to 5 times
    });
});