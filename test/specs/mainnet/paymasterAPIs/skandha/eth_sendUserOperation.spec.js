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
let sender;
let nonce;
let initCode;
let callData;
let callGasLimit;
let verificationGasLimit;
let maxFeePerGas;
let maxPriorityFeePerGas;
let paymasterAndData;
let preVerificationGas;
let signature;

//define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the send user operation endpoint of the skandha', function () {
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

      //wait for the execution
      helper.wait(data.mediumTimeout);

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

      // estimate transactions added to the batch and get the fee data for the UserOp
      let op;
      try {
        op = await mainnetPrimeSdk.estimate();

        sender = op.sender;
        nonce = op.nonce;
        initCode = op.initCode;
        callData = op.callData;
        callGasLimit = op.callGasLimit;
        verificationGasLimit = op.verificationGasLimit;
        maxFeePerGas = op.maxFeePerGas;
        maxPriorityFeePerGas = op.maxPriorityFeePerGas;
        paymasterAndData = op.paymasterAndData;
        preVerificationGas = op.preVerificationGas;
        signature = op.signature;
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_estimateTransaction_1);
      }
    }
  );

  it(
    'SMOKE: Validate the eth_sendUserOperation endpoint of the skandha with valid details on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: data.sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        // Add assertions
        try {
          assert.isNumber(
            response.data.id,
            message.vali_skandha_sendUserOperation_id
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result,
            message.vali_skandha_sendUserOperation_result
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
        assert.fail(message.fail_skandha_sendUserOperation_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid sender on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: data.invalidSender, // invalid sender
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_2);
        console.log(message.fail_skandha_sendUserOperation_2);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_2);
          console.log(message.vali_skandha_sendUserOperation_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect sender on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: data.incorrectSender, // incorrect sender
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_3);
        console.log(message.fail_skandha_sendUserOperation_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_3);
          console.log(message.vali_skandha_sendUserOperation_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without sender on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                nonce: nonce, // without sender
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_3);
        console.log(message.fail_skandha_sendUserOperation_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_3);
          console.log(message.vali_skandha_sendUserOperation_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid nonce on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: data.invalid_hex, // invalid nonce
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_5);
        console.log(message.fail_skandha_sendUserOperation_5);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_5);
          console.log(message.vali_skandha_sendUserOperation_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect nonce on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: data.incorrect_hex, // incorrect nonce
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_6);
        console.log(message.fail_skandha_sendUserOperation_6);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_6);
          console.log(message.vali_skandha_sendUserOperation_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without nonce on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender, // without nonce
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_7);
        console.log(message.fail_skandha_sendUserOperation_7);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_7);
          console.log(message.vali_skandha_sendUserOperation_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid initCode on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: data.invalid_hex, // invalid initCode
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_8);
        console.log(message.fail_skandha_sendUserOperation_8);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_8);
          console.log(message.vali_skandha_sendUserOperation_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_8);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect initCode on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: data.incorrect_hex, // incorrect initCode
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_9);
        console.log(message.fail_skandha_sendUserOperation_9);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_9);
          console.log(message.vali_skandha_sendUserOperation_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_9);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without initCode on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce, // without initCode
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_10);
        console.log(message.fail_skandha_sendUserOperation_10);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_10);
          console.log(message.vali_skandha_sendUserOperation_10);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_10);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid callData on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: data.invalid_hex, // invalid callData
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_11);
        console.log(message.fail_skandha_sendUserOperation_11);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_11);
          console.log(message.vali_skandha_sendUserOperation_11);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_11);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect callData on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: data.incorrect_hex, // incorrect callData
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_12);
        console.log(message.fail_skandha_sendUserOperation_12);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_12);
          console.log(message.vali_skandha_sendUserOperation_12);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_12);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without callData on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode, // without callData
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_13);
        console.log(message.fail_skandha_sendUserOperation_13);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_13);
          console.log(message.vali_skandha_sendUserOperation_13);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_13);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid callGasLimit on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: data.invalid_hex, // invalid callGasLimit
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_14);
        console.log(message.fail_skandha_sendUserOperation_14);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_14);
          console.log(message.vali_skandha_sendUserOperation_14);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_14);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect callGasLimit on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: data.incorrect_hex, // incorrect callGasLiit
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_15);
        console.log(message.fail_skandha_sendUserOperation_15);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_15);
          console.log(message.vali_skandha_sendUserOperation_15);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_15);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without callGasLimit on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData, // without callGasLimit
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_16);
        console.log(message.fail_skandha_sendUserOperation_16);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_16);
          console.log(message.vali_skandha_sendUserOperation_16);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_16);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid verificationGasLimit on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: data.invalid_hex, // invalid verificationGasLimit
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_17);
        console.log(message.fail_skandha_sendUserOperation_17);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_17);
          console.log(message.vali_skandha_sendUserOperation_17);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_17);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect verificationGasLimit on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: data.incorrect_hex, // incorrect verificationGasLimit
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_18);
        console.log(message.fail_skandha_sendUserOperation_18);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_18);
          console.log(message.vali_skandha_sendUserOperation_18);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_18);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without verificationGasLimit on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit, // without verificationGasLimit
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_19);
        console.log(message.fail_skandha_sendUserOperation_19);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_19);
          console.log(message.vali_skandha_sendUserOperation_19);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_19);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid preVerificationGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: data.invalid_hex, // invalid preVerificationGas
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_20);
        console.log(message.fail_skandha_sendUserOperation_20);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_20);
          console.log(message.vali_skandha_sendUserOperation_20);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_20);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect preVerificationGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: data.incorrect_hex, // incorrect preVerificationGas
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_21);
        console.log(message.fail_skandha_sendUserOperation_21);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_21);
          console.log(message.vali_skandha_sendUserOperation_21);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_21);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without preVerificationGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit, // without preVerificationGas
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_22);
        console.log(message.fail_skandha_sendUserOperation_22);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_22);
          console.log(message.vali_skandha_sendUserOperation_22);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_22);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid maxPriorityFeePerGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: data.invalid_hex, // invalid maxPriorityFeePerGas
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_23);
        console.log(message.fail_skandha_sendUserOperation_23);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_23);
          console.log(message.vali_skandha_sendUserOperation_23);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_23);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect maxPriorityFeePerGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: data.incorrect_hex, // incorrect maxPriorityFeePerGas
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_24);
        console.log(message.fail_skandha_sendUserOperation_24);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_24);
          console.log(message.vali_skandha_sendUserOperation_24);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_24);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without maxPriorityFeePerGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas, // without maxPriorityFeePerGas
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_25);
        console.log(message.fail_skandha_sendUserOperation_25);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_25);
          console.log(message.vali_skandha_sendUserOperation_25);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_25);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid maxFeePerGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: data.invalid_hex, // invalid maxFeePerGas
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_26);
        console.log(message.fail_skandha_sendUserOperation_26);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_26);
          console.log(message.vali_skandha_sendUserOperation_26);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_26);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect maxFeePerGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: data.incorrect_hex, // incorrect maxFeePerGas
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_27);
        console.log(message.fail_skandha_sendUserOperation_27);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_27);
          console.log(message.vali_skandha_sendUserOperation_27);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_27);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without maxFeePerGas on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas, // without maxFeePerGas
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_28);
        console.log(message.fail_skandha_sendUserOperation_28);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_28);
          console.log(message.vali_skandha_sendUserOperation_28);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_28);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid paymasterAndData on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: data.invalid_hex, // invalid paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_29);
        console.log(message.fail_skandha_sendUserOperation_29);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_29);
          console.log(message.vali_skandha_sendUserOperation_29);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_29);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect paymasterAndData on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: data.incorrect_hex, // incorrect paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_30);
        console.log(message.fail_skandha_sendUserOperation_30);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_30);
          console.log(message.vali_skandha_sendUserOperation_30);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_30);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without paymasterAndData on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas, // without paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_31);
        console.log(message.fail_skandha_sendUserOperation_31);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_31);
          console.log(message.vali_skandha_sendUserOperation_31);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_31);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid signature on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: data.invalid_hex, // invalid signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_32);
        console.log(message.fail_skandha_sendUserOperation_32);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_32);
          console.log(message.vali_skandha_sendUserOperation_32);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_32);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect signature on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: data.incorrect_hex, // incorrect signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_33);
        console.log(message.fail_skandha_sendUserOperation_33);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_33);
          console.log(message.vali_skandha_sendUserOperation_33);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_33);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without signature on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData, // without signature
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_34);
        console.log(message.fail_skandha_sendUserOperation_34);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_34);
          console.log(message.vali_skandha_sendUserOperation_34);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_34);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid entry point address on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.invalidEntryPointAddress, // invalid entry point address
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_35);
        console.log(message.fail_skandha_sendUserOperation_35);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_35);
          console.log(message.vali_skandha_sendUserOperation_35);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_35);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect entry point address on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.incorrectentryPointAddress, // incorrect entry point address
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_36);
        console.log(message.fail_skandha_sendUserOperation_36);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_36);
          console.log(message.vali_skandha_sendUserOperation_36);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_36);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without entry point address on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOperation',
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
            ], // without entry point address
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_37);
        console.log(message.fail_skandha_sendUserOperation_37);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_37);
          console.log(message.vali_skandha_sendUserOperation_37);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_37);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with invalid method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'Eth_SendUserOperation', // invalid method name
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_38);
        console.log(message.fail_skandha_sendUserOperation_38);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_38);
          console.log(message.vali_skandha_sendUserOperation_38);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_38);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha with incorrect method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: 'eth_sendUserOper', // incorrect method name
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_39);
        console.log(message.fail_skandha_sendUserOperation_39);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_39);
          console.log(message.vali_skandha_sendUserOperation_39);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_39);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the eth_sendUserOperation endpoint of the skandha without method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            jsonrpc: '2.0',
            method: '', // without method name
            params: [
              {
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: callData,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas,
                paymasterAndData: paymasterAndData,
                signature: signature,
              },
              data.entryPointAddress,
            ],
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_sendUserOperation_40);
        console.log(message.fail_skandha_sendUserOperation_40);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_sendUserOperation_40);
          console.log(message.vali_skandha_sendUserOperation_40);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_sendUserOperation_40);
        }
      }
    }
  );
});
