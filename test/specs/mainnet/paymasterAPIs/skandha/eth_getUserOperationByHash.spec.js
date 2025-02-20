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
} from '../../../../utils/sharedData_mainnet.js';
import helper from '../../../../utils/helper.js';

let mainnetPrimeSdk;
let uoHash;

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the get userOperation by hash endpoint of the skandha', function () {
  it(
    'PRECONDITION: Perform the transfer native token with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;

      // initializating sdk
      try {
        mainnetPrimeSdk = new PrimeSdk(
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
        await mainnetPrimeSdk.clearUserOpsFromBatch();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_clearTransaction_1);
      }

      // add transactions to the batch
      let transactionBatch;
      try {
        transactionBatch = await mainnetPrimeSdk.addUserOpsToBatch({
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
        balance = await mainnetPrimeSdk.getNativeBalance();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_getBalance_1);
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
      try {
        uoHash = await mainnetPrimeSdk.send(op);

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
    }
  );

  it(
    'SMOKE: Validate the eth_getUserOperationByHash endpoint of the skandha with valid details on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationByHash',
            params: [uoHash],
          },
          header
        );

        // Add assertions
        try {
          assert.isNumber(
            response.data.id,
            message.vali_skandha_getUserOperationByHash_id
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.sender,
            message.vali_skandha_getUserOperationByHash_sender
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.nonce,
            message.vali_skandha_getUserOperationByHash_nonce
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.initCode,
            message.vali_skandha_getUserOperationByHash_initCode
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.callData,
            message.vali_skandha_getUserOperationByHash_callData
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.callGasLimit,
            message.vali_skandha_getUserOperationByHash_callGasLimit
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.verificationGasLimit,
            message.vali_skandha_getUserOperationByHash_verificationGasLimit
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.preVerificationGas,
            message.vali_skandha_getUserOperationByHash_preVerificationGas
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.maxFeePerGas,
            message.vali_skandha_getUserOperationByHash_maxFeePerGas
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.maxPriorityFeePerGas,
            message.vali_skandha_getUserOperationByHash_maxPriorityFeePerGas
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.paymasterAndData,
            message.vali_skandha_getUserOperationByHash_paymasterAndData
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.userOperation.signature,
            message.vali_skandha_getUserOperationByHash_signature
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.entryPoint,
            message.vali_skandha_getUserOperationByHash_entryPoint
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
        assert.fail(message.fail_skandha_getUserOperationByHash_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationByHash endpoint of the skandha with invalid hash on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationByHash',
            params: [data.invalid_hash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationByHash_2);
        console.log(message.fail_skandha_getUserOperationByHash_2);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationByHash_2);
          console.log(message.vali_skandha_getUserOperationByHash_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationByHash_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationByHash endpoint of the skandha with incorrect hash on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationByHash',
            params: [data.incorrect_hash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationByHash_3);
        console.log(message.fail_skandha_getUserOperationByHash_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationByHash_3);
          console.log(message.vali_skandha_getUserOperationByHash_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationByHash_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationByHash endpoint of the skandha withOUT hash on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'eth_getUserOperationByHash',
            params: [],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationByHash_4);
        console.log(message.fail_skandha_getUserOperationByHash_4);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationByHash_4);
          console.log(message.vali_skandha_getUserOperationByHash_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationByHash_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationByHash endpoint of the skandha with invalid method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            id: 3,
            method: 'Eth_GetUserOperationByHash',
            params: [uoHash],
          },
          header
        );

        addContext(test, message.fail_skandha_getUserOperationByHash_6);
        console.log(message.fail_skandha_getUserOperationByHash_6);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationByHash_6);
          console.log(message.vali_skandha_getUserOperationByHash_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationByHash_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationByHash endpoint of the skandha with incorrect method name on the ' +
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

        addContext(test, message.fail_skandha_getUserOperationByHash_6);
        console.log(message.fail_skandha_getUserOperationByHash_6);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationByHash_6);
          console.log(message.vali_skandha_getUserOperationByHash_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationByHash_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_getUserOperationByHash endpoint of the skandha without method name on the ' +
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

        addContext(test, message.fail_skandha_getUserOperationByHash_7);
        console.log(message.fail_skandha_getUserOperationByHash_7);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getUserOperationByHash_7);
          console.log(message.vali_skandha_getUserOperationByHash_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getUserOperationByHash_7);
        }
      }
    }
  );
});
