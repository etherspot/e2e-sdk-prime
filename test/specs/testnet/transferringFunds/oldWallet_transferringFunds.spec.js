import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers, utils, providers } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import {
  randomChainId,
  randomChainName,
  randomIncorrectTokenAddress,
  randomInvalidProviderNetwork,
  randomInvalidTokenAddress,
  randomOtherProviderNetwork,
  randomProviderNetwork,
  randomTokenAddress,
} from '../../../utils/sharedData_testnet.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import abi from '../../../data/nftabi.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let testnetPrimeSdk;
let etherspotWalletAddress;
let nativeAddress = null;
let dataService;
let runTest;

describe('Perform the transaction of the tokens on the TestNet (with old wallet)', function () {
  before(async function () {
    var test = this;

    await customRetryAsync(async function () {
      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        testnetPrimeSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(randomChainId),
            bundlerProvider: new EtherspotBundler(
              Number(randomChainId),
              process.env.BUNDLER_API_KEY
            ),
          }
        );

        try {
          assert.strictEqual(
            testnetPrimeSdk.state.EOAAddress,
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
        etherspotWalletAddress =
          await testnetPrimeSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            etherspotWalletAddress,
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
        dataService = new DataUtils(process.env.DATA_API_KEY);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_data_service);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  beforeEach(async function () {
    var test = this;

    await customRetryAsync(async function () {
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
    }, data.retry); // Retry this async test up to 5 times
  });

  it(
    'SMOKE: Perform the transfer native token with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
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
          let op;
          try {
            op = await testnetPrimeSdk.estimate();

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
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Perform the transfer ERC20 token with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          helper.wait(data.mediumTimeout);

          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );

            try {
              assert.isTrue(
                provider._isProvider,
                message.vali_erc20Transfer_provider
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
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          let transactionData;
          try {
            transactionData = erc20Instance.interface.encodeFunctionData(
              'transfer',
              [
                data.recipient,
                ethers.utils.parseUnits(
                  data.erc20_value,
                  data.erc20_usdc_decimal
                ),
              ]
            );

            try {
              assert.isNotEmpty(
                transactionData,
                message.vali_erc20Contract_transferFrom
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
            assert.fail(message.fail_erc20Contract_transferFrom);
          }

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
          let userOpsBatch;
          try {
            userOpsBatch = await testnetPrimeSdk.addUserOpsToBatch({
              to: randomTokenAddress,
              data: transactionData,
            });

            try {
              assert.isNotEmpty(
                userOpsBatch.to,
                message.vali_addTransaction_to
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsBatch.data,
                message.vali_addTransaction_data
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsBatch.value[0],
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
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          let op;
          try {
            op = await testnetPrimeSdk.estimate();

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
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Perform the transfer ERC721 NFT token with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          helper.wait(data.mediumTimeout);

          // get erc721 Contract Interface
          let erc721Interface;
          let erc721Data;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Data = erc721Interface.encodeFunctionData('transferFrom', [
              data.sender,
              data.recipient,
              data.tokenId,
            ]);

            try {
              assert.isNotEmpty(
                erc721Data,
                message.vali_erc721Transfer_contractInterface
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
            assert.fail(message.fail_erc721Transfer_contractInterface);
          }

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
          let userOpsBatch;
          try {
            userOpsBatch = await testnetPrimeSdk.addUserOpsToBatch({
              to: data.nft_tokenAddress,
              data: erc721Data,
            });

            try {
              assert.isNotEmpty(
                userOpsBatch.to[0],
                message.vali_addTransaction_to
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsBatch.data[0],
                message.vali_addTransaction_data
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsBatch.value[0],
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
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch
          let op;
          try {
            op = await testnetPrimeSdk.estimate();

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

          // sending to the bundler
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
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'SMOKE: Perform the transfer native token by passing callGasLimit with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
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
          // passing callGasLimit as 40000 to manually set it
          let op;
          try {
            op = await testnetPrimeSdk.estimate({ callGasLimit: 40000 });

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
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.nativeTransaction_insufficientBalance);
        console.warn(message.nativeTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Perform the concurrent userops with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      // NOTE: assume the sender wallet is deployed

      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          helper.wait(data.mediumTimeout);

          const provider = new providers.JsonRpcProvider();

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

          // Note that usually Bundlers do not allow sending more than 10 concurrent userops from an unstaked entites (wallets, factories, paymaster)
          // Staked entities can send as many userops as they want
          let concurrentUseropsCount = 1;
          const userops = [];
          const uoHashes = [];

          try {
            while (--concurrentUseropsCount >= 0) {
              const op = await testnetPrimeSdk.estimate({
                key: concurrentUseropsCount,
              });
              userops.push(op);
            }

            console.log('Sending userops...');
            for (const op of userops) {
              const uoHash = await testnetPrimeSdk.send(op);
              uoHashes.push(uoHash);
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

          try {
            console.log('Waiting for transactions...');
            const userOpsReceipts = new Array(uoHashes.length).fill(null);
            const timeout = Date.now() + 60000; // 1 minute timeout
            while (
              userOpsReceipts.some((receipt) => receipt == null) &&
              Date.now() < timeout
            ) {
              helper.wait(2000);
              for (let i = 0; i < uoHashes.length; ++i) {
                if (userOpsReceipts[i]) continue;
                const uoHash = uoHashes[i];
                userOpsReceipts[i] =
                  await testnetPrimeSdk.getUserOpReceipt(uoHash);
              }
            }

            if (userOpsReceipts.some((receipt) => receipt != null)) {
              for (const uoReceipt of userOpsReceipts) {
                if (!uoReceipt) continue;
                addContext(test, message.vali_submitTransaction_1);
                console.log(message.vali_submitTransaction_1);
              }
            } else {
              addContext(test, message.vali_submitTransaction_2);
              console.log(message.vali_submitTransaction_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getUserOpReceipt_1);
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
    'REGRESSION: Perform the transfer native token with the incorrect To Address while estimate the added transactions to the batch on the ' +
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
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
              to: data.incorrectRecipient, // incorrect to address
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

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_9);
            assert.fail(message.fail_estimateTransaction_9);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_estimateTransaction_8);
              console.log(message.vali_estimateTransaction_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_9);
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
    'REGRESSION: Perform the transfer native token with the invalid To Address i.e. missing character while estimate the added transactions to the batch on the ' +
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
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
              to: data.invalidRecipient, // invalid to address
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

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_10);
            assert.fail(message.fail_estimateTransaction_10);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_estimateTransaction_9);
              console.log(message.vali_estimateTransaction_9);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_10);
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
    'REGRESSION: Perform the transfer native token with the invalid Value while estimate the added transactions to the batch on the ' +
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
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseUnits(data.invalidValue), // invalid value
            });

            addContext(test, message.fail_estimateTransaction_11);
            assert.fail(message.fail_estimateTransaction_11);
          } catch (e) {
            if (e.reason === constant.invalid_value_1) {
              addContext(test, message.vali_estimateTransaction_10);
              console.log(message.vali_estimateTransaction_10);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_11);
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
    'REGRESSION: Perform the transfer native token with the very small Value while estimate the added transactions to the batch on the ' +
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
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseUnits(data.smallValue), // very small value
            });

            addContext(test, message.fail_estimateTransaction_12);
            assert.fail(message.fail_estimateTransaction_12);
          } catch (e) {
            if (e.reason === constant.invalid_value_2) {
              addContext(test, message.vali_estimateTransaction_11);
              console.log(message.vali_estimateTransaction_11);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_12);
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
    'REGRESSION: Perform the transfer native token without adding transaction to the batch while estimate the added transactions to the batch on the ' +
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
            assert.fail(message.fail_clearTransaction_1);
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

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_13);
            assert.fail(message.fail_estimateTransaction_13);
          } catch (e) {
            if (e.message === constant.invalid_parameter) {
              addContext(test, message.vali_estimateTransaction_12);
              console.log(message.vali_estimateTransaction_12);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_13);
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

  xit(
    'REGRESSION: Perform the transfer native token by passing callGasLimit with the incorrect To Address while estimate the added transactions to the batch on the ' +
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
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
              to: data.incorrectRecipient, // incorrect to address
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

          // estimate transactions added to the batch
          // passing callGasLimit as 40000 to manually set it
          try {
            await testnetPrimeSdk.estimate({ callGasLimit: 40000 });

            addContext(test, message.fail_estimateTransaction_9);
            assert.fail(message.fail_estimateTransaction_9);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_estimateTransaction_8);
              console.log(message.vali_estimateTransaction_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_9);
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

  xit(
    'REGRESSION: Perform the transfer native token by passing callGasLimit with the invalid To Address i.e. missing character while estimate the added transactions to the batch on the ' +
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
          }

          // add transactions to the batch
          try {
            await testnetPrimeSdk.addUserOpsToBatch({
              to: data.invalidRecipient, // invalid to address
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

          // estimate transactions added to the batch
          // passing callGasLimit as 40000 to manually set it
          try {
            await testnetPrimeSdk.estimate({ callGasLimit: 40000 });

            addContext(test, message.fail_estimateTransaction_10);
            assert.fail(message.fail_estimateTransaction_10);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_estimateTransaction_8);
              console.log(message.vali_estimateTransaction_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_10);
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

  xit(
    'REGRESSION: Perform the transfer native token by passing callGasLimit without adding transaction to the batch while estimate the added transactions to the batch on the ' +
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
            assert.fail(message.fail_clearTransaction_1);
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

          // estimate transactions added to the batch
          // passing callGasLimit as 40000 to manually set it
          try {
            await testnetPrimeSdk.estimate({ callGasLimit: 40000 });

            addContext(test, message.fail_estimateTransaction_13);
            assert.fail(message.fail_estimateTransaction_13);
          } catch (e) {
            if (e.message === constant.empty_batch) {
              addContext(test, message.vali_estimateTransaction_12);
              console.log(message.vali_estimateTransaction_12);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_13);
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
    'REGRESSION: Perform the transfer ERC20 token with invalid provider netowrk details while Getting the Decimal from ERC20 Contract on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomInvalidProviderNetwork // invalid provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transferr', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_4);
            assert.fail(message.fail_erc20Transfer_4);
          } catch (e) {
            if (e.reason === constant.no_function) {
              addContext(test, message.vali_erc20Transfer_4);
              console.log(message.vali_erc20Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token without provider netowrk details while Getting the Decimal from ERC20 Contract on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(); // without provider
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transferr', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_4);
            assert.fail(message.fail_erc20Transfer_4);
          } catch (e) {
            if (e.reason === constant.no_function) {
              addContext(test, message.vali_erc20Transfer_4);
              console.log(message.vali_erc20Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with other provider netowrk details while Getting the Decimal from ERC20 Contract on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomOtherProviderNetwork // other provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transferr', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_4);
            assert.fail(message.fail_erc20Transfer_4);
          } catch (e) {
            if (e.reason === constant.no_function) {
              addContext(test, message.vali_erc20Transfer_4);
              console.log(message.vali_erc20Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with incorrect Token Address details while Getting the Decimal from ERC20 Contract on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomIncorrectTokenAddress, // incorrect token address
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transferr', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_4);
            assert.fail(message.fail_erc20Transfer_4);
          } catch (e) {
            if (e.reason === constant.no_function) {
              addContext(test, message.vali_erc20Transfer_4);
              console.log(message.vali_erc20Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with invalid Token Address i.e. missing character details while Getting the Decimal from ERC20 Contract on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomInvalidTokenAddress, // invalid token address
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transferr', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_4);
            assert.fail(message.fail_erc20Transfer_4);
          } catch (e) {
            if (e.reason === constant.no_function) {
              addContext(test, message.vali_erc20Transfer_4);
              console.log(message.vali_erc20Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with null Token Address details while Getting the Decimal from ERC20 Contract on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          try {
            new ethers.Contract(null, ERC20_ABI, provider); // null token address

            addContext(test, message.fail_erc20Transfer_3);
            assert.fail(message.fail_erc20Transfer_3);
          } catch (e) {
            if (e.reason === constant.contract_address_2) {
              addContext(test, message.vali_erc20Transfer_3);
              console.log(message.vali_erc20Transfer_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_3);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with incorrect transfer method name while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transferr', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_4);
            assert.fail(message.fail_erc20Transfer_4);
          } catch (e) {
            if (e.reason === constant.no_function) {
              addContext(test, message.vali_erc20Transfer_4);
              console.log(message.vali_erc20Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with invalid value while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              data.recipient,
              ethers.utils.parseUnits(
                data.invalidValue,
                data.erc20_usdc_decimal
              ), // invalid value
            ]);

            addContext(test, message.fail_erc20Transfer_5);
            assert.fail(message.fail_erc20Transfer_5);
          } catch (e) {
            if (e.reason === constant.invalid_value_1) {
              addContext(test, message.vali_erc20Transfer_5);
              console.log(message.vali_erc20Transfer_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_5);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with very small value while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              data.recipient,
              ethers.utils.parseUnits(data.smallValue, data.erc20_usdc_decimal), // very small value
            ]);

            addContext(test, message.fail_erc20Transfer_6);
            assert.fail(message.fail_erc20Transfer_6);
          } catch (e) {
            if (e.reason === constant.invalid_value_2) {
              addContext(test, message.vali_erc20Transfer_6);
              console.log(message.vali_erc20Transfer_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_6);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token without value while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              data.recipient,
            ]);

            addContext(test, message.fail_erc20Transfer_7);
            assert.fail(message.fail_erc20Transfer_7);
          } catch (e) {
            if (e.reason === constant.invalid_value_4) {
              addContext(test, message.vali_erc20Transfer_7);
              console.log(message.vali_erc20Transfer_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_7);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with incorrect recipient while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              data.incorrectRecipient, // incorrect recipient address
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_8);
            assert.fail(message.fail_erc20Transfer_8);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_erc20Transfer_8);
              console.log(message.vali_erc20Transfer_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_8);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with invalid recipient i.e. missing character while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              data.invalidRecipient, // invalid recipient address
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_9);
            assert.fail(message.fail_erc20Transfer_9);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_erc20Transfer_9);
              console.log(message.vali_erc20Transfer_9);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_9);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token without recipient while Getting the transferFrom encoded data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);

            addContext(test, message.fail_erc20Transfer_10);
            assert.fail(message.fail_erc20Transfer_10);
          } catch (e) {
            if (e.reason === constant.invalid_value_4) {
              addContext(test, message.vali_erc20Transfer_10);
              console.log(message.vali_erc20Transfer_10);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Transfer_10);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with the incorrect Token Address while adding transactions to the batch on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          let transactionData;
          try {
            transactionData = erc20Instance.interface.encodeFunctionData(
              'transfer',
              [
                data.recipient,
                ethers.utils.parseUnits(
                  data.erc20_value,
                  data.erc20_usdc_decimal
                ),
              ]
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Contract_decimals);
          }

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
              to: randomIncorrectTokenAddress, // Incorrect Token Address
              data: transactionData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_16);
            assert.fail(message.fail_estimateTransaction_16);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_estimateTransaction_15);
              console.log(message.vali_estimateTransaction_15);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_16);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with the invalid Token Address i.e. missing character while adding transactions to the batch on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          let transactionData;
          try {
            transactionData = erc20Instance.interface.encodeFunctionData(
              'transfer',
              [
                data.recipient,
                ethers.utils.parseUnits(
                  data.erc20_value,
                  data.erc20_usdc_decimal
                ),
              ]
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Contract_decimals);
          }

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
              to: randomInvalidTokenAddress, // Invalid Token Address
              data: transactionData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_17);
            assert.fail(message.fail_estimateTransaction_17);
          } catch (e) {
            let error = e.reason;
            if (error.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_estimateTransaction_16);
              console.log(message.vali_estimateTransaction_16);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_17);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token with the null Token Address while adding transactions to the batch on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          let transactionData;
          try {
            transactionData = erc20Instance.interface.encodeFunctionData(
              'transfer',
              [
                data.recipient,
                ethers.utils.parseUnits(
                  data.erc20_value,
                  data.erc20_usdc_decimal
                ),
              ]
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Contract_decimals);
          }

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
              to: null, // Null Token Address
              data: transactionData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_18);
            assert.fail(message.fail_estimateTransaction_18);
          } catch (e) {
            if (e.reason.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_estimateTransaction_17);
              console.log(message.vali_estimateTransaction_17);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_18);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token without Token Address while adding transactions to the batch on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          let transactionData;
          try {
            transactionData = erc20Instance.interface.encodeFunctionData(
              'transfer',
              [
                data.recipient,
                ethers.utils.parseUnits(
                  data.erc20_value,
                  data.erc20_usdc_decimal
                ),
              ]
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Contract_decimals);
          }

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
              data: transactionData, // without tokenAddress
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_19);
            assert.fail(message.fail_estimateTransaction_19);
          } catch (e) {
            if (e.reason.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_estimateTransaction_18);
              console.log(message.vali_estimateTransaction_18);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_19);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC20 token without adding transaction to the batch while estimate the added transactions to the batch on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get the respective provider details
          let provider;
          try {
            provider = new ethers.providers.JsonRpcProvider(
              randomProviderNetwork
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_provider);
          }

          // get erc20 Contract Interface
          let erc20Instance;
          try {
            erc20Instance = new ethers.Contract(
              randomTokenAddress,
              ERC20_ABI,
              provider
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Transfer_contractInterface);
          }

          // get transferFrom encoded data
          try {
            erc20Instance.interface.encodeFunctionData('transfer', [
              data.recipient,
              ethers.utils.parseUnits(
                data.erc20_value,
                data.erc20_usdc_decimal
              ),
            ]);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Contract_decimals);
          }

          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            assert.fail(message.fail_estimateTransaction_13);
          } catch (e) {
            if (e.message === constant.invalid_parameter) {
              addContext(test, message.vali_estimateTransaction_12);
              console.log(message.vali_estimateTransaction_12);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_13);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc20Transaction_insufficientBalance);
        console.warn(message.erc20Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token with incorrect Sender Address while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.incorrectSender, // incorrect sender address
              data.recipient,
              data.tokenId,
            ]);

            addContext(test, message.fail_erc721Transfer_1);
            assert.fail(message.fail_erc721Transfer_1);
          } catch (e) {
            if (e.reason.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_erc721Transfer_1);
              console.log(message.vali_erc721Transfer_1);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_1);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token with invalid Sender Address i.e. missing character while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.invalidSender, // invalid sender address
              data.recipient,
              data.tokenId,
            ]);

            addContext(test, message.fail_erc721Transfer_2);
            assert.fail(message.fail_erc721Transfer_2);
          } catch (e) {
            if (e.reason.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_erc721Transfer_2);
              console.log(message.vali_erc721Transfer_2);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_2);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token without Sender Address while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.recipient, // not added sender address
              data.tokenId,
            ]);

            addContext(test, message.fail_erc721Transfer_3);
            assert.fail(message.fail_erc721Transfer_3);
          } catch (e) {
            if (e.reason === constant.invalid_value_4) {
              addContext(test, message.vali_erc721Transfer_3);
              console.log(message.vali_erc721Transfer_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_3);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token with incorrect Recipient Address while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.sender,
              data.incorrectRecipient, // incorrect recipient address
              data.tokenId,
            ]);

            addContext(test, message.fail_erc721Transfer_4);
            assert.fail(message.fail_erc721Transfer_4);
          } catch (e) {
            if (e.reason.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_erc721Transfer_4);
              console.log(message.vali_erc721Transfer_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token with invalid Recipient Address i.e. missing character while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.sender,
              data.invalidRecipient, // invalid recipient address
              data.tokenId,
            ]);

            addContext(test, message.fail_erc721Transfer_5);
            assert.fail(message.fail_erc721Transfer_5);
          } catch (e) {
            if (e.reason.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_erc721Transfer_5);
              console.log(message.vali_erc721Transfer_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_5);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token without Recipient Address while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.sender, // not added recipient address
              data.tokenId,
            ]);

            addContext(test, message.fail_erc721Transfer_6);
            assert.fail(message.fail_erc721Transfer_6);
          } catch (e) {
            if (e.reason === constant.invalid_value_4) {
              addContext(test, message.vali_erc721Transfer_6);
              console.log(message.vali_erc721Transfer_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_6);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token with incorrect tokenId while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.sender,
              data.recipient,
              data.incorrectTokenId, // incorrect tokenid
            ]);

            addContext(message.fail_erc721Transfer_7);
            assert.fail(message.fail_erc721Transfer_7);
          } catch (e) {
            if (e.reason === constant.invalid_bignumber_1) {
              addContext(test, message.vali_erc721Transfer_7);
              console.log(message.vali_erc721Transfer_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_7);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT token without tokenId while creating the NFT Data on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.sender,
              data.recipient, // not added tokenid
            ]);

            addContext(test, message.fail_erc721Transfer_8);
            assert.fail(message.fail_erc721Transfer_8);
          } catch (e) {
            if (e.reason === constant.invalid_value_4) {
              addContext(test, message.vali_erc721Transfer_8);
              console.log(message.vali_erc721Transfer_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc721Transfer_8);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the transfer ERC721 NFT Token without adding transaction to the batch while estimate the added transactions to the batch on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // get erc721 Contract Interface
          let erc721Interface;
          try {
            erc721Interface = new ethers.utils.Interface(abi.abi);

            erc721Interface.encodeFunctionData('transferFrom', [
              data.sender,
              data.recipient,
              data.tokenId,
            ]);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc721Transfer_contractInterface);
          }

          // clear the transaction batch
          try {
            await testnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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

          // estimate transactions added to the batch
          try {
            await testnetPrimeSdk.estimate();

            addContext(test, message.fail_estimateTransaction_13);
            assert.fail(message.fail_estimateTransaction_13);
          } catch (e) {
            if (e.message === constant.invalid_parameter) {
              addContext(test, message.vali_estimateTransaction_12);
              console.log(message.vali_estimateTransaction_12);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_13);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.erc721Transaction_insufficientBalance);
        console.warn(message.erc721Transaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Perform the concurrent userops with invalid concurrentUseropsCount on the ' +
      randomChainName +
      ' network',
    async function () {
      // NOTE: assume the sender wallet is deployed

      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          const provider = new providers.JsonRpcProvider();

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
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getBalance_1);
          }

          // Note that usually Bundlers do not allow sending more than 10 concurrent userops from an unstaked entites (wallets, factories, paymaster)
          // Staked entities can send as many userops as they want
          let concurrentUseropsCount = -5; // invalid concurrent userops
          const userops = [];
          const uoHashes = [];

          try {
            while (--concurrentUseropsCount >= 0) {
              const op = await testnetPrimeSdk.estimate({
                key: concurrentUseropsCount,
              });
              userops.push(op);
            }

            console.log('Sending userops...');
            for (const op of userops) {
              const uoHash = await testnetPrimeSdk.send(op);
              uoHashes.push(uoHash);
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

          try {
            console.log('Waiting for transactions...');
            const userOpsReceipts = new Array(uoHashes.length).fill(null);
            const timeout = Date.now() + 60000; // 1 minute timeout
            while (
              userOpsReceipts.some((receipt) => receipt == null) &&
              Date.now() < timeout
            ) {
              helper.wait(2000);
              for (let i = 0; i < uoHashes.length; ++i) {
                if (userOpsReceipts[i]) continue;
                const uoHash = uoHashes[i];
                userOpsReceipts[i] =
                  await testnetPrimeSdk.getUserOpReceipt(uoHash);
              }
            }

            if (userOpsReceipts.some((receipt) => receipt != null)) {
              for (const uoReceipt of userOpsReceipts) {
                if (!uoReceipt) continue;
                addContext(test, message.vali_submitTransaction_1);
                console.log(message.vali_submitTransaction_1);
              }
            } else {
              addContext(test, message.vali_submitTransaction_2);
              console.log(message.vali_submitTransaction_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getUserOpReceipt_1);
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
    'REGRESSION: Perform the concurrent userops without concurrentUseropsCount on the ' +
      randomChainName +
      ' network',
    async function () {
      // NOTE: assume the sender wallet is deployed

      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          const provider = new providers.JsonRpcProvider();

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
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getBalance_1);
          }

          // Note that usually Bundlers do not allow sending more than 10 concurrent userops from an unstaked entites (wallets, factories, paymaster)
          // Staked entities can send as many userops as they want
          let concurrentUseropsCount; // invalid concurrent userops
          const userops = [];
          const uoHashes = [];

          try {
            while (--concurrentUseropsCount >= 0) {
              const op = await testnetPrimeSdk.estimate({
                key: concurrentUseropsCount,
              });
              userops.push(op);
            }

            console.log('Sending userops...');
            for (const op of userops) {
              const uoHash = await testnetPrimeSdk.send(op);
              uoHashes.push(uoHash);
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

          try {
            console.log('Waiting for transactions...');
            const userOpsReceipts = new Array(uoHashes.length).fill(null);
            const timeout = Date.now() + 60000; // 1 minute timeout
            while (
              userOpsReceipts.some((receipt) => receipt == null) &&
              Date.now() < timeout
            ) {
              helper.wait(2000);
              for (let i = 0; i < uoHashes.length; ++i) {
                if (userOpsReceipts[i]) continue;
                const uoHash = uoHashes[i];
                userOpsReceipts[i] =
                  await testnetPrimeSdk.getUserOpReceipt(uoHash);
              }
            }

            if (userOpsReceipts.some((receipt) => receipt != null)) {
              for (const uoReceipt of userOpsReceipts) {
                if (!uoReceipt) continue;
                addContext(test, message.vali_submitTransaction_1);
                console.log(message.vali_submitTransaction_1);
              }
            } else {
              addContext(test, message.vali_submitTransaction_2);
              console.log(message.vali_submitTransaction_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getUserOpReceipt_1);
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
    'REGRESSION: Perform the concurrent userops with non deployed address on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          const provider = new providers.JsonRpcProvider();

          try {
            if ((await provider.getCode(data.eoaAddress)).length <= 2) {
              addContext(test, message.vali_deployAddress_1);
              console.log(message.vali_deployAddress_1);
              return;
            }

            addContext(test, message.fail_deployAddress_1);
            assert.fail(message.fail_deployAddress_1);
          } catch (e) {
            const errorMessage = e.message;
            if (errorMessage.includes(constant.invalid_network_2)) {
              addContext(test, message.vali_deployAddress_2);
              console.log(message.vali_deployAddress_2);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_deployAddress_1);
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
