import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import data from '../../../data/apiTestData.json' assert { type: 'json' };

describe('Performance testing of Skandha Endpoints with Goerli Network', function () {
  it('SMOKE: Validate the skandha_getGasPrice method of the skandha with valid details on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
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
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);

        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
        const returnedValue = await response.json();
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the skandha_getGasPrice response.'
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

  it('SMOKE: Validate the skandha_config method of the skandha with valid details on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
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
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);

        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
        const returnedValue = await response.json();
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the skandha_config response.'
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

  it('SMOKE: Validate the skandha_feeHistory method of the skandha with valid details on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
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
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);

        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
        const returnedValue = await response.json();
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the skandha_feeHistory response.'
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

  it('SMOKE: Validate the eth_chainId method of the skandha with valid details on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
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
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);

        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
        const returnedValue = await response.json();
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the eth_chainId response.'
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

  it('SMOKE: Validate the eth_supportedEntryPoints method of the skandha with valid details on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
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
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);

        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
        const returnedValue = await response.json();
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);

        try {
          assert.isNotEmpty(
            returnedValue.result,
            'The result value is empty in the eth_supportedEntryPoints response.'
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

  it('SMOKE: Validate the Batch RPC calls of the skandha with valid details on Goerli Network', async function () {
    var test = this;
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
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
        addContext(test, 'Response status: ' + response.status);
        const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
        const ttfb_s = (ttfb_ms / 1000).toFixed(2);

        addContext(test, 'Time to First Byte (TTFB): ' + ttfb_s + ' second');
        const returnedValue = await response.json();
        const returnedValueString = JSON.stringify(returnedValue);
        addContext(test, 'Value returned: ' + returnedValueString);

        try {
          assert.isNotEmpty(
            returnedValue[0].result,
            'The first result value is empty in the Batch RPC calls response.'
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The first result value is not displayed correctly in the Batch RPC calls response.'
          );
        }

        try {
          assert.isNotEmpty(
            returnedValue[1].result,
            'The second result value is empty in the Batch RPC calls response.'
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The second result value is not displayed correctly in the Batch RPC calls response.'
          );
        }

        try {
          assert.isNotEmpty(
            returnedValue[2].result,
            'The third result value is empty in the Batch RPC calls response.'
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The third result value is not displayed correctly in the Batch RPC calls response.'
          );
        }

        try {
          assert.isNotEmpty(
            returnedValue[3].result,
            'The fourth result value is empty in the Batch RPC calls response.'
          );
        } catch (e) {
          console.error(e);
          assert.fail(
            'The fourth result value is not displayed correctly in the Batch RPC calls response.'
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
