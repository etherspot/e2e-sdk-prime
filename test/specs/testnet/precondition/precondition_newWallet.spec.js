import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { randomPrivateKey } from 'etherspot';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { ethers } from 'ethers';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import {
  randomChainId,
  randomChainName,
  randomProviderNetwork,
  randomTokenAddress,
} from '../../../utils/sharedData_testnet.js';
import { customRetryAsync } from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let testnetPrimeSdk_old;
let testnetPrimeSdk;
let primeAccountAddress;
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Perform the precondition for new wallet generation', function () {
  it(
    'PRECONDITION1: Create random private key on the ' +
      randomChainName +
      ' network',
    async function () {
      // Generate a random private key
      const randomPrivateKeyString = randomPrivateKey();

      console.log('randomPrivateKeyString', randomPrivateKeyString);

      // Store privatekey in utility

      const valueToPersist = { newPrivateKey: randomPrivateKeyString };
      const filePath = path.join(__dirname, '../../../utils/testUtils.json');
      fs.writeFileSync(filePath, JSON.stringify(valueToPersist));
    }
  );

  it(
    'PRECONDITION2: Initialize the prime sdk for new private key on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      await customRetryAsync(async function () {
        const filePath = path.join(__dirname, '../../../utils/testUtils.json');
        const sharedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // wait for the execution
        helper.wait(data.mediumTimeout);

        // initializating sdk
        try {
          testnetPrimeSdk = new PrimeSdk(
            { privateKey: sharedState.newPrivateKey },
            {
              chainId: Number(randomChainId),
              bundlerProvider: new EtherspotBundler(
                Number(randomChainId),
                process.env.BUNDLER_API_KEY
              ),
            }
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_sdk_initialize);
        }

        // get prime account address
        try {
          primeAccountAddress =
            await testnetPrimeSdk.getCounterFactualAddress();

          console.log('primeAccountAddress', primeAccountAddress);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_smart_address);
        }
      }, data.retry); // Retry this async test up to 3 times
    }
  );

  it(
    'PRECONDITION3: Perform the transfer native token from old wallet to new wallet on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      await customRetryAsync(async function () {
        // wait for the execution
        helper.wait(data.mediumTimeout);

        // initializating sdk
        try {
          testnetPrimeSdk_old = new PrimeSdk(
            { privateKey: process.env.PRIVATE_KEY },
            {
              chainId: Number(randomChainId),
              bundlerProvider: new EtherspotBundler(
                Number(randomChainId),
                process.env.BUNDLER_API_KEY
              ),
            }
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_sdk_initialize);
        }

        // wait for the execution
        helper.wait(data.mediumTimeout);

        // clear the transaction batch
        try {
          await testnetPrimeSdk_old.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // add transactions to the batch
        let transactionBatch;

        try {
          transactionBatch = await testnetPrimeSdk_old.addUserOpsToBatch({
            to: primeAccountAddress,
            value: ethers.utils.parseEther(data.newWallet_value),
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addTransaction_1);
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await testnetPrimeSdk_old.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await testnetPrimeSdk_old.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          if (eString === 'Error') {
            console.warn(message.skip_transaction_error);
            addContext(test, message.skip_transaction_error);
            test.skip();
          } else {
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }
        }

        // get transaction hash...
        try {
          console.log('Waiting for transaction...');
          let userOpsReceipt = null;
          const timeout = Date.now() + 60000; // 1 minute timeout
          while (userOpsReceipt == null && Date.now() < timeout) {
            helper.wait(data.mediumTimeout);
            userOpsReceipt = await testnetPrimeSdk_old.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_submitTransaction_1);
        }
      }, data.retry); // Retry this async test up to 3 times
    }
  );

  it(
    'PRECONDITION4: Perform the transfer ERC20 token from old wallet to new wallet on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;

      await customRetryAsync(async function () {
        helper.wait(data.mediumTimeout);

        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            randomProviderNetwork
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_erc20Transfer_provider);
        }

        // get erc20 Contract Interface
        let erc20Instance;
        try {
          erc20Instance = new ethers.Contract(
            randomTokenAddress,
            ERC20_ABI,
            provider
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_erc20Transfer_contractInterface);
        }

        // get transferFrom encoded data
        let transactionData;
        try {
          transactionData = erc20Instance.interface.encodeFunctionData(
            'transfer',
            [
              primeAccountAddress,
              ethers.utils.parseUnits(
                data.newWallet_erc20value,
                data.erc20_usdc_decimal
              ),
            ]
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_erc20Contract_transferFrom);
        }

        // clear the transaction batch
        try {
          await testnetPrimeSdk_old.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // add transactions to the batch
        let userOpsBatch;
        try {
          userOpsBatch = await testnetPrimeSdk_old.addUserOpsToBatch({
            to: randomTokenAddress,
            data: transactionData,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await testnetPrimeSdk_old.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await testnetPrimeSdk_old.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          if (eString === 'Error') {
            console.warn(message.skip_transaction_error);
            addContext(test, message.skip_transaction_error);
            test.skip();
          } else {
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }
        }

        // get transaction hash...
        try {
          console.log('Waiting for transaction...');
          let userOpsReceipt = null;
          const timeout = Date.now() + 60000; // 1 minute timeout
          while (userOpsReceipt == null && Date.now() < timeout) {
            helper.wait(data.mediumTimeout);
            userOpsReceipt = await testnetPrimeSdk_old.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_submitTransaction_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    }
  );

  it(
    'PRECONDITION5: Perform the transfer native token from new wallet to old wallet on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;

      await customRetryAsync(async function () {
        // wait for the execution
        helper.wait(data.mediumTimeout);

        // clear the transaction batch
        try {
          await testnetPrimeSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // get balance of the account address
        let balance;
        try {
          balance = await testnetPrimeSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await testnetPrimeSdk.addUserOpsToBatch({
            to: data.sender,
            value: ethers.utils.parseEther(balance),
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addTransaction_1);
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await testnetPrimeSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await testnetPrimeSdk.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          if (eString === 'Error') {
            console.warn(message.skip_transaction_error);
            addContext(test, message.skip_transaction_error);
            test.skip();
          } else {
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }
        }

        // get transaction hash...
        try {
          console.log('Waiting for transaction...');
          let userOpsReceipt = null;
          const timeout = Date.now() + 60000; // 1 minute timeout
          while (userOpsReceipt == null && Date.now() < timeout) {
            helper.wait(data.mediumTimeout);
            userOpsReceipt = await testnetPrimeSdk.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_submitTransaction_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    }
  );
});
