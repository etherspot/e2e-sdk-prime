import { assert } from 'chai';
import data from '../../../data/api_testData.json' assert { type: 'json' };
import customRetryAsync from '../../../utils/baseTest.js';
// import Helper from '../../../utils/Helper.js';
import addContext from 'mochawesome/addContext.js';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import data1 from '../../../data/testData.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let goerliTestNetSdk;

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

  it.only('SMOKE: Validate the transfer native token with valid details on the Goerli Network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        goerliTestNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(process.env.GOERLI_CHAINID),
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
      let Sender;
      let Nonce;
      let InitCode;
      let CallData;
      let CallGasLimit;
      let VerificationGasLimit;
      let MaxFeePerGas;
      let MaxPriorityFeePerGas;
      let PaymasterAndData;
      let PreVerificationGas;
      let Signature;

      try {
        op = await goerliTestNetSdk.estimate();

        console.log('op:::::::::::', op);

        Sender = op.sender;
        Nonce = op.nonce;
        InitCode = op.initCode;
        CallData = op.callData;
        CallGasLimit = op.callGasLimit;
        VerificationGasLimit = op.verificationGasLimit;
        MaxFeePerGas = op.maxFeePerGas;
        MaxPriorityFeePerGas = op.maxPriorityFeePerGas;
        PaymasterAndData = op.paymasterAndData;
        PreVerificationGas = op.preVerificationGas;
        Signature = op.signature;
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
        );
      }

      try {
        const response = await fetch('https://goerli-bundler.etherspot.io/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_sendUserOperation',
            params: [
              {
                Sender,
                Nonce,
                InitCode,
                CallData,
                CallGasLimit,
                VerificationGasLimit,
                PreVerificationGas,
                MaxFeePerGas,
                MaxPriorityFeePerGas,
                PaymasterAndData,
                Signature,
              },
              data.entryPointAddress,
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

      /* new line */

      // // sign the UserOp and sending to the bundler
      // let uoHash;
      // try {
      //   uoHash = await goerliTestNetSdk.send(op);
      // } catch (e) {
      //   console.error(e);
      //   const eString = e.toString();
      //   addContext(test, eString);
      //   assert.fail(
      //     'The sign the UserOp and sending to the bundler action is not performed.',
      //   );
      // }

      // // get transaction hash...
      // console.log('Waiting for transaction...');
      // let userOpsReceipt = null;
      // const timeout = Date.now() + 60000; // 1 minute timeout
      // while (userOpsReceipt == null && Date.now() < timeout) {
      //   await Helper.wait(2000);
      //   userOpsReceipt = await goerliTestNetSdk.getUserOpReceipt(uoHash);
      // }
    }, data1.retry); // Retry this async test up to 5 times
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
          method: 'skandha_validateUserOperation',
          params: [
            {
              sender: data.sender,
              nonce: '0x0',
              initCode:
                '0x9406cc6185a346906296840746125a0e449764545fbfb9cf00000000000000000000000005449b55b91e9ebdd099ed584cb6357234f2ab3b0000000000000000000000000000000000000000000000000000000000000000',
              callData:
                '0xb61d27f60000000000000000000000007743d0ec8f1f848dc76e21a18dc5b478f7d87b6e0000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
              callGasLimit: '0x879d7',
              verificationGasLimit: '0x5dfa8',
              preVerificationGas: '0xadbc',
              maxFeePerGas: '0xbebc200',
              maxPriorityFeePerGas: '0x0',
              paymasterAndData: '0x',
              signature:
                '0xa5dc9910e3af2c4e00e311c22dce5905ee91efa093d4707f25e86fefb6c9985713b7720078851ca78d4de3fd35a9641de5ae19e8fa940d492f0beea4df463de11c',
            },
            '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          ],
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
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('Getting an error');
    }
  });
});
