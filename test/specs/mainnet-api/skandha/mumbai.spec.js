import { assert } from 'chai';
import data from '../../../data/api_testData.json' assert { type: 'json' };
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import data1 from '../../../data/testData.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let mumbaiTestNetSdk;

describe('Performance testing of Skandha Endpoints with Mumbai Network', function () {
  it('SMOKE: Validate the skandha_getGasPrice method of the skandha with valid details on Mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'skandha_getGasPrice',
          params: [],
          id: 46,
          jsonrpc: '2.0',
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

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the skandha_getGasPrice response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail('Not getting correct response.');
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the skandha_config method of the skandha with valid details on Mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'skandha_config',
          params: [],
          id: 46,
          jsonrpc: '2.0',
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

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the skandha_config response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail('Not getting correct response.');
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the skandha_feeHistory method of the skandha with valid details on Mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'skandha_feeHistory',
          params: [data.entryPointAddress, data.blockCount, 'latest'],
          id: 46,
          jsonrpc: '2.0',
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

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the skandha_feeHistory response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail('Not getting correct response.');
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the eth_chainId method of the skandha with valid details on Mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_chainId',
          params: [],
          id: 46,
          jsonrpc: '2.0',
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

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the eth_chainId response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail('Not getting correct response.');
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the eth_supportedEntryPoints method of the skandha with valid details on Mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_supportedEntryPoints',
          params: [],
          id: 46,
          jsonrpc: '2.0',
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

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the eth_supportedEntryPoints response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail('Not getting correct response.');
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the transfer native token with skandha and invalid signature length on the mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        mumbaiTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(process.env.MUMBAI_CHAINID),
            projectKey: process.env.PROJECT_KEY_TESTNET,
          },
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      // get EtherspotWallet address
      try {
        await mumbaiTestNetSdk.getCounterFactualAddress();
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
        await mumbaiTestNetSdk.clearUserOpsFromBatch();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The transaction of the batch is not clear correctly.');
      }

      // add transactions to the batch
      try {
        await mumbaiTestNetSdk.addUserOpsToBatch({
          to: data1.recipient,
          value: ethers.utils.parseEther(data1.value),
        });
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The addition of transaction in the batch is not performed.',
        );
      }

      // estimate transactions added to the batch and get the fee data for the UserOp
      let op;
      try {
        op = await mumbaiTestNetSdk.estimate();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
        );
      }

      try {
        const response = await fetch('https://mumbai-bundler.etherspot.io/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'skandha_validateUserOperation',
            params: [op, data.entryPointAddress],
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
          const errorMessage = returnedValue.error.message;
          if (errorMessage.includes('invalid signature length')) {
            console.log('Value returned:', returnedValue);
            const returnedValueString = JSON.stringify(returnedValue);
            addContext(test, 'Value returned: ' + returnedValueString);
          } else {
            assert.fail('The response is not getting correct.');
          }
        }
      } catch (e) {
        console.error('Fetch error:', e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('Getting an error');
      }
    }, data1.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the Batch RPC calls of the skandha with valid details on mumbai Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          { method: 'skandha_config' },
          { method: 'eth_chainId' },
          { method: 'eth_supportedEntryPoints' },
          {
            method: 'skandha_feeHistory',
            params: [data.entryPointAddress, data.blockCount, 'latest'],
          },
        ]),
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

        try {
          assert.isNotEmpty(
            returnedValue[0].result,
            'The first result value is empty in the Batch RPC calls response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The first result value is not displayed correctly in the Batch RPC calls response.',
          );
        }

        try {
          assert.isNotEmpty(
            returnedValue[1].result,
            'The second result value is empty in the Batch RPC calls response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The second result value is not displayed correctly in the Batch RPC calls response.',
          );
        }

        try {
          assert.isNotEmpty(
            returnedValue[2].result,
            'The third result value is empty in the Batch RPC calls response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The third result value is not displayed correctly in the Batch RPC calls response.',
          );
        }

        try {
          assert.isNotEmpty(
            returnedValue[3].result,
            'The fourth result value is empty in the Batch RPC calls response.',
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The fourth result value is not displayed correctly in the Batch RPC calls response.',
          );
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });
});
