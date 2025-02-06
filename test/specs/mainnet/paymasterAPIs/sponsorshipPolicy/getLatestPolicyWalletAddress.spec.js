import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { expect, assert } from 'chai';
import axios from 'axios';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import { handleErrorValidation } from '../../../../utils/baseTest.js';
import { randomChainName } from '../../../../utils/sharedData_mainnet.js';
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

describe('Validate record of the latest sponsorship policy api using wallet address', function () {
  it(
    'SMOKE: Fetching the latest policy of particular wallet address endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/latest`,
          null,
          {
            headers,
          }
        );
        const responseBody = response.data;

        // perform assertions
        expect(response.status).to.equal(200);

        try {
          assert.isNotEmpty(
            responseBody.walletAddress,
            message.vali_latestPolicyWalletAddress_walletAddress
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            responseBody.name,
            message.vali_latestPolicyWalletAddress_name
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNotEmpty(
            responseBody.description,
            message.vali_latestPolicyWalletAddress_description
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNumber(
            responseBody.id,
            message.vali_latestPolicyWalletAddress_id
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_latestPolicyWalletAddress_1);
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.invalid_sponsorAddress}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddress_2);
        assert.fail(message.vali_latestPolicyWalletAddress_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddress_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.incorrect_sponsorAddress}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddress_3);
        assert.fail(message.vali_latestPolicyWalletAddress_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddress_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddress_4);
        assert.fail(message.vali_latestPolicyWalletAddress_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddress_4,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/latest`,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddress_5);
        assert.fail(message.vali_latestPolicyWalletAddress_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddress_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/latest`,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddress_6);
        assert.fail(message.vali_latestPolicyWalletAddress_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddress_6,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/latest`,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddress_7);
        assert.fail(message.vali_latestPolicyWalletAddress_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddress_7,
          400
        );
      }
    }
  );
});
