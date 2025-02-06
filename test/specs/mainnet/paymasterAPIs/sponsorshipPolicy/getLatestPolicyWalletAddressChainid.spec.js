import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { expect, assert } from 'chai';
import axios from 'axios';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import { handleErrorValidation } from '../../../../utils/baseTest.js';
import {
  randomChainId,
  randomChainName,
  randomInvalidChainId,
  randomIncorrectChainId,
} from '../../../../utils/sharedData_mainnet.js';
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

describe('Validate record of the latest sponsorship policy api using wallet address and chainid', function () {
  it(
    'SMOKE: Fetching the latest policy of particular wallet address and chain id endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/${randomChainId}/latest`,
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
            message.vali_latestPolicyWalletAddressandChainid_walletAddress
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
            message.vali_latestPolicyWalletAddressandChainid_name
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
            message.vali_latestPolicyWalletAddressandChainid_description
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
            message.vali_latestPolicyWalletAddressandChainid_id
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
        assert.fail(message.fail_latestPolicyWalletAddressandChainid_1);
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.invalid_sponsorAddress}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_2);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandChainid_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.incorrect_sponsorAddress}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_3);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandChainid_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_4);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_latestPolicyWalletAddressandChainid_4,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka with invalid chainid on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/${randomInvalidChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_5);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandChainid_5,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka with incorrect chainid on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/${randomIncorrectChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_6);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandChainid_6,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka without chainid on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_7);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_latestPolicyWalletAddressandChainid_7,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka without wallet address and chainid on the ' +
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

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_8);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandChainid_8,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/${randomChainId}/latest`,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_9);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_9);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressandChainid_9,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/${randomChainId}/latest`,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_10);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_10);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressandChainid_10,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and chainid endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/chain-id/${randomChainId}/latest`,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandChainid_11);
        assert.fail(message.vali_latestPolicyWalletAddressandChainid_11);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressandChainid_11,
          400
        );
      }
    }
  );
});
