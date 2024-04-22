import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let xdaiMainNetSdk;
let xdaiAccountAddress;
let xdaiMainNetSdk1;
let xdaiAccountAddress1;
let xdaiSimpleAccountAddress;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with xdai network on the MainNet', function () {
  it('SMOKE: Validate the ZeroDev address on the xdai network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        xdaiMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.xdai_chainid),
            factoryWallet: Factory.ZERO_DEV, bundlerProvider: new EtherspotBundler(Number(data.xdai_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            xdaiMainNetSdk.state.EOAAddress,
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
        xdaiSimpleAccountAddress =
          await xdaiMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            xdaiSimpleAccountAddress,
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

  it('SMOKE: Validate the SimpleAccount address on the xdai network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        xdaiMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.xdai_chainid),
            factoryWallet: Factory.SIMPLE_ACCOUNT, bundlerProvider: new EtherspotBundler(Number(data.xdai_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            xdaiMainNetSdk.state.EOAAddress,
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
        xdaiSimpleAccountAddress =
          await xdaiMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            xdaiSimpleAccountAddress,
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

  it('SMOKE: Validate the get multiple accounts on the xdai network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        xdaiMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.xdai_chainid),
            bundlerProvider: new EtherspotBundler(Number(data.xdai_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            xdaiMainNetSdk.state.EOAAddress,
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
        xdaiAccountAddress =
          await xdaiMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            xdaiAccountAddress,
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
        xdaiMainNetSdk1 = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.xdai_chainid),
            projectKey: process.env.PROJECT_KEY, index: 1, bundlerProvider: new EtherspotBundler(Number(data.xdai_chainid), process.env.BUNDLER_API_KEY)
          });

        try {
          assert.strictEqual(
            xdaiMainNetSdk1.state.EOAAddress,
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
        xdaiAccountAddress1 =
          await xdaiMainNetSdk1.getCounterFactualAddress();

        try {
          assert.strictEqual(
            xdaiAccountAddress1,
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
