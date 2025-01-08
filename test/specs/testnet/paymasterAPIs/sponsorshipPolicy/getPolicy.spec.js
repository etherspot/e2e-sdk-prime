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

describe('Validate records of the sponsorship policy api', function () {
  it(
    'SMOKE: Validate the policy endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        const response = await axios.get(
          `${data.arka_fqdn}/${data.arka_policy}`,
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
              message.vali_policy_walletAddress
            );
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(responseBody[i].name, message.vali_policy_name);
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              responseBody[i].description,
              message.vali_policy_description
            );
          } catch (e) {
            addContext(test, e);
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(responseBody[i].id, message.vali_policy_id);
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
        assert.fail(message.fail_policy_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the policy endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}`, {
          invalid_headers,
        });

        addContext(test, message.vali_policy_2);
        assert.fail(message.vali_policy_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policy_2,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the policy endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}`, {
          incorrect_headers,
        });

        addContext(test, message.vali_policy_3);
        assert.fail(message.vali_policy_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policy_3,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the policy endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send GET request with headers
        await axios.get(`${data.arka_fqdn}/${data.arka_policy}`, {
          withoutapikey_headers,
        });

        addContext(test, message.vali_policy_4);
        assert.fail(message.vali_policy_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_policy_4,
          400
        );
      }
    }
  );
});
