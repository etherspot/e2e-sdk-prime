import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { ethers } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import helper from '../../../../utils/helper.js';
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

describe('Validate the check whitelist endpoint of the Arka', function () {
  it(
    'PRECONDITION: Validate the whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);
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
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);
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
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);
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
      }
    }
  );

  it(
    'SMOKE: Validate the Check Whitelist endpoint with v1 and userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.check_whitelist_1);

        // perform assertions
        addContext(test, message.vali_checkWhitelist_0);
        console.log(message.vali_checkWhitelist_0);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelistv1_1);
      }
    }
  );

  it(
    'PRECONDITION: Validate the remove whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the remove whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_00);
        }
      }

      // validate the remove whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_0);
        }
      }

      // validate the remove whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv2_1);
          console.log(message.vali_removeWhitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_0);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the Check Whitelist endpoint which was not whitelisted with v1 and userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.check_whitelist_2);

        // perform assertions
        addContext(test, message.vali_checkWhitelist_00);
        console.log(message.vali_checkWhitelist_00);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelistv1_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist_invalid}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`; // invalid url

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_2);
        console.log(message.fail_checkWhitelistv1_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_checkWhitelistv1_2);
          console.log(message.vali_checkWhitelistv1_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist_incorrect}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`; // incorrect url

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_3);
        console.log(message.fail_checkWhitelistv1_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_checkWhitelistv1_3);
          console.log(message.vali_checkWhitelistv1_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.invalid_sponsorAddress], // invalid addres
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_4);
        console.log(message.fail_checkWhitelistv1_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_checkWhitelistv1_4);
          console.log(message.vali_checkWhitelistv1_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.incorrect_sponsorAddress], // incorrect addres
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_44);
        console.log(message.fail_checkWhitelistv1_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_checkWhitelistv1_44);
          console.log(message.vali_checkWhitelistv1_44);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [], // without addres
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_5);
        console.log(message.fail_checkWhitelistv1_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_5);
          console.log(message.vali_checkWhitelistv1_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${data.invalid_bundler_apikey}&chainId=${randomChainId}&useVp=true`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_6);
        console.log(message.fail_checkWhitelistv1_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_6);
          console.log(message.vali_checkWhitelistv1_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?&chainId=${randomChainId}&useVp=true`; // without apikey

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_7);
        console.log(message.fail_checkWhitelistv1_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_7);
          console.log(message.vali_checkWhitelistv1_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1, userVp parameter and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&useVp=true`; // without chainid

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_8);
        console.log(message.fail_checkWhitelistv1_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_8);
          console.log(message.vali_checkWhitelistv1_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_8);
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
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);
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
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);
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
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);
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
      }
    }
  );

  it(
    'SMOKE: Validate the Check Whitelist endpoint which was already whitelisted with v1 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [addresses],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.check_whitelist_1);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelistv1_1);
      }
    }
  );

  it(
    'PRECONDITION: Validate the remove whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the remove whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_00);
        }
      }

      // validate the remove whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_0);
        }
      }

      // validate the remove whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv2_1);
          console.log(message.vali_removeWhitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_0);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the Check Whitelist endpoint which was not whitelisted with v1 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [addresses],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.check_whitelist_2);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelistv1_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_invalid}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`; // invalid url

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_2);
        console.log(message.fail_checkWhitelistv1_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_checkWhitelistv1_2);
          console.log(message.vali_checkWhitelistv1_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_incorrect}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`; // incorrect url

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_3);
        console.log(message.fail_checkWhitelistv1_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_checkWhitelistv1_3);
          console.log(message.vali_checkWhitelistv1_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.invalid_sponsorAddress], // invalid address
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_4);
        console.log(message.fail_checkWhitelistv1_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_checkWhitelistv1_4);
          console.log(message.vali_checkWhitelistv1_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.incorrect_sponsorAddress], // incorrect address
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_44);
        console.log(message.fail_checkWhitelistv1_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_checkWhitelistv1_44);
          console.log(message.vali_checkWhitelistv1_44);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [], // without address
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_5);
        console.log(message.fail_checkWhitelistv1_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_5);
          console.log(message.vali_checkWhitelistv1_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${data.invalid_bundler_apikey}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_6);
        console.log(message.fail_checkWhitelistv1_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_6);
          console.log(message.vali_checkWhitelistv1_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_7);
        console.log(message.fail_checkWhitelistv1_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_7);
          console.log(message.vali_checkWhitelistv1_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v1 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}`; // without chainid

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv1_8);
        console.log(message.fail_checkWhitelistv1_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv1_8);
          console.log(message.vali_checkWhitelistv1_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv1_8);
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
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);
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
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);
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
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);
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
      }
    }
  );

  it(
    'SMOKE: Validate the Check Whitelist endpoint which was already whitelisted with v2 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.check_whitelist_1);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelistv2_1);
      }
    }
  );

  it(
    'PRECONDITION: Validate the remove whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the remove whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_00);
        }
      }

      // validate the remove whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_0);
        }
      }

      // validate the remove whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv2_1);
          console.log(message.vali_removeWhitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_0);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the Check Whitelist endpoint which was not whitelisted with v2 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.check_whitelist_2);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelistv2_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2_invalid}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`; // invalid url

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_2);
        console.log(message.fail_checkWhitelistv2_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_checkWhitelistv2_2);
          console.log(message.vali_checkWhitelistv2_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2_incorrect}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`; // incorrect url

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_3);
        console.log(message.fail_checkWhitelistv2_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_checkWhitelistv2_3);
          console.log(message.vali_checkWhitelistv2_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.invalid_sponsorAddress], // invalid address
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_4);
        console.log(message.fail_checkWhitelistv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_checkWhitelistv2_4);
          console.log(message.vali_checkWhitelistv2_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.incorrect_sponsorAddress], // incorrect address
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_4);
        console.log(message.fail_checkWhitelistv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_checkWhitelistv2_4);
          console.log(message.vali_checkWhitelistv2_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [], // without address
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_5);
        console.log(message.fail_checkWhitelistv2_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv2_5);
          console.log(message.vali_checkWhitelistv2_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${data.invalid_bundler_apikey}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_6);
        console.log(message.fail_checkWhitelistv2_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv2_6);
          console.log(message.vali_checkWhitelistv2_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_7);
        console.log(message.fail_checkWhitelistv2_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv2_7);
          console.log(message.vali_checkWhitelistv2_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Check Whitelist endpoint with v2 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // define the url
      const url = `${data.arka_checkwhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}`; // without chainid

      // define the payload
      const requestData = {
        params: [addresses],
      };

      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelistv2_8);
        console.log(message.fail_checkWhitelistv2_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_checkWhitelistv2_8);
          console.log(message.vali_checkWhitelistv2_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelistv2_8);
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
      const url1 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_whitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_addWhitelist_1);
        console.log(message.vali_addWhitelist_1);
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
      }

      // validate the whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv1_1);
        console.log(message.vali_whitelistv1_1);
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
      }

      // validate the whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_whitelistv2_1);
        console.log(message.vali_whitelistv2_1);
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
      }
    }
  );

  it(
    'REGRESSION: Validate the check whitelist endpoint with v1 and userVp parameter as a false of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=false`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(
          response.data.message,
          message.vali_checkWhitelist_message
        );

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.add_whitelist_3,
          message.vali_checkWhitelist_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e.response.data.error);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_checkWhitelist_1);
      }
    }
  );

  it(
    'PRECONDITION: Validate the remove whitelist endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url1 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;
      const url2 = `${data.arka_removeWhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;
      const url3 = `${data.arka_removeWhitelist_v2}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the remove whitelist address endpoint with v1 and userVp parameter
      try {
        const response = await axios.post(url1, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_00);
        }
      }

      // validate the remove whitelist address endpoint with v1 and without userVp parameter
      try {
        const response = await axios.post(url2, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv1_1);
          console.log(message.vali_removeWhitelistv1_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv1_0);
        }
      }

      // validate the remove whitelist address endpoint with v2 and without userVp parameter
      try {
        const response = await axios.post(url3, requestData, header);

        // perform assertions
        addContext(test, message.vali_removeWhitelist_1);
        console.log(message.vali_removeWhitelist_1);
      } catch (e) {
        const error = e.response.data.error;

        if (
          error.includes(constant.remove_whitelist_1) ||
          error.includes(constant.remove_whitelist_4)
        ) {
          addContext(test, message.vali_removeWhitelistv2_1);
          console.log(message.vali_removeWhitelistv2_1);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_removeWhitelistv2_0);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the check whitelist endpoint with v1 and userVp parameter with invalid data of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_checkwhitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=qwerty`;

      // define the payload
      const requestData = {
        params: [data.arka_sponsorAddress],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_checkWhitelist_13);
        console.log(message.fail_checkWhitelist_13);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_3)) {
          addContext(test, message.vali_checkWhitelist_13);
          console.log(message.vali_checkWhitelist_13);
        } else {
          console.error(e.response.data.error);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelist_13);
        }
      }
    }
  );
});
