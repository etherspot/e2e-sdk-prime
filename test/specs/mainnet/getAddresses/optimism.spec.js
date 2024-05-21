import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let optimismMainNetSdk;
let optimismAccountAddress;
let optimismMainNetSdk1;
let optimismAccountAddress1;
let optimismSimpleAccountAddress;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with optimism network on the MainNet', function () {
  it('SMOKE: Validate the ZeroDev address on the optimism network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            factoryWallet: Factory.ZERO_DEV, bundlerProvider: new EtherspotBundler(Number(data.optimism_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            message.vali_eoa_address
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
        assert.fail(message.fail_sdk_initialize);
      }

      // get ZeroDev address
      try {
        optimismSimpleAccountAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismSimpleAccountAddress,
            data.zerodev_address,
            message.vali_zero_dev
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
        assert.fail(message.fail_zero_dev);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the SimpleAccount address on the optimism network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            factoryWallet: Factory.SIMPLE_ACCOUNT, bundlerProvider: new EtherspotBundler(Number(data.optimism_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            message.vali_eoa_address
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
        assert.fail(message.fail_sdk_initialize);
      }

      // get SimpleAccount address
      try {
        optimismSimpleAccountAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismSimpleAccountAddress,
            data.simpleaccount_address,
            message.vali_simple_account,
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
        assert.fail(message.fail_simple_account);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the get multiple accounts on the optimism network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            bundlerProvider: new EtherspotBundler(Number(data.optimism_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            message.vali_eoa_address
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
        assert.fail(message.fail_sdk_initialize);
      }

      // get account address
      try {
        optimismAccountAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismAccountAddress,
            data.sender,
            message.vali_account_address,
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
        assert.fail(message.fail_account_address);
      }

      // initializating sdk for index 1...
      try {
        optimismMainNetSdk1 = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            projectKey: process.env.PROJECT_KEY, index: 1, bundlerProvider: new EtherspotBundler(Number(data.optimism_chainid), process.env.BUNDLER_API_KEY)
          });

        try {
          assert.strictEqual(
            optimismMainNetSdk1.state.EOAAddress,
            data.eoaAddress,
            message.vali_eoa_address
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
        assert.fail(message.fail_sdk_initialize);
      }

      // get account address
      try {
        optimismAccountAddress1 =
          await optimismMainNetSdk1.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismAccountAddress1,
            data.sender1,
            message.vali_account_address,
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
        assert.fail(message.fail_account_address);
      }
    }, data.retry); // Retry this async test up to 5 times
  });
});
