import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler, ArkaPaymaster } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

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
            message.vali_eoa_address);
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
        xdaiEtherspotWalletAddress =
          await xdaiMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            xdaiEtherspotWalletAddress,
            data.sender,
            message.vali_smart_address);
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
          message.fail_smart_address,
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
        assert.fail(message.fail_data_service);
      }

      // initializating ArkaPaymaster...
      try {
        arkaPaymaster = new ArkaPaymaster(Number(data.xdai_chainid), process.env.API_KEY, data.paymaster_arka);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_arka_initialize);
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
        assert.fail(message.fail_wallet_balance);
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
          assert.fail(message.fail_clearTransaction_1);
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
              message.vali_addTransaction_to);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionBatch.data,
              message.vali_addTransaction_data);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionBatch.value,
              message.vali_addTransaction_value);
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
          balance = await xdaiMainNetSdk.getNativeBalance();

          try {
            assert.isNotEmpty(
              balance,
              message.vali_getBalance_balance);
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
              message.vali_estimateTransaction_sender);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.nonce,
              message.vali_estimateTransaction_nonce);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.initCode,
              message.vali_estimateTransaction_initCode);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.callData,
              message.vali_estimateTransaction_callData);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.callGasLimit,
              message.vali_estimateTransaction_callGasLimit);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.verificationGasLimit,
              message.vali_estimateTransaction_verificationGasLimit);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.maxFeePerGas,
              message.vali_estimateTransaction_maxFeePerGas);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.maxPriorityFeePerGas,
              message.vali_estimateTransaction_maxPriorityFeePerGas);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.paymasterAndData,
              message.vali_estimateTransaction_paymasterAndData);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.preVerificationGas,
              message.vali_estimateTransaction_preVerificationGas);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.signature,
              message.vali_estimateTransaction_signature);
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
          uoHash = await xdaiMainNetSdk.send(op);

          try {
            assert.isNotEmpty(
              uoHash,
              message.vali_submitTransaction_uoHash);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_submitTransaction_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.nativeTransaction_insufficientBalance);
    }
  });

  xit('SMOKE: Perform the transfer token with arka pimlico paymaster on the xdai network', async function () {
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
              message.vali_getBalance_balance);
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
              message.vali_pimlico_paymasterAddress_1);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
                message.vali_erc20Contract_to);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                contract.data,
                message.vali_erc20Contract_data);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_erc20Contract_1);
          }

          // get estimation of transaction
          try {
            approveOp = await xdaiMainNetSdk.estimate();

            try {
              assert.isNotEmpty(
                approveOp.sender,
                message.vali_estimateTransaction_sender);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.nonce,
                message.vali_estimateTransaction_nonce);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.initCode,
                message.vali_estimateTransaction_initCode);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.callData,
                message.vali_estimateTransaction_callData);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.callGasLimit,
                message.vali_estimateTransaction_callGasLimit);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.verificationGasLimit,
                message.vali_estimateTransaction_verificationGasLimit);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.maxFeePerGas,
                message.vali_estimateTransaction_maxFeePerGas);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.maxPriorityFeePerGas,
                message.vali_estimateTransaction_maxPriorityFeePerGas);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.paymasterAndData,
                message.vali_estimateTransaction_paymasterAndData);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.preVerificationGas,
                message.vali_estimateTransaction_preVerificationGas);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                approveOp.signature,
                message.vali_estimateTransaction_signature);
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

          // get the uoHash1
          try {
            uoHash1 = await xdaiMainNetSdk.send(approveOp);

            try {
              assert.isNotEmpty(
                uoHash1,
                message.vali_submitTransaction_uoHash);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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
                message.vali_addTransaction_to);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                transactionBatch.data,
                message.vali_addTransaction_data);
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
          try {
            balance = await xdaiMainNetSdk.getNativeBalance();

            try {
              assert.isNotEmpty(
                balance,
                message.vali_getBalance_balance);
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
            op = await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
            });

            try {
              assert.isNotEmpty(
                op.sender,
                message.vali_estimateTransaction_sender);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.nonce,
                message.vali_estimateTransaction_nonce);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.initCode,
                message.vali_estimateTransaction_initCode);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.callData,
                message.vali_estimateTransaction_callData);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.callGasLimit,
                message.vali_estimateTransaction_callGasLimit);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.verificationGasLimit,
                message.vali_estimateTransaction_verificationGasLimit);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.maxFeePerGas,
                message.vali_estimateTransaction_maxFeePerGas);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.maxPriorityFeePerGas,
                message.vali_estimateTransaction_maxPriorityFeePerGas);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.paymasterAndData,
                message.vali_estimateTransaction_paymasterAndData);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.preVerificationGas,
                message.vali_estimateTransaction_preVerificationGas);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                op.signature,
                message.vali_estimateTransaction_signature);
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

          // sign the UserOp and sending to the bundler...
          try {
            uoHash = await xdaiMainNetSdk.send(op);

            try {
              assert.isNotEmpty(
                uoHash,
                message.vali_submitTransaction_uoHash);
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }
        } else {
          addContext(test, message.fail_paymasterAddress_1);
          assert.fail(message.fail_paymasterAddress_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
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
              message.vali_getBalance_balance);
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

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
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
              message.vali_addTransaction_to);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              transactionBatch.data,
              message.vali_addTransaction_data);
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
        try {
          balance = await xdaiMainNetSdk.getNativeBalance();

          try {
            assert.isNotEmpty(
              balance,
              message.vali_getBalance_balance);
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
              message.vali_estimateTransaction_sender);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.nonce,
              message.vali_estimateTransaction_nonce);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.initCode,
              message.vali_estimateTransaction_initCode);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.callData,
              message.vali_estimateTransaction_callData);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.callGasLimit,
              message.vali_estimateTransaction_callGasLimit);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.verificationGasLimit,
              message.vali_estimateTransaction_verificationGasLimit);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.maxFeePerGas,
              message.vali_estimateTransaction_maxFeePerGas);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.maxPriorityFeePerGas,
              message.vali_estimateTransaction_maxPriorityFeePerGas);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.paymasterAndData,
              message.vali_estimateTransaction_paymasterAndData);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.preVerificationGas,
              message.vali_estimateTransaction_preVerificationGas);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              op.signature,
              message.vali_estimateTransaction_signature);
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

        // sign the UserOp and sending to the bundler...
        try {
          uoHash = await xdaiMainNetSdk.send(op);

          try {
            assert.isNotEmpty(
              uoHash,
              message.vali_submitTransaction_uoHash);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_submitTransaction_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.nativeTransaction_insufficientBalance);
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
              message.vali_metadata_sponsorAddress);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              metadata.sponsorWalletBalance,
              message.vali_metadata_sponsorWalletBalance);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              metadata.chainsSupported,
              message.vali_metadata_chainsSupported);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              metadata.tokenPaymasters,
              message.vali_metadata_tokenPaymasters);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_metadata_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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
              message.vali_getTokenPaymasterAddress_tokenPaymasterAddress);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getTokenPaymasterAddress_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('SMOKE: Validate the remove whitelist address function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          let removeWhitelist = await arkaPaymaster.removeWhitelist([data.sender]);

          if (removeWhitelist.includes(constant.remove_whitelist_2)) {
            addContext(test, message.vali_removeWhitelist_1);
            console.log(message.vali_removeWhitelist_1);
          } else {
            addContext(test, message.fail_removeWhitelist_1);
            assert.fail(message.fail_removeWhitelist_1);
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.remove_whitelist_1)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('SMOKE: Validate the add whitelist address function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          let addWhitelist = await arkaPaymaster.addWhitelist([data.sender]);

          if (addWhitelist.includes(constant.add_whitelist_1)) {
            addContext(test, message.vali_addWhitelist_1);
            console.log(message.vali_addWhitelist_1);
          } else {
            addContext(test, message.fail_addWhitelist_1);
            assert.fail(message.fail_addWhitelist_1);
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.add_whitelist_2)) {
            addContext(test, message.vali_addWhitelist_2);
            console.log(message.vali_addWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_addWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('SMOKE: Validate the check whitelist function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          let checkWhitelist = await arkaPaymaster.checkWhitelist(data.sender);

          if (checkWhitelist.includes(constant.check_whitelist_1)) {
            addContext(test, message.vali_addWhitelist_2);
            console.log(message.vali_addWhitelist_2);
          } else if (checkWhitelist.includes(constant.check_whitelist_2)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelist_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('SMOKE: Validate the deposit function of the arka paymaster on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the deposit
        try {
          let deposit = await arkaPaymaster.deposit(data.value);

          if (deposit.includes(constant.deposit_1)) {
            addContext(test, message.vali_deposit_1)
            console.log(message.vali_deposit_1)
          } else {
            addContext(test, message.fail_deposit_1)
            assert.fail(message.fail_deposit_1)
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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
          assert.fail(message.fail_clearTransaction);
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
          assert.fail(message.fail_addTransaction_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
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

          addContext(test, message.fail_estimateTransaction_2)
          assert.fail(message.fail_estimateTransaction_2);
        } catch (e) {
          if (e.message === constant.not_found) {
            addContext(test, message.vali_estimateTransaction_1)
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
      console.warn(message.nativeTransaction_insufficientBalance);
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
          assert.fail(message.fail_clearTransaction);
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
          assert.fail(message.fail_addTransaction_1)
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
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

          addContext(test, message.fail_estimateTransaction_3)
          assert.fail(message.fail_estimateTransaction_3);
        } catch (e) {
          if (e.message === constant.not_found) {
            addContext(test, message.vali_estimateTransaction_2)
            console.log(message.vali_estimateTransaction_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.nativeTransaction_insufficientBalance);
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
          assert.fail(message.fail_clearTransaction);
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
          assert.fail(message.fail_addTransaction_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
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

          addContext(test, message.fail_estimateTransaction_4)
          assert.fail(message.fail_estimateTransaction_4);
        } catch (e) {
          if (e.message === constant.invalid_apiKey) {
            addContext(test, message.vali_estimateTransaction_3)
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
      console.warn(message.nativeTransaction_insufficientBalance);
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
          assert.fail(message.fail_clearTransaction);
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
          assert.fail(message.fail_addTransaction_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
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

          addContext(test, message.fail_estimateTransaction_5)
          assert.fail(message.fail_estimateTransaction_5);
        } catch (e) {
          if (e.message === constant.invalid_apiKey) {
            addContext(test, message.vali_estimateTransaction_4)
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
      console.warn(message.nativeTransaction_insufficientBalance);
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
          assert.fail(message.fail_clearTransaction);
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
          assert.fail(message.fail_addTransaction_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_getBalance_1);
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

          addContext(test, message.fail_estimateTransaction_6)
          assert.fail(message.fail_estimateTransaction_6);
        } catch (e) {
          if (e.message === constant.invalid_apiKey) {
            addContext(test, message.vali_estimateTransaction_5)
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
      console.warn(message.nativeTransaction_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster URL on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (paymasterAddress.includes(constant.not_found)) {
          addContext(test, message.vali_pimlico_paymasterAddress_2)
          console.log(message.vali_pimlico_paymasterAddress_2);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_2);
          assert.fail(message.fail_pimlico_paymasterAddress_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid API Key in queryString on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (returnedValue.error === constant.invalid_apiKey) {
          addContext(test, message.vali_pimlico_paymasterAddress_3)
          console.log(message.vali_pimlico_paymasterAddress_3);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_3);
          assert.fail(message.fail_pimlico_paymasterAddress_3);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster without API Key in queryString on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (returnedValue.error === constant.invalid_apiKey) {
          addContext(test, message.vali_pimlico_paymasterAddress_4)
          console.log(message.vali_pimlico_paymasterAddress_4);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_4);
          assert.fail(message.fail_pimlico_paymasterAddress_4);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid ChainID in queryString on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (returnedValue.error === constant.invalid_network_3) {
          addContext(test, message.vali_pimlico_paymasterAddress_5)
          console.log(message.vali_pimlico_paymasterAddress_5);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_5);
          assert.fail(message.fail_pimlico_paymasterAddress_5);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster without ChainID in queryString on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (returnedValue.error === constant.invalid_data) {
          addContext(test, message.vali_pimlico_paymasterAddress_6)
          console.log(message.vali_pimlico_paymasterAddress_6);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_6);
          assert.fail(message.fail_pimlico_paymasterAddress_6);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid Entry Point Address while fetching the paymaster address on the xdai network', async function () {
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
          if (errorMessage.includes(constant.invalid_address_4)) {
            addContext(test, message.vali_pimlico_paymasterAddress_7)
            console.log(message.vali_pimlico_paymasterAddress_7);
          } else {
            addContext(test, message.fail_pimlico_paymasterAddress_7);
            assert.fail(message.fail_pimlico_paymasterAddress_7);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid token while fetching the paymaster address on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (returnedValue.error === constant.invalid_network_1) {
          addContext(test, message.vali_pimlico_paymasterAddress_8)
          console.log(message.vali_pimlico_paymasterAddress_8);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_8);
          assert.fail(message.fail_pimlico_paymasterAddress_8);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster without parameters while fetching the paymaster address on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        if (returnedValue.error === constant.invalid_data) {
          addContext(test, message.vali_pimlico_paymasterAddress_9)
          console.log(message.vali_pimlico_paymasterAddress_9);
        } else {
          addContext(test, message.fail_pimlico_paymasterAddress_9);
          assert.fail(message.fail_pimlico_paymasterAddress_9);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with incorrect token address of the erc20 contract on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            if (errorMessage.includes(constant.contract_address_1)) {
              addContext(test, message.vali_erc20Contract_1)
              console.log(message.vali_erc20Contract_1);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Contract_3);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid token address of the erc20 contract on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            if (errorMessage.includes(constant.contract_address_1)) {
              addContext(test, message.vali_erc20Contract_2)
              console.log(message.vali_erc20Contract_2);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Contract_4);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster address of the erc20 contract on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            if (errorMessage.includes(constant.invalid_address_4)) {
              addContext(test, message.vali_erc20Contract_3)
              console.log(message.vali_erc20Contract_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Contract_5);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with incorrect paymaster address of the erc20 contract on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            if (errorMessage.includes(constant.invalid_address_6)) {
              addContext(test, message.vali_erc20Contract_4)
              console.log(message.vali_erc20Contract_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_erc20Contract_6);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid value of the transactions on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            assert.fail(message.fail_erc20Contract_1);
          }

          // get the UserOp Hash
          try {
            approveOp = await xdaiMainNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }

          // get the uoHash1
          try {
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
          }

          // add transactions to the batch
          try {
            await xdaiMainNetSdk.addUserOpsToBatch({
              to: data.recipient,
              value: ethers.utils.parseEther(data.invalidValue),
            });

            addContext(test, message.fail_addTransaction_2)
            assert.fail(message.fail_addTransaction_2);
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes(constant.invalid_value_1)) {
              addContext(test, vali_addTransaction_1)
              console.log(vali_addTransaction_1);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_addTransaction_3);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid paymaster URL while estimate the transactions on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            assert.fail(message.fail_erc20Contract_1);
          }

          // get the UserOp Hash
          try {
            approveOp = await xdaiMainNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }

          // get the uoHash1
          try {
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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
            assert.fail(message.fail_pimlico_paymasterAddress_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${invalid_arka_url}${queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
            });

            addContext(test, message.fail_estimateTransaction_2)
            assert.fail(message.fail_estimateTransaction_2);
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes(constant.not_found)) {
              addContext(test, message.vali_estimateTransaction_1)
              console.log(message.vali_estimateTransaction_1);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_2);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid Api Key while estimate the transactions on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            assert.fail(message.fail_erc20Contract_1);
          }

          // get the UserOp Hash
          try {
            approveOp = await xdaiMainNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }

          // get the uoHash1
          try {
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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
            assert.fail(message.fail_pimlico_paymasterAddress_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
            });

            addContext(test, message.fail_estimateTransaction_4)
            assert.fail(message.fail_estimateTransaction_4);
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes(constant.invalid_apiKey)) {
              addContext(test, message.vali_estimateTransaction_3)
              console.log(message.vali_estimateTransaction_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_4);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster without Api Key while estimate the transactions on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            assert.fail(message.fail_erc20Contract_1);
          }

          // get the UserOp Hash
          try {
            approveOp = await xdaiMainNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }

          // get the uoHash1
          try {
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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
            assert.fail(message.fail_pimlico_paymasterAddress_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
            });

            addContext(test, message.fail_estimateTransaction_6)
            assert.fail(message.fail_estimateTransaction_6);
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes(constant.invalid_apiKey)) {
              addContext(test, message.vali_estimateTransaction_5)
              console.log(message.vali_estimateTransaction_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_6);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster with invalid chainid while estimate the transactions on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            assert.fail(message.fail_erc20Contract_1);
          }

          // get the UserOp Hash
          try {
            approveOp = await xdaiMainNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }

          // get the uoHash1
          try {
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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
            assert.fail(message.fail_pimlico_paymasterAddress_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
            });

            addContext(test, message.fail_estimateTransaction_7)
            assert.fail(message.fail_estimateTransaction_7);
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes(constant.invalid_network_3)) {
              addContext(test, message.vali_estimateTransaction_6)
              console.log(message.vali_estimateTransaction_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_7);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  xit('REGRESSION: Perform the transfer token on arka pimlico paymaster without chainid while estimate the transactions on the xdai network', async function () {
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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
            assert.fail(message.fail_erc20Contract_1);
          }

          // get the UserOp Hash
          try {
            approveOp = await xdaiMainNetSdk.estimate();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_1);
          }

          // get the uoHash1
          try {
            await xdaiMainNetSdk.send(approveOp);
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_submitTransaction_1);
          }

          // clear the transaction batch
          try {
            await xdaiMainNetSdk.clearUserOpsFromBatch();
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_clearTransaction_1);
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
            assert.fail(message.fail_pimlico_paymasterAddress_1);
          }

          // estimate transactions added to the batch and get the fee data for the UserOp
          try {
            await xdaiMainNetSdk.estimate({
              paymasterDetails: {
                url: `${arka_url}${invalid_queryString}`,
                context: { token: data.usdc_token, mode: 'erc20' },
              }
            });

            addContext(test, message.fail_estimateTransaction_8)
            assert.fail(message.fail_estimateTransaction_8);
          } catch (e) {
            let errorMessage = e.message;
            if (errorMessage.includes(constant.invalid_data)) {
              addContext(test, message.vali_estimateTransaction_7)
              console.log(message.vali_estimateTransaction_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_estimateTransaction_8);
            }
          }
        } else {
          addContext(test, message.fail_erc20Contract_2);
          assert.fail(message.fail_erc20Contract_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
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
          assert.fail(message.fail_getBalance_1);
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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

          addContext(test, message.fail_estimateTransaction_2)
          assert.fail(message.fail_estimateTransaction_2);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.not_found)) {
            addContext(test, message.vali_estimateTransaction_1)
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
      console.warn(message.pimlocoPaymaster_insufficientBalance);
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
          assert.fail(message.fail_getBalance_1);
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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

          addContext(test, message.fail_estimateTransaction_4)
          assert.fail(message.fail_estimateTransaction_4);
        } catch (e) {
          if (e.message === constant.invalid_apiKey) {
            addContext(test, message.vali_estimateTransaction_3)
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
      console.warn(message.pimlocoPaymaster_insufficientBalance);
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
          assert.fail(message.fail_getBalance_1);
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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

          addContext(test, message.fail_estimateTransaction_6)
          assert.fail(message.fail_estimateTransaction_6);
        } catch (e) {
          if (e.message === constant.invalid_apiKey) {
            addContext(test, message.vali_estimateTransaction_3)
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
      console.warn(message.pimlocoPaymaster_insufficientBalance);
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
          assert.fail(message.fail_getBalance_1);
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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

          addContext(test, message.fail_estimateTransaction_7)
          assert.fail(message.fail_estimateTransaction_7);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_network_3)) {
            addContext(test, message.vali_estimateTransaction_6)
            console.log(message.vali_estimateTransaction_6);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_7);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
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
          assert.fail(message.fail_getBalance_1);
        }

        // clear the transaction batch
        try {
          await xdaiMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_clearTransaction_1);
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
          assert.fail(message.fail_pimlico_paymasterAddress_1);
        }

        // get balance of the account address
        try {
          await xdaiMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_pimlico_paymasterAddress_1);
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

          addContext(test, message.fail_estimateTransaction_8)
          assert.fail(message.fail_estimateTransaction_8);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_data)) {
            addContext(test, message.vali_estimateTransaction_7)
            console.log(message.vali_estimateTransaction_7);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_estimateTransaction_8);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.pimlocoPaymaster_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the get token paymaster address function of the arka paymaster with incorrect token on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the get token paymaster address
        try {
          await arkaPaymaster.getTokenPaymasterAddress(data.invalid_usdc_token);

          addContext(test, message.fail_getTokenPaymasterAddress_2)
          assert.fail(message.fail_getTokenPaymasterAddress_2)
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_network_1)) {
            addContext(test, message.vali_getTokenPaymasterAddress_1);
            console.log(message.vali_getTokenPaymasterAddress_1);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getTokenPaymasterAddress_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the get token paymaster address function of the arka paymaster without token on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the get token paymaster address
        try {
          await arkaPaymaster.getTokenPaymasterAddress();

          addContext(test, message.fail_getTokenPaymasterAddress_3)
          assert.fail(message.fail_getTokenPaymasterAddress_3)
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_data)) {
            addContext(test, message.vali_getTokenPaymasterAddress_2);
            console.log(message.vali_getTokenPaymasterAddress_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_getTokenPaymasterAddress_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with invalid address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          await arkaPaymaster.removeWhitelist([data.invalidSender]);

          addContext(test, message.fail_removeWhitelist_3)
          assert.fail(message.fail_removeWhitelist_3);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_removeWhitelist_3);
            console.log(message.vali_removeWhitelist_3);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the remove whitelist address function of the arka paymaster with incorrect address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the remove whitelist address
        try {
          await arkaPaymaster.removeWhitelist([data.incorrectSender]);

          addContext(test, message.fail_removeWhitelist_4)
          assert.fail(message.fail_removeWhitelist_4);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_removeWhitelist_4);
            console.log(message.vali_removeWhitelist_4);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_4);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          addContext(test, message.fail_removeWhitelist_5)
          assert.fail(message.fail_removeWhitelist_5);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.remove_whitelist_1)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          addContext(test, message.fail_removeWhitelist_5)
          assert.fail(message.fail_removeWhitelist_5);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.remove_whitelist_1)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          if (removewhitelist.includes(constant.remove_whitelist_2)) {
            addContext(test, message.vali_removeWhitelist_1);
            console.log(message.vali_removeWhitelist_1);
          } else {
            addContext(test, message.fail_removeWhitelist_1);
            assert.fail(message.fail_removeWhitelist_1);
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.remove_whitelist_1)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          addContext(test, message.fail_removeWhitelist_6)
          assert.fail(message.fail_removeWhitelist_6);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.remove_whitelist_1)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_removeWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with invalid address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          await arkaPaymaster.addWhitelist([data.invalidSender]);

          addContext(test, message.fail_addWhitelist_3)
          assert.fail(message.fail_addWhitelist_3);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_addWhitelist_3);
            console.log(message.vali_addWhitelist_3);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_addWhitelist_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the add whitelist address function of the arka paymaster with incorrect address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the add whitelist address
        try {
          await arkaPaymaster.addWhitelist([data.incorrectSender]);

          addContext(test, message.fail_addWhitelist_4)
          assert.fail(message.fail_addWhitelist_4);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_addWhitelist_4);
            console.log(message.vali_addWhitelist_4);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_addWhitelist_4);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          if (addwhitelist.includes(constant.add_whitelist_3)) {
            addContext(test, message.vali_addWhitelist_5);
            console.log(message.vali_addWhitelist_5);
          } else {
            addContext(test, message.fail_addWhitelist_7);
            assert.fail(message.fail_addWhitelist_7);
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.add_whitelist_2)) {
            addContext(test, message.vali_addWhitelist_2);
            console.log(message.vali_addWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_addWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          if (addWhitelist.includes(constant.add_whitelist_3)) {
            addContext(test, message.vali_addWhitelist_1);
            console.log(message.vali_addWhitelist_1);
          } else {
            addContext(test, message.fail_addWhitelist_1);
            assert.fail(message.fail_addWhitelist_1);
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.add_whitelist_2)) {
            addContext(test, message.vali_addWhitelist_2);
            console.log(message.vali_addWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_addWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          if (addwhitelist.includes(constant.add_whitelist_3)) {
            addContext(test, message.vali_addWhitelist_1);
            console.log(message.vali_addWhitelist_1);
          } else {
            addContext(test, message.fail_addWhitelist_1);
            assert.fail(message.fail_addWhitelist_1);
          }
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.add_whitelist_2)) {
            addContext(test, message.vali_addWhitelist_2);
            console.log(message.vali_addWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_addWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster with invalid address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          await arkaPaymaster.checkWhitelist(data.invalidSender);

          addContext(test, message.fail_checkWhitelist_2)
          assert.fail(message.fail_checkWhitelist_2)
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_checkWhitelist_1);
            console.log(message.vali_checkWhitelist_1);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_checkWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster with incorrect address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          await arkaPaymaster.checkWhitelist(data.invalidSender);

          addContext(test, message.fail_checkWhitelist_3)
          assert.fail(message.fail_checkWhitelist_3)
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_checkWhitelist_2);
            console.log(message.vali_checkWhitelist_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_checkWhitelist_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
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

          if (checkwhitelist.includes(constant.check_whitelist_1)) {
            addContext(test, message.vali_addWhitelist_2);
            console.log(message.vali_addWhitelist_2);
          } else if (checkwhitelist.includes(constant.check_whitelist_2)) {
            addContext(test, message.vali_removeWhitelist_2);
            console.log(message.vali_removeWhitelist_2);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_checkWhitelist_4);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the check whitelist function of the arka paymaster without address on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the whilelist address
        try {
          await arkaPaymaster.checkWhitelist();

          addContext(test, message.fail_checkWhitelist_5)
          assert.fail(message.fail_checkWhitelist_5);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_address_5)) {
            addContext(test, message.vali_checkWhitelist_3);
            console.log(message.vali_checkWhitelist_3);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_checkWhitelist_5);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the deposit function of the arka paymaster with invalid amount on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        // validate the deposit
        try {
          await arkaPaymaster.deposit("one");

          addContext(test, message.fail_deposit_3)
          assert.fail(message.fail_deposit_3)
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.invalid_data)) {
            addContext(test, message.vali_deposit_2);
            console.log(message.vali_deposit_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_deposit_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.arkaFunction_insufficientBalance);
    }
  });
});
