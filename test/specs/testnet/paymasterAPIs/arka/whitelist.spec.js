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

describe('Validate the whitelist endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the Whitelist endpoint with v1 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

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
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_invalid, // invalid url
          {
            params: [addresses, randomChainId, process.env.API_KEY],
          },
          header
        );

        addContext(test, message.fail_whitelistv1_2);
        console.log(message.fail_whitelistv1_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_whitelistv1_2);
          console.log(message.vali_whitelistv1_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_incorrect, // incorrect url
          {
            params: [addresses, randomChainId, process.env.API_KEY],
          },
          header
        );

        addContext(test, message.fail_whitelistv1_3);
        console.log(message.fail_whitelistv1_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_whitelistv1_3);
          console.log(message.vali_whitelistv1_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [
              data.invalid_sponsorAddress, // invalid address
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_whitelistv1_4);
        console.log(message.fail_whitelistv1_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_whitelistv1_4);
          console.log(message.vali_whitelistv1_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [
              data.incorrect_sponsorAddress, // incorrect address
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_whitelistv1_44);
        console.log(message.fail_whitelistv1_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_whitelistv1_44);
          console.log(message.vali_whitelistv1_44);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [
              randomChainId, // without address
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_whitelistv1_5);
        console.log(message.fail_whitelistv1_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv1_5);
          console.log(message.vali_whitelistv1_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [addresses, randomChainId, 'arka_public'], // invalid apikey
          },
          header
        );

        addContext(test, message.fail_whitelistv1_6);
        console.log(message.fail_whitelistv1_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv1_6);
          console.log(message.vali_whitelistv1_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [addresses, randomChainId], // without apikey
          },
          header
        );

        addContext(test, message.fail_whitelistv1_7);
        console.log(message.fail_whitelistv1_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv1_7);
          console.log(message.vali_whitelistv1_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v1 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist,
          {
            params: [addresses, process.env.API_KEY], // without chainid
          },
          header
        );

        addContext(test, message.fail_whitelistv1_8);
        console.log(message.fail_whitelistv1_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv1_8);
          console.log(message.vali_whitelistv1_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv1_8);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the Whitelist endpoint with v2 of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
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
        assert.fail(message.fail_whitelistv2_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_v2_invalid, // invalid url
          {
            params: [addresses, randomChainId, process.env.API_KEY],
          },
          header
        );

        addContext(test, message.fail_whitelistv2_2);
        console.log(message.fail_whitelistv2_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_whitelistv2_2);
          console.log(message.vali_whitelistv2_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_v2_incorrect, // incorrect url
          {
            params: [addresses, randomChainId, process.env.API_KEY],
          },
          header
        );

        addContext(test, message.fail_whitelistv2_3);
        console.log(message.fail_whitelistv2_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_whitelistv2_3);
          console.log(message.vali_whitelistv2_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and invalid address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [
              data.invalid_sponsorAddress, // invalid address
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_whitelistv2_4);
        console.log(message.fail_whitelistv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_whitelistv2_4);
          console.log(message.vali_whitelistv2_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and incorrect address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [
              data.incorrect_sponsorAddress, // incorrect address
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_whitelistv2_4);
        console.log(message.fail_whitelistv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_whitelistv2_4);
          console.log(message.vali_whitelistv2_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and without address of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [
              randomChainId, // without address
              process.env.API_KEY,
            ],
          },
          header
        );

        addContext(test, message.fail_whitelistv2_5);
        console.log(message.fail_whitelistv2_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv2_5);
          console.log(message.vali_whitelistv2_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [addresses, randomChainId, 'arka_public'], // invalid apikey
          },
          header
        );

        addContext(test, message.fail_whitelistv2_6);
        console.log(message.fail_whitelistv2_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv2_6);
          console.log(message.vali_whitelistv2_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [addresses, randomChainId], // without apikey
          },
          header
        );

        addContext(test, message.fail_whitelistv2_7);
        console.log(message.fail_whitelistv2_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv2_7);
          console.log(message.vali_whitelistv2_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the Whitelist endpoint with v2 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;
      const randomAddress = ethers.Wallet.createRandom();
      const addresses = [randomAddress.address];

      try {
        const response = await axios.post(
          data.arka_whitelist_v2,
          {
            params: [addresses, process.env.API_KEY], // without chainid
          },
          header
        );

        addContext(test, message.fail_whitelistv2_8);
        console.log(message.fail_whitelistv2_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_whitelistv2_8);
          console.log(message.vali_whitelistv2_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelistv2_8);
        }
      }
    }
  );
});
