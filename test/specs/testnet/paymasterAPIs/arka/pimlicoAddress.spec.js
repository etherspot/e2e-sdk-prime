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
} from '../../../../utils/sharedData_testnet.js';
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the pimlico address endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the pimlico address endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      // make the random address whitelisted
      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [addresses, randomChainId, process.env.API_KEY],
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
        assert.fail(message.fail_whitelistv1_1);
      }

      // wait for the few seconds
      Helper.wait(15000);

      // check the whitelist status
      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              addresses,
              { token: data.usdc_token },
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_pimlicoAddress_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint with invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico_invalid, // invalid url
          {
            params: [
              addresses,
              { token: data.usdc_token },
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_2);
        console.log(message.fail_pimlicoAddress_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_pimlicoAddress_2);
          console.log(message.vali_pimlicoAddress_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint with incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico_incorrect, // incorrect url
          {
            params: [
              addresses,
              { token: data.usdc_token },
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_3);
        console.log(message.fail_pimlicoAddress_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_pimlicoAddress_3);
          console.log(message.vali_pimlicoAddress_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint with invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              data.invalid_sponsorAddress, // invalid address
              { token: data.usdc_token },
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_4);
        console.log(message.fail_pimlicoAddress_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_pimlicoAddress_4);
          console.log(message.vali_pimlicoAddress_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint with incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              data.incorrect_sponsorAddress, // incorrect address
              { token: data.usdc_token },
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_44);
        console.log(message.fail_pimlicoAddress_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_pimlicoAddress_44);
          console.log(message.vali_pimlicoAddress_44);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              { token: data.usdc_token },
              randomChainId, // without address
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_5);
        console.log(message.fail_pimlicoAddress_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_pimlicoAddress_5);
          console.log(message.vali_pimlicoAddress_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint with invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              addresses,
              { token: data.usdc_token },
              randomChainId,
              'arka_public',
            ], // invalid apikey
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_6);
        console.log(message.fail_pimlicoAddress_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_pimlicoAddress_6);
          console.log(message.vali_pimlicoAddress_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [addresses, { token: data.usdc_token }, randomChainId], // without apikey
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_7);
        console.log(message.fail_pimlicoAddress_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_pimlicoAddress_7);
          console.log(message.vali_pimlicoAddress_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              addresses,
              { token: data.usdc_token },
              process.env.API_KEY,
            ], // without chainid
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_8);
        console.log(message.fail_pimlicoAddress_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_pimlicoAddress_8);
          console.log(message.vali_pimlicoAddress_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_8);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint with invalid token of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              addresses,
              { token: data.invalid_usdc_token }, // invalid token
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_9);
        console.log(message.fail_pimlicoAddress_9);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_pimlicoAddress_9);
          console.log(message.vali_pimlicoAddress_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_9);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the pimlico address endpoint without token of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_pimlico,
          {
            params: [
              addresses,
              // without token
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_pimlicoAddress_10);
        console.log(message.fail_pimlicoAddress_10);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_pimlicoAddress_10);
          console.log(message.vali_pimlicoAddress_10);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlicoAddress_10);
        }
      }
    }
  );
});
