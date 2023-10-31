import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import { assert } from 'chai';
import Helper from '../../../utils/Helper.js';
import data from '../../../data/api_testData.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let mumbaiTestNetSdk;

/* eslint-disable prettier/prettier */
describe('Performance testing of Arka Endpoints with Mumbai Network', () => {
  it('SMOKE: Validate the Deposit endpoint of Arka on Mumbai Network', async () => {
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
            data.amount,
            data.mumbai_chainid_testnet,
            process.env.API_KEY,
          ],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the Whitelist endpoint of Arka on Mumbai Network', async () => {
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
          params: [addresses, data.mumbai_chainid_testnet, process.env.API_KEY],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the Check an Address is Whitelist endpoint of Arka on Mumbai Network', async () => {
    const sponsorAddress = data.address;
    const addresses = '0xE05FB316eB8C4ba7288D43c1bd87BE8a8d16761C';
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
            data.mumbai_chainid_testnet,
            process.env.API_KEY,
          ],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the Pimlico Paymaster endpoint of Arka on Mumbai Network', async () => {
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
            data.mumbai_chainid_testnet,
            process.env.API_KEY,
          ],
        }),
      });
      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorResponse = await response.text();
        console.error('Error response:', errorResponse);
        assert.fail('Getting an error');
      } else {
        console.log('Response status:', response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);
        console.log('Time to First Byte (TTFB):', ttfb_s + ' second');

        const returnedValue = await response.json();
        console.log('Value returned:', returnedValue);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Perform the Sponsor a Transaction with Arka and PrimeSDK on the Mumbai network', async () => {
    const startTime = performance.now();

    // initializating sdk
    try {
      mumbaiTestNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.POLYGON_CHAINID_TESTNET),
          projectKey: process.env.PROJECT_KEY,
        },
      );

      try {
        assert.strictEqual(
          mumbaiTestNetSdk.state.walletAddress,
          data.eoaAddress,
          'The EOA Address is not calculated correctly.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The SDK is not initialled successfully.');
    }

    // get EtherspotWallet address
    try {
      await mumbaiTestNetSdk.getCounterFactualAddress();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The Etherspot Wallet Address is not displayed successfully.',
      );
    }

    // clear the transaction batch
    try {
      await mumbaiTestNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await mumbaiTestNetSdk.addUserOpsToBatch({
        to: data.recipient,
        value: ethers.utils.parseEther('0.000001'),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await mumbaiTestNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch and get the fee data for the UserOp
    let op;
    try {
      op = await mumbaiTestNetSdk.estimate({
        url: 'https://arka.etherspot.io/',
        api_key: process.env.API_KEY,
        context: { mode: 'sponsor' },
      });
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
      );
    }

    // sign the UserOp and sending to the bundler
    let uoHash;
    try {
      uoHash = await mumbaiTestNetSdk.send(op);
    } catch (e) {
      console.error(e);
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
        userOpsReceipt = await mumbaiTestNetSdk.getUserOpReceipt(uoHash);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The get transaction hash action is not performed.');
    }

    const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
    const ttfb_s = (ttfb_ms / 1000).toFixed(2);
    console.log('Time to First Byte (TTFB):', ttfb_s + ' second');
  });
});
