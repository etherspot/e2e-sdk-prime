import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { expect, assert } from 'chai';
import axios from 'axios';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import {
  generateRandomString,
  handleErrorValidation,
} from '../../../../utils/baseTest.js';
import {
  randomChainId,
  randomChainName,
} from '../../../../utils/sharedData_mainnet.js';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

const randomName = generateRandomString(15);
const randomDescription = generateRandomString(15);

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

describe('Validate record of the sponsorship policy api using id', function () {
  let newId;

  it(
    'PRECONDITION: Validate the add policy endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          name: randomName,
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: false,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
          globalMaximumApplicable: true,
          globalMaximumUsd: 5000,
          globalMaximumNative: 1000,
          globalMaximumOpCount: 1000,
          perUserMaximumApplicable: true,
          perUserMaximumUsd: 100,
          perUserMaximumNative: 200,
          perUserMaximumOpCount: 50,
          perOpMaximumApplicable: true,
          perOpMaximumUsd: 10,
          perOpMaximumNative: 20,
        };

        // send POST request with headers and data
        const response = await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,

          requestData,
          {
            headers,
          }
        );
        const responseBody = response.data;
        newId = responseBody.id;

        // perform assertions
        expect(response.status).to.equal(200);

        try {
          assert.equal(
            responseBody.walletAddress,
            data.sponsorAddress,
            message.vali_addPolicy_walletAddress
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.name,
            randomName,
            message.vali_addPolicy_name
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.description,
            randomDescription,
            message.vali_addPolicy_description
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNumber(responseBody.id, message.vali_addPolicy_id);
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
        assert.fail(message.fail_addPolicy_1);
      }
    }
  );

  it(
    'SMOKE: Fetching the policy of particular id endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policy}/${newId}`,
          null,
          {
            headers,
          }
        );
        const responseBody = response.data;

        // perform assertions
        expect(response.status).to.equal(200);

        try {
          assert.equal(
            responseBody.walletAddress,
            data.sponsorAddress,
            message.vali_policyId_walletAddress
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.name,
            randomName,
            message.vali_policyId_name
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.description,
            randomDescription,
            message.vali_policyId_description
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(responseBody.id, newId, message.vali_policyId_id);
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
        assert.fail(message.fail_policyId_1);
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka with invalid id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policy}/${data.invalid_newId}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyId_2);
        assert.fail(message.vali_policyId_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyId_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka with incorrect id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policy}/${data.incorrect_newId}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyId_3);
        assert.fail(message.vali_policyId_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyId_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka without id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}`, null, {
          headers,
        });

        addContext(test, message.vali_policyId_4);
        assert.fail(message.vali_policyId_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyId_4,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka with zero id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policy}/${data.zero_newId}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyId_5);
        assert.fail(message.vali_policyId_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyId_5,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka with negative id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(
          `${data.arka_fqdn}/${data.arka_policy}/-${newId}`,
          null,
          {
            headers,
          }
        );

        addContext(test, message.vali_policyId_6);
        assert.fail(message.vali_policyId_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_policyId_6,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}/${newId}`, {
          invalid_headers,
        });

        addContext(test, message.vali_policyId_7);
        assert.fail(message.vali_policyId_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyId_7,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}/${newId}`, {
          incorrect_headers,
        });

        addContext(test, message.vali_policyId_8);
        assert.fail(message.vali_policyId_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyId_8,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Fetching the policy of particular id endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}/${newId}`, {
          withoutapikey_headers,
        });

        addContext(test, message.vali_policyId_9);
        assert.fail(message.vali_policyId_9);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policyId_9,
          400
        );
      }
    }
  );
});
