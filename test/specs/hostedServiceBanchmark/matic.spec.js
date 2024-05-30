import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers, utils, providers } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../utils/baseTest.js';
import data from '../../data/testData.json' assert { type: 'json' };

let maticMainNetSdk;

describe('The PrimeSDK, when transfer a token with matic network on the MainNet', function () {
  it('SMOKE: Validate the time taken for the regular ERC20 token transaction on the matic network', async function () {
    var test = this;

    await customRetryAsync(async function () {
      const startTime = performance.now();

      // initializating sdk
      try {
        maticMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.matic_chainid),
            projectKey: process.env.PROJECT_KEY,
            bundlerProvider: new EtherspotBundler(
              Number(data.matic_chainid),
              process.env.BUNDLER_API_KEY
            ),
          }
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      // get the respective provider details
      let provider;
      try {
        provider = new ethers.providers.JsonRpcProvider(
          data.providerNetwork_matic
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The provider response is not displayed correctly.');
      }

      // get erc20 Contract Interface
      let erc20Instance;
      try {
        erc20Instance = new ethers.Contract(
          data.tokenAddress_maticUSDC,
          ERC20_ABI,
          provider
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The get erc20 Contract Interface is not performed.');
      }

      // get decimals from erc20 contract
      let decimals;
      try {
        decimals = await erc20Instance.functions.decimals();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The decimals from erc20 contract is not displayed correctly.'
        );
      }

      // get transferFrom encoded data
      let transactionData;
      try {
        transactionData = erc20Instance.interface.encodeFunctionData(
          'transfer',
          [data.recipient, ethers.utils.parseUnits(data.erc20_value, decimals)]
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The decimals from erc20 contract is not displayed correctly.'
        );
      }

      // clear the transaction batch
      try {
        await maticMainNetSdk.clearUserOpsFromBatch();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The transaction of the batch is not clear correctly.');
      }

      // add transactions to the batch
      try {
        await maticMainNetSdk.addUserOpsToBatch({
          to: data.tokenAddress_maticUSDC,
          data: transactionData,
        });
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The transaction of the batch is not clear correctly.');
      }

      // estimate transactions added to the batch and get the fee data for the UserOp
      let op;
      try {
        op = await maticMainNetSdk.estimate();
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The estimate transactions added to the batch is not performed.'
        );
      }

      // sign the UserOp and sending to the bundler
      try {
        await maticMainNetSdk.send(op);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The sending to the bundler action is not performed.');
      }

      const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
      const ttfb_s = (ttfb_ms / 1000).toFixed(2);

      addContext(
        test,
        'Time to First Byte (TTFB) for the regular ERC20 token transaction on the matic network is:  ' +
          ttfb_s +
          ' seconds'
      );
      console.log(
        'Time to First Byte (TTFB) for the regular ERC20 token transaction on the matic network is:  ' +
          ttfb_s +
          ' seconds'
      );
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the time taken for the gasless ERC20 token transaction on the matic network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.matic_chainid
    )}`;
    await customRetryAsync(async function () {
      const startTime = performance.now();

      // initializating sdk
      try {
        maticMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.matic_chainid),
            projectKey: process.env.PROJECT_KEY,
            bundlerProvider: new EtherspotBundler(
              Number(data.matic_chainid),
              process.env.BUNDLER_API_KEY
            ),
          }
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The SDK is not initialled successfully.');
      }

      /**
       * The fetching of pimlico erc20 paymaster address is only required for the first time for each specified gas token since we need to approve the tokens to spend
       * from the paymaster address on behalf of you.
       */
      let returnedValue;
      let paymasterAddress;
      let erc20Contract;
      let encodedData;
      let approveOp;
      let op;

      try {
        returnedValue = await fetch(
          `${arka_url}/pimlicoAddress${queryString}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              params: [data.entryPointAddress, { token: 'USDC' }],
            }),
          }
        ).then((res) => {
          return res.json();
        });

        paymasterAddress = returnedValue.message;
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The fetched value of the arka pimlico paymaster is not displayed.'
        );
      }

      if (utils.isAddress(paymasterAddress)) {
        // get the erc20 Contract
        try {
          erc20Contract = new ethers.Contract(
            data.tokenAddress_maticUSDC,
            ERC20_ABI
          );
          encodedData = erc20Contract.interface.encodeFunctionData('approve', [
            paymasterAddress,
            ethers.constants.MaxUint256,
          ]);

          await maticMainNetSdk.addUserOpsToBatch({
            to: data.tokenAddress_maticUSDC,
            data: encodedData,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The erc20Contract value of the arka pimlico paymaster is not displayed.'
          );
        }

        // get estimation of transaction
        try {
          approveOp = await maticMainNetSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The get estimation of transaction of the arka pimlico paymaster is not displayed.'
          );
        }

        // get the uoHash1
        try {
          await maticMainNetSdk.send(approveOp);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The uoHash1 value of the arka pimlico paymaster is not displayed.'
          );
        }

        // clear the transaction batch
        try {
          await maticMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'Clear the transaction batch of the arka pimlico paymaster is not displayed.'
          );
        }

        // add transactions to the batch
        try {
          await maticMainNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: ethers.utils.parseEther(data.value),
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The add transactions to the batch of the arka pimlico paymaster is not displayed.'
          );
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          op = await maticMainNetSdk.estimate({
            paymasterDetails: {
              url: `${data.paymaster_arka}${queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The estimate transactions added to the batch and get the fee data for the UserOp of the arka pimlico paymaster is not displayed.'
          );
        }

        // sign the UserOp and sending to the bundler...
        try {
          await maticMainNetSdk.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The sign the UserOp and sending to the bundler of the arka pimlico paymaster is not displayed.'
          );
        }
      } else {
        addContext(test, 'Unable to fetch the paymaster address.');
        assert.fail('Unable to fetch the paymaster address.');
      }

      const ttfb_ms = performance.now() - startTime; // Calculate TTFB in milliseconds
      const ttfb_s = (ttfb_ms / 1000).toFixed(2);

      addContext(
        test,
        'Time to First Byte (TTFB) for the gasless ERC20 token transaction on the matic network is ' +
          ttfb_s +
          ' seconds'
      );
      console.log(
        'Time to First Byte (TTFB) for the gasless ERC20 token transaction on the matic network is ' +
          ttfb_s +
          ' seconds'
      );
    }, data.retry); // Retry this async test up to 5 times
  });
});
