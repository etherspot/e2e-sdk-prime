import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { ethers } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import Helper from '../../../../utils/helper.js';
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

describe('Validate the get all whitelist endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the get all whitelist endpoint with whitelisted address and v2 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // make the random address whitelisted
      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [addresses, randomChainId, process.env.BUNDLER_API_KEY],
          },
          header
        );

        // perform assertions
        assert.include(response.data.message, constant.add_whitelist_1);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_whitelistv2_1);
      }

      // wait for the few seconds
      Helper.wait(15000);

      // validate the get all whitelist endpoint
      try {
        const response = await axios.post(
          data.arka_getAllWhitelist_v2,
          {
            params: ['1', randomChainId, process.env.BUNDLER_API_KEY],
          },
          header
        );

        // perform assertions
        assert.isNotEmpty(
          response.addresses,
          message.vali_getAllWhitelist_addresses
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_getAllWhitelistv2_2);
      }
    }
  );

  it(
    'REGRESSION: Validate the get all whitelist endpoint with new random address and v2 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      try {
        const response = await axios.post(
          data.arka_getAllWhitelist_v2,
          {
            params: ['1', randomChainId, process.env.BUNDLER_API_KEY],
          },
          header
        );

        addContext(test, message.fail_getAllWhitelistv2_9);
        console.log(message.fail_getAllWhitelistv2_9);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.getAllWhitelist_1)) {
          addContext(test, message.vali_getAllWhitelistv2_1);
          console.log(message.vali_getAllWhitelistv2_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getAllWhitelistv2_9);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the get all whitelist endpoint with v2 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_getAllWhitelist_invalid, // invalid url
          {
            params: ['1', randomChainId, process.env.BUNDLER_API_KEY],
          },
          header
        );

        addContext(test, message.fail_getAllWhitelistv2_2);
        console.log(message.fail_getAllWhitelistv2_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_getAllWhitelistv2_2);
          console.log(message.vali_getAllWhitelistv2_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getAllWhitelistv2_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the get all whitelist endpoint with v2 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_getAllWhitelist_incorrect, // incorrect url
          {
            params: ['1', randomChainId, process.env.BUNDLER_API_KEY],
          },
          header
        );

        addContext(test, message.fail_getAllWhitelistv2_3);
        console.log(message.fail_getAllWhitelistv2_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_getAllWhitelistv2_3);
          console.log(message.vali_getAllWhitelistv2_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getAllWhitelistv2_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the get all whitelist endpoint with v2 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_getAllWhitelist,
          {
            params: ['1', randomChainId, 'arka_public'], // invalid apikey
          },
          header
        );

        addContext(test, message.fail_getAllWhitelistv2_6);
        console.log(message.fail_getAllWhitelistv2_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_getAllWhitelistv2_6);
          console.log(message.vali_getAllWhitelistv2_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getAllWhitelistv2_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the get all whitelist endpoint with v2 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_getAllWhitelist,
          {
            params: ['1', randomChainId], // without apikey
          },
          header
        );

        addContext(test, message.fail_getAllWhitelistv2_7);
        console.log(message.fail_getAllWhitelistv2_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_getAllWhitelistv2_7);
          console.log(message.vali_getAllWhitelistv2_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getAllWhitelistv2_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the get all whitelist endpoint with v2 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_getAllWhitelist,
          {
            params: ['1', process.env.BUNDLER_API_KEY], // without chainid
          },
          header
        );

        addContext(test, message.fail_getAllWhitelistv2_8);
        console.log(message.fail_getAllWhitelistv2_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_getAllWhitelistv2_8);
          console.log(message.vali_getAllWhitelistv2_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getAllWhitelistv2_8);
        }
      }
    }
  );
});
