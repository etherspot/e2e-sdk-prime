import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { ethers } from 'ethers';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import {
  randomChainId,
  randomChainName,
  randomProviderNetwork,
  randomTokenAddress,
} from '../../../utils/sharedData_mainnet.js';
import customRetryAsync from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let mainnetPrimeSdk;
let mainnetPrimeSdk_old;
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Perform the postcondition for new wallet fund', function () {
  it(
    'POSTCONDITION1: Initialize the modular sdk for new private key on the ' +
      randomChainName +
      ' network',
    async function () {
      const filePath = path.join(__dirname, '../../../utils/testUtils.json');
      const sharedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      var test = this;
      await customRetryAsync(async function () {
        // wait for the execution
        helper.wait(data.mediumTimeout);

        // initializating sdk
        try {
          mainnetPrimeSdk = new PrimeSdk(
            {
              privateKey: sharedState.newPrivateKey,
            },
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
      }, data.retry); // Retry this async test up to 3 times
    }
  );

  it(
    'POSTCONDITION2: Perform the transfer ERC20 token from new wallet to old wallet on the ' +
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

        // get balance of the account address
        let balance;
        try {
          balance = await mainnetPrimeSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
        }

        // get transferFrom encoded data
        let transactionData;
        balance = balance - 0.001;
        const balanceStr = balance.toFixed(3);
        try {
          transactionData = erc20Instance.interface.encodeFunctionData(
            'transfer',
            [
              data.sender,
              ethers.utils.parseUnits(balanceStr, data.erc20_usdc_decimal),
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
          await mainnetPrimeSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // add transactions to the batch
        let userOpsBatch;
        try {
          userOpsBatch = await mainnetPrimeSdk.addUserOpsToBatch({
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
          op = await mainnetPrimeSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await mainnetPrimeSdk.send(op);
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
            userOpsReceipt = await mainnetPrimeSdk_old.getUserOpReceipt(uoHash);
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
    'POSTCONDITION3: Perform the transfer native token from new wallet to old wallet on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      await customRetryAsync(async function () {
        helper.wait(data.longTimeout);

        // clear the transaction batch
        try {
          await mainnetPrimeSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // get balance of the account address
        let balance;
        try {
          balance = await mainnetPrimeSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          balance = balance - 0.0001;
          const balanceStr = balance.toFixed(3);

          transactionBatch = await mainnetPrimeSdk.addUserOpsToBatch({
            to: data.sender,
            value: ethers.utils.parseEther(balanceStr),
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
          op = await mainnetPrimeSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await mainnetPrimeSdk.send(op);
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
        console.log('Waiting for transaction...');
        let userOpsReceipt = null;
        const timeout = Date.now() + 1200000; // 1 minute timeout
        while (userOpsReceipt == null && Date.now() < timeout) {
          helper.wait(data.mediumTimeout);
          userOpsReceipt = await mainnetPrimeSdk.getUserOpReceipt(uoHash);
        }
      }, data.retry); // Retry this async test up to 3 times
    }
  );
});
