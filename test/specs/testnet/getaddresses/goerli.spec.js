import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/basetest.js';
import data from '../../../data/testdata.json' assert { type: 'json' };

let goerliTestNetSdk;
let goerliSimpleAccountAddress;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with goerli network on the MainNet', function () {
  it('SMOKE: Validate the ZeroDev address on the goerli network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        goerliTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.goerli_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.ZERO_DEV,
          },
        );

        try {
          assert.strictEqual(
            goerliTestNetSdk.state.EOAAddress,
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
        goerliSimpleAccountAddress =
          await goerliTestNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            goerliSimpleAccountAddress,
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

  it('SMOKE: Validate the SimpleAccount address on the goerli network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        goerliTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.goerli_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.SIMPLE_ACCOUNT,
          },
        );

        try {
          assert.strictEqual(
            goerliTestNetSdk.state.EOAAddress,
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
        goerliSimpleAccountAddress =
          await goerliTestNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            goerliSimpleAccountAddress,
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
});
