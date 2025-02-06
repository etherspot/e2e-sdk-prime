import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { expect, assert } from 'chai';
import axios from 'axios';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import { handleErrorValidation } from '../../../../utils/baseTest.js';
import { randomChainName } from '../../../../utils/sharedData_testnet.js';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define headers with valid details
const headers = {
  'Content-Type': 'application/json',
  apikey: process.env.BUNDLER_API_KEY,
};

// define headers with invalid details
const invalid_headers = {
  'Content-Type': 'application/json',
  apikey: data.invalid_bundler_apikey,
};

// define headers with incorrect details
const incorrect_headers = {
  'Content-Type': 'application/json',
  apikey: data.incorrect_bundler_apikey,
};

// define headers without apikey details
const withoutapikey_headers = {
  'Content-Type': 'application/json',
};

describe('Validate record of the sponsorship policy api using walet address', function () {
  it(
    'SMOKE: Fetching the policy of particular wallet address endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}`,
          null,
          {
            headers,
          }
        );
        const responseBody = response.data;

        // perform assertions
        expect(response.status).to.equal(200);

        for (let i = 0; i < responseBody.length; i++) {
          try {
            assert.isNotEmpty(
              responseBody[i].walletAddress,
              message.vali_policyWalletAddress_walletAddress
            );
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              responseBody[i].name,
              message.vali_policyWalletAddress_name
            );
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              responseBody[i].description,
              message.vali_policyWalletAddress_description
            );
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              responseBody[i].id,
              message.vali_policyWalletAddress_id
            );
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_policyWalletAddress_1);
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.invalid_sponsorAddress}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddress_2);
        assert.fail(message.vali_policyWalletAddress_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyWalletAddress_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.incorrect_sponsorAddress}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddress_3);
        assert.fail(message.vali_policyWalletAddress_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyWalletAddress_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_policyWalletAddress}`, null, {
          headers,
        });

        addContext(test, message.vali_policyWalletAddress_4);
        assert.fail(message.vali_policyWalletAddress_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_7,
          message.fail_policyWalletAddress_4,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}`,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_policyWalletAddress_5);
        assert.fail(message.vali_policyWalletAddress_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyWalletAddress_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}`,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_policyWalletAddress_6);
        assert.fail(message.vali_policyWalletAddress_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyWalletAddress_6,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}`,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_policyWalletAddress_7);
        assert.fail(message.vali_policyWalletAddress_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyWalletAddress_7,
          400
        );
      }
    }
  );
});
