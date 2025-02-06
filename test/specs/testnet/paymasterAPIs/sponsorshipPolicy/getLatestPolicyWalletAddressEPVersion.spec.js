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

describe('Validate record of the latest sponsorship policy api using wallet address and ep version', function () {
  it(
    'SMOKE: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/latest`,
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
            message.vali_latestPolicyWalletAddressandEPVersion_walletAddress
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
            message.vali_latestPolicyWalletAddressandEPVersion_name
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
            message.vali_latestPolicyWalletAddressandEPVersion_description
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
            message.vali_latestPolicyWalletAddressandEPVersion_id
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
        assert.fail(message.fail_latestPolicyWalletAddressandEPVersion_1);
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.invalid_sponsorAddress}/ep-version/${data.ep07}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_2);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandEPVersion_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.incorrect_sponsorAddress}/ep-version/${data.ep07}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_3);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandEPVersion_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/ep-version/${data.ep07}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_4);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_latestPolicyWalletAddressandEPVersion_4,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka with invalid entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.invalid_epversion}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_5);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_latestPolicyWalletAddressandEPVersion_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka with incorrect entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.incorrect_epversion}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_6);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_latestPolicyWalletAddressandEPVersion_6,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka without entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/latest`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_7);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_latestPolicyWalletAddressandEPVersion_7,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka without wallet address and entry point version on the ' +
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

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_8);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressandEPVersion_8,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/latest`,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_9);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_9);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressandEPVersion_9,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/latest`,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_10);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_10);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressandEPVersion_10,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address and entry point version endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/latest`,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_latestPolicyWalletAddressandEPVersion_11);
        assert.fail(message.vali_latestPolicyWalletAddressandEPVersion_11);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressandEPVersion_11,
          400
        );
      }
    }
  );
});
