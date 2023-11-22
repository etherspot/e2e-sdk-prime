import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import data from '../../../data/testData.json' assert { type: 'json' };
import customRetryAsync from '../../../utils/baseTest.js';
import addContext from 'mochawesome/addContext.js';
import Helper from '../../../utils/Helper.js';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let mumbaiTestNetSdk;
let mumbaiEtherspotWalletAddress;
let mumbaiNativeAddress = null;
let runTest;

describe('The PrimeSDK, when get cross chain quotes and get advance routes LiFi transaction details with mumbai network on the MainNet.', function () {
  beforeEach(async function () {
    var test = this;

    // initializating sdk
    try {
      mumbaiTestNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.MUMBAI_CHAINID),
          projectKey: process.env.PROJECT_KEY_TESTNET,
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
      mumbaiEtherspotWalletAddress =
        await mumbaiTestNetSdk.getCounterFactualAddress();

      try {
        assert.strictEqual(
          mumbaiEtherspotWalletAddress,
          data.sender,
          'The Etherspot Wallet Address is not calculated correctly.',
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
        'The Etherspot Wallet Address is not displayed successfully.',
      );
    }

    let output = await mumbaiTestNetSdk.getAccountBalances({
      account: data.sender,
      chainId: Number(process.env.MUMBAI_CHAINID),
    });
    let native_balance;
    let usdc_balance;
    let native_final;
    let usdc_final;

    for (let i = 0; i < output.items.length; i++) {
      let tokenAddress = output.items[i].token;
      if (tokenAddress === mumbaiNativeAddress) {
        native_balance = output.items[i].balance;
        native_final = utils.formatUnits(native_balance, 18);
      } else if (tokenAddress === data.tokenAddress_mumbaiUSDC) {
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

  it('SMOKE: Perform the transfer native token with paymaster on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await mumbaiTestNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: ethers.utils.parseEther(data.value),
          });

          try {
            assert.isNotEmpty(
              transactionBatch.to,
              'The To Address value is empty in the add transactions to batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionBatch.data,
              'The data value is empty in the add transactions to batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionBatch.value,
              'The value value is empty in the add transactions to batch response.',
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
            'The addition of transaction in the batch is not performed.',
          );
        }

        // get balance of the account address
        let balance;
        try {
          balance = await mumbaiTestNetSdk.getNativeBalance();

          try {
            assert.isNotEmpty(
              balance,
              'The balance is not number in the get native balance response.',
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
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await mumbaiTestNetSdk.estimate({
            url: data.paymaster_arka,
            api_key: process.env.API_KEY,
            context: { mode: 'sponsor' },
          });

          try {
            assert.isNotEmpty(
              op.sender,
              'The sender value is not correct in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.nonce._hex,
              'The hex value of the nonce is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isTrue(
              op.nonce._isBigNumber,
              'The isBigNumber value of the nonce is false in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.initCode,
              'The initCode value is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.callData,
              'The callData value is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.callGasLimit._hex,
              'The hex value of the callGasLimit is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isTrue(
              op.callGasLimit._isBigNumber,
              'The isBigNumber value of the callGasLimit is false in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.verificationGasLimit._hex,
              'The hex value of the verificationGasLimit is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isTrue(
              op.verificationGasLimit._isBigNumber,
              'The isBigNumber value of the verificationGasLimit is false in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.maxFeePerGas,
              'The maxFeePerGas is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.maxPriorityFeePerGas,
              'The maxPriorityFeePerGas is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.paymasterAndData,
              'The paymasterAndData value is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.preVerificationGas._hex,
              'The hex value of the preVerificationGas is empty in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isTrue(
              op.preVerificationGas._isBigNumber,
              'The isBigNumber value of the preVerificationGas is false in the estimate transactions added to the batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.signature,
              'The signature value is empty in the estimate transactions added to the batch response.',
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
            'The estimate transactions added to the batch and get the fee data for the UserOp is not performed.',
          );
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await mumbaiTestNetSdk.send(op);

          try {
            assert.isNotEmpty(
              uoHash,
              'The uoHash value is empty in the sending bundler response.',
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
            'The sign the UserOp and sending to the bundler action is not performed.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN ON THE mumbai NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer token with arka pimlico paymaster on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let balance;
        // get balance of the account address
        try {
          balance = await mumbaiTestNetSdk.getNativeBalance();

          try {
            assert.isNotEmpty(
              balance,
              'The balance is empty in the get native balance response.',
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
          assert.fail('The balance of the native token is not displayed.');
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
        let uoHash1;
        let userOpsReceipt1 = null;
        let transactionBatch;
        let op;
        let uoHash;
        let userOpsReceipt = null;

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
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;

          try {
            assert.isNotEmpty(
              paymasterAddress,
              'The paymasterAddress is empty in the fetch paymaster address response.',
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
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          let contract;
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );

            contract = await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });

            try {
              assert.isNotEmpty(
                contract.to,
                'The to value is empty in the erc20 contract response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                contract.data,
                'The data value is empty in the erc20 contract response.',
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
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get estimation of transaction
          try {
            approveOp = await mumbaiTestNetSdk.estimate();

            try {
              assert.isNotEmpty(
                approveOp.sender,
                'The sender value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.nonce._hex,
                'The nonce value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.initCode,
                'The initCode value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.callData,
                'The callData value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.callGasLimit._hex,
                'The callGasLimit value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.verificationGasLimit._hex,
                'The verificationGasLimit value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.maxFeePerGas,
                'The maxFeePerGas value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.maxPriorityFeePerGas,
                'The maxPriorityFeePerGas value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.paymasterAndData,
                'The paymasterAndData value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.preVerificationGas._hex,
                'The preVerificationGas value is empty in the get transaction estimation response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.signature,
                'The signature value is empty in the get transaction estimation response.',
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
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);

            try {
              assert.isNotEmpty(
                uoHash1,
                'The uoHash1 value is empty in the get the uoHash response.',
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
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              await Helper.wait(1000);
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.userOpHash,
                'The userOpHash value is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.sender,
                'The sender value is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.nonce,
                'The nonce value is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.actualGasCost,
                'The actualGasCost value is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.actualGasUsed,
                'The actualGasUsed value is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isTrue(
                userOpsReceipt1.success,
                'The success value is not true in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            for (let j = 0; j < userOpsReceipt1.logs.length; j++) {
              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].transactionIndex,
                  'The transactionIndex value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].blockNumber,
                  'The blockNumber value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].transactionHash,
                  'The transactionHash value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].address,
                  'The address value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].data,
                  'The data value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].logIndex,
                  'The logIndex value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.logs[j].blockHash,
                  'The blockHash value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.to,
                'The to value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.from,
                'The from value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.transactionIndex,
                'The transactionIndex value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.gasUsed,
                'The gasUsed value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.logsBloom,
                'The logsBloom value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.blockHash,
                'The blockHash value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.transactionHash,
                'The transactionHash value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            for (let k = 0; k < userOpsReceipt1.receipt.logs.length; k++) {
              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].transactionIndex,
                  'The transactionIndex value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].blockNumber,
                  'The blockNumber value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].transactionHash,
                  'The transactionHash value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].address,
                  'The address value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].data,
                  'The data value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].logIndex,
                  'The logIndex value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt1.receipt.logs[k].blockHash,
                  'The blockHash value of logs is empty in the get transaction hash response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.blockNumber,
                'The blockNumber value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.confirmations,
                'The confirmations value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.cumulativeGasUsed,
                'The cumulativeGasUsed value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.effectiveGasPrice,
                'The effectiveGasPrice value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.status,
                'The status value of the receipt is empty in the get transaction hash response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt1.receipt.type,
                'The type value of the receipt is empty in the get transaction hash response.',
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
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            transactionBatch = await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });

            try {
              assert.isNotEmpty(
                transactionBatch.to,
                'The to value is empty in the transactionBatch response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactionBatch.data,
                'The data value is empty in the transactionBatch response.',
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
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get balance of the account address
          try {
            balance = await mumbaiTestNetSdk.getNativeBalance();

            try {
              assert.isNotEmpty(
                balance,
                'The balance value is empty in the get balance of the account address response.',
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
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            op = await mumbaiTestNetSdk.estimate({
              url: `${data.paymaster_arka}${queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            });

            try {
              assert.isNotEmpty(
                op.sender,
                'The sender value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.nonce._hex,
                'The nonce value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.initCode,
                'The initCode value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.callData,
                'The callData value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.callGasLimit._hex,
                'The callGasLimit value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.verificationGasLimit._hex,
                'The verificationGasLimit value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.maxFeePerGas,
                'The maxFeePerGas value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.maxPriorityFeePerGas,
                'The maxPriorityFeePerGas value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.paymasterAndData,
                'The paymasterAndData value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.preVerificationGas._hex,
                'The preVerificationGas value is empty while estimate the transaction and get the fee data for the UserOp.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.signature,
                'The signature value is empty while estimate the transaction and get the fee data for the UserOp.',
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
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // sign the UserOp and sending to the bundler...
          try {
            uoHash = await mumbaiTestNetSdk.send(op);

            try {
              assert.isNotEmpty(
                uoHash,
                'The uoHash value is empty in the sending bundler response.',
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
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Receipt...
          try {
            console.log('Waiting for transaction...');
            const timeout = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt == null && Date.now() < timeout) {
              await Helper.wait(1000);
              userOpsReceipt = await mumbaiTestNetSdk.getUserOpReceipt(uoHash);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.userOpHash,
                'The userOpHash value is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.sender,
                'The sender value is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.nonce,
                'The nonce value is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.actualGasCost,
                'The actualGasCost value is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.actualGasUsed,
                'The actualGasUsed value is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isTrue(
                userOpsReceipt.success,
                'The success value is not true in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            for (let j = 0; j < userOpsReceipt.logs.length; j++) {
              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].transactionIndex,
                  'The transactionIndex value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].blockNumber,
                  'The blockNumber value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].transactionHash,
                  'The transactionHash value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].address,
                  'The address value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].data,
                  'The data value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].logIndex,
                  'The logIndex value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.logs[j].blockHash,
                  'The blockHash value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.to,
                'The to value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.from,
                'The from value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.transactionIndex,
                'The transactionIndex value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.gasUsed,
                'The gasUsed value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.logsBloom,
                'The logsBloom value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.blockHash,
                'The blockHash value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.transactionHash,
                'The transactionHash value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            for (let k = 0; k < userOpsReceipt.receipt.logs.length; k++) {
              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].transactionIndex,
                  'The transactionIndex value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].blockNumber,
                  'The blockNumber value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].transactionHash,
                  'The transactionHash value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].address,
                  'The address value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].data,
                  'The data value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].logIndex,
                  'The logIndex value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  userOpsReceipt.receipt.logs[k].blockHash,
                  'The blockHash value of logs is empty in the get userOps Receipt response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.blockNumber,
                'The blockNumber value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.confirmations,
                'The confirmations value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.cumulativeGasUsed,
                'The cumulativeGasUsed value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.effectiveGasPrice,
                'The effectiveGasPrice value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.status,
                'The status value of the receipt is empty in the get userOps Receipt response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                userOpsReceipt.receipt.type,
                'The type value of the receipt is empty in the get userOps Receipt response.',
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
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('Unable to fetch the paymaster address.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with invalid paymaster url on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            url: data.invalid_paymaster_arka, // invalid URL
            api_key: process.env.API_KEY,
            context: { mode: 'sponsor' },
          });
        } catch (e) {
          if (e.message === 'Not Found') {
            console.log(
              'The correct validation is displayed when invalid paymaster url added while estimation.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid paymaster url added while estimation.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without paymaster url on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            // without URL
            api_key: process.env.API_KEY,
            context: { mode: 'sponsor' },
          });
        } catch (e) {
          if (e.message === 'Not Found') {
            console.log(
              'The correct validation is displayed when paymaster url not added while estimation.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when paymaster url not added while estimation.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with invalid API Key on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            url: data.paymaster_arka,
            api_key: process.env.INVALID_API_KEY,
            context: { mode: 'sponsor' },
          });
        } catch (e) {
          if (e.message === 'Invalid Api Key') {
            console.log(
              'The correct validation is displayed when invalid API Key added while estimation.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid API Key added while estimation.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with incorrect API Key on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            url: data.paymaster_arka,
            api_key: process.env.INCORRECT_API_KEY,
            context: { mode: 'sponsor' },
          });
        } catch (e) {
          if (e.message === 'Invalid Api Key') {
            console.log(
              'The correct validation is displayed when incorrect API Key added while estimation.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when incorrect API Key added while estimation.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without API Key on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            url: data.paymaster_arka,
            // without api_key
            context: { mode: 'sponsor' },
          });
        } catch (e) {
          if (e.message === 'Invalid Api Key') {
            console.log(
              'The correct validation is displayed when API Key not added while estimation.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when API Key not added while estimation.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with invalid context on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            url: data.paymaster_arka,
            api_key: process.env.API_KEY,
            context: { mode: 'sponsorsponso' },
          });
        } catch (e) {
          let error = e.message;
          if (error.includes('Cannot read properties of undefined')) {
            console.log(
              'The correct validation is displayed when invalid context detail added while estimation',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid context detail added while estimation',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without context on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await mumbaiTestNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await mumbaiTestNetSdk.addUserOpsToBatch({
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
          await mumbaiTestNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await mumbaiTestNetSdk.estimate({
            url: data.paymaster_arka,
            api_key: process.env.API_KEY,
            // without context
          });
        } catch (e) {
          let error = e.message;
          if (error.includes('Invalid data provided')) {
            console.log(
              'The correct validation is displayed when context detail not added while estimation',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when context detail not added while estimation',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster URL on the mumbai network', async function () {
    var test = this;
    const invalid_arka_url = data.invalid_paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;

        try {
          returnedValue = await fetch(
            `${invalid_arka_url}/pimlicoAddress${queryString}`, // invalid paymaster URL
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (paymasterAddress.includes('not found')) {
          console.log(
            'The paymaster address is not found as expected while fetching the paymaster address with invalid paymaster URL.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched with invalid paymaster URL.',
          );
          assert.fail(
            'The paymaster address is fetched with invalid paymaster URL.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid API Key in queryString on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.INVALID_API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`; // invalid API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (returnedValue.error === 'Invalid Api Key') {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address with invalid API Key in queryString.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched with invalid API Key in queryString.',
          );
          assert.fail(
            'The paymaster address is fetched with invalid API Key in queryString.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without API Key in queryString on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?chainId=${Number(process.env.MUMBAI_CHAINID)}`; // without API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (returnedValue.error === 'Invalid Api Key') {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address without API Key in queryString.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched without API Key in queryString.',
          );
          assert.fail(
            'The paymaster address is fetched without API Key in queryString.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid ChainID in queryString on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.INVALID_MUMBAI_CHAINID,
    )}`; // invalid chainid in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (returnedValue.error === 'Unsupported network') {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address with invalid chainid in queryString.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched with invalid chainid in queryString.',
          );
          assert.fail(
            'The paymaster address is fetched with invalid chainid in queryString.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without ChainID in queryString on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}`; // without ChainID
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        try {
          returnedValue = await fetch(
            `${arka_url}/pimlicoAddress${queryString}`,
            {
              // without chainid in queryString
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (returnedValue.error === 'Invalid data provided') {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address without chainid in queryString.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched without chainid in queryString.',
          );
          assert.fail(
            'The paymaster address is fetched without chainid in queryString.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid Entry Point Address while fetching the paymaster address on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;

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
                params: [
                  data.invalidEntryPointAddress, // invalid entry point address
                  { token: data.usdc_token },
                ],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        const errorMessage = returnedValue.error;
        if (errorMessage.includes('invalid address')) {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address with invalid Entry Point Address.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched with invalid Entry Point Address.',
          );
          assert.fail(
            'The paymaster address is fetched with invalid Entry Point Address.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid token while fetching the paymaster address on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;

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
                params: [
                  data.entryPointAddress,
                  { token: data.invalid_usdc_token }, // invalid token
                ],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (returnedValue.error === 'Invalid network/token') {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address with invalid token.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched with invalid token.',
          );
          assert.fail('The paymaster address is fetched with invalid token.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without parameters while fetching the paymaster address on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;

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
                params: [], // without parametets
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (returnedValue.error === 'Invalid data provided') {
          console.log(
            'The paymaster address is displayed as a undefined as expected while fetching the paymaster address without parameters.',
          );
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with incorrect token address of the erc20 contract on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.incorrectTokenAddress_mumbaiUSDC, // incorrect token address
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            let errorMessage = e.message;
            if (
              errorMessage.includes(
                'provider is required to use ENS name as contract address',
              )
            ) {
              console.log(
                'The validation for erc20Contract is displayed as expected while generating the erc20Contract with incorrect token address.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The expected validation is not displayed while generating the erc20Contract with incorrect token address.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid token address of the erc20 contract on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.invalidTokenAddress_mumbaiUSDC, // invalid token address
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            let errorMessage = e.message;
            if (
              errorMessage.includes(
                'provider is required to use ENS name as contract address',
              )
            ) {
              console.log(
                'The validation for erc20Contract is displayed as expected while generating the erc20Contract with invalid token address.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The expected validation is not displayed while generating the erc20Contract with invalid token address.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster address of the erc20 contract on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        paymasterAddress = returnedValue.message;

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [data.invalid_paymasterAddress, ethers.constants.MaxUint256], // invalid paymaster address
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('invalid address')) {
              console.log(
                'The validation for erc20Contract is displayed as expected while generating the erc20Contract with invalid paymaster address.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The expected validation is not displayed while generating the erc20Contract with invalid paymaster address.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with incorrect paymaster address of the erc20 contract on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        paymasterAddress = returnedValue.message;

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [data.incorrect_paymasterAddress, ethers.constants.MaxUint256], // incorrect paymaster address
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('bad address checksum')) {
              console.log(
                'The validation for erc20Contract is displayed as expected while generating the erc20Contract with incorrect paymaster address.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The expected validation is not displayed while generating the erc20Contract with incorrect paymaster address.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid value of the transactions on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;
        let uoHash1;
        let userOpsReceipt1 = null;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Hash
          try {
            approveOp = await mumbaiTestNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.invalidValue),
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('invalid decimal value')) {
              console.log(
                'The validation for transactionBatch is displayed as expected while adding transactions to the batch with invalid value.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The validation is not displayed for the transactionBatch while adding transactions to the batch with invalid value.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster URL while estimate the transactions on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let invalid_arka_url = data.invalid_paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;
        let uoHash1;
        let userOpsReceipt1 = null;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Hash
          try {
            approveOp = await mumbaiTestNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await mumbaiTestNetSdk.estimate({
              url: `${invalid_arka_url}${queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('Not Found')) {
              console.log(
                'The validation for estimate transaction is displayed as expected while estimating the transactions with invalid paymaster URL.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The validation for estimate transaction is not displayed while estimating the transactions with invalid paymaster URL.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid Api Key while estimate the transactions on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    let invalid_queryString = `?apiKey=${
      process.env.INVALID_API_KEY
    }&chainId=${Number(process.env.MUMBAI_CHAINID)}`; // invalid API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;
        let uoHash1;
        let userOpsReceipt1 = null;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Hash
          try {
            approveOp = await mumbaiTestNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await mumbaiTestNetSdk.estimate({
              url: `${arka_url}${invalid_queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('Invalid Api Key')) {
              console.log(
                'The validation for estimate transaction is displayed as expected while estimating the transactions with invalid Api Key.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The validation for estimate transaction is not displayed while estimating the transactions with invalid Api Key.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without Api Key while estimate the transactions on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    let invalid_queryString = `?chainId=${Number(process.env.MUMBAI_CHAINID)}`; // without API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;
        let uoHash1;
        let userOpsReceipt1 = null;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Hash
          try {
            approveOp = await mumbaiTestNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await mumbaiTestNetSdk.estimate({
              url: `${arka_url}${invalid_queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('Invalid Api Key')) {
              console.log(
                'The validation for estimate transaction is displayed as expected while estimating the transactions without Api Key.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The validation for estimate transaction is not displayed while estimating the transactions without Api Key.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid chainid while estimate the transactions on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    let invalid_queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.INVALID_MUMBAI_CHAINID,
    )}`; // invalid chainid in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;
        let uoHash1;
        let userOpsReceipt1 = null;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Hash
          try {
            approveOp = await mumbaiTestNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await mumbaiTestNetSdk.estimate({
              url: `${arka_url}${invalid_queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('Unsupported network')) {
              console.log(
                'The validation for estimate transaction is displayed as expected while estimating the transactions with invalid chainid.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The validation for estimate transaction is not displayed while estimating the transactions with invalid chainid.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without chainid while estimate the transactions on the mumbai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      process.env.MUMBAI_CHAINID,
    )}`;
    let invalid_queryString = `?apiKey=${process.env.API_KEY}`; // without ChainID
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;
        let uoHash1;
        let userOpsReceipt1 = null;

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
                params: [data.entryPointAddress, { token: data.usdc_token }],
              }),
            },
          ).then((res) => {
            return res.json();
          });

          paymasterAddress = returnedValue.message;
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        if (utils.isAddress(paymasterAddress)) {
          // get the erc20 Contract
          try {
            erc20Contract = new ethers.Contract(
              data.tokenAddress_mumbaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_mumbaiUSDC,
              data: encodedData,
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The erc20Contract value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the UserOp Hash
          try {
            approveOp = await mumbaiTestNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The approveOp value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get the uoHash1
          try {
            uoHash1 = await mumbaiTestNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // get transaction hash...
          try {
            console.log('Waiting for transaction...');

            let timeout1 = Date.now() + 60000; // 1 minute timeout
            while (userOpsReceipt1 == null && Date.now() < timeout1) {
              userOpsReceipt1 =
                await mumbaiTestNetSdk.getUserOpReceipt(uoHash1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The transaction hash of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await mumbaiTestNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'Clear the transaction batch of the arka pimlico paymaster is not displayed.',
            );
          }

          // add transactions to the batch
          try {
            await mumbaiTestNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.value),
            });
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The fetched value of the arka pimlico paymaster is not displayed.',
            );
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await mumbaiTestNetSdk.estimate({
              url: `${arka_url}${invalid_queryString}`,
              context: { token: data.usdc_token, mode: 'erc20' },
            });
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes('Invalid data provided')) {
              console.log(
                'The validation for estimate transaction is displayed as expected while estimating the transactions without chainid.',
              );
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(
                'The validation for estimate transaction is not displayed while estimating the transactions without chainid.',
              );
            }
          }
        } else {
          addContext(
            test,
            'The paymaster address is fetched without parameters.',
          );
          assert.fail('The paymaster address is fetched without parameters.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE mumbai NETWORK',
      );
    }
  });
});
