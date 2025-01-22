import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { randomChainName } from '../../../../utils/sharedData_mainnet.js';
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the get gas price endpoint of the skandha', function () {
  it(
    'SMOKE: Validate the skandha_getGasPrice endpoint of the skandha with valid details on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'skandha_getGasPrice',
            id: 3,
          },
          header
        );

        // Add assertions
        try {
          assert.isNumber(
            response.data.id,
            message.vali_skandha_getGasPrice_id
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.maxPriorityFeePerGas,
            message.vali_skandha_getGasPrice_maxPriorityFeePerGas
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.maxFeePerGas,
            message.vali_skandha_getGasPrice_maxFeePerGas
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
        assert.fail(message.fail_skandha_getGasPrice_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_getGasPrice endpoint of the skandha with invalid method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'Skandha_GetGasPrice', // invalid method name
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_getGasPrice_2);
        console.log(message.fail_skandha_getGasPrice_2);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getGasPrice_2);
          console.log(message.vali_skandha_getGasPrice_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getGasPrice_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_getGasPrice endpoint of the skandha with incorrect method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'skandha_getGas', // incorrect method name
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_getGasPrice_3);
        console.log(message.fail_skandha_getGasPrice_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getGasPrice_3);
          console.log(message.vali_skandha_getGasPrice_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getGasPrice_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_getGasPrice endpoint of the skandha without method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: '', // without method name
            id: 3,
          },
          header
        );

        addContext(test, message.fail_skandha_getGasPrice_3);
        console.log(message.fail_skandha_getGasPrice_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_getGasPrice_3);
          console.log(message.vali_skandha_getGasPrice_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_getGasPrice_3);
        }
      }
    }
  );
});
