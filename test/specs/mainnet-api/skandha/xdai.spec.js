import { assert } from 'chai';
import data from '../../../data/api_testData.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

/* eslint-disable prettier/prettier */
describe('Performance testing of Skandha Endpoints with Mumbai Network', () => {
  it('SMOKE: Validate the skandha_getGasPrice method of the skandha with valid details on Mumbai Network', async () => {
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
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the skandha_config method of the skandha with valid details on Mumbai Network', async () => {
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
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the skandha_feeHistory method of the skandha with valid details on Mumbai Network', async () => {
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
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the eth_chainId method of the skandha with valid details on Mumbai Network', async () => {
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
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the eth_supportedEntryPoints method of the skandha with valid details on Mumbai Network', async () => {
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
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });

  it('SMOKE: Validate the eth_sendUserOperation method of the skandha with valid details on Mumbai Network', async () => {
    const startTime = performance.now();

    try {
      const response = await fetch('https://goerli-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_sendUserOperation',
          params: [],
          id: 46,
          jsonrpc: '2.0',
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
    } catch (error) {
      console.error('Fetch error:', error);
      assert.fail('Getting an error');
    }
  });
});
