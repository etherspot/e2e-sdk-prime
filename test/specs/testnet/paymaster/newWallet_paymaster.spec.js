import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { customRetryAsync } from '../../../utils/baseTest.js';
import {
  randomChainId,
  randomChainName,
  randomTokenAddress,
} from '../../../utils/sharedData_testnet.js';
import helper from '../../../utils/helper.js';
import axios from 'axios';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let testnetPrimeSdk;
let etherspotWalletAddress;
let nativeAddress = null;
let dataService;
let runTest;
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Perform the transaction with arka paymasters on the TestNet (with new wallet)', function () {
  before(async function () {
    const filePath = path.join(__dirname, '../../../utils/testUtils.json');
    const sharedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    var test = this;

    await customRetryAsync(async function () {
      helper.wait(data.mediumTimeout);

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

      // get EtherspotWallet address
      try {
        etherspotWalletAddress =
          await testnetPrimeSdk.getCounterFactualAddress();
      } catch (e) {
        console.error(e.message);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_smart_address);
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
    'PRECONDITION: Validate the whitelist endpoint with v1 and userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_whitelist}?apiKey=${process.env.BUNDLER_API_KEY}&chainId=${randomChainId}&useVp=true`;

      // define header with valid details
      const header = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      // define the payload
      const requestData = {
        params: [[etherspotWalletAddress]],
      };

      var test = this;
      // validate the whitelist endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes('Addresses were already added')) {
          addContext(test, message.vali_whitelist_1);
          console.log(message.vali_whitelist_1);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_whitelist_1);
        }
      }
    }
  );

  it(
    'SMOKE: Perform the transfer native token on arka paymaster on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let op;
      if (runTest) {
        await customRetryAsync(async function () {
          helper.wait(data.mediumTimeout);

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
          let transactionBatch;
          try {
            transactionBatch = await testnetPrimeSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });

            try {
              assert.isNotEmpty(
                transactionBatch.to,
                message.vali_addTransaction_to
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactionBatch.data,
                message.vali_addTransaction_data
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactionBatch.value,
                message.vali_addTransaction_value
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
            assert.fail(message.fail_addTransaction_1);
          }

          // get balance of the account address
          let balance;
          try {
            balance = await testnetPrimeSdk.getNativeBalance();

            try {
              assert.isNotEmpty(balance, message.vali_getBalance_balance);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getBalance_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            op = await testnetPrimeSdk.estimate({
              paymasterDetails: {
                url: `${data.paymaster_arka}?apiKey=${
                  process.env.BUNDLER_API_KEY
                }&chainId=${Number(randomChainId)}&useVp=true`,
                context: { mode: 'sponsor' },
              },
            });

            try {
              assert.isNotEmpty(
                op.sender,
                message.vali_estimateTransaction_sender
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.nonce,
                message.vali_estimateTransaction_nonce
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.initCode,
                message.vali_estimateTransaction_initCode
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.callData,
                message.vali_estimateTransaction_callData
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.callGasLimit,
                message.vali_estimateTransaction_callGasLimit
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.verificationGasLimit,
                message.vali_estimateTransaction_verificationGasLimit
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.maxFeePerGas,
                message.vali_estimateTransaction_maxFeePerGas
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.maxPriorityFeePerGas,
                message.vali_estimateTransaction_maxPriorityFeePerGas
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.paymasterAndData,
                message.vali_estimateTransaction_paymasterAndData
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.preVerificationGas,
                message.vali_estimateTransaction_preVerificationGas
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.signature,
                message.vali_estimateTransaction_signature
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
            assert.fail(message.fail_estimateTransaction_1);
          }
        }, data.retry); // Retry this async test up to 5 times

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await testnetPrimeSdk.send(op);

          try {
            assert.isNotEmpty(uoHash, message.vali_submitTransaction_uoHash);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
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
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer native token with invalid arka paymaster url on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction);
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
            await testnetPrimeSdk.estimate({
              paymasterDetails: {
                url: `${data.invalid_paymaster_arka}?apiKey=${
                  // invalid paymaster url
                  process.env.BUNDLER_API_KEY
                }&chainId=${Number(randomChainId)}&useVp=true`,
                context: { mode: 'sponsor' },
              },
            });

            addContext(test, message.fail_estimateTransaction_2);
            assert.fail(message.fail_estimateTransaction_2);
          } catch (e) {
            if (e.message === constant.not_found) {
              addContext(test, message.vali_estimateTransaction_1);
              console.log(message.vali_estimateTransaction_1);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_2);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer native token with invalid API Key of arka paymaster on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction);
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
            await testnetPrimeSdk.estimate({
              paymasterDetails: {
                url: `${data.paymaster_arka}?apiKey=${
                  data.invalid_bundler_apikey // invalid api key
                }&chainId=${Number(randomChainId)}&useVp=true`,
                context: { mode: 'sponsor' },
              },
            });

            addContext(test, message.fail_estimateTransaction_4);
            assert.fail(message.fail_estimateTransaction_4);
          } catch (e) {
            if (e.message === constant.invalid_apiKey) {
              addContext(test, message.vali_estimateTransaction_3);
              console.log(message.vali_estimateTransaction_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer native token with incorrect API Key of arka paymaster on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction);
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
            await testnetPrimeSdk.estimate({
              paymasterDetails: {
                url: `${data.paymaster_arka}?apiKey=${
                  data.incorrect_bundler_apikey // incorrect api key
                }&chainId=${Number(randomChainId)}&useVp=true`,
                context: { mode: 'sponsor' },
              },
            });

            addContext(test, message.fail_estimateTransaction_5);
            assert.fail(message.fail_estimateTransaction_5);
          } catch (e) {
            if (e.message === constant.invalid_apiKey) {
              addContext(test, message.vali_estimateTransaction_4);
              console.log(message.vali_estimateTransaction_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_5);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer native token without API Key of arka paymaster on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction);
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
            await testnetPrimeSdk.estimate({
              paymasterDetails: {
                url: `${data.paymaster_arka}? 
                chainId=${Number(randomChainId)}&useVp=true`,
                context: { mode: 'sponsor' }, // without aoi key
              },
            });

            addContext(test, message.fail_estimateTransaction_6);
            assert.fail(message.fail_estimateTransaction_6);
          } catch (e) {
            if (e.message === constant.invalid_apiKey) {
              addContext(test, message.vali_estimateTransaction_5);
              console.log(message.vali_estimateTransaction_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_6);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );
});
