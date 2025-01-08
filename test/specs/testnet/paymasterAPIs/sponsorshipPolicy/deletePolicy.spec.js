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
} from '../../../../utils/sharedData_testnet.js';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

const randomName = generateRandomString(15);
const randomDescription = generateRandomString(15);

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

describe('Validate the delete sponsorship policy api of Arka', function () {
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
    'REGRESSION: Validate the delete policy endpoint of Arka with invalid id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        const response = await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${data.invalid_newId}`,
          {
            headers,
          }
        );

        addContext(test, message.vali_deletePolicy_2);
        assert.fail(message.vali_deletePolicy_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_deletePolicy_2,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka with incorrect id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        const response = await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${data.incorrect_newId}`,
          {
            headers,
          }
        );

        addContext(test, message.vali_deletePolicy_3);
        assert.fail(message.vali_deletePolicy_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_deletePolicy_3,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka without id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        const response = await axios.delete(`${data.arka_deletePolicy}`, {
          headers,
        });

        addContext(test, message.vali_deletePolicy_4);
        assert.fail(message.vali_deletePolicy_4);
      } catch (e) {
        let error = e.message;
        if (error.includes(constant.sponsorshipPolicy_walletAddress_12)) {
          addContext(test, message.vali_deletePolicy_1);
          console.log(message.vali_deletePolicy_1);
        } else {
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deletePolicy_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka with zero value id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        const response = await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${data.zero_newId}`,
          {
            headers,
          }
        );

        addContext(test, message.vali_deletePolicy_5);
        assert.fail(message.vali_deletePolicy_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_deletePolicy_5,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka with negative id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        const response = await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/-${newId}`,
          {
            headers,
          }
        );

        addContext(test, message.vali_deletePolicy_6);
        assert.fail(message.vali_deletePolicy_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_deletePolicy_6,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${newId}`,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_deletePolicy_7);
        assert.fail(message.vali_deletePolicy_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_deletePolicy_7,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${newId}`,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_deletePolicy_8);
        assert.fail(message.vali_deletePolicy_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_deletePolicy_8,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the delete policy endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        await axios.put(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${newId}`,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_deletePolicy_9);
        assert.fail(message.vali_deletePolicy_9);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_deletePolicy_9,
          400
        );
      }
    }
  );

  it(
    'SMOKE: Validate the delete policy endpoint of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // send DELETE request with headers
        const response = await axios.delete(
          `${data.arka_fqdn}/${data.arka_deletePolicy}/${newId}`,
          {
            headers,
          }
        );
        const responseBody = response.data;

        // perform assertions
        expect(response.status).to.equal(200);

        try {
          assert.equal(
            responseBody.message,
            `Successfully deleted policy with id ${newId}`,
            message.vali_deletePolicy_message
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
        assert.fail(message.fail_deletePolicy_1);
      }
    }
  );
});
