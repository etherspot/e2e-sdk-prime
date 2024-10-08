import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { utils, constants, BigNumber, ethers } from 'ethers';
import { BridgingProvider } from '@etherspot/prime-sdk/dist/sdk/data/index.js';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let optimismMainNetSdk;
let optimismEtherspotWalletAddress;
let optimismNativeAddress = null;
let optimismDataService;
let runTest;

describe('The PrimeSDK, Validate the connext endpoints with optimism network on the MainNet', function () {
  before(async function () {
    var test = this;

    await customRetryAsync(async function () {
      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            bundlerProvider: new EtherspotBundler(
              Number(data.optimism_chainid),
              process.env.BUNDLER_API_KEY
            ),
          }
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
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

      // get EtherspotWallet address
      try {
        optimismEtherspotWalletAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismEtherspotWalletAddress,
            data.sender,
            message.vali_smart_address
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }
      } catch (e) {
        console.error(e.message);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_smart_address);
      }

      // initializating Data service...
      try {
        optimismDataService = new DataUtils(process.env.DATA_API_KEY);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_data_service);
      }

      // validate the balance of the wallet
      try {
        let output = await optimismDataService.getAccountBalances({
          account: data.sender,
          chainId: Number(data.optimism_chainid),
        });
        let native_balance;
        let usdc_balance;
        let native_final;
        let usdc_final;

        for (let i = 0; i < output.items.length; i++) {
          let tokenAddress = output.items[i].token;
          if (tokenAddress === optimismNativeAddress) {
            native_balance = output.items[i].balance;
            native_final = utils.formatUnits(native_balance, 18);
          } else if (tokenAddress === data.tokenAddress_optimismUSDC) {
            usdc_balance = output.items[i].balance;
            usdc_final = utils.formatUnits(usdc_balance, 6);
          }
        }

        if (
          native_final > data.minimum_native_balance &&
          usdc_final > data.minimum_token_balance
        ) {
          runTest = true;
        } else {
          runTest = false;
        }
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_wallet_balance);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the all supported assets with valid details on the optimism network', async function () {
    var test = this;
    let allSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        helper.wait(data.mediumTimeout);

        try {
          allSupportedAssets = await optimismDataService.getSupportedAssets({});

          try {
            assert.isNotEmpty(
              allSupportedAssets[0].symbol,
              message.vali_connext_getSupportedAssets_symbol
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              allSupportedAssets[0].address,
              message.vali_connext_getSupportedAssets_address
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              allSupportedAssets[0].decimals,
              message.vali_connext_getSupportedAssets_decimals
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              allSupportedAssets[0].chainId,
              message.vali_connext_getSupportedAssets_chainId
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              allSupportedAssets[0].icon,
              message.vali_connext_getSupportedAssets_icon
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
          assert.fail(message.fail_connext_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('SMOKE: Validate the supported assets with valid details on the optimism network', async function () {
    var test = this;
    let supportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        helper.wait(data.mediumTimeout);

        try {
          supportedAssets = await optimismDataService.getSupportedAssets({
            chainId: data.optimism_chainid,
            provider: BridgingProvider.Connext,
          });

          try {
            assert.isNotEmpty(
              supportedAssets[0].symbol,
              message.vali_connext_getSupportedAssets_symbol
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              supportedAssets[0].address,
              message.vali_connext_getSupportedAssets_address
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              supportedAssets[0].decimals,
              message.vali_connext_getSupportedAssets_decimals
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.strictEqual(
              supportedAssets[0].chainId,
              data.optimism_chainid,
              message.vali_connext_getSupportedAssets_chainId
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              supportedAssets[0].icon,
              message.vali_connext_getSupportedAssets_icon
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
          assert.fail(message.fail_connext_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('SMOKE: Validate the get quotes with valid details on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        helper.wait(data.mediumTimeout);

        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          try {
            assert.isNotEmpty(
              quotes[0].data,
              message.vali_connext_getQuotes_data
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(quotes[0].to, message.vali_connext_getQuotes_to);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              quotes[0].value,
              message.vali_connext_getQuotes_value
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
          assert.fail(message.fail_connext_3);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('SMOKE: Validate the get transaction status with valid details on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        helper.wait(data.mediumTimeout);

        // clear the transaction batch
        try {
          await optimismMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: ethers.utils.parseEther(data.value),
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_addTransaction_1);
        }

        // get balance of the account address
        try {
          await optimismMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await optimismMainNetSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_estimateTransaction_1);
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await optimismMainNetSdk.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          if (eString === 'Error') {
            console.warn(message.skip_transaction_error);
            addContext(test, message.skip_transaction_error);
            test.skip();
          } else {
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }
        }

        // get transaction hash
        let userOpsReceipt = null;
        try {
          console.log('Waiting for transaction...');
          const timeout = Date.now() + 60000; // 1 minute timeout
          while (userOpsReceipt == null && Date.now() < timeout) {
            await helper.wait(5000);
            userOpsReceipt = await optimismMainNetSdk.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getTransactionHash_1);
        }

        // validate the transaction status
        let transactionStatus;
        try {
          transactionStatus = await optimismDataService.getTransactionStatus({
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            transactionHash: userOpsReceipt.receipt.transactionHash,
            provider: BridgingProvider.Connext,
          });

          try {
            assert.isNotEmpty(
              transactionStatus.status,
              message.vali_connext_getTransactionStatus_status
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionStatus.transactionHash,
              message.vali_connext_getTransactionStatus_transactionHash
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionStatus.connextscanUrl,
              message.vali_connext_getTransactionStatus_connextscanUrl
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
          assert.fail(message.fail_connext_4);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the supported assets with invalid chainid on the optimism network', async function () {
    var test = this;
    let supportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          supportedAssets = await optimismDataService.getSupportedAssets({
            chainId: data.invalid_optimism_chainid,
            provider: BridgingProvider.Connext,
          });

          if (supportedAssets.length === 0) {
            addContext(test, message.vali_connext_1);
            console.log(message.vali_connext_1);
          } else {
            addContext(test, message.fail_connext_5);
            assert.fail(message.fail_connext_5);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_connext_6);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with invalid sender address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.invalidSender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_7);
          assert.fail(message.fail_connext_7);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_7
          ) {
            addContext(test, message.vali_connext_2);
            console.log(message.vali_connext_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_7);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without sender address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_8);
          assert.fail(message.fail_connext_8);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_7
          ) {
            addContext(test, message.vali_connext_3);
            console.log(message.vali_connext_3);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_8);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with incorrect sender address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.incorrectSender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_9);
          assert.fail(message.fail_connext_9);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_7
          ) {
            addContext(test, message.vali_connext_4);
            console.log(message.vali_connext_4);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_9);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with invalid recepient address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.invalidRecipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_10);
          assert.fail(message.fail_connext_10);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_8
          ) {
            addContext(test, message.vali_connext_5);
            console.log(message.vali_connext_5);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_10);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without recepient address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_11);
          assert.fail(message.fail_connext_11);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_8
          ) {
            addContext(test, message.vali_connext_6);
            console.log(message.vali_connext_6);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_11);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with incorrect recepient address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.incorrectRecipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_12);
          assert.fail(message.fail_connext_12);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_8
          ) {
            addContext(test, message.vali_connext_7);
            console.log(message.vali_connext_7);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_12);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without fromChainid details on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_13);
          assert.fail(message.fail_connext_13);
        } catch (e) {
          if (e.message === constant.invalid_address_9) {
            addContext(test, message.vali_connext_8);
            console.log(message.vali_connext_8);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_13);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without toChainid details on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_14);
          assert.fail(message.fail_connext_14);
        } catch (e) {
          if (e.message === constant.invalid_address_10) {
            addContext(test, message.vali_connext_9);
            console.log(message.vali_connext_9);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_14);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with invalid from token address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.invalidTokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_15);
          assert.fail(message.fail_connext_15);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_11
          ) {
            addContext(test, message.vali_connext_10);
            console.log(message.vali_connext_10);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_15);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with incorrect from token address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.incorrectTokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_16);
          assert.fail(message.fail_connext_16);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_11
          ) {
            addContext(test, message.vali_connext_11);
            console.log(message.vali_connext_11);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_16);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without from token address on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_17);
          assert.fail(message.fail_connext_17);
        } catch (e) {
          if (
            e.errors[0].constraints.isAddress === constant.invalid_address_11
          ) {
            addContext(test, message.vali_connext_12);
            console.log(message.vali_connext_12);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_17);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with invalid value on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.invalidValue, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_18);
          assert.fail(message.fail_connext_18);
        } catch (e) {
          if (e.reason === constant.invalid_value_1) {
            addContext(test, message.vali_connext_13);
            console.log(message.vali_connext_13);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_18);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes with small value on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.smallValue, 18),
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_19);
          assert.fail(message.fail_connext_19);
        } catch (e) {
          if (e.reason === constant.invalid_value_2) {
            addContext(test, message.vali_connext_14);
            console.log(message.vali_connext_14);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_19);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without value on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            slippage: 0.1,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_20);
          assert.fail(message.fail_connext_20);
        } catch (e) {
          if (
            e.errors[0].constraints.IsBigNumberish ===
            constant.invalid_bignumber_2
          ) {
            addContext(test, message.vali_connext_15);
            console.log(message.vali_connext_15);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_20);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get quotes without slippage on the optimism network', async function () {
    var test = this;
    let quotes;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          quotes = await optimismDataService.getQuotes({
            fromAddress: data.sender,
            toAddress: data.recipient,
            fromChainId: data.optimism_chainid,
            toChainId: data.matic_chainid,
            fromToken: data.tokenAddress_optimismUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 18),
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_21);
          assert.fail(message.fail_connext_21);
        } catch (e) {
          if (e.message === constant.invalid_address_13) {
            addContext(test, message.vali_connext_16);
            console.log(message.vali_connext_16);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_21);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get transaction status without fromChainId on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // validate the transaction status
        let transactionStatus;
        try {
          transactionStatus = await optimismDataService.getTransactionStatus({
            toChainId: data.matic_chainid,
            transactionHash: data.transactionHash,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_22);
          assert.fail(message.fail_connext_22);
        } catch (e) {
          if (
            e.errors[0].constraints.isPositive === constant.invalid_chainid_4
          ) {
            addContext(test, message.vali_connext_17);
            console.log(message.vali_connext_17);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_22);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get transaction status without toChainId on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // validate the transaction status
        let transactionStatus;
        try {
          transactionStatus = await optimismDataService.getTransactionStatus({
            fromChainId: data.invalid_optimism_chainid,
            transactionHash: data.transactionHash,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_23);
          assert.fail(message.fail_connext_23);
        } catch (e) {
          if (
            e.errors[0].constraints.isPositive === constant.invalid_chainid_5
          ) {
            addContext(test, message.vali_connext_18);
            console.log(message.vali_connext_18);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_23);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get transaction status with invalid transactionHash on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // validate the transaction status
        let transactionStatus;
        try {
          transactionStatus = await optimismDataService.getTransactionStatus({
            fromChainId: data.invalid_optimism_chainid,
            toChainId: data.matic_chainid,
            transactionHash: data.invalid_transactionHash,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_24);
          assert.fail(message.fail_connext_24);
        } catch (e) {
          if (
            e.errors[0].constraints.isHex === constant.transactionHash_32hex
          ) {
            addContext(test, message.vali_connext_19);
            console.log(message.vali_connext_19);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_24);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get transaction status with incorrect transactionHash on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // validate the transaction status
        let transactionStatus;
        try {
          transactionStatus = await optimismDataService.getTransactionStatus({
            fromChainId: data.invalid_optimism_chainid,
            toChainId: data.matic_chainid,
            transactionHash: data.incorrect_transactionHash,
            provider: BridgingProvider.Connext,
          });

          if (transactionStatus.status === constant.invalid_chainid_6) {
            addContext(test, message.vali_connext_20);
            console.log(message.vali_connext_20);
          } else {
            addContext(test, eString);
            assert.fail(message.fail_connext_25);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_connext_25);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });

  it('REGRESSION: Validate the get transaction status without transactionHash on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // validate the transaction status
        let transactionStatus;
        try {
          transactionStatus = await optimismDataService.getTransactionStatus({
            fromChainId: data.invalid_optimism_chainid,
            toChainId: data.matic_chainid,
            provider: BridgingProvider.Connext,
          });

          addContext(test, message.fail_connext_26);
          assert.fail(message.fail_connext_26);
        } catch (e) {
          if (
            e.errors[0].constraints.isHex === constant.transactionHash_32hex
          ) {
            addContext(test, message.vali_connext_21);
            console.log(message.vali_connext_21);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_connext_26);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.connext_insufficientBalance);
      test.skip();
    }
  });
});
