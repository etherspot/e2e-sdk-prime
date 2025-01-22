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

describe('Validate record of the latest sponsorship policy api using wallet address, ep version, and chainid', function () {
  it(
    'SMOKE: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
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
            message.vali_latestPolicyWalletAddressEPVersionandChainid_walletAddress
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
            message.vali_latestPolicyWalletAddressEPVersionandChainid_name
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
            message.vali_latestPolicyWalletAddressEPVersionandChainid_description
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
            message.vali_latestPolicyWalletAddressEPVersionandChainid_id
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
        assert.fail(
          message.fail_latestPolicyWalletAddressEPVersionandChainid_1
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.invalid_sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_2
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_2
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_2,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.incorrect_sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_3
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_3
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_3,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_4
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_4
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_4,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with invalid entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.invalid_epversion}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_5
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_5
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with incorrect entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.incorrect_epversion}/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_6
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_6
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_11,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_6,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka without entry point version on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/chain-id/${randomChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_7
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_7
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_9,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_7,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with invalid chainid on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomInvalidChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_8
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_8
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_8,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with incorrect chainid on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomIncorrectChainId}/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_9
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_9
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_9,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka without chainid on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/latest`,
          null,
          {
            headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_10
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_10
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.invalid_data,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_10,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka without wallet address and entry point version on the ' +
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

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_11
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_11
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_11,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
          {
            invalid_headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_12
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_12
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_12,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
          {
            incorrect_headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_13
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_13
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_13,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the latest policy of particular wallet address, entry point version and chain id endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policyWalletAddress}/${data.sponsorAddress}/ep-version/${data.ep07}/chain-id/${randomChainId}/latest`,
          {
            withoutapikey_headers,
          }
        );

        addContext(
          test,
          message.vali_latestPolicyWalletAddressEPVersionandChainid_14
        );
        assert.fail(
          message.vali_latestPolicyWalletAddressEPVersionandChainid_14
        );
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_latestPolicyWalletAddressEPVersionandChainid_14,
          400
        );
      }
    }
  );
});
