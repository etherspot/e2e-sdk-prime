import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler, ArkaPaymaster } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let xdaiMainNetSdk;
let xdaiEtherspotWalletAddress;
let xdaiNativeAddress = null;
let xdaiDataService;
let arkaPaymaster;
let runTest;

/* eslint-disable prettier/prettier */
describe('The PrimeSDK, when transaction with arka and pimlico paymasters with xdai network on the MainNet.', function () {
  before(async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        xdaiMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.xdai_chainid),
            bundlerProvider: new EtherspotBundler(Number(data.xdai_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            xdaiMainNetSdk.state.EOAAddress,
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
        xdaiEtherspotWalletAddress =
          await xdaiMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            xdaiEtherspotWalletAddress,
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
        xdaiDataService = new DataUtils(
          process.env.DATA_API_KEY
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The Data service is not initialled successfully.');
      }

      // initializating ArkaPaymaster...
      try {
        arkaPaymaster = new ArkaPaymaster(Number(data.xdai_chainid), process.env.API_KEY, data.paymaster_arka);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('An error is displayed while initializating sdk.');
      }

      // validate the balance of the wallet
      try {
        let output = await xdaiDataService.getAccountBalances({
          account: data.sender,
          chainId: Number(data.xdai_chainid),
        });
        let native_balance;
        let usdc_balance;
        let native_final;
        let usdc_final;

        for (let i = 0; i < output.items.length; i++) {
          let tokenAddress = output.items[i].token;
          if (tokenAddress === xdaiNativeAddress) {
            native_balance = output.items[i].balance;
            native_final = utils.formatUnits(native_balance, 18);
          } else if (tokenAddress === data.tokenAddress_xdaiUSDC) {
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

  it('SMOKE: Perform the transfer native token on arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await xdaiMainNetSdk.addUserOpsToBatch({
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
          balance = await xdaiMainNetSdk.getNativeBalance();

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
          op = await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `https://arka.etherspot.io?apiKey=${process.env.API_KEY
                }&chainId=${Number(data.xdai_chainid)}`,
              context: { mode: 'sponsor' },
            }
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
          uoHash = await xdaiMainNetSdk.send(op);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('*SMOKE: Perform the transfer token with arka pimlico paymaster on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let balance;
        // get balance of the account address
        try {
          balance = await xdaiMainNetSdk.getNativeBalance();

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
        let transactionBatch;
        let op;
        let uoHash;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );

            contract = await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();

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
            uoHash1 = await xdaiMainNetSdk.send(approveOp);

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

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            transactionBatch = await xdaiMainNetSdk.addUserOpsToBatch({
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
            balance = await xdaiMainNetSdk.getNativeBalance();

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
            op = await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
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
            uoHash = await xdaiMainNetSdk.send(op);

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
        } else {
          addContext(test, 'Unable to fetch the paymaster address.');
          assert.fail('Unable to fetch the paymaster address.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer token with arka paymaster with validUntil and validAfter on the XDAI network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let balance;
        let transactionBatch;
        let op;
        let uoHash;

        // get balance of the account address
        try {
          balance = await xdaiMainNetSdk.getNativeBalance();

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

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
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
          transactionBatch = await xdaiMainNetSdk.addUserOpsToBatch({
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
          balance = await xdaiMainNetSdk.getNativeBalance();

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

        /* estimate transactions added to the batch and get the fee data for the UserOp
        validUntil and validAfter are optional defaults to 10 mins of expiry from send call and should be passed in terms of milliseconds
        For example purpose, the valid is fixed as expiring in 100 mins once the paymaster data is generated
        validUntil and validAfter is relevant only with sponsor transactions and not for token paymasters
        */

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          op = await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `${arka_url}${queryString}`,
              context: {
                mode: 'sponsor',
                validAfter: new Date().valueOf(),
                validUntil: new Date().valueOf() + 6000000,
              },
            }
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
          uoHash = await xdaiMainNetSdk.send(op);

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
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('SMOKE: Validate the metadata of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // get the metadata
        try {
          let metadata = await arkaPaymaster.metadata();

          try {
            assert.isNotEmpty(
              metadata.sponsorAddress,
              'The sponsorAddress is empty in the metadata response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              metadata.sponsorWalletBalance,
              'The sponsorWalletBalance is empty in the metadata response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              metadata.chainsSupported,
              'The chainsSupported is empty in the metadata response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              metadata.tokenPaymasters,
              'The tokenPaymasters is empty in the metadata response.',
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
          assert.fail('An error is displayed while calling the metadata function of arka.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the get token paymaster address function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the get token paymaster address
        try {
          let getTokenPaymasterAddress = await arkaPaymaster.getTokenPaymasterAddress("USDC");

          try {
            assert.isNotEmpty(
              getTokenPaymasterAddress,
              'The getTokenPaymasterAddress response is empty.',
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
          assert.fail('An error is displayed while calling the get token paymaster address function of arka.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the remove whitelist address function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          let removeWhitelist = await arkaPaymaster.removeWhitelist([data.sender]);

          if (removeWhitelist.includes('Successfully removed whitelisted addresses with transaction Hash')) {
            addContext(test, 'Removed the address from whitelisted successfully.');
            console.log('Removed the address from whitelisted successfully.');
          } else {
            addContext(test, 'An error is displayed while removing the address from whitelisting.');
            assert.fail('An error is displayed while removing the address from whitelisting.');
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('is not whitelisted')) {
            addContext(test, 'The address is not whitelisted.');
            console.log('The address is not whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the add whitelist address function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          let addWhitelist = await arkaPaymaster.addWhitelist([data.sender]);

          if (addWhitelist.includes('Successfully whitelisted with transaction Hash')) {
            addContext(test, 'The address is whitelisted successfully.');
            console.log('The address is whitelisted successfully.');
          } else {
            addContext(test, 'An error is displayed while whitelisting the address.');
            assert.fail('An error is displayed while whitelisting the address.');
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('already whitelisted')) {
            addContext(test, 'The address is already whitelisted.');
            console.log('The address is already whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the add whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the check whitelist function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          let checkWhitelist = await arkaPaymaster.checkWhitelist(data.sender);

          if (checkWhitelist.includes('Already added')) {
            addContext(test, 'The address is already whitelisted.');
            console.log('The address is already whitelisted.');
          } else if (checkWhitelist.includes('Not added yet')) {
            addContext(test, 'The address is not whitelisted.');
            console.log('The address is not whitelisted.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('An error is displayed while calling the check whitelist address function of arka.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the deposit function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the deposit
        try {
          let deposit = await arkaPaymaster.deposit(0.000001);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('An error is displayed while calling the deposit function of arka.');
        }

      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with invalid arka paymaster url on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await xdaiMainNetSdk.addUserOpsToBatch({
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
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: data.invalid_paymaster_arka, // invalid URL
              api_key: process.env.API_KEY,
              context: { mode: 'sponsor' },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION WITH PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without arka paymaster url on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await xdaiMainNetSdk.addUserOpsToBatch({
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
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              // without URL
              api_key: process.env.API_KEY,
              context: { mode: 'sponsor' },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION WITH PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with invalid API Key of arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await xdaiMainNetSdk.addUserOpsToBatch({
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
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: data.paymaster_arka,
              api_key: process.env.INVALID_API_KEY,
              context: { mode: 'sponsor' },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION WITH PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with incorrect API Key of arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await xdaiMainNetSdk.addUserOpsToBatch({
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
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: data.paymaster_arka,
              api_key: process.env.INCORRECT_API_KEY,
              context: { mode: 'sponsor' },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION WITH PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without API Key of arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await xdaiMainNetSdk.addUserOpsToBatch({
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
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: data.paymaster_arka,
              // without api_key
              context: { mode: 'sponsor' },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION WITH PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster URL on the xdai network', async function () {
    var test = this;
    const invalid_arka_url = data.invalid_paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid API Key in queryString on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.INVALID_API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without API Key in queryString on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?chainId=${Number(data.xdai_chainid)}`; // without API Key in queryString
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid ChainID in queryString on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.invalid_xdai_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without ChainID in queryString on the xdai network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid Entry Point Address while fetching the paymaster address on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid token while fetching the paymaster address on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without parameters while fetching the paymaster address on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with incorrect token address of the erc20 contract on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
              data.incorrectTokenAddress_xdaiUSDC, // incorrect token address
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid token address of the erc20 contract on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
              data.invalidTokenAddress_xdaiUSDC, // invalid token address
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster address of the erc20 contract on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [data.invalid_paymasterAddress, ethers.constants.MaxUint256], // invalid paymaster address
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with incorrect paymaster address of the erc20 contract on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [data.incorrect_paymasterAddress, ethers.constants.MaxUint256], // incorrect paymaster address
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid value of the transactions on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();
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
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            await xdaiMainNetSdk.addUserOpsToBatch({
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster URL while estimate the transactions on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let invalid_arka_url = data.invalid_paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();
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
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            await xdaiMainNetSdk.addUserOpsToBatch({
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
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${invalid_arka_url}${queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid Api Key while estimate the transactions on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    let invalid_queryString = `?apiKey=${process.env.INVALID_API_KEY
      }&chainId=${Number(data.xdai_chainid)}`; // invalid API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();
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
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            await xdaiMainNetSdk.addUserOpsToBatch({
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
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without Api Key while estimate the transactions on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    let invalid_queryString = `?chainId=${Number(data.xdai_chainid)}`; // without API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();
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
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            await xdaiMainNetSdk.addUserOpsToBatch({
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
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid chainid while estimate the transactions on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    let invalid_queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.invalid_xdai_chainid,
    )}`; // invalid chainid in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();
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
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            await xdaiMainNetSdk.addUserOpsToBatch({
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
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka pimlico paymaster without chainid while estimate the transactions on the xdai network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    let invalid_queryString = `?apiKey=${process.env.API_KEY}`; // without ChainID
    if (runTest) {
      await customRetryAsync(async function () {
        let returnedValue;
        let paymasterAddress;
        let erc20Contract;
        let encodedData;
        let approveOp;

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
              data.tokenAddress_xdaiUSDC,
              ERC20_ABI,
            );
            encodedData = erc20Contract.interface.encodeFunctionData(
              'approve',
              [paymasterAddress, ethers.constants.MaxUint256],
            );
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.tokenAddress_xdaiUSDC,
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
            approveOp = await xdaiMainNetSdk.estimate();
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
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The uoHash1 value of the arka pimlico paymaster is not displayed.',
            );
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
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
            await xdaiMainNetSdk.addUserOpsToBatch({
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
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka paymaster with validUntil and validAfter with invalid paymaster URL on the XDAI network', async function () {
    var test = this;
    let invalid_arka_url = data.invalid_paymaster_arka;
    let queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.xdai_chainid,
    )}`;
    if (runTest) {
      await customRetryAsync(async function () {
        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
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
          await xdaiMainNetSdk.addUserOpsToBatch({
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

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        /* estimate transactions added to the batch and get the fee data for the UserOp
        validUntil and validAfter are optional defaults to 10 mins of expiry from send call and should be passed in terms of milliseconds
        For example purpose, the valid is fixed as expiring in 100 mins once the paymaster data is generated
        validUntil and validAfter is relevant only with sponsor transactions and not for token paymasters
        */

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `${invalid_arka_url}${queryString}`,
              context: {
                mode: 'sponsor',
                validAfter: new Date().valueOf(),
                validUntil: new Date().valueOf() + 6000000,
              },
            }
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
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka paymaster with validUntil and validAfter with invalid API Token on the XDAI network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let invalid_queryString = `?apiKey=${process.env.INVALID_API_KEY
      }&chainId=${Number(data.xdai_chainid)}`; // invalid API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
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
          await xdaiMainNetSdk.addUserOpsToBatch({
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

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        /* estimate transactions added to the batch and get the fee data for the UserOp
        validUntil and validAfter are optional defaults to 10 mins of expiry from send call and should be passed in terms of milliseconds
        For example purpose, the valid is fixed as expiring in 100 mins once the paymaster data is generated
        validUntil and validAfter is relevant only with sponsor transactions and not for token paymasters
        */

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `${arka_url}${invalid_queryString}`,
              context: {
                mode: 'sponsor',
                validAfter: new Date().valueOf(),
                validUntil: new Date().valueOf() + 6000000,
              },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka paymaster with validUntil and validAfter without API Token on the XDAI network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let invalid_queryString = `?chainId=${Number(data.xdai_chainid)}`; // without API Key in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
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
          await xdaiMainNetSdk.addUserOpsToBatch({
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

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        /* estimate transactions added to the batch and get the fee data for the UserOp
        validUntil and validAfter are optional defaults to 10 mins of expiry from send call and should be passed in terms of milliseconds
        For example purpose, the valid is fixed as expiring in 100 mins once the paymaster data is generated
        validUntil and validAfter is relevant only with sponsor transactions and not for token paymasters
        */

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `${arka_url}${invalid_queryString}`,
              context: {
                mode: 'sponsor',
                validAfter: new Date().valueOf(),
                validUntil: new Date().valueOf() + 6000000,
              },
            }
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka paymaster with validUntil and validAfter with invalid ChainID on the XDAI network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let invalid_queryString = `?apiKey=${process.env.API_KEY}&chainId=${Number(
      data.invalid_xdai_chainid,
    )}`; // invalid ChainID in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
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
          await xdaiMainNetSdk.addUserOpsToBatch({
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

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        /* estimate transactions added to the batch and get the fee data for the UserOp
        validUntil and validAfter are optional defaults to 10 mins of expiry from send call and should be passed in terms of milliseconds
        For example purpose, the valid is fixed as expiring in 100 mins once the paymaster data is generated
        validUntil and validAfter is relevant only with sponsor transactions and not for token paymasters
        */

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `${arka_url}${invalid_queryString}`,
              context: {
                mode: 'sponsor',
                validAfter: new Date().valueOf(),
                validUntil: new Date().valueOf() + 6000000,
              },
            }
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
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer token on arka paymaster with validUntil and validAfter without ChainID on the XDAI network', async function () {
    var test = this;
    let arka_url = data.paymaster_arka;
    let invalid_queryString = `?apiKey=${process.env.API_KEY}`; // without ChainID in queryString
    if (runTest) {
      await customRetryAsync(async function () {
        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
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
          await xdaiMainNetSdk.addUserOpsToBatch({
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

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The fetched value of the arka pimlico paymaster is not displayed.',
          );
        }

        /* estimate transactions added to the batch and get the fee data for the UserOp
        validUntil and validAfter are optional defaults to 10 mins of expiry from send call and should be passed in terms of milliseconds
        For example purpose, the valid is fixed as expiring in 100 mins once the paymaster data is generated
        validUntil and validAfter is relevant only with sponsor transactions and not for token paymasters
        */

        // estimate transactions added to the batch and get the fee data for the UserOp
        try {
          await xdaiMainNetSdk.estimate({
            paymasterDetails: {
              url: `${arka_url}${invalid_queryString}`,
              context: {
                mode: 'sponsor',
                validAfter: new Date().valueOf(),
                validUntil: new Date().valueOf() + 6000000,
              },
            }
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
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA PIMLICO PAYMASTER ON THE XDAI NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get token paymaster address function of the arka paymaster with incorrect token on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the get token paymaster address
        try {
          await arkaPaymaster.getTokenPaymasterAddress("USDS");

          assert.fail('The get token paymaster address function is worked with incorrect token.')
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Invalid network/token')) {
            addContext(test, 'An appropriate validation message is displayed for incorrect token.');
            console.log('An appropriate validation message is displayed for incorrect token.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the get token paymaster address function of arka with incorrect token.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the get token paymaster address function of the arka paymaster without token on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the get token paymaster address
        try {
          await arkaPaymaster.getTokenPaymasterAddress();

          assert.fail('The get token paymaster address function is worked without token.')
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Invalid data provided')) {
            addContext(test, 'An appropriate validation message is displayed without token.');
            console.log('An appropriate validation message is displayed without token.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the get token paymaster address function of arka without token.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with invalid address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          await arkaPaymaster.removeWhitelist([data.invalidSender]);

          assert.fail('The remove whitelist address function performed successfully with invalid address.');

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'An appropriate validation is displayed while performing remove whitelist function with invalid address.');
            console.log('An appropriate validation is displayed while performing remove whitelist function with invalid address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka with invalid address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with incorrect address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          await arkaPaymaster.removeWhitelist([data.incorrectSender]);

          assert.fail('The remove whitelist address function performed successfully with incorrect address.');

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'An appropriate validation is displayed while performing remove whitelist function with incorrect address.');
            console.log('An appropriate validation is displayed while performing remove whitelist function with incorrect address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka with incorrect address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with random address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          const randomAddress = ethers.Wallet.createRandom();
          await arkaPaymaster.removeWhitelist([randomAddress.address]);

          assert.fail('The remove whitelist address function performed successfully with random address.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('is not whitelisted')) {
            addContext(test, 'The address is not whitelisted.');
            console.log('The address is not whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster without address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          await arkaPaymaster.removeWhitelist([]);

          assert.fail('The remove whitelist address function performed successfully without address.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('is not whitelisted')) {
            addContext(test, 'The address is not whitelisted.');
            console.log('The address is not whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with random and whitelisted addresses on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          const randomAddress = ethers.Wallet.createRandom();
          await arkaPaymaster.removeWhitelist([randomAddress.address, data.sender]);

          assert.fail('The remove whitelist address function performed successfully with random address.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('is not whitelisted')) {
            addContext(test, 'The address is not whitelisted.');
            console.log('The address is not whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with multiple whitelisted addresses on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          const randomAddress1 = ethers.Wallet.createRandom();
          const randomAddress2 = ethers.Wallet.createRandom();

          // make whitelisted addresses
          await arkaPaymaster.addWhitelist([randomAddress1.address, randomAddress2.address]);

          // remove whitelist addresses
          let removewhitelist = await arkaPaymaster.removeWhitelist([randomAddress1.address, randomAddress2.address]);

          if (removewhitelist.includes('Successfully removed whitelisted addresses with transaction Hash')) {
            addContext(test, 'Removed the addresses from whitelisted successfully.');
            console.log('Removed the addresses from whitelisted successfully.');
          } else {
            addContext(test, 'An error is displayed while removing the addresses from whitelisting.');
            assert.fail('An error is displayed while removing the addresses from whitelisting.');
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('is not whitelisted')) {
            addContext(test, 'The addresses are not whitelisted.');
            console.log('The addresses are not whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with multiple random addresses on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          const randomAddress1 = ethers.Wallet.createRandom();
          const randomAddress2 = ethers.Wallet.createRandom();
          await arkaPaymaster.removeWhitelist([randomAddress1.address, randomAddress2.address]);

          assert.fail('The remove whitelist address function performed successfully with multiple random addresses.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('is not whitelisted')) {
            addContext(test, 'The addresses are not whitelisted.');
            console.log('The addresses are not whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the remove whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with invalid address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          await arkaPaymaster.addWhitelist([data.invalidSender]);

          assert.fail('The add whitelist address function performed successfully with invalid address.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'An appropriate validation is displayed while performing add whitelist function with invalid address.');
            console.log('An appropriate validation is displayed while performing add whitelist function with invalid address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the add whitelist address function of arka with invalid address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with incorrect address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          await arkaPaymaster.addWhitelist([data.incorrectSender]);

          assert.fail('The add whitelist address function performed successfully with incorrect address.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'An appropriate validation is displayed while performing add whitelist function with incorrect address.');
            console.log('An appropriate validation is displayed while performing add whitelist function with incorrect address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the add whitelist address function of arka with incorrect address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with random address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          const randomAddress = ethers.Wallet.createRandom();
          let addwhitelist = await arkaPaymaster.addWhitelist([randomAddress.address]);

          if (addwhitelist.includes('Successfully whitelisted with transaction Hash')) {
            addContext(test, 'The address is whitelisted successfully with random address.');
            console.log('The address is whitelisted successfully with random address.');
          } else {
            addContext(test, 'An error is displayed while whitelisting the random address.');
            assert.fail('An error is displayed while whitelisting the random address.');
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('already whitelisted')) {
            addContext(test, 'The address is already whitelisted.');
            console.log('The address is already whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the add whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster without address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          await arkaPaymaster.addWhitelist([]);

          assert.fail('The add whitelist address function performed successfully without address.');
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('An error is displayed while calling the add whitelist address function of arka.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with random and whitelisted addresses on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          const randomAddress = ethers.Wallet.createRandom();
          await arkaPaymaster.addWhitelist([randomAddress.address, data.sender]);

          if (addWhitelist.includes('Successfully whitelisted with transaction Hash')) {
            addContext(test, 'The address is whitelisted successfully.');
            console.log('The address is whitelisted successfully.');
          } else {
            addContext(test, 'An error is displayed while whitelisting the address.');
            assert.fail('An error is displayed while whitelisting the address.');
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('already whitelisted')) {
            addContext(test, 'The address is already whitelisted.');
            console.log('The address is already whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the add whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with multiple whitelisted addresses on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          const randomAddress1 = ethers.Wallet.createRandom();
          const randomAddress2 = ethers.Wallet.createRandom();

          // add whitelist addresses
          let addwhitelist = await arkaPaymaster.addWhitelist([randomAddress1.address, randomAddress2.address]);

          if (addwhitelist.includes('Successfully whitelisted with transaction Hash')) {
            addContext(test, 'Added the addresses in whitelisted successfully.');
            console.log('Added the addresses in whitelisted successfully.');
          } else {
            addContext(test, 'An error is displayed while adding the addresses in whitelisting.');
            assert.fail('An error is displayed while adding the addresses in whitelisting.');
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('already whitelisted')) {
            addContext(test, 'The address is already whitelisted.');
            console.log('The address is already whitelisted.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while calling the add whitelist address function of arka.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster with invalid address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          await arkaPaymaster.checkWhitelist(data.invalidSender);

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'The validation message is displayed while checking the whitelist address with invalid address.');
            console.log('The validation message is displayed while checking the whitelist address with invalid address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while checking the whitelist address function of arka with invalid address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster with incorrect address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          await arkaPaymaster.checkWhitelist(data.invalidSender);

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'The validation message is displayed while checking the whitelist address with incorrect address.');
            console.log('The validation message is displayed while checking the whitelist address with incorrect address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while checking the whitelist address function of arka with incorrect address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster with random address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          const randomAddress = ethers.Wallet.createRandom();
          let checkwhitelist = await arkaPaymaster.checkWhitelist(randomAddress.address);
          
          if (checkwhitelist.includes('Already added')) {
            addContext(test, 'The address is already whitelisted.');
            console.log('The address is already whitelisted.');
          } else if (checkwhitelist.includes('Not added yet')) {
            addContext(test, 'The address is not whitelisted.');
            console.log('The address is not whitelisted.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('An error is displayed while calling the check whitelist address function of arka.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster without address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          await arkaPaymaster.checkWhitelist();

          assert.fail('The check whitelist address function performed successfully without address.');
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('The given address is invalid. Please try again with valid address')) {
            addContext(test, 'The validation message is displayed while checking the whitelist address with incorrect address.');
            console.log('The validation message is displayed while checking the whitelist address with incorrect address.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while checking the whitelist address function of arka with incorrect address.');
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the deposit function of the arka paymaster with invalid amount on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the deposit
        try {
          await arkaPaymaster.deposit("one");
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Invalid data provided')) {
            addContext(test, 'The validation message is displayed while deposit with invalid amount.');
            console.log('The validation message is displayed while deposit with invalid amount.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while deposit function of arka with invalid amount.');
          }
        }

      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the deposit function of the arka paymaster with invalid amount on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the deposit
        try {
          await arkaPaymaster.deposit("one");
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Invalid data provided')) {
            addContext(test, 'The validation message is displayed while deposit with invalid amount.');
            console.log('The validation message is displayed while deposit with invalid amount.');
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('An error is displayed while deposit function of arka with invalid amount.');
          }
        }

      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE ARKA FUNCTION ON THE xdai NETWORK',
      );
    }
  });
});
