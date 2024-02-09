import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let arbitrumMainNetSdk;
let arbitrumSimpleAccountAddress;
let arbitrumMainNetSdk1;
let arbitrumAccountAddress1;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with arbitrum network on the MainNet', function () {
  it('SMOKE: Validate the ZeroDev address on the arbitrum network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        arbitrumMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.arbitrum_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.ZERO_DEV
          },
        );

        try {
          assert.strictEqual(
            arbitrumMainNetSdk.state.EOAAddress,
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
        arbitrumSimpleAccountAddress =
          await arbitrumMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            arbitrumSimpleAccountAddress,
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

  it('SMOKE: Validate the SimpleAccount address on the arbitrum network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        arbitrumMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.arbitrum_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.SIMPLE_ACCOUNT
          },
        );

        try {
          assert.strictEqual(
            arbitrumMainNetSdk.state.EOAAddress,
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
        arbitrumSimpleAccountAddress =
          await arbitrumMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            arbitrumSimpleAccountAddress,
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

  it('SMOKE: Validate the get multiple accounts on the arbitrum network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        arbitrumMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.arbitrum_chainid),
            projectKey: process.env.PROJECT_KEY
          },
        );

        try {
          assert.strictEqual(
            arbitrumMainNetSdk.state.EOAAddress,
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
        arbitrumAccountAddress =
          await arbitrumMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            arbitrumAccountAddress,
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
        arbitrumMainNetSdk1 = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.arbitrum_chainid),
            projectKey: process.env.PROJECT_KEY, index: 1
          });

        try {
          assert.strictEqual(
            arbitrumMainNetSdk1.state.EOAAddress,
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
        arbitrumAccountAddress1 =
          await arbitrumMainNetSdk1.getCounterFactualAddress();

        try {
          assert.strictEqual(
            arbitrumAccountAddress1,
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
