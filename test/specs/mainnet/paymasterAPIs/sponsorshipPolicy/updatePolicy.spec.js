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
const updatedRandomName = generateRandomString(15);
const updatedRandomDescription = generateRandomString(15);

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
    'SMOKE: Validate the update policy endpoint of Arka on the ' +
      randomChainName +
      ' network: case 1',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
          walletAddress: data.sponsorAddress,
          name: updatedRandomName,
          description: updatedRandomDescription,
          isPublic: true,
          isEnabled: false,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_07'],
          isPerpetual: true,
          globalMaximumApplicable: false,
          globalMaximumUsd: data.globalMaximumUsd,
          globalMaximumNative: data.globalMaximumNative,
          globalMaximumOpCount: data.globalMaximumOpCount,
          perUserMaximumApplicable: false,
          perUserMaximumUsd: data.perUserMaximumUsd,
          perUserMaximumNative: data.perUserMaximumNative,
          perUserMaximumOpCount: data.perUserMaximumOpCount,
          perOpMaximumApplicable: false,
          perOpMaximumUsd: data.perOpMaximumUsd,
          perOpMaximumNative: data.perOpMaximumUsd,
        };

        // send POST request with headers and data
        const response = await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );
        const responseBody = response.data;

        // perform assertions
        expect(response.status).to.equal(200);

        try {
          assert.equal(responseBody.id, newId, message.vali_updatePolicy_id);
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.walletAddress,
            data.sponsorAddress,
            message.vali_updatePolicy_walletAddress
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
            updatedRandomName,
            message.vali_updatePolicy_name
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
            updatedRandomDescription,
            message.vali_updatePolicy_description
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // **********************

        try {
          assert.isTrue(
            responseBody.isPublic,
            message.vali_updatePolicy_isPublic
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isFalse(
            responseBody.isEnabled,
            message.vali_updatePolicy_isEnabled
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.isApplicableToAllNetworks,
            message.vali_updatePolicy_isApplicableToAllNetworks
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.enabledChains[0],
            randomChainId,
            message.vali_updatePolicy_enabledChains
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.supportedEPVersions[0],
            data.ep07,
            message.vali_updatePolicy_supportedEPVersions
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.isPerpetual,
            message.vali_updatePolicy_isPerpetual
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isFalse(
            responseBody.globalMaximumApplicable,
            message.vali_updatePolicy_globalMaximumApplicable
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.globalMaximumUsd,
            message.vali_updatePolicy_globalMaximumUsd
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.globalMaximumNative,
            message.vali_updatePolicy_globalMaximumNative
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.globalMaximumOpCount,
            message.vali_updatePolicy_globalMaximumOpCount
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isFalse(
            responseBody.perUserMaximumApplicable,
            message.vali_updatePolicy_perUserMaximumApplicable
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.perUserMaximumUsd,
            message.vali_updatePolicy_perUserMaximumUsd
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.perUserMaximumNative,
            message.vali_updatePolicy_perUserMaximumNative
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.perUserMaximumOpCount,
            message.vali_updatePolicy_perUserMaximumOpCount
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isFalse(
            responseBody.perOpMaximumApplicable,
            message.vali_updatePolicy_perOpMaximumApplicable
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.perOpMaximumUsd,
            message.vali_updatePolicy_perOpMaximumUsd
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.perOpMaximumNative,
            message.vali_updatePolicy_perOpMaximumNative
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.addressAllowList,
            message.vali_updatePolicy_addressAllowList
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.addressBlockList,
            message.vali_updatePolicy_addressBlockList
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
        assert.fail(message.fail_updatePolicy_1);
      }
    }
  );

  it(
    'SMOKE: Validate the update policy endpoint of Arka on the ' +
      randomChainName +
      ' network: case 2',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
          walletAddress: data.sponsorAddress,
          name: updatedRandomName,
          description: updatedRandomDescription,
          isPublic: true,
          isEnabled: false,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_07'],
          isPerpetual: true,
          globalMaximumApplicable: true,
          globalMaximumUsd: data.globalMaximumUsd,
          globalMaximumNative: data.globalMaximumNative,
          globalMaximumOpCount: data.globalMaximumOpCount,
          perUserMaximumApplicable: true,
          perUserMaximumUsd: data.perUserMaximumUsd,
          perUserMaximumNative: data.perUserMaximumNative,
          perUserMaximumOpCount: data.perUserMaximumOpCount,
          perOpMaximumApplicable: true,
          perOpMaximumUsd: data.perOpMaximumUsd,
          perOpMaximumNative: data.perOpMaximumUsd,
        };

        // send POST request with headers and data
        const response = await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );
        const responseBody = response.data;

        // perform assertions
        expect(response.status).to.equal(200);

        try {
          assert.equal(responseBody.id, newId, message.vali_updatePolicy_id);
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.walletAddress,
            data.sponsorAddress,
            message.vali_updatePolicy_walletAddress
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
            updatedRandomName,
            message.vali_updatePolicy_name
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
            updatedRandomDescription,
            message.vali_updatePolicy_description
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.isPublic,
            message.vali_updatePolicy_isPublic
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isFalse(
            responseBody.isEnabled,
            message.vali_updatePolicy_isEnabled
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.isApplicableToAllNetworks,
            message.vali_updatePolicy_isApplicableToAllNetworks
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.enabledChains[0],
            randomChainId,
            message.vali_updatePolicy_enabledChains
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.supportedEPVersions[0],
            data.ep07,
            message.vali_updatePolicy_supportedEPVersions
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.isPerpetual,
            message.vali_updatePolicy_isPerpetual
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.globalMaximumApplicable,
            message.vali_updatePolicy_globalMaximumApplicable
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.globalMaximumUsd,
            data.globalMaximumUsd,
            message.vali_updatePolicy_globalMaximumUsd
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.globalMaximumNative,
            data.globalMaximumNative,
            message.vali_updatePolicy_globalMaximumNative
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.globalMaximumOpCount,
            data.globalMaximumOpCount,
            message.vali_updatePolicy_globalMaximumOpCount
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.perUserMaximumApplicable,
            message.vali_updatePolicy_perUserMaximumApplicable
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.perUserMaximumUsd,
            data.perUserMaximumUsd,
            message.vali_updatePolicy_perUserMaximumUsd
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.perUserMaximumNative,
            data.perUserMaximumNative,
            message.vali_updatePolicy_perUserMaximumNative
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.perUserMaximumOpCount,
            data.perUserMaximumOpCount,
            message.vali_updatePolicy_perUserMaximumOpCount
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isTrue(
            responseBody.perOpMaximumApplicable,
            message.vali_updatePolicy_perOpMaximumApplicable
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.perOpMaximumUsd,
            data.perOpMaximumUsd,
            message.vali_updatePolicy_perOpMaximumUsd
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.equal(
            responseBody.perOpMaximumNative,
            data.perOpMaximumNative,
            message.vali_updatePolicy_perOpMaximumNative
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.addressAllowList,
            message.vali_updatePolicy_addressAllowList
          );
        } catch (e) {
          addContext(test, e);
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          assert.isNull(
            responseBody.addressBlockList,
            message.vali_updatePolicy_addressBlockList
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
        assert.fail(message.fail_updatePolicy_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with invalid wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_2);
        assert.fail(message.vali_updatePolicy_2);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_updatePolicy_2,
          403
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with incorrect wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_3);
        assert.fail(message.vali_updatePolicy_3);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_updatePolicy_3,
          403
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka without wallet address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_4);
        assert.fail(message.vali_updatePolicy_4);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_2,
          message.fail_updatePolicy_4,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with wallet address as a empty string on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_5);
        assert.fail(message.vali_updatePolicy_5);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_2,
          message.fail_updatePolicy_5,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with wallet address as a only blank spaces on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_6);
        assert.fail(message.vali_updatePolicy_6);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_1,
          message.fail_updatePolicy_6,
          403
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka without name on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_7);
        assert.fail(message.vali_updatePolicy_7);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_7,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with name as a empty string on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_8);
        assert.fail(message.vali_updatePolicy_8);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_8,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with name as a only blank spaces on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_9);
        assert.fail(message.vali_updatePolicy_9);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_9,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka without description on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_10);
        assert.fail(message.vali_updatePolicy_10);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_10,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with description as a empty string on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_11);
        assert.fail(message.vali_updatePolicy_11);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_11,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with description as a only blank spaces on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_12);
        assert.fail(message.vali_updatePolicy_12);
      } catch (e) {
        // TO DO: Update the constant message
        // TO DO: Update the status code
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_updatePolicy_12,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka without EPVersion on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_13);
        assert.fail(message.vali_updatePolicy_13);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_13,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with invalid EPVersion on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_14);
        assert.fail(message.vali_updatePolicy_14);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_14,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with EPVersion empty array on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_15);
        assert.fail(message.vali_updatePolicy_15);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_10,
          message.fail_updatePolicy_15,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with invalid id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: data.invalid_newId, // invalid id
          walletAddress: data.sponsorAddress,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_16);
        assert.fail(message.vali_updatePolicy_16);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_updatePolicy_16,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with incorrect id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: data.incorrect_newId, // incorrect id
          walletAddress: data.sponsorAddress,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_17);
        assert.fail(message.vali_updatePolicy_17);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_updatePolicy_17,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka without id on the ' +
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
          supportedEPVersions: ['EPV_06', 'EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_18);
        assert.fail(message.vali_updatePolicy_18);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_7,
          message.fail_updatePolicy_18,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with zero value id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: data.zero_newId, // zero value id
          walletAddress: data.sponsorAddress,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_19);
        assert.fail(message.vali_updatePolicy_19);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_7,
          message.fail_updatePolicy_19,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with negative value id on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: `-${newId}`, // negative id
          walletAddress: data.sponsorAddress,
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
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            headers,
          }
        );

        addContext(test, message.vali_updatePolicy_20);
        assert.fail(message.vali_updatePolicy_20);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_6,
          message.fail_updatePolicy_20,
          404
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with invalid apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
          walletAddress: data.sponsorAddress,
          name: updatedRandomName,
          description: updatedRandomDescription,
          isPublic: true,
          isEnabled: false,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            invalid_headers,
          }
        );

        addContext(test, message.vali_updatePolicy_21);
        assert.fail(message.vali_updatePolicy_21);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_updatePolicy_21,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka with incorrect apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
          walletAddress: data.sponsorAddress,
          name: updatedRandomName,
          description: updatedRandomDescription,
          isPublic: true,
          isEnabled: false,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            incorrect_headers,
          }
        );

        addContext(test, message.vali_updatePolicy_22);
        assert.fail(message.vali_updatePolicy_22);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_updatePolicy_22,
          400
        );
      }
    }
  );

  it(
    'REGRESSION: Validate the update policy endpoint of Arka without apikey on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      try {
        // define the payload
        const requestData = {
          id: newId,
          walletAddress: data.sponsorAddress,
          name: updatedRandomName,
          description: updatedRandomDescription,
          isPublic: true,
          isEnabled: false,
          isApplicableToAllNetworks: true,
          enabledChains: [randomChainId],
          supportedEPVersions: ['EPV_07'],
          isPerpetual: true,
        };

        // send POST request with headers and data
        await axios.put(
          `${data.arka_fqdn}/${data.arka_updatePolicy}`,
          requestData,
          {
            withoutapikey_headers,
          }
        );

        addContext(test, message.vali_updatePolicy_23);
        assert.fail(message.vali_updatePolicy_23);
      } catch (e) {
        handleErrorValidation(
          test,
          e,
          constant.sponsorshipPolicy_walletAddress_13,
          message.fail_updatePolicy_23,
          400
        );
      }
    }
  );
});
