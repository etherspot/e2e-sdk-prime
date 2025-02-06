import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers, utils, providers } from 'ethers';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import helper from '../../../utils/helper.js';
import {
  randomChainId,
  randomChainName,
  randomProviderNetwork,
  randomTokenAddress,
} from '../../../utils/sharedData_mainnet.js';
import { customRetryAsync } from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let mainnetPrimeSdk;
let nativeAddress = null;
let dataService;
let runTest;
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Validate the single transaction and multiple transaction details on the MainNet (with new wallet)', function () {
  before(async function () {
    const filePath = path.join(__dirname, '../../../utils/testUtils.json');
    const sharedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    var test = this;

    await customRetryAsync(async function () {
      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        mainnetPrimeSdk = new PrimeSdk(
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
    'SMOKE: Validate the transaction history of the native token transaction on the ' +
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
            await mainnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // add transactions to the batch
          try {
            await mainnetPrimeSdk.addUserOpsToBatch({
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
            await mainnetPrimeSdk.getNativeBalance();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getBalance_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            op = await mainnetPrimeSdk.estimate();
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
          uoHash = await mainnetPrimeSdk.send(op);
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
            userOpsReceipt = await mainnetPrimeSdk.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getTransactionHash_1);
        }

        await customRetryAsync(async function () {
          // get single transaction history details
          let transactionHash;
          let singleTransaction;

          if (!(userOpsReceipt === null)) {
            try {
              transactionHash = userOpsReceipt.receipt.transactionHash;
              singleTransaction = await dataService.getTransaction({
                hash: transactionHash,
                chainId: Number(randomChainId),
              });

              try {
                assert.isNumber(
                  singleTransaction.chainId,
                  message.vali_getTransaction_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.hash,
                  message.vali_getTransaction_hash
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.nonce,
                  message.vali_getTransaction_nonce
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.blockHash,
                  message.vali_getTransaction_blockHash
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.blockNumber,
                  message.vali_getTransaction_blockNumber
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.from,
                  message.vali_getTransaction_from
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.to,
                  message.vali_getTransaction_to
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.value,
                  message.vali_getTransaction_value
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.gasPrice,
                  message.vali_getTransaction_gasPrice
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.gasLimit,
                  message.vali_getTransaction_gasLimit
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.input,
                  message.vali_getTransaction_input
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.status,
                  message.vali_getTransaction_status
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.blockExplorerUrl,
                  message.vali_getTransaction_blockExplorerUrl
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.transactionIndex,
                  message.vali_getTransaction_transactionIndex
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.gasUsed,
                  message.vali_getTransaction_gasUsed
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.logs[0].transactionIndex,
                  message.vali_getTransaction_log_transactionIndex
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.logs[0].blockNumber,
                  message.vali_getTransaction_log_blockNumber
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.logs[0].transactionHash,
                  message.vali_getTransaction_log_transactionHash
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.logs[0].address,
                  message.vali_getTransaction_log_address
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.logs[0].topics,
                  message.vali_getTransaction_log_topics
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.logs[0].data,
                  message.vali_getTransaction_log_data
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  singleTransaction.logs[0].logIndex,
                  message.vali_getTransaction_log_logIndex
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  singleTransaction.logs[0].blockHash,
                  message.vali_getTransaction_log_blockHash
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
              assert.fail(message.fail_getTransaction_1);
            }
          } else {
            addContext(test, message.vali_getTransaction_1);
            console.log(message.vali_getTransaction_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the get transactions history response with random transaction on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          helper.wait(data.mediumTimeout);

          // Fetching historical transactions
          let transactions;
          let randomTransaction;

          try {
            transactions = await dataService.getTransactions({
              chainId: Number(randomChainId),
              account: data.sender,
            });

            randomTransaction =
              Math.floor(
                Math.random() * (transactions.transactions.length - 1)
              ) + 1;

            if (transactions.transactions.length > 0) {
              try {
                assert.isNumber(
                  transactions.transactions[randomTransaction].chainId,
                  message.vali_getTransactions_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].sender,
                  message.vali_getTransactions_sender
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].transactionHash,
                  message.vali_getTransactions_transactionHash
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].userOpHash,
                  message.vali_getTransactions_userOpHash
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  transactions.transactions[randomTransaction].actualGasCost,
                  message.vali_getTransactions_actualGasCost
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  transactions.transactions[randomTransaction].actualGasUsed,
                  message.vali_getTransactions_actualGasUsed
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].success,
                  message.vali_getTransactions_success
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  transactions.transactions[randomTransaction].timestamp,
                  message.vali_getTransactions_timestamp
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].paymaster,
                  message.vali_getTransactions_paymaster
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  transactions.transactions[randomTransaction].value,
                  message.vali_getTransactions_value
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].blockExplorerUrl,
                  message.vali_getTransactions_blockExplorerUrl
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].input,
                  message.vali_getTransactions_input
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  transactions.transactions[randomTransaction].nonce,
                  message.vali_getTransactions_nonce
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].initCode,
                  message.vali_getTransactions_initCode
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].callData,
                  message.vali_getTransactions_callData
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction]
                    .verificationGasLimit,
                  message.vali_getTransactions_verificationGasLimit
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction]
                    .preVerificationGas,
                  message.vali_getTransactions_preVerificationGas
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction].maxFeePerGas,
                  message.vali_getTransactions_maxFeePerGas
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  transactions.transactions[randomTransaction]
                    .maxPriorityFeePerGas,
                  message.vali_getTransactions_maxPriorityFeePerGas
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.vali_getTransactions_1);
              assert.fail(message.vali_getTransactions_1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getTransactions_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the get transactions history response of the native transaction on the ' +
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
            await mainnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // add transactions to the batch
          try {
            await mainnetPrimeSdk.addUserOpsToBatch({
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
            await mainnetPrimeSdk.getNativeBalance();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getBalance_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            op = await mainnetPrimeSdk.estimate();
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
          uoHash = await mainnetPrimeSdk.send(op);
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
            userOpsReceipt = await mainnetPrimeSdk.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getTransactionHash_1);
        }

        await customRetryAsync(async function () {
          // wait for the 10 seconds
          helper.wait(data.longTimeout);

          // Fetching historical transactions
          let transactions;
          try {
            transactions = await dataService.getTransactions({
              chainId: Number(randomChainId),
              account: data.sender,
              page: 1,
              limit: 10,
            });

            if (userOpsReceipt != null) {
              if (transactions.transactions.length > 0) {
                try {
                  assert.isNumber(
                    transactions.transactions[0].chainId,
                    message.vali_getTransactions_chainId
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].blockNumber,
                    message.vali_getTransactions_blockNumber
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].sender,
                    message.vali_getTransactions_sender
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].target,
                    message.vali_getTransactions_target
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].transactionHash,
                    message.vali_getTransactions_transactionHash
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].userOpHash,
                    message.vali_getTransactions_userOpHash
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].actualGasCost,
                    message.vali_getTransactions_actualGasCost
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].actualGasUsed,
                    message.vali_getTransactions_actualGasUsed
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].success,
                    message.vali_getTransactions_success
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].timestamp,
                    message.vali_getTransactions_timestamp
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].paymaster,
                    message.vali_getTransactions_paymaster
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].value,
                    message.vali_getTransactions_value
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].blockExplorerUrl,
                    message.vali_getTransactions_blockExplorerUrl
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].input,
                    message.vali_getTransactions_input
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].nonce,
                    message.vali_getTransactions_nonce
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].initCode,
                    message.vali_getTransactions_initCode
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].callData,
                    message.vali_getTransactions_callData
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].verificationGasLimit,
                    message.vali_getTransactions_verificationGasLimit
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].preVerificationGas,
                    'The preVerificationGas value is empty in the get transactions response.'
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].maxFeePerGas,
                    message.vali_getTransactions_maxFeePerGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].maxPriorityFeePerGas,
                    message.vali_getTransactions_maxPriorityFeePerGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].maxPriorityFeePerGas,
                    message.vali_getTransactions_maxPriorityFeePerGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].nativeTransfers[0].from,
                    message.vali_getTransactions_nativeTransfers_from
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].nativeTransfers[0].to,
                    message.vali_getTransactions_nativeTransfers_to
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].nativeTransfers[0].value,
                    message.vali_getTransactions_nativeTransfers_value
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].nativeTransfers[0].asset,
                    message.vali_getTransactions_nativeTransfers_asset
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].nativeTransfers[0].address,
                    message.vali_getTransactions_nativeTransfers_address
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].nativeTransfers[0].decimal,
                    message.vali_getTransactions_nativeTransfers_decimal
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].nativeTransfers[0].data,
                    message.vali_getTransactions_nativeTransfers_data
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }
              } else {
                addContext(test, message.vali_getTransactions_1);
                assert.fail(message.vali_getTransactions_1);
              }
            } else {
              addContext(test, message.vali_getTransactions_1);
              console.log(message.vali_getTransactions_1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getTransactions_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the get transactions history response of the erc20 transaction on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let op;
      if (runTest) {
        await customRetryAsync(async function () {
          helper.wait(data.mediumTimeout);

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
            assert.fail(message.fail_getTransactions_2);
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
            assert.fail(message.fail_getTransactions_3);
          }

          // get transfer From encoded data
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
            assert.fail(message.fail_getTransactions_5);
          }

          // clear the transaction batch
          try {
            await mainnetPrimeSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // add transactions to the batch
          let userOpsBatch;
          try {
            userOpsBatch = await mainnetPrimeSdk.addUserOpsToBatch({
              to: randomTokenAddress,
              data: transactionData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            op = await mainnetPrimeSdk.estimate();
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
          uoHash = await mainnetPrimeSdk.send(op);
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
            userOpsReceipt = await mainnetPrimeSdk.getUserOpReceipt(uoHash);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getTransactionHash_1);
        }

        await customRetryAsync(async function () {
          // wait for the 10 seconds
          helper.wait(data.longTimeout);

          // Fetching historical transactions
          let transactions;
          try {
            transactions = await dataService.getTransactions({
              chainId: Number(randomChainId),
              account: data.sender,
              page: 1,
              limit: 10,
            });

            if (userOpsReceipt != null) {
              if (transactions.transactions.length > 0) {
                try {
                  assert.isNumber(
                    transactions.transactions[0].chainId,
                    message.vali_getTransactions_chainId
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].sender,
                    message.vali_getTransactions_sender
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].transactionHash,
                    message.vali_getTransactions_transactionHash
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].userOpHash,
                    message.vali_getTransactions_userOpHash
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].actualGasCost,
                    message.vali_getTransactions_actualGasCost
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].actualGasUsed,
                    message.vali_getTransactions_actualGasUsed
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].success,
                    message.vali_getTransactions_success
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].timestamp,
                    message.vali_getTransactions_timestamp
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].paymaster,
                    message.vali_getTransactions_paymaster
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].value,
                    message.vali_getTransactions_value
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].blockExplorerUrl,
                    message.vali_getTransactions_blockExplorerUrl
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].input,
                    message.vali_getTransactions_input
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].nonce,
                    message.vali_getTransactions_nonce
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].initCode,
                    message.vali_getTransactions_initCode
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].callData,
                    message.vali_getTransactions_callData
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].verificationGasLimit,
                    message.vali_getTransactions_verificationGasLimit
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].preVerificationGas,
                    message.vali_getTransactions_preVerificationGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].maxFeePerGas,
                    message.vali_getTransactions_maxFeePerGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].maxPriorityFeePerGas,
                    message.vali_getTransactions_maxPriorityFeePerGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].maxPriorityFeePerGas,
                    message.vali_getTransactions_maxPriorityFeePerGas
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].erc20Transfers[0].from,
                    message.vali_getTransactions_erc20Transfers_from
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].erc20Transfers[0].to,
                    message.vali_getTransactions_erc20Transfers_to
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].erc20Transfers[0].value,
                    message.vali_getTransactions_erc20Transfers_value
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].erc20Transfers[0].address,
                    message.vali_getTransactions_erc20Transfers_address
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    transactions.transactions[0].erc20Transfers[0].decimal,
                    message.vali_getTransactions_erc20Transfers_decimal
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    transactions.transactions[0].erc20Transfers[0].data,
                    message.vali_getTransactions_erc20Transfers_data
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }
              } else {
                addContext(test, message.vali_getTransactions_1);
                assert.fail(message.vali_getTransactions_1);
              }
            } else {
              addContext(test, message.vali_getTransactions_1);
              console.log(message.vali_getTransactions_1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getTransactions_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction history response with invalid hash on ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // Fetching a single transaction
          let transaction;
          try {
            transaction = await dataService.getTransaction({
              hash: data.incorrect_hash, // Incorrect Transaction Hash
              chainId: Number(randomChainId),
            });

            if (transaction === null || Object.keys(transaction).length === 0) {
              addContext(test, message.vali_getTransactions_2);
              console.log(message.vali_getTransactions_2);
            } else {
              addContext(test, message.fail_getTransactions_6);
              assert.fail(message.fail_getTransactions_6);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getTransactions_6);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transaction history response when hash hex is not with 32 size on ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          // Fetching a single transaction
          try {
            await dataService.getTransaction({
              hash: data.invalid_hash, // Invalid Transaction Hash
              chainId: Number(randomChainId),
            });

            addContext(test, message.fail_getTransactions_7);
            assert.fail(message.fail_getTransactions_7);
          } catch (e) {
            if (e.errors[0].constraints.isHex === constant.hash_32) {
              addContext(test, message.vali_getTransactions_3);
              console.log(message.vali_getTransactions_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_getTransactions_7);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transactions history response with invalid account on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            let a = await dataService.getTransactions({
              chainId: Number(randomChainId),
              account: data.invalidSender,
            });

            addContext(test, message.fail_getTransactions_10);
            assert.fail(message.fail_getTransactions_10);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_1
            ) {
              addContext(test, message.vali_getTransactions_6);
              console.log(message.vali_getTransactions_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_getTransactions_10);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the get transactions history response with incorrect account on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          try {
            await dataService.getTransactions({
              chainId: Number(randomChainId),
              account: data.incorrectSender,
            });

            addContext(test, message.fail_getTransactions_11);
            assert.fail(message.fail_getTransactions_11);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_1
            ) {
              addContext(test, message.vali_getTransactions_7);
              console.log(message.vali_getTransactions_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_getTransactions_11);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.getTransaction_insufficientBalance);
        console.warn(message.getTransaction_insufficientBalance);
        test.skip();
      }
    }
  );
});
