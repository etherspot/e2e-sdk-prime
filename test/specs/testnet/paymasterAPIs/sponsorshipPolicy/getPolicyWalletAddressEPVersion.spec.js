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
  apikey: process.env.API_KEY_ARKA,
};

// define headers with invalid details
const invalid_headers = {
  'Content-Type': 'application/json',
  apikey: process.env.INVALID_API_KEY_ARKA,
};

// define headers with incorrect details
const incorrect_headers = {
  'Content-Type': 'application/json',
  apikey: process.env.INCORRECT_API_KEY_ARKA,
};

// define headers without apikey details
const withoutapikey_headers = {
  'Content-Type': 'application/json',
};

describe('Validate record of the sponsorship policy api using walet address and ep version', function () {
  it(
    'SMOKE: Fetching the policy of particular wallet address and entry point version endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}`,
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
              message.vali_policyWalletAddressandEPVersion_walletAddress
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
              message.vali_policyWalletAddressandEPVersion_name
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
              message.vali_policyWalletAddressandEPVersion_description
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
              message.vali_policyWalletAddressandEPVersion_id
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
        assert.fail(message.fail_policyWalletAddressandEPVersion_1);
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.invalid_sponsorAddress}/ep-version/${data.ep07}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_2);
        assert.fail(message.vali_policyWalletAddressandEPVersion_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyWalletAddressandEPVersion_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.incorrect_sponsorAddress}/ep-version/${data.ep07}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_3);
        assert.fail(message.vali_policyWalletAddressandEPVersion_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyWalletAddressandEPVersion_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/ep-version/${data.ep07}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_4);
        assert.fail(message.vali_policyWalletAddressandEPVersion_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_policyWalletAddressandEPVersion_4,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka with invalid entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.invalid_epversion}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_5);
        assert.fail(message.vali_policyWalletAddressandEPVersion_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_policyWalletAddressandEPVersion_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka with incorrect entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.incorrect_epversion}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_6);
        assert.fail(message.vali_policyWalletAddressandEPVersion_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_policyWalletAddressandEPVersion_6,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka without entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_7);
        assert.fail(message.vali_policyWalletAddressandEPVersion_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_policyWalletAddressandEPVersion_7,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka without wallet address and entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_policyWalletAddress}`, null, {
          headers,
        });

        addContext(test, message.vali_policyWalletAddressandEPVersion_8);
        assert.fail(message.vali_policyWalletAddressandEPVersion_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_7,
          message.fail_policyWalletAddressandEPVersion_8,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}`,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_9);
        assert.fail(message.vali_policyWalletAddressandEPVersion_9);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyWalletAddressandEPVersion_9,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}`,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_10);
        assert.fail(message.vali_policyWalletAddressandEPVersion_10);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyWalletAddressandEPVersion_10,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular wallet address and entry point version endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}`,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_policyWalletAddressandEPVersion_11);
        assert.fail(message.vali_policyWalletAddressandEPVersion_11);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyWalletAddressandEPVersion_11,
          400
        );
      }
    }
  );
});
