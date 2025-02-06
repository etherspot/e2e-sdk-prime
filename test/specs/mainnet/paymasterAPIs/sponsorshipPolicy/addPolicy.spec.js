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

describe('Validate the add sponsorship policy api of Arka', function () {
  it(
    'SMOKE: Validate the add policy endpoint of Arka on the ' +
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
          `${`${data.arka_fqdn}/${data.arka_addPolicy}`}`,
          requestData,
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
    'REGRESSION: Validate the add policy endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.invalid_sponsorAddress, // invalid wallet address
          name: randomName,
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_2);
        assert.fail(message.vali_addPolicy_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_addPolicy_2,
          403
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.incorrect_sponsorAddress, // incorrect wallet address
          name: randomName,
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_3);
        assert.fail(message.vali_addPolicy_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_addPolicy_3,
          403
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          name: randomName, // without wallet address
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_4);
        assert.fail(message.vali_addPolicy_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_2,
          message.fail_addPolicy_4,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with wallet address as a empty string on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: '', // empty string
          name: randomName,
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_5);
        assert.fail(message.vali_addPolicy_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_2,
          message.fail_addPolicy_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with wallet address as a only blank spaces on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: '       ', // blank spaces
          name: randomName,
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_6);
        assert.fail(message.vali_addPolicy_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_addPolicy_6,
          403
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka without name on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          description: randomDescription, // without name
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_7);
        assert.fail(message.vali_addPolicy_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_2,
          message.fail_addPolicy_7,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with name as a empty string on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          name: '', // empty string
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_8);
        assert.fail(message.vali_addPolicy_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_2,
          message.fail_addPolicy_8,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with name as a only blank spaces on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          name: '       ', // blank spaces
          description: randomDescription,
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_9);
        assert.fail(message.vali_addPolicy_9);
      } catch (e) {
        // TO DO: Update the constant message
        // TO DO: Update the status code
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_addPolicy_9,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka without description on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          name: randomName, // without description
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_10);
        assert.fail(message.vali_addPolicy_10);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_3,
          message.fail_addPolicy_10,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with description as a empty string on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          name: randomName,
          description: '', // empty string
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_11);
        assert.fail(message.vali_addPolicy_11);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_3,
          message.fail_addPolicy_11,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with description as a only blank spaces on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          walletAddress: data.sponsorAddress,
          name: randomName,
          description: '       ', // blank spaces
          isPublic: true,
          isEnabled: true,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_12);
        assert.fail(message.vali_addPolicy_12);
      } catch (e) {
        // TO DO: Update the constant message
        // TO DO: Update the status code
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_addPolicy_12,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka without EPVersion on the ' +
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
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          isPerpetual: true, // without EPVersion
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_13);
        assert.fail(message.vali_addPolicy_13);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_4,
          message.fail_addPolicy_13,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with invalid EPVersion on the ' +
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
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_06', 'EP_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_14);
        assert.fail(message.vali_addPolicy_14);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_5,
          message.fail_addPolicy_14,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with EPVersion empty array on the ' +
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
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: [],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_addPolicy_15);
        assert.fail(message.vali_addPolicy_15);
      } catch (e) {
        // TO DO: Update the constant message
        // TO DO: Update the status code
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_5,
          message.fail_addPolicy_15,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with invalid apikey on the ' +
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
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_addPolicy_16);
        assert.fail(message.vali_addPolicy_16);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_addPolicy_16,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka with incorrect apikey on the ' +
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
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_addPolicy_17);
        assert.fail(message.vali_addPolicy_17);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_addPolicy_17,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the add policy endpoint of Arka without apikey on the ' +
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
        };

        // send POST request with headers and data
        await axios.post(
          `${data.arka_fqdn}/${data.arka_addPolicy}`,
          requestData,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_addPolicy_18);
        assert.fail(message.vali_addPolicy_18);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_addPolicy_18,
          400
        );
      }
    }
  );
});
