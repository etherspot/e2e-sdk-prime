import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { ethers } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import {
  randomChainId,
  randomChainName,
} from '../../../../utils/sharedData_mainnet.js';
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the add stake endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the add stake endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.ep07, data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(response.data.message, message.vali_addStake_message);

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.addStake_1,
          message.vali_addStake_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_addStake_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with invalid entry points on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.invalid_epversion, data.value], // invalid entry point
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_2);
        console.log(message.fail_addStake_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_2)) {
          addContext(test, message.vali_addStake_2);
          console.log(message.vali_addStake_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with incorrect entry points on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.incorrect_epversion, data.value], // incorrect entry point
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_3);
        console.log(message.fail_addStake_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_2)) {
          addContext(test, message.vali_addStake_3);
          console.log(message.vali_addStake_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka without entry points on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.value], // without entry point
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_4);
        console.log(message.fail_addStake_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.addStake_2)) {
          addContext(test, message.vali_addStake_4);
          console.log(message.vali_addStake_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with invalid value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.ep07, data.invalidValue], // invalid value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_10);
        console.log(message.fail_addStake_10);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.addStake_2)) {
          addContext(test, message.vali_addStake_10);
          console.log(message.vali_addStake_10);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_10);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with exceeded value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.ep07, data.exceededValue], // exceeded value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_11);
        console.log(message.fail_addStake_11);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.addStake_3)) {
          addContext(test, message.vali_addStake_11);
          console.log(message.vali_addStake_11);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_11);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka without value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.ep07], // without value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_12);
        console.log(message.fail_addStake_12);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.addStake_2)) {
          addContext(test, message.vali_addStake_12);
          console.log(message.vali_addStake_12);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_12);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with incorrect apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`; // incorrect apikey

      // define the payload
      const requestData = {
        params: [data.ep07, data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_5);
        console.log(message.fail_addStake_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_addStake_5);
          console.log(message.vali_addStake_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with invalid apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${data.invalid_bundler_apikey}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.ep07, data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_6);
        console.log(message.fail_addStake_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_addStake_6);
          console.log(message.vali_addStake_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka without apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [data.ep07, data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_7);
        console.log(message.fail_addStake_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_addStake_7);
          console.log(message.vali_addStake_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka with invalid chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${data.invalid_chainId}`; // invalid chainId

      // define the payload
      const requestData = {
        params: [data.ep07, data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_8);
        console.log(message.fail_addStake_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_3)) {
          addContext(test, message.vali_addStake_8);
          console.log(message.vali_addStake_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_8);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the add stake endpoint of Arka without chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_addStake}?apiKey=${process.env.BUNDLER_API_KEY}`; // without chainId

      // define the payload
      const requestData = {
        params: [data.ep07, data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_addStake_9);
        console.log(message.fail_addStake_9);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_addStake_9);
          console.log(message.vali_addStake_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addStake_9);
        }
      }
    }
  );
});
