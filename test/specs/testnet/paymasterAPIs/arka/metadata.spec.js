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

describe('Validate the metadata endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the metadata endpoint of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      // validate the metadata endpoint
      try {
        const response = await axios.get(
          data.arka_metadata,
          {
            params: {
              chainId: randomChainId,
              apiKey: process.env.BUNDLER_API_KEY,
            },
          },
          header
        );

        // validate the sponsorAddress parameter in the response
        assert.isNotEmpty(
          response.data.sponsorAddress,
          message.vali_metadata_sponsorAddress
        );

        // validate the sponsorWalletBalance parameter in the response
        assert.isNotEmpty(
          response.data.sponsorWalletBalance,
          message.vali_metadata_sponsorWalletBalance
        );

        // validate the sponsorBalance parameter in the response
        assert.isNotEmpty(
          response.data.sponsorBalance,
          message.vali_metadata_sponsorBalance
        );

        // validate the chainsSupported parameter in the response
        assert.isNotEmpty(
          response.data.chainsSupported,
          message.vali_metadata_chainsSupported
        );

        // validate the tokenPaymasters parameter in the response
        assert.isNotEmpty(
          response.data.tokenPaymasters,
          message.vali_metadata_tokenPaymasters
        );

        // validate the multiTokenPaymasters parameter in the response
        assert.isNotEmpty(
          response.data.multiTokenPaymasters,
          message.vali_metadata_multiTokenPaymasters
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_metadata_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the Metadata endpoint invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_metadata_invalid, // invalid url
          {
            params: {
              chainId: randomChainId,
              apiKey: process.env.BUNDLER_API_KEY,
            },
          },
          header
        );

        addContext(test, message.fail_metadata_2);
        console.log(message.fail_metadata_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_metadata_2);
          console.log(message.vali_metadata_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_metadata_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Metadata endpoint incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_metadata_incorrect, // incorrect url
          {
            params: {
              chainId: randomChainId,
              apiKey: process.env.BUNDLER_API_KEY,
            },
          },
          header
        );

        addContext(test, message.fail_metadata_3);
        console.log(message.fail_metadata_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_metadata_3);
          console.log(message.vali_metadata_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_metadata_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Metadata endpoint invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_metadata,
          {
            params: { chainId: randomChainId, apiKey: 'arka_public' }, // invalid apikey
          },
          header
        );

        addContext(test, message.fail_metadata_6);
        console.log(message.fail_metadata_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_metadata_6);
          console.log(message.vali_metadata_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_metadata_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Metadata endpoint without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_metadata,
          {
            params: { chainId: randomChainId }, // without apikey
          },
          header
        );

        addContext(test, message.fail_metadata_7);
        console.log(message.fail_metadata_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_metadata_7);
          console.log(message.vali_metadata_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_metadata_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Metadata endpoint without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_metadata,
          {
            params: { apiKey: process.env.BUNDLER_API_KEY }, // without chainid
          },
          header
        );

        addContext(test, message.fail_metadata_8);
        console.log(message.fail_metadata_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_metadata_8);
          console.log(message.vali_metadata_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_metadata_8);
        }
      }
    }
  );
});
