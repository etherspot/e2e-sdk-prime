import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { ethers } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import {
  randomChainId,
  randomChainName,
} from '../../../../utils/sharedData_testnet.js';
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the deploy-vp endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the deploy-vp endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.ep06, data.ep07],
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the verifyingPaymaster parameter in the response
        assert.isNotEmpty(
          response.data.verifyingPaymaster,
          message.vali_deployVerifyingPaymaster_verifyingPaymaster
        );

        // validate the txHash parameter in the response
        assert.isNotEmpty(
          response.data.txHash,
          message.vali_deployVerifyingPaymaster_txHash
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_1)) {
          addContext(test, message.vali_deployVerifyingPaymaster_1);
          console.log(message.vali_deployVerifyingPaymaster_1);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_1);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka with invalid entry points on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.invalid_epversion], // invalid entry point
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_2);
        console.log(message.fail_deployVerifyingPaymaster_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_2)) {
          addContext(test, message.vali_deployVerifyingPaymaster_2);
          console.log(message.vali_deployVerifyingPaymaster_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka with incorrect entry points on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.incorrect_epversion], // incorrect entry point
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_3);
        console.log(message.fail_deployVerifyingPaymaster_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_2)) {
          addContext(test, message.vali_deployVerifyingPaymaster_3);
          console.log(message.vali_deployVerifyingPaymaster_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka without entry points on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [], // without entry point
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_4);
        console.log(message.fail_deployVerifyingPaymaster_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_2)) {
          addContext(test, message.vali_deployVerifyingPaymaster_4);
          console.log(message.vali_deployVerifyingPaymaster_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka with incorrect apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.DATA_API_KEY}&chainId=${randomChainId}`; // incorrect apikey

      // define the payload
      const requestData = {
        params: [data.ep07],
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_5);
        console.log(message.fail_deployVerifyingPaymaster_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deployVerifyingPaymaster_5);
          console.log(message.vali_deployVerifyingPaymaster_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka with invalid apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.ep07],
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_6);
        console.log(message.fail_deployVerifyingPaymaster_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deployVerifyingPaymaster_6);
          console.log(message.vali_deployVerifyingPaymaster_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka without apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [data.ep07],
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_7);
        console.log(message.fail_deployVerifyingPaymaster_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deployVerifyingPaymaster_7);
          console.log(message.vali_deployVerifyingPaymaster_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka with invalid chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${data.invalid_chainId}`; // invalid chainId

      // define the payload
      const requestData = {
        params: [data.ep07],
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_8);
        console.log(message.fail_deployVerifyingPaymaster_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_network_3)) {
          addContext(test, message.vali_deployVerifyingPaymaster_8);
          console.log(message.vali_deployVerifyingPaymaster_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_8);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deploy-vp endpoint of Arka without chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deployVerifyingPaymaster}?apiKey=${process.env.ARKA_API_KEY_PROD}`; // without chainId

      // define the payload
      const requestData = {
        params: [data.ep07],
      };

      var test = this;
      // validate the deployVerifyingPaymaster endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deployVerifyingPaymaster_9);
        console.log(message.fail_deployVerifyingPaymaster_9);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deployVerifyingPaymaster_9);
          console.log(message.vali_deployVerifyingPaymaster_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deployVerifyingPaymaster_9);
        }
      }
    }
  );
});
