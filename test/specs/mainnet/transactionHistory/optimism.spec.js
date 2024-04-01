import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers, utils, providers } from 'ethers';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import helper from '../../../utils/helper.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let optimismMainNetSdk;
let optimismEtherspotWalletAddress;
let optimismNativeAddress = null;
let optimismDataService;
let runTest;

describe('The PrimeSDK, when get the single transaction and multiple transaction details with optimism network on the MainNet', function () {
  before(async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        optimismMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.optimism_chainid),
            bundlerProvider: new EtherspotBundler(Number(data.optimism_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            optimismMainNetSdk.state.EOAAddress,
            data.eoaAddress,
            'The EOA Address is not calculated correctly.',
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
        assert.fail('The SDK is not initialled successfully.');
      }

      // get EtherspotWallet address
      try {
        optimismEtherspotWalletAddress =
          await optimismMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            optimismEtherspotWalletAddress,
            data.sender,
            'The Etherspot Wallet Address is not calculated correctly.',
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
        assert.fail(
          'The Etherspot Wallet Address is not displayed successfully.',
        );
      }

      // initializating Data service...
      try {
        optimismDataService = new DataUtils(
          process.env.DATA_API_KEY
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The Data service is not initialled successfully.');
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
        assert.fail('Validation of the balance of the wallet is not performed.');
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the transaction history of the native token transaction on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await optimismMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
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
          assert.fail(
            'The addition of transaction in the batch is not performed.',
          );
        }

        // get balance of the account address
        try {
          await optimismMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await optimismMainNetSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
          );
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await optimismMainNetSdk.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The sign the UserOp and sending to the bundler action is not performed.',
          );
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
          assert.fail('The get transaction hash action is not performed.');
        }

        // get single transaction history details
        let transactionHash;
        let singleTransaction;

        if (!(userOpsReceipt === null)) {
          try {
            transactionHash = userOpsReceipt.receipt.transactionHash;
            singleTransaction = await optimismDataService.getTransaction({
              hash: transactionHash,
              chainId: Number(data.optimism_chainid),
            });

            try {
              assert.isNumber(
                singleTransaction.chainId,
                'The chainId value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.hash,
                'The hash value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.nonce,
                'The nonce value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.blockHash,
                'The blockHash value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.blockNumber,
                'The blockNumber value is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.from,
                'The from address value is not correct in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.to,
                'The to address value is not correct in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.value,
                'The value details is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.gasPrice,
                'The gasPrice value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.gasLimit,
                'The gasLimit value is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.input,
                'The input value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.status,
                'The status value is not correct in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.blockExplorerUrl,
                'The blockExplorerUrl value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.transactionIndex,
                'The transactionIndex value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.gasUsed,
                'The gasUsed value is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.logs[0].transactionIndex,
                'The transactionIndex value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.logs[0].blockNumber,
                'The blockNumber value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.logs[0].transactionHash,
                'The transactionHash value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.logs[0].address,
                'The address value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.logs[0].topics,
                'The topics value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.logs[0].data,
                'The data value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                singleTransaction.logs[0].logIndex,
                'The logIndex value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                singleTransaction.logs[0].blockHash,
                'The blockHash value of the logs is empty in the transaction details response.',
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
            assert.fail('The get transaction details is not performed.');
          }
        } else {
          console.log('The UserOpsReceipt is displayed as a null.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTION ON THE optimism NETWORK',
      );
    }
  });

  it('SMOKE: Validate the get transactions history response with random transaction in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // Fetching historical transactions
        let transactions;
        let randomTransaction;

        try {
          transactions = await optimismDataService.getTransactions({
            chainId: Number(data.optimism_chainid),
            account: data.sender,
          });

          randomTransaction =
            Math.floor(Math.random() * (transactions.transactions.length - 1)) + 1;

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].chainId,
              'The chainId value is not number in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].blockNumber,
              'The blockNumber value is not number in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].sender,
              'The sender address vlaue is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].target,
              'The target address vlaue is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].transactionHash,
              'The transactionHash value is not number in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].userOpHash,
              'The userOpHash value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].actualGasCost,
              'The actualGasCost value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].actualGasUsed,
              'The actualGasUsed value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].success,
              'The success value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].timestamp,
              'The timestamp value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].paymaster,
              'The paymaster value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].value,
              'The values value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].blockExplorerUrl,
              'The blockExplorerUrl value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].input,
              'The input value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].nonce,
              'The nonce value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].initCode,
              'The initCode value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].callData,
              'The callData value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].verificationGasLimit,
              'The verificationGasLimit value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].preVerificationGas,
              'The preVerificationGas value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].maxFeePerGas,
              'The maxFeePerGas value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].maxPriorityFeePerGas,
              'The maxPriorityFeePerGas value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].maxPriorityFeePerGas,
              'The maxPriorityFeePerGas value is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].nativeTransfers[0].from,
              'The from value of the nativeTransfers is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].nativeTransfers[0].to,
              'The to value of the nativeTransfers is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].nativeTransfers[0].value,
              'The to value of the nativeTransfers is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].nativeTransfers[0].asset,
              'The to asset of the nativeTransfers is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].nativeTransfers[0].address,
              'The to address of the nativeTransfers is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNumber(
              transactions.transactions[randomTransaction].nativeTransfers[0].decimal,
              'The to decimal of the nativeTransfers is empty in the get transactions response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactions.transactions[randomTransaction].nativeTransfers[0].data,
              'The to data of the nativeTransfers is empty in the get transactions response.',
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
          assert.fail(
            'An error is displayed while Fetching historical transactions.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH RANDOM HASH ON THE optimism NETWORK',
      );
    }
  });

  it('SMOKE: Validate the get transactions history response of the native transaction in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await optimismMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
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
          assert.fail(
            'The addition of transaction in the batch is not performed.',
          );
        }

        // get balance of the account address
        try {
          await optimismMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await optimismMainNetSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
          );
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await optimismMainNetSdk.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The sign the UserOp and sending to the bundler action is not performed.',
          );
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
          assert.fail('The get transaction hash action is not performed.');
        }

        // wait for the 10 seconds
        helper.wait(10000)

        // Fetching historical transactions
        let transactions;
        try {
          transactions = await optimismDataService.getTransactions({
            chainId: Number(data.optimism_chainid),
            account: data.sender,
            page: 1,
            limit: 10
          });

          if (userOpsReceipt != null) {
            try {
              assert.isNumber(
                transactions.transactions[0].chainId,
                'The chainId value is not number in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].blockNumber,
                'The blockNumber value is not number in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].sender,
                'The sender address vlaue is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].target,
                'The target address vlaue is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].transactionHash,
                'The transactionHash value is not number in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].userOpHash,
                'The userOpHash value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].actualGasCost,
                'The actualGasCost value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].actualGasUsed,
                'The actualGasUsed value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].success,
                'The success value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].timestamp,
                'The timestamp value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].paymaster,
                'The paymaster value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].value,
                'The values value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].blockExplorerUrl,
                'The blockExplorerUrl value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].input,
                'The input value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].nonce,
                'The nonce value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].initCode,
                'The initCode value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].callData,
                'The callData value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].verificationGasLimit,
                'The verificationGasLimit value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].preVerificationGas,
                'The preVerificationGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].maxFeePerGas,
                'The maxFeePerGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].maxPriorityFeePerGas,
                'The maxPriorityFeePerGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].maxPriorityFeePerGas,
                'The maxPriorityFeePerGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].nativeTransfers[0].from,
                'The from value of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].nativeTransfers[0].to,
                'The to value of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].nativeTransfers[0].value,
                'The to value of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].nativeTransfers[0].asset,
                'The to asset of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].nativeTransfers[0].address,
                'The to address of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].nativeTransfers[0].decimal,
                'The to decimal of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].nativeTransfers[0].data,
                'The to data of the nativeTransfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            addContext(test, 'The null value getting for userOpsReceipt')
            console.log('The null value getting for userOpsReceipt.')
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'An error is displayed while Fetching historical transactions.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH RANDOM TRANSACTION ON THE optimism NETWORK',
      );
    }
  });

  it('SMOKE: Validate the get transactions history response of the erc20 transaction in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_optimism,
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
            data.tokenAddress_optimismUSDC,
            ERC20_ABI,
            provider,
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
            'The decimals from erc20 contract is not displayed correctly.',
          );
        }

        // get transferFrom encoded data
        let transactionData;
        try {
          transactionData = erc20Instance.interface.encodeFunctionData(
            'transfer',
            [data.recipient, ethers.utils.parseUnits(data.erc20_value, decimals)],
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The decimals from erc20 contract is not displayed correctly.',
          );
        }

        // clear the transaction batch
        try {
          await optimismMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let userOpsBatch;
        try {
          userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
            to: data.tokenAddress_optimismUSDC,
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
          op = await optimismMainNetSdk.estimate();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The estimate transactions added to the batch is not performed.',
          );
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await optimismMainNetSdk.send(op);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The sending to the bundler action is not performed.');
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
          assert.fail('The get transaction hash action is not performed.');
        }

        // wait for the 10 seconds
        helper.wait(10000)

        // Fetching historical transactions
        let transactions;
        try {
          transactions = await optimismDataService.getTransactions({
            chainId: Number(data.optimism_chainid),
            account: data.sender,
            page: 1,
            limit: 10
          });

          if (userOpsReceipt != null) {
            try {
              assert.isNumber(
                transactions.transactions[0].chainId,
                'The chainId value is not number in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].blockNumber,
                'The blockNumber value is not number in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].sender,
                'The sender address vlaue is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].target,
                'The target address vlaue is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].transactionHash,
                'The transactionHash value is not number in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].userOpHash,
                'The userOpHash value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].actualGasCost,
                'The actualGasCost value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].actualGasUsed,
                'The actualGasUsed value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].success,
                'The success value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].timestamp,
                'The timestamp value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].paymaster,
                'The paymaster value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].value,
                'The values value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].blockExplorerUrl,
                'The blockExplorerUrl value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].input,
                'The input value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].nonce,
                'The nonce value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].initCode,
                'The initCode value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].callData,
                'The callData value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].verificationGasLimit,
                'The verificationGasLimit value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].preVerificationGas,
                'The preVerificationGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].maxFeePerGas,
                'The maxFeePerGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].maxPriorityFeePerGas,
                'The maxPriorityFeePerGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].maxPriorityFeePerGas,
                'The maxPriorityFeePerGas value is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].erc20Transfers[0].from,
                'The from value of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].erc20Transfers[0].to,
                'The to value of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].erc20Transfers[0].value,
                'The to value of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].erc20Transfers[0].asset,
                'The to asset of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].erc20Transfers[0].address,
                'The to address of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                transactions.transactions[0].erc20Transfers[0].decimal,
                'The to decimal of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactions.transactions[0].erc20Transfers[0].data,
                'The to data of the erc20Transfers is empty in the get transactions response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            addContext(test, 'The null value getting for userOpsReceipt')
            console.log('The null value getting for userOpsReceipt.')
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'An error is displayed while Fetching historical transactions.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH ERC20 TRANSACTION ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transaction history response with invalid hash on optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // Fetching a single transaction
        let transaction;
        try {
          transaction = await optimismDataService.getTransaction({
            hash: data.incorrect_hash, // Incorrect Transaction Hash
            chainId: Number(data.optimism_chainid),
          });

          if (transaction === null || Object.keys(transaction).length === 0) {
            console.log(
              'The null is received while fetching the transaction history with incorrect hash.',
            );
          } else {
            addContext(test, 'Getting the single transaction history with incorrect Hash.');
            assert.fail(
              'Getting the single transaction history with incorrect Hash.',
            );
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'Getting the single transaction history with incorrect Hash.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INVALID HASH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transaction history response when hash hex is not with 32 size on optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // Fetching a single transaction
        try {
          try {
            await optimismDataService.getTransaction({
              hash: data.invalid_hash, // Invalid Transaction Hash
              chainId: Number(data.optimism_chainid),
            });
            assert.fail(
              'The transaction history is fetched with hash which not having 32 size hex.',
            );
          } catch (e) {
            if (
              e.errors[0].constraints.isHex == 'hash must be hex with 32 size'
            ) {
              console.log(
                'The validation message is displayed when hash not having 32 size hex while fetching the transaction history.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The transaction history is fetched with hash which not having 32 size hex.',
              );
            }
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The transaction history is fetched with hash which not having 32 size hex.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH HASH SIZE IS NOT 32 HEX ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with invalid chainid in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let transactions = await optimismDataService.getTransactions({
            chainId: Number(data.invalid_optimism_chainid),
            account: data.sender,
          });

          if (transactions.transactions.length === 0) {
            console.log(
              'Not display transactions is the get transactions history response with invalid chainid',
            );
          } else {
            addContext(test, 'The transactions are displayed for the get transactions history response with invalid chainid');
            assert.fail(
              'The transactions are displayed for the get transactions history response with invalid chainid',
            );
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'An error is displayed for the get transactions history response with invalid chainid',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INVALID CHAINID ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with incorrect chainid in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await optimismDataService.getTransactions({
            chainId: Number(process.env.MATIC_CHAINID),
            account: data.sender,
          });
          assert.fail(
            'Validate the get transactions history response with incorrect chainid is performed',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'chainId') {
            console.log(
              'The correct validation is displayed while getting the get transactions history response with incorrect chainid',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed for the get transactions history response with incorrect chainid',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INCORRECT CHAINID ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with invalid account in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let a = await optimismDataService.getTransactions({
            chainId: Number(data.optimism_chainid),
            account: data.invalidSender,
          });
          assert.fail(
            'Validate the get transactions history response with invalid account is performed',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'account') {
            console.log(
              'The correct validation is displayed while getting the get transactions history response with invalid account',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed for the get transactions history response with invalid account',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INVALID ACCOUNT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with incorrect account in optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await optimismDataService.getTransactions({
            chainId: Number(data.optimism_chainid),
            account: data.incorrectSender,
          });
          assert.fail(
            'Validate the get transactions history response with incorrect account is performed',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'account') {
            console.log(
              'The correct validation is displayed while getting the get transactions history response with incorrect account',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed for the get transactions history response with incorrect account',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INCORRECT ACCOUNT ON THE optimism NETWORK',
      );
    }
  });
});
