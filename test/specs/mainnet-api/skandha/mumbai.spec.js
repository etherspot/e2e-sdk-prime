import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import { assert } from 'chai';
// import Helper from '../../../utils/Helper.js';
import data from '../../../data/api_testData.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let mumbaiTestNetSdk;

/* eslint-disable prettier/prettier */
describe('Performance testing of Skandha Endpoints with Mumbai Network', () => {
  it('SMOKE: Validate the skandha_getGasPrice method of the skandha with valid details on Mumbai Network', async () => {
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
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
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

  it('SMOKE: Perform the transfer native token with valid details on the Mumbai network', async () => {
    const startTime = performance.now();

    // validate the eth_sendUserOperation method of skandha
    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_sendUserOperation',
          params: [
            {
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_sendUserOperation',
              params: [
                {
                  sender, // address
                  nonce, // uint256
                  initCode, // bytes
                  callData, // bytes
                  callGasLimit, // uint256
                  verificationGasLimit, // uint256
                  preVerificationGas, // uint256
                  maxFeePerGas, // uint256
                  maxPriorityFeePerGas, // uint256
                  paymasterAndData, // bytes
                  signature, // bytes
                },
                entryPoint, // address
              ],
            },
          ],
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

  it('SMOKE: Perform the transfer native token with valid details on the Mumbai network', async () => {
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
      op = await mumbaiTestNetSdk.estimate();
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

    // validate the eth_sendUserOperation method of skandha
    try {
      const response = await fetch('https://mumbai-bundler.etherspot.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_estimateUserOperationGas',
          params: [uoHash],
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

    // // get transaction hash
    // let userOpsReceipt = null;
    // try {
    //   console.log('Waiting for transaction...');
    //   const timeout = Date.now() + 60000; // 1 minute timeout
    //   while (userOpsReceipt == null && Date.now() < timeout) {
    //     await Helper.wait(2000);
    //     userOpsReceipt = await mumbaiTestNetSdk.getUserOpReceipt(uoHash);
    //   }
    // } catch (e) {
    //   console.error(e);
    //   assert.fail('The get transaction hash action is not performed.');
    // }
  });
});
