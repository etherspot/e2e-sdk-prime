import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let maticMainNetSdk;
let maticAccountAddress;
let maticSimpleAccountAddress;
let maticMainNetSdk1;
let maticAccountAddress1;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with matic network on the MainNet', function () {
  it('SMOKE: Validate the ZeroDev address on the matic network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        maticMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.matic_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.ZERO_DEV, bundlerProvider: new EtherspotBundler(Number(data.matic_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            maticMainNetSdk.state.EOAAddress,
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
        maticSimpleAccountAddress =
          await maticMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            maticSimpleAccountAddress,
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

  it('SMOKE: Validate the SimpleAccount address on the matic network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        maticMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.matic_chainid),
            projectKey: process.env.PROJECT_KEY,
            factoryWallet: Factory.SIMPLE_ACCOUNT, bundlerProvider: new EtherspotBundler(Number(data.matic_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            maticMainNetSdk.state.EOAAddress,
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
        maticSimpleAccountAddress =
          await maticMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            maticSimpleAccountAddress,
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

  it('SMOKE: Validate the get multiple accounts on the matic network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        maticMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.matic_chainid),
            projectKey: process.env.PROJECT_KEY, bundlerProvider: new EtherspotBundler(Number(data.matic_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            maticMainNetSdk.state.EOAAddress,
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
        maticAccountAddress =
          await maticMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            maticAccountAddress,
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
        maticMainNetSdk1 = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.matic_chainid),
            projectKey: process.env.PROJECT_KEY, index: 1, bundlerProvider: new EtherspotBundler(Number(data.matic_chainid), process.env.BUNDLER_API_KEY)
          });

        try {
          assert.strictEqual(
            maticMainNetSdk1.state.EOAAddress,
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
        maticAccountAddress1 =
          await maticMainNetSdk1.getCounterFactualAddress();

        try {
          assert.strictEqual(
            maticAccountAddress1,
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
