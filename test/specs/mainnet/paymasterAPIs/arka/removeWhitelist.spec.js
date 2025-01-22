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
import helper from '../../../../utils/helper.js';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the remove whitelist endpoint of the Arka', function () {
  it(
    'PRECONDITION: Validate the whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_5)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_00);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_2)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.add_whitelist_2) ||
          error.includes(constant.add_whitelist_5)
        ) {
          addContext(test, message.vali_whitelistv2_1);
          console.log(message.vali_whitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }
    }
  );

  it(
    'SMOKE: Validate the remove whitelist endpoint with v1 and userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(
          response.data.message,
          message.vali_removeWhitelist_message
        );

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.remove_whitelist_3,
          message.vali_removeWhitelist_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_removeWhitelist_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist_invalid}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`; // invalid url

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_2);
        console.log(message.fail_removeWhitelistv1_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_removeWhitelistv1_2);
          console.log(message.vali_removeWhitelistv1_2);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [[data.invalid_sponsorAddress]], // invalid address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_4);
        console.log(message.fail_removeWhitelistv1_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv1_4);
          console.log(message.vali_removeWhitelistv1_4);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [[data.incorrect_sponsorAddress]], // incorrect address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_44);
        console.log(message.fail_removeWhitelistv1_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv1_44);
          console.log(message.vali_removeWhitelistv1_44);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [[]], // without address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_5);
        console.log(message.fail_removeWhitelistv1_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_5);
          console.log(message.vali_removeWhitelistv1_5);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`; // invalid apikey

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_6);
        console.log(message.fail_removeWhitelistv1_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_6);
          console.log(message.vali_removeWhitelistv1_6);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?chainId=${randomChainId}&useVp=true`; // without apikey

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_7);
        console.log(message.fail_removeWhitelistv1_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_7);
          console.log(message.vali_removeWhitelistv1_7);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1, userVp parameter and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&useVp=true`; // without chainid

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_8);
        console.log(message.fail_removeWhitelistv1_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_8);
          console.log(message.vali_removeWhitelistv1_8);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_8);
        }
      }
    }
  );

  it(
    'PRECONDITION: Validate the whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_5)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_00);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_2)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.add_whitelist_2) ||
          error.includes(constant.add_whitelist_5)
        ) {
          addContext(test, message.vali_whitelistv2_1);
          console.log(message.vali_whitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }
    }
  );

  it(
    'SMOKE: Validate the remove Whitelist endpoint with v1 and without userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.remove_whitelist_3);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_removeWhitelistv1_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist_invalid}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid url

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_2);
        console.log(message.fail_removeWhitelistv1_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_removeWhitelistv1_2);
          console.log(message.vali_removeWhitelistv1_2);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.invalid_sponsorAddress]], // invalid address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_4);
        console.log(message.fail_removeWhitelistv1_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv1_4);
          console.log(message.vali_removeWhitelistv1_4);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.incorrect_sponsorAddress]], // incorrect address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_44);
        console.log(message.fail_removeWhitelistv1_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv1_44);
          console.log(message.vali_removeWhitelistv1_44);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[]], // without address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_5);
        console.log(message.fail_removeWhitelistv1_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_5);
          console.log(message.vali_removeWhitelistv1_5);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_6);
        console.log(message.fail_removeWhitelistv1_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_6);
          console.log(message.vali_removeWhitelistv1_6);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_7);
        console.log(message.fail_removeWhitelistv1_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv1_7);
          console.log(message.vali_removeWhitelistv1_7);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v1 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}`; // without chainid

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv1_8);
        console.log(message.fail_removeWhitelistv1_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv1_8);
          console.log(message.vali_removeWhitelistv1_8);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_8);
        }
      }
    }
  );

  it(
    'PRECONDITION: Validate the whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_5)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_00);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_2)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.add_whitelist_2) ||
          error.includes(constant.add_whitelist_5)
        ) {
          addContext(test, message.vali_whitelistv2_1);
          console.log(message.vali_whitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }
    }
  );

  it(
    'SMOKE: Validate the remove Whitelist endpoint with v2 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.remove_whitelist_3);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e.response.data.error);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_removeWhitelistv2_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist_v2_invalid}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid url

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_2);
        console.log(message.fail_removeWhitelistv2_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_removeWhitelistv2_2);
          console.log(message.vali_removeWhitelistv2_2);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.invalid_sponsorAddress]], // invalid address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_4);
        console.log(message.fail_removeWhitelistv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv2_4);
          console.log(message.vali_removeWhitelistv2_4);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.incorrect_sponsorAddress]], // incorrect address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_44);
        console.log(message.fail_removeWhitelistv2_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_4)) {
          addContext(test, message.vali_removeWhitelistv2_44);
          console.log(message.vali_removeWhitelistv2_44);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[]], // without address
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_5);
        console.log(message.fail_removeWhitelistv2_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv2_5);
          console.log(message.vali_removeWhitelistv2_5);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_6);
        console.log(message.fail_removeWhitelistv2_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv2_6);
          console.log(message.vali_removeWhitelistv2_6);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist_v2}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_7);
        console.log(message.fail_removeWhitelistv2_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_removeWhitelistv2_7);
          console.log(message.vali_removeWhitelistv2_7);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the remove Whitelist endpoint with v2 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}`; // without chainid

      // define the payload
      const requestData = {
        params: [[addresses]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelistv2_8);
        console.log(message.fail_removeWhitelistv2_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_removeWhitelistv2_8);
          console.log(message.vali_removeWhitelistv2_8);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_8);
        }
      }
    }
  );

  it(
    'PRECONDITION: Validate the whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_5)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_00);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_2)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.add_whitelist_2) ||
          error.includes(constant.add_whitelist_5)
        ) {
          addContext(test, message.vali_whitelistv2_1);
          console.log(message.vali_whitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }
    }
  );

  it(
    'REGRESSION: Validate the remove whitelist endpoint with v1 and userVp parameter as a false of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=false`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(
          response.data.message,
          message.vali_removeWhitelist_message
        );

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.remove_whitelist_3,
          message.vali_removeWhitelist_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e.response.data.error);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_removeWhitelist_1);
      }
    }
  );

  it(
    'PRECONDITION: Validate the whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_5)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_00);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.add_whitelist_2)) {
          addContext(test, message.vali_whitelistv1_1);
          console.log(message.vali_whitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);

        // wait for the response
        helper.wait(data.mediumTimeout);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.add_whitelist_2) ||
          error.includes(constant.add_whitelist_5)
        ) {
          addContext(test, message.vali_whitelistv2_1);
          console.log(message.vali_whitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_0);
        }

        // wait for the response
        helper.wait(data.mediumTimeout);
      }
    }
  );

  it(
    'REGRESSION: Validate the remove whitelist endpoint with v1 and userVp parameter with invalid data of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_removeWhitelist}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=qwerty`;

      // define the payload
      const requestData = {
        params: [[data.arka_sponsorAddress]],
      };

      var test = this;
      // validate the remove whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_removeWhitelist_13);
        console.log(message.fail_removeWhitelist_13);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_3)) {
          addContext(test, message.vali_removeWhitelist_13);
          console.log(message.vali_removeWhitelist_13);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelist_13);
        }
      }
    }
  );
});
