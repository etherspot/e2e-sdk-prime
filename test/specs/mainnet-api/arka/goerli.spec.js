import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import { assert } from 'chai';
import Helper from '../../../utils/Helper.js';
import data from '../../../data/api_testData.json' assert { type: 'json' };
import addContext from 'mochawesome/addContext.js';
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let goerliTestNetSdk;

/* eslint-disable prettier/prettier */
describe('Performance testing of Arka Endpoints with Goerli Network', function () {
  it('SMOKE: Validate the Whitelist endpoint of Arka on Goerli Network', async function () {
    var test = this;
    const addresses = [data.address];
    const startTime = performance.now();

    try {
      const response = await fetch(data.arka_whitelist, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: [addresses, data.goerli_chainid_testnet, process.env.API_KEY],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        addContext(test, 'Error response:' + errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');
        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the Deposit endpoint of Arka on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch(data.arka_deposit, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: [
            data.value,
            data.goerli_chainid_testnet,
            process.env.API_KEY,
          ],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        addContext(test, 'Error response:' + errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');
        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the Check an Address is Whitelist endpoint of Arka on Goerli Network', async function () {
    var test = this;
    const sponsorAddress = data.address;
    const addresses = data.address;
    const startTime = performance.now();

    try {
      const response = await fetch(data.arka_checkwhitelist, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: [
            sponsorAddress,
            addresses,
            data.goerli_chainid_testnet,
            process.env.API_KEY,
          ],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        addContext(test, 'Error response:' + errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');
        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the Pimlico Paymaster endpoint of Arka on Goerli Network', async function () {
    var test = this;
    // const context = { token: data.usdc_token };
    const startTime = performance.now();

    try {
      const response = await fetch(data.arka_pimlico, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: [
            data.entryPointAddress,
            { token: 'USDC' },
            data.goerli_chainid_testnet,
            process.env.API_KEY,
          ],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        addContext(test, 'Error response:' + errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');
        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Perform the Sponsor a Transaction with Arka and PrimeSDK on the Goerli network', async function () {
    var test = this;
    const startTime = performance.now();

    // initializating sdk
    try {
      goerliTestNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.GOERLI_CHAINID),
          projectKey: process.env.PROJECT_KEY_TESTNET,
        },
      );

      try {
        assert.strictEqual(
          goerliTestNetSdk.state.walletAddress,
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

    // get EtherspotWallet address
    try {
      await goerliTestNetSdk.getCounterFactualAddress();
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail(
        'The Etherspot Wallet Address is not displayed successfully.',
      );
    }

    // clear the transaction batch
    try {
      await goerliTestNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await goerliTestNetSdk.addUserOpsToBatch({
        to: data.recipient,
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await goerliTestNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch and get the fee data for the UserOp
    let op;
    try {
      op = await goerliTestNetSdk.estimate({
        url: 'https://arka.etherspot.io/',
        api_key: process.env.API_KEY,
        context: { mode: 'sponsor' },
      });

      console.log('op::::::::::', op);
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail(
        'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
      );
    }

    // sign the UserOp and sending to the bundler
    let uoHash;
    try {
      uoHash = await goerliTestNetSdk.send(op);
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail(
        'The sign the UserOp and sending to the bundler action is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await goerliTestNetSdk.getUserOpReceipt(uoHash);
      }
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);

      assert.fail('The get transaction hash action is not performed.');
    }

    const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
    const ttfb_s = (ttfb_ms / 1000).toFixed(2);
    console.log('Time to First Byte (TTFB):', ttfb_s + ' second');
    addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
  });
});
