import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import Helper from '../../../utils/Helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let maticMainNetSdk;
let maticEtherspotWalletAddress;
let maticNativeAddress = null;
let runTest;

describe('The PrimeSDK, when get the single transaction and multiple transaction details with matic network on the MainNet', () => {
  beforeEach(async () => {
    // added timeout
    Helper.wait(data.mediumTimeout);

    // initializating sdk
    try {
      maticMainNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.POLYGON_CHAINID),
          projectKey: process.env.PROJECT_KEY,
        },
      );

      try {
        assert.strictEqual(
          maticMainNetSdk.state.walletAddress,
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
      maticEtherspotWalletAddress =
        await maticMainNetSdk.getCounterFactualAddress();

      try {
        assert.strictEqual(
          maticEtherspotWalletAddress,
          data.sender,
          'The Etherspot Wallet Address is not calculated correctly.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail(
        'The Etherspot Wallet Address is not displayed successfully.',
      );
    }

    let output = await maticMainNetSdk.getAccountBalances({
      account: data.sender,
      chainId: Number(process.env.POLYGON_CHAINID),
    });
    let native_balance;
    let usdc_balance;
    let native_final;
    let usdc_final;

    for (let i = 0; i < output.items.length; i++) {
      let tokenAddress = output.items[i].token;
      if (tokenAddress === maticNativeAddress) {
        native_balance = output.items[i].balance;
        native_final = utils.formatUnits(native_balance, 18);
      } else if (tokenAddress === data.maticUsdcAddress) {
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
  });

  xit('SMOKE: Validate the transaction history of the native token transaction on the matic network', async () => {
    if (runTest) {
      // clear the transaction batch
      try {
        await maticMainNetSdk.clearUserOpsFromBatch();
      } catch (e) {
        console.error(e);
        assert.fail('The transaction of the batch is not clear correctly.');
      }

      // add transactions to the batch
      try {
        await maticMainNetSdk.addUserOpsToBatch({
          to: data.recipient,
          value: ethers.utils.parseEther(data.value),
        });
      } catch (e) {
        console.error(e);
        assert.fail(
          'The addition of transaction in the batch is not performed.',
        );
      }

      // get balance of the account address
      try {
        await maticMainNetSdk.getNativeBalance();
      } catch (e) {
        console.error(e);
        assert.fail('The balance of the native token is not displayed.');
      }

      // estimate transactions added to the batch and get the fee data for the UserOp
      let op;
      try {
        op = await maticMainNetSdk.estimate();
      } catch (e) {
        console.error(e);
        assert.fail(
          'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
        );
      }

      // sign the UserOp and sending to the bundler
      let uoHash;
      try {
        uoHash = await maticMainNetSdk.send(op);
      } catch (e) {
        console.error(e);
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
          await Helper.wait(2000);
          userOpsReceipt = await maticMainNetSdk.getUserOpReceipt(uoHash);
        }
      } catch (e) {
        console.error(e);
        assert.fail('The get transaction hash action is not performed.');
      }

      // get single transaction history details
      let transactionHash;
      let singleTransaction;
      let blockNumber_singleTransaction;
      let from_singleTransaction;
      let gasLimit_singleTransaction;
      let gasPrice_singleTransaction;
      let gasUsed_singleTransaction;
      let hash_singleTransaction;
      let status_singleTransaction;
      let blockExplorerUrl_singleTransaction;
      try {
        transactionHash = userOpsReceipt.recipient.transactionHash;
        singleTransaction = await maticMainNetSdk.getTransaction({
          hash: transactionHash,
        });

        try {
          assert.isNotEmpty(
            singleTransaction.blockHash,
            'The blockHash value is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.blockNumber,
            'The blockNumber value is not number in the transaction details response.',
          );
          blockNumber_singleTransaction = singleTransaction.blockNumber;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            singleTransaction.from,
            data.sender,
            'The from address value is not correct in the transaction details response.',
          );
          from_singleTransaction = singleTransaction.from;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.gasLimit,
            'The gasLimit value is not number in the transaction details response.',
          );
          gasLimit_singleTransaction = singleTransaction.gasLimit;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.gasPrice,
            'The gasPrice value is empty in the transaction details response.',
          );
          gasPrice_singleTransaction = singleTransaction.gasPrice;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.gasUsed,
            'The gasUsed value is not number in the transaction details response.',
          );
          gasUsed_singleTransaction = singleTransaction.gasUsed;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.hash,
            'The hash value is empty in the transaction details response.',
          );
          hash_singleTransaction = singleTransaction.hash;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.input,
            'The input value is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.logs[0].transactionIndex,
            'The transactionIndex value of the logs is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.logs[0].blockNumber,
            'The blockNumber value of the logs is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].transactionHash,
            'The transactionHash value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].address,
            'The address value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].topics,
            'The topics value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].data,
            'The data value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.logs[0].logIndex,
            'The logIndex value of the logs is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].blockHash,
            'The blockHash value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.nonce,
            'The nonce value is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            singleTransaction.status,
            'Completed',
            'The status value is not correct in the transaction details response.',
          );

          status_singleTransaction = singleTransaction.status;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.to,
            'The to address value is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.transactionIndex,
            'The transactionIndex value is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.value,
            'The value details is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.blockExplorerUrl,
            'The blockExplorerUrl value is empty in the transaction details response.',
          );

          blockExplorerUrl_singleTransaction =
            singleTransaction.blockExplorerUrl;
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);
        assert.fail('The get transaction details is not performed.');
      }

      // get transactions history
      let transactions;
      let blockNumber_transactions;
      let from_transactions;
      let gasLimit_transactions;
      let gasPrice_transactions;
      let gasUsed_transactions;
      let hash_transactions;
      let status_transactions;
      let blockExplorerUrl_transactions;
      try {
        transactions = await maticMainNetSdk.getTransactions({
          chainId: Number(process.env.POLYGON_CHAINID),
          account: data.sender,
        });

        for (let x = 0; x < transactions.items.length; x++) {
          blockNumber_transactions = transactions.items[x].blockNumber;

          if (blockNumber_singleTransaction == blockNumber_transactions) {
            try {
              assert.isNotEmpty(
                transactions.items[x].blockHash,
                'The blockHash value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].blockNumber,
                'The blockNumber value is not number in the transaction details response.',
              );
              blockNumber_transactions = transactions.items[x].blockNumber;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                blockNumber_singleTransaction,
                blockNumber_transactions,
                'The blockNumber of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                transactions.items[x].from,
                data.sender,
                'The from address value is not correct in the transaction details response.',
              );
              from_transactions = transactions.items[x].from;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                from_singleTransaction,
                from_transactions,
                'The from address of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].gasLimit,
                'The gasLimit value is not number in the transaction details response.',
              );

              gasLimit_transactions = transactions.items[x].gasLimit;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                gasLimit_singleTransaction,
                gasLimit_transactions,
                'The gasLimit of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].gasPrice,
                'The gasPrice value is empty in the transaction details response.',
              );

              gasPrice_transactions = transactions.items[x].gasPrice;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                gasPrice_singleTransaction,
                gasPrice_transactions,
                'The gasPrice of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].gasUsed,
                'The gasUsed value is not number in the transaction details response.',
              );
              gasUsed_transactions = transactions.items[x].gasUsed;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                gasUsed_singleTransaction,
                gasUsed_transactions,
                'The gasUsed of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].hash,
                'The hash value is empty in the transaction details response.',
              );

              hash_transactions = transactions.items[x].hash;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                hash_singleTransaction,
                hash_transactions,
                'The hash of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].input,
                'The input value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].logs[0].transactionIndex,
                'The transactionIndex value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].logs[0].blockNumber,
                'The blockNumber value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].logs[0].transactionHash,
                'The transactionHash value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].logs[0].address,
                'The address value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].logs[0].topics,
                'The topics value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].logs[0].data,
                'The data value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].logs[0].logIndex,
                'The logIndex value of the logs is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].logs[0].blockHash,
                'The blockHash value of the logs is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].nonce,
                'The nonce value is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].status,
                'The status value is not correct in the transaction details response.',
              );

              status_transactions = transactions.items[x].status;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                status_singleTransaction,
                status_transactions,
                'The status of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].to,
                'The to address value is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNumber(
                transactions.items[x].transactionIndex,
                'The transactionIndex value is not number in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].value,
                'The value details is empty in the transaction details response.',
              );
            } catch (e) {
              console.error(e);
            }

            try {
              assert.isNotEmpty(
                transactions.items[x].blockExplorerUrl,
                'The blockExplorerUrl value is empty in the transaction details response.',
              );

              blockExplorerUrl_transactions =
                transactions.items[x].blockExplorerUrl;
            } catch (e) {
              console.error(e);
            }

            try {
              assert.strictEqual(
                blockExplorerUrl_singleTransaction,
                blockExplorerUrl_transactions,
                'The blockExplorerUrl of get single transaction response and get transactions response are not matched.',
              );
            } catch (e) {
              console.error(e);
            }
            break;
          }
        }
      } catch (e) {
        console.error(e);
        assert.fail(
          'The history of the transactions of the respective address is not performed correctly.',
        );
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS ON THE matic NETWORK',
      );
    }
  });

  it('SMOKE: Validate the NFT List on the matic network', async () => {
    if (runTest) {
      let nfts;
      try {
        nfts = await maticMainNetSdk.getNftList({
          chainId: Number(process.env.POLYGON_CHAINID),
          account: data.sender,
        });

        if (nfts.items.length > 0) {
          console.log('The items are available in the NFT list.');

          try {
            assert.isNotEmpty(
              nfts.items[0].contractName,
              'The contractName value is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              nfts.items[0].contractAddress,
              'The contractAddress value is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              nfts.items[0].tokenType,
              'The tokenType value is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              nfts.items[0].nftDescription,
              'The nftDescription value is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNumber(
              nfts.items[0].balance,
              'The balance value is not number in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              nfts.items[0].items[0].tokenId,
              'The tokenId value of the items is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              nfts.items[0].items[0].name,
              'The name value of the items is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNumber(
              nfts.items[0].items[0].amount,
              'The amount value of the items is not number in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              nfts.items[0].items[0].image,
              'The image value of the items is empty in the NFT list response.',
            );
          } catch (e) {
            console.error(e);
          }
        } else {
          console.log('The items are not available in the NFT list.');
        }
      } catch (e) {
        console.error(e);
        assert.fail('The get NFT list is not performed correctly.');
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE NFT LIST ON THE matic NETWORK',
      );
    }
  });

  xit('REGRESSION: Validate the get transactions history response with random hash in matic network', async () => {
    if (runTest) {
      // Fetching historical transactions
      let transactions;
      let randomTransaction;
      let randomHash;
      let blockNumber_transactions;
      let from_transactions;
      let gasLimit_transactions;
      let gasPrice_transactions;
      let gasUsed_transactions;
      let hash_transactions;
      let status_transactions;
      let blockExplorerUrl_transactions;

      try {
        transactions = await maticMainNetSdk.getTransactions({
          chainId: Number(process.env.POLYGON_CHAINID),
          account: data.sender,
        });
        randomTransaction =
          Math.floor(Math.random() * (transactions.items.length - 1)) + 1;
        randomHash = transactions.items[randomTransaction].hash;

        try {
          assert.isNumber(
            transactions.items[randomTransaction].blockNumber,
            'The blockNumber value is not number in the get transactions response.',
          );
          blockNumber_transactions =
            transactions.items[randomTransaction].blockNumber;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].from,
            'The from address vlaue is empty in the get transactions response.',
          );
          from_transactions = transactions.items[randomTransaction].from;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            transactions.items[randomTransaction].gasLimit,
            'The gasLimit value is not number in the get transactions response.',
          );
          gasLimit_transactions =
            transactions.items[randomTransaction].gasLimit;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].gasPrice,
            'The gasPrice value is empty in the get transactions response.',
          );
          gasPrice_transactions =
            transactions.items[randomTransaction].gasPrice;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            transactions.items[randomTransaction].gasUsed,
            'The gasUsed value is not number in the get transactions response.',
          );
          gasUsed_transactions = transactions.items[randomTransaction].gasUsed;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].hash,
            'The hash value is empty in the get transactions response.',
          );
          hash_transactions = transactions.items[randomTransaction].hash;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            transactions.items[randomTransaction].status,
            'Completed',
            'The status value is empty in the get transactions response.',
          );
          status_transactions = transactions.items[randomTransaction].status;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].value,
            'The values value is empty in the get transactions response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            transactions.items[randomTransaction].direction,
            'Sender',
            'The direction value is not equal in the get transactions response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].batch,
            'The batch value is empty in the get transactions response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].asset,
            'The asset value is empty in the get transactions response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            transactions.items[randomTransaction].blockExplorerUrl,
            'The blockExplorerUrl value is empty in the get transactions response.',
          );
          blockExplorerUrl_transactions =
            transactions.items[randomTransaction].blockExplorerUrl;
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);
        assert.fail(
          'An error is displayed while Fetching historical transactions.',
        );
      }

      // Fetching a single transaction
      let singleTransaction;
      let blockNumber_singleTransaction;
      let from_singleTransaction;
      let gasLimit_singleTransaction;
      let gasPrice_singleTransaction;
      let gasUsed_singleTransaction;
      let hash_singleTransaction;
      let status_singleTransaction;
      let blockExplorerUrl_singleTransaction;

      try {
        singleTransaction = await maticMainNetSdk.getTransaction({
          hash: randomHash, // Add your transaction hash
        });

        try {
          assert.isNotEmpty(
            singleTransaction.blockHash,
            'The blockHash value is empty in the get single transaction response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.blockNumber,
            'The blockNumber value is not number in the get single transaction response.',
          );
          blockNumber_singleTransaction = singleTransaction.blockNumber;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            singleTransaction.from,
            data.sender,
            'The from address value is not correct in the het single transaction response.',
          );
          from_singleTransaction = singleTransaction.from;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.gasLimit,
            'The gasLimit value is not number in the get single transaction response.',
          );
          gasLimit_singleTransaction = singleTransaction.gasLimit;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.gasPrice,
            'The gasPrice value is empty in the get single transaction response.',
          );
          gasPrice_singleTransaction = singleTransaction.gasPrice;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.gasUsed,
            'The gasUsed value is not number in the get single transaction response.',
          );
          gasUsed_singleTransaction = singleTransaction.gasUsed;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.hash,
            'The hash value is empty in the get single transaction response.',
          );
          hash_singleTransaction = singleTransaction.hash;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.input,
            'The input value is empty in the get single transaction response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.input,
            'The input value is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.logs[0].transactionIndex,
            'The transactionIndex value of the logs is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.logs[0].blockNumber,
            'The blockNumber value of the logs is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].transactionHash,
            'The transactionHash value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].address,
            'The address value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].topics,
            'The topics value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].data,
            'The data value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.logs[0].logIndex,
            'The logIndex value of the logs is not number in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.logs[0].blockHash,
            'The blockHash value of the logs is empty in the transaction details response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.nonce,
            'The nonce value is not number in the get single transaction response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            singleTransaction.status,
            'Completed',
            'The status value is empty in the get single transaction response.',
          );
          status_singleTransaction = singleTransaction.status;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.to,
            'The To Address value is empty in the Get Single Transaction Response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNumber(
            singleTransaction.transactionIndex,
            'The To transactionIndex value is not number in the get single transaction response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.value,
            'The To value value is empty in the get single transaction response.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.isNotEmpty(
            singleTransaction.blockExplorerUrl,
            'The To blockExplorerUrl value is empty in the get single transaction response.',
          );
          blockExplorerUrl_singleTransaction =
            singleTransaction.blockExplorerUrl;
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            blockNumber_singleTransaction,
            blockNumber_transactions,
            'The blockNumber of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            from_singleTransaction,
            from_transactions,
            'The from address of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            gasLimit_singleTransaction,
            gasLimit_transactions,
            'The gasLimit of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            gasPrice_singleTransaction,
            gasPrice_transactions,
            'The gasPrice of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            gasUsed_singleTransaction,
            gasUsed_transactions,
            'The gasUsed of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            hash_singleTransaction,
            hash_transactions,
            'The hash of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            status_singleTransaction,
            status_transactions,
            'The status of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }

        try {
          assert.strictEqual(
            blockExplorerUrl_singleTransaction,
            blockExplorerUrl_transactions,
            'The blockExplorerUrl of get single transaction response and get transactions response are not matched.',
          );
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);
        assert.fail('An error is displayed while Fetching single transaction.');
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH RANDOM HASH ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transaction history response with invalid hash on matic network', async () => {
    if (runTest) {
      // Fetching a single transaction
      let transaction;
      try {
        transaction = await maticMainNetSdk.getTransaction({
          hash: data.incorrect_hash, // Incorrect Transaction Hash
        });

        if (transaction == null) {
          console.log(
            'The null is received while fetching the transaction history with incorrect hash.',
          );
        } else {
          console.error(e);
          assert.fail(
            'Getting the single transaction history with incorrect Hash.',
          );
        }
      } catch (e) {
        console.error(e);
        assert.fail(
          'Getting the single transaction history with incorrect Hash.',
        );
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INVALID HASH ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transaction history response when hash hex is not with 32 size on matic network', async () => {
    if (runTest) {
      // Fetching a single transaction
      try {
        try {
          await maticMainNetSdk.getTransaction({
            hash: data.invalid_hash, // Invalid Transaction Hash
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
            assert.fail(
              'The transaction history is fetched with hash which not having 32 size hex.',
            );
          }
        }
      } catch (e) {
        console.error(e);
        assert.fail(
          'The transaction history is fetched with hash which not having 32 size hex.',
        );
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH HASH SIZE IS NOT 32 HEX ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with invalid chainid in matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getTransactions({
          chainId: Number(process.env.INVALID_POLYGON_CHAINID),
          account: data.sender,
        });
        assert.fail(
          'Validate the get transactions history response with invalid chainid is performed',
        );
      } catch (e) {
        const errorResponse = JSON.parse(e.message);
        if (errorResponse[0].property === 'chainId') {
          console.log(
            'The correct validation is displayed while getting the get transactions history response with invalid chainid',
          );
        } else {
          assert.fail(
            'The respective validate is not displayed for the get transactions history response with invalid chainid',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INVALID CHAINID ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with incorrect chainid in matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getTransactions({
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
          assert.fail(
            'The respective validate is not displayed for the get transactions history response with incorrect chainid',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INCORRECT CHAINID ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with invalid account in matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getTransactions({
          chainId: Number(process.env.POLYGON_CHAINID),
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
          assert.fail(
            'The respective validate is not displayed for the get transactions history response with invalid account',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INVALID ACCOUNT ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get transactions history response with incorrect account in matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getTransactions({
          chainId: Number(process.env.POLYGON_CHAINID),
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
          assert.fail(
            'The respective validate is not displayed for the get transactions history response with incorrect account',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE TRANSACTIONS WITH INCORRECT ACCOUNT ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with invalid chainid on the matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getNftList({
          chainId: process.env.INVALID_POLYGON_CHAINID,
          account: data.sender,
        });

        assert.fail('Validate the NFT List with invalid chainid is performed');
      } catch (e) {
        const errorResponse = JSON.parse(e.message);
        if (errorResponse[0].property === 'chainId') {
          console.log(
            'The correct validation is displayed while getting the NFT list with invalid chainid',
          );
        } else {
          assert.fail(
            'The respective validate is not displayed for the NFT List with invalid chainid',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INVALID CHAINID ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with invalid account address on the matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getNftList({
          chainId: Number(process.env.POLYGON_CHAINID),
          account: data.invalidSender,
        });

        assert.fail(
          'Validate the NFT List with invalid account address is performed',
        );
      } catch (e) {
        const errorResponse = JSON.parse(e.message);
        if (errorResponse[0].property === 'account') {
          console.log(
            'The correct validation is displayed while getting the NFT list with invalid account address',
          );
        } else {
          assert.fail(
            'The respective validate is not displayed for the NFT List with invalid account address',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INVALID ACCOUNT ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with incorrect account address on the matic network', async () => {
    if (runTest) {
      try {
        await maticMainNetSdk.getNftList({
          chainId: Number(process.env.POLYGON_CHAINID),
          account: data.incorrectSender,
        });
        assert.fail(
          'Validate the NFT List with inncorrect account address is performed',
        );
      } catch (e) {
        const errorResponse = JSON.parse(e.message);
        if (errorResponse[0].property === 'account') {
          console.log(
            'The correct validation is displayed while getting the NFT list with inncorrect account address',
          );
        } else {
          assert.fail(
            'The respective validate is not displayed for the NFT List with incorrect account address',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INCORRECT ACCOUNT ON THE matic NETWORK',
      );
    }
  });
});
