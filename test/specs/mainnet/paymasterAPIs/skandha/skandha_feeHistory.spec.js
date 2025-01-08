import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { randomChainName } from '../../../../utils/sharedData_mainnet.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the fee history endpoint of the skandha', function () {
  it(
    'SMOKE: Validate the skandha_feeHistory endpoint of the skandha with valid details on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'skandha_feeHistory',
            id: 3,
            params: [data.entryPointAddress, '10', 'latest'],
          },
          header
        );

        // Add assertions
        try {
          assert.isNumber(response.data.id, message.vali_skandha_feeHistory_id);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.actualGasPrice,
            message.vali_skandha_feeHistory_actualGasPrice
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.maxFeePerGas,
            message.vali_skandha_feeHistory_maxFeePerGas
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            response.data.result.maxPriorityFeePerGas,
            message.vali_skandha_feeHistory_maxPriorityFeePerGas
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
        assert.fail(message.fail_skandha_feeHistory_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_feeHistory endpoint of the skandha with invalid method name on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'Skandha_FeeHistory', // invalid method name
            id: 3,
            params: [data.entryPointAddress, '10', 'latest'],
          },
          header
        );

        addContext(test, message.fail_skandha_feeHistory_2);
        console.log(message.fail_skandha_feeHistory_2);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_feeHistory_2);
          console.log(message.vali_skandha_feeHistory_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_feeHistory_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_feeHistory endpoint of the skandha with incorrect method name on the ' +
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
            params: [data.entryPointAddress, '10', 'latest'],
          },
          header
        );

        addContext(test, message.fail_skandha_feeHistory_3);
        console.log(message.fail_skandha_feeHistory_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_feeHistory_3);
          console.log(message.vali_skandha_feeHistory_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_feeHistory_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_feeHistory endpoint of the skandha without method name on the ' +
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
            params: [data.entryPointAddress, '10', 'latest'],
          },
          header
        );

        addContext(test, message.fail_skandha_feeHistory_3);
        console.log(message.fail_skandha_feeHistory_3);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_feeHistory_3);
          console.log(message.vali_skandha_feeHistory_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_feeHistory_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_feeHistory endpoint of the skandha with invalid entry point address on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'skandha_feeHistory',
            id: 3,
            params: [data.invalidEntryPointAddress, '10', 'latest'], // invalid entry point address
          },
          header
        );

        addContext(test, message.fail_skandha_feeHistory_5);
        console.log(message.fail_skandha_feeHistory_5);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_feeHistory_5);
          console.log(message.vali_skandha_feeHistory_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_feeHistory_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_feeHistory endpoint of the skandha with incorrect entry point address on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'skandha_feeHistory',
            id: 3,
            params: [data.incorrectentryPointAddress, '10', 'latest'], // incorrect entry point address
          },
          header
        );

        addContext(test, message.fail_skandha_feeHistory_6);
        console.log(message.fail_skandha_feeHistory_6);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_feeHistory_6);
          console.log(message.vali_skandha_feeHistory_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_feeHistory_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the skandha_feeHistory endpoint of the skandha without entry point address on the ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          `https://${randomChainName}-bundler.etherspot.io/`,
          {
            method: 'skandha_feeHistory',
            id: 3,
            params: ['10', 'latest'], // without entry point address
          },
          header
        );

        addContext(test, message.fail_skandha_feeHistory_7);
        console.log(message.fail_skandha_feeHistory_7);
      } catch (e) {
        const error = e.response.error.message;

        if (error.includes(constant.skandha_error_1)) {
          addContext(test, message.vali_skandha_feeHistory_7);
          console.log(message.vali_skandha_feeHistory_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_skandha_feeHistory_7);
        }
      }
    }
  );
});
