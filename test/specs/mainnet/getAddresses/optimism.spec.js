import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let optimismMainNetSdk;
let optimismSimpleAccountAddress;
let optimismMainNetSdk1;
let optimismAccountAddress1;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with optimism network on the MainNet', function () {
  it('SMOKE: Validate the ZeroDev address on the optimism network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.ZERO_DEV
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            'The EOA Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      // get ZeroDev address
      try {
        optimismSimpleAccountAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismSimpleAccountAddress,
            data.zerodev_address,
            'The Zero Dev Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The Zero Dev Address is not displayed successfully.');
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the SimpleAccount address on the optimism network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.SIMPLE_ACCOUNT
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            'The EOA Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      // get SimpleAccount address
      try {
        optimismSimpleAccountAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismSimpleAccountAddress,
            data.simpleaccount_address,
            'The SimpleAccount Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SimpleAccount Address is not displayed successfully.');
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the get multiple accounts on the optimism network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            projectKey: process.env.PROJECT_KEY
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            'The EOA Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      // get account address
      try {
        optimismAccountAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismAccountAddress,
            data.sender,
            'The Account Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The Account Address is not displayed successfully.');
      }

      // initializating sdk for index 1...
      try {
        optimismMainNetSdk1 = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            projectKey: process.env.PROJECT_KEY, index: 1
          });

        try {
          assert.strictEqual(
            optimismMainNetSdk1.state.EOAAddress,
            data.eoaAddress,
            'The EOA Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      // get account address
      try {
        optimismAccountAddress1 =
          await optimismMainNetSdk1.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismAccountAddress1,
            data.sender1,
            'The Account Address is not calculated correctly.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The Account Address is not displayed successfully.');
      }
    }, data.retry); // Retry this async test up to 5 times
  });
});
