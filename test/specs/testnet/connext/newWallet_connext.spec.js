import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { utils, ethers } from 'ethers';
import { BridgingProvider } from '@etherspot/prime-sdk/dist/sdk/data/index.js';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import {
  randomChainId,
  randomChainName,
  randomIncorrectTokenAddress,
  randomInvalidChainId,
  randomInvalidTokenAddress,
  randomToChainId,
  randomTokenAddress,
} from '../../../utils/sharedData_testnet.js';
import { customRetryAsync } from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let testnetPrimeSdk;
let nativeAddress = null;
let dataService;
let runTest;
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Validate the connext endpoints on the TestNet (with new wallet)', function () {
  before(async function () {
    const filePath = path.join(__dirname, '../../../utils/testUtils.json');
    const sharedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        testnetPrimeSdk = new PrimeSdk(
          { privateKey: sharedState.newPrivateKey },
          {
            chainId: Number(randomChainId),
            bundlerProvider: new EtherspotBundler(
              Number(randomChainId),
              process.env.BUNDLER_API_KEY
            ),
          }
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_sdk_initialize);
      }

      // initializating Data service...
      try {
        dataService = new DataUtils(process.env.BUNDLER_API_KEY);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_data_service);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  beforeEach(async function () {
    // validate the balance of the wallet
    try {
      let output = await dataService.getAccountBalances({
        account: data.sender,
        chainId: Number(randomChainId),
      });
      let native_balance;
      let usdc_balance;
      let native_final;
      let usdc_final;

      for (let i = 0; i < output.items.length; i++) {
        let tokenAddress = output.items[i].token;
        if (tokenAddress === nativeAddress) {
          native_balance = output.items[i].balance;
          native_final = utils.formatUnits(native_balance, 18);
        } else if (tokenAddress === randomTokenAddress) {
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
  });

  it(
    'SMOKE: Validate the all supported assets with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let allSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            allSupportedAssets = await dataService.getSupportedAssets({});

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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the supported assets with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let supportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            supportedAssets = await dataService.getSupportedAssets({
              chainId: randomChainId,
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
                randomChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the get quotes with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
              assert.isNotEmpty(
                quotes[0].to,
                message.vali_connext_getQuotes_to
              );
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the get transaction status with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let op;
      if (runTest) {
        await customRetryAsync(async function () {
          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
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
            await testnetPrimeSdk.getNativeBalance();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getBalance_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            op = await testnetPrimeSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }
        }, data.retry); // Retry this async test up to 5 times

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await testnetPrimeSdk.send(op);
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
            await helper.wait(data.mediumTimeout);
            userOpsReceipt = await testnetPrimeSdk.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getTransactionHash_1);
        }

        await customRetryAsync(async function () {
          // validate the transaction status
          let transactionStatus;
          try {
            transactionStatus = await dataService.getTransactionStatus({
              fromChainId: randomChainId,
              toChainId: randomToChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with invalid sender address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.invalidSender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without sender address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with incorrect sender address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.incorrectSender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with invalid recepient address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.invalidRecipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without recepient address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with incorrect recepient address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.incorrectRecipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without fromChainid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without toChainid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with invalid from token address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomInvalidTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with incorrect from token address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomIncorrectTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without from token address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with invalid value on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes with small value on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without value on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get quotes without slippage on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let quotes;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            quotes = await dataService.getQuotes({
              fromAddress: data.sender,
              toAddress: data.recipient,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromToken: randomTokenAddress,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction status without fromChainId on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // validate the transaction status
          let transactionStatus;
          try {
            transactionStatus = await dataService.getTransactionStatus({
              toChainId: randomToChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction status without toChainId on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // validate the transaction status
          let transactionStatus;
          try {
            transactionStatus = await dataService.getTransactionStatus({
              fromChainId: randomInvalidChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction status with invalid transactionHash on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // validate the transaction status
          let transactionStatus;
          try {
            transactionStatus = await dataService.getTransactionStatus({
              fromChainId: randomInvalidChainId,
              toChainId: randomToChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction status with incorrect transactionHash on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // validate the transaction status
          let transactionStatus;
          try {
            transactionStatus = await dataService.getTransactionStatus({
              fromChainId: randomInvalidChainId,
              toChainId: randomToChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction status without transactionHash on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // validate the transaction status
          let transactionStatus;
          try {
            transactionStatus = await dataService.getTransactionStatus({
              fromChainId: randomInvalidChainId,
              toChainId: randomToChainId,
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
        addContext(test, message.connext_insufficientBalance);
        console.warn(message.connext_insufficientBalance);
        test.skip();
      }
    }
  );
});
