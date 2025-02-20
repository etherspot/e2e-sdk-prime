import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { assert } from 'chai';
import { PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };
import {
  randomChainId,
  randomChainName,
} from '../../../../utils/sharedData_testnet.js';
import helper from '../../../../utils/helper.js';

let testnetPrimeSdk;
let uoHash;

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the get userOperation receipt endpoint of the skandha', function () {
  it(
    'PRECONDITION: Perform the transfer native token with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;

      // initializating sdk
      try {
        testnetPrimeSdk = new PrimeSdk(
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

      // clear the transaction batch
      try {
        await testnetPrimeSdk.clearUserOpsFromBatch();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_clearTransaction_1);
      }

      // add transactions to the batch
      let transactionBatch;
      try {
        transactionBatch = await testnetPrimeSdk.addUserOpsToBatch({
          to: data.recipient,
          value: ethers.utils.parseEther(data.value),
        });
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_addTransaction_1);
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
      try {
        uoHash = await testnetPrimeSdk.send(op);

        console.log('UserOp hash:', uoHash);
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

      // get transaction hash
      let userOpsReceipt = null;
      try {
        console.log('Waiting for transaction...');
        const timeout = Date.now() + 60000; // 1 minute timeout
        while (userOpsReceipt == null && Date.now() < timeout) {
          await helper.wait(data.mediumTimeout);
          userOpsReceipt = await testnetPrimeSdk.getUserOpReceipt(uoHash);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_getTransactionHash_1);
      }
    }
  );

  it(
    'SMOKE: Validate the eth_getUserOperationReceipt endpoint of the skandha with valid details on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationReceipt',
            params: [uoHash],
          },
          header
        );

        // Add assertions
        try {
          assert.isNumber(
            response.data.id,
            message.vali_skandha_getUserOperationReceipt_id
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOpHash,
            message.vali_skandha_getUserOperationReceipt_userOpHash
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.sender,
            message.vali_skandha_getUserOperationReceipt_sender
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.nonce,
            message.vali_skandha_getUserOperationReceipt_nonce
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.actualGasCost,
            message.vali_skandha_getUserOperationReceipt_actualGasCost
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.actualGasUsed,
            message.vali_skandha_getUserOperationReceipt_actualGasUsed
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.to,
            message.vali_skandha_getUserOperationReceipt_to
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.from,
            message.vali_skandha_getUserOperationReceipt_from
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.transactionIndex,
            message.vali_skandha_getUserOperationReceipt_transactionIndex
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.gasUsed,
            message.vali_skandha_getUserOperationReceipt_gasUsed
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.logsBloom,
            message.vali_skandha_getUserOperationReceipt_logsBloom
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.blockHash,
            message.vali_skandha_getUserOperationReceipt_blockHash
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.transactionHash,
            message.vali_skandha_getUserOperationReceipt_transactionHash
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.logs,
            message.vali_skandha_getUserOperationReceipt_logs
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.blockNumber,
            message.vali_skandha_getUserOperationReceipt_blockNumber
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.confirmations,
            message.vali_skandha_getUserOperationReceipt_confirmations
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.cumulativeGasUsed,
            message.vali_skandha_getUserOperationReceipt_cumulativeGasUsed
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.effectiveGasPrice,
            message.vali_skandha_getUserOperationReceipt_effectiveGasPrice
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.status,
            message.vali_skandha_getUserOperationReceipt_status
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.receipt.type,
            message.vali_skandha_getUserOperationReceipt_type
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_skandha_getUserOperationReceipt_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationReceipt endpoint of the skandha with invalid hash on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationReceipt',
            params: [data.invalid_hash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationReceipt_2);
        console.log(message.fail_skandha_getUserOperationReceipt_2);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationReceipt_2);
          console.log(message.vali_skandha_getUserOperationReceipt_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationReceipt_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationReceipt endpoint of the skandha with incorrect hash on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationReceipt',
            params: [data.incorrect_hash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationReceipt_3);
        console.log(message.fail_skandha_getUserOperationReceipt_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationReceipt_3);
          console.log(message.vali_skandha_getUserOperationReceipt_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationReceipt_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationReceipt endpoint of the skandha withOUT hash on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationReceipt',
            params: [],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationReceipt_4);
        console.log(message.fail_skandha_getUserOperationReceipt_4);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationReceipt_4);
          console.log(message.vali_skandha_getUserOperationReceipt_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationReceipt_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationReceipt endpoint of the skandha with invalid method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationReceipt',
            params: [uoHash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationReceipt_6);
        console.log(message.fail_skandha_getUserOperationReceipt_6);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationReceipt_6);
          console.log(message.vali_skandha_getUserOperationReceipt_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationReceipt_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationReceipt endpoint of the skandha with incorrect method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperatio',
            params: [uoHash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationReceipt_6);
        console.log(message.fail_skandha_getUserOperationReceipt_6);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationReceipt_6);
          console.log(message.vali_skandha_getUserOperationReceipt_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationReceipt_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationReceipt endpoint of the skandha without method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: '',
            params: [uoHash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationReceipt_7);
        console.log(message.fail_skandha_getUserOperationReceipt_7);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationReceipt_7);
          console.log(message.vali_skandha_getUserOperationReceipt_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationReceipt_7);
        }
      }
    }
  );
});
