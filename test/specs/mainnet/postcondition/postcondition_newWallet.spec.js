import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { ethers } from 'ethers';
import { customRetryAsync } from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import testUtils from '../../../utils/testUtils.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let xdaiMainNetSdk;

describe('Perform the postcondition for new wallet fund', function () {
  it('POSTCONDITION1: Initialize the modular sdk for new private key on the xdai network', async function () {
    const privateKey = testUtils.getPrivateKey();

    var test = this;
    await customRetryAsync(async function () {
      // wait for the execution
      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        xdaiMainNetSdk = new PrimeSdk(
          { privateKey: privateKey },
          {
            chainId: Number(data.xdai_chainid),
            bundlerProvider: new EtherspotBundler(
              Number(data.xdai_chainid),
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
  });

  it('POSTCONDITION2: Perform the transfer native token from new wallet to old wallet on the xdai network', async function () {
    var test = this;
    await customRetryAsync(async function () {
      helper.wait(data.longTimeout);

      // clear the transaction batch
      try {
        await xdaiMainNetSdk.clearUserOpsFromBatch();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_clearTransaction_1);
      }

      // get balance of the account address
      let balance;
      try {
        balance = await xdaiMainNetSdk.getNativeBalance();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_getBalance_1);
      }

      // add transactions to the batch
      let transactionBatch;
      try {
        transactionBatch = await xdaiMainNetSdk.addUserOpsToBatch({
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
        op = await xdaiMainNetSdk.estimate();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_estimateTransaction_1);
      }

      // sign the UserOp and sending to the bundler
      let uoHash;
      try {
        uoHash = await xdaiMainNetSdk.send(op);
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
        userOpsReceipt = await xdaiMainNetSdk.getUserOpReceipt(uoHash);
      }
    }, data.retry); // Retry this async test up to 3 times
  });

  it('POSTCONDITION3: Perform the transfer ERC20 token from new wallet to old wallet on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        helper.wait(data.mediumTimeout);

        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_xdai
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
            data.tokenAddress_xdaiUSDC,
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
          balance = await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
        }

        // get transferFrom encoded data
        let transactionData;
        try {
          transactionData = erc20Instance.interface.encodeFunctionData(
            'transfer',
            [
              data.sender,
              ethers.utils.parseUnits(balance, data.erc20_usdc_decimal),
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
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // add transactions to the batch
        let userOpsBatch;
        try {
          userOpsBatch = await xdaiMainNetSdk.addUserOpsToBatch({
            to: data.tokenAddress_xdaiUSDC,
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
          op = await xdaiMainNetSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await xdaiMainNetSdk.send(op);
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
            userOpsReceipt = await xdaiMainNetSdk_old.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_submitTransaction_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      addContext(test, message.erc20Transaction_insufficientBalance);
      console.warn(message.erc20Transaction_insufficientBalance);
      test.skip();
    }
  });
});
