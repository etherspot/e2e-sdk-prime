import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { Factory, PrimeSdk } from '@etherspot/prime-sdk';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let mumbaiTestNetSdk;
let mumbaiAccountAddress;
let mumbaiTestNetSdk1;
let mumbaiAccountAddress1;
let mumbaiSimpleAccountAddress;

describe('The PrimeSDK, when get the ZeroDev address and SimpleAccount address details with mumbai network on the TestNet', function () {
  it('SMOKE: Validate the ZeroDev address on the mumbai network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        mumbaiTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.mumbai_chainid),
            factoryWallet: Factory.ZERO_DEV
          },
        );

        try {
          assert.strictEqual(
            mumbaiTestNetSdk.state.EOAAddress,
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
        mumbaiSimpleAccountAddress =
          await mumbaiTestNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            mumbaiSimpleAccountAddress,
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

  it('SMOKE: Validate the SimpleAccount address on the mumbai network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        mumbaiTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.mumbai_chainid),
            factoryWallet: Factory.SIMPLE_ACCOUNT
          },
        );

        try {
          assert.strictEqual(
            mumbaiTestNetSdk.state.EOAAddress,
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
        mumbaiSimpleAccountAddress =
          await mumbaiTestNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            mumbaiSimpleAccountAddress,
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

  it('SMOKE: Validate the get multiple accounts on the mumbai network', async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        mumbaiTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.mumbai_chainid)
          },
        );

        try {
          assert.strictEqual(
            mumbaiTestNetSdk.state.EOAAddress,
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
        mumbaiAccountAddress =
          await mumbaiTestNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            mumbaiAccountAddress,
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
        mumbaiTestNetSdk1 = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.mumbai_chainid),
            projectKey: process.env.PROJECT_KEY, index: 1
          });

        try {
          assert.strictEqual(
            mumbaiTestNetSdk1.state.EOAAddress,
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
        mumbaiAccountAddress1 =
          await mumbaiTestNetSdk1.getCounterFactualAddress();

        try {
          assert.strictEqual(
            mumbaiAccountAddress1,
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
