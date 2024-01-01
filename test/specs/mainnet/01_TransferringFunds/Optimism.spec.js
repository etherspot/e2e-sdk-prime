import { PrimeSdk, DataUtils, graphqlEndpoints } from '@etherspot/prime-sdk';
import { ethers, utils } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import abi from '../../../data/NFTabi.json' assert { type: 'json' };
import addContext from 'mochawesome/addContext.js';
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let optimismMainNetSdk;
let optimismEtherspotWalletAddress;
let optimismNativeAddress = null;
let optimismDataService;
let runTest;

describe('The PrimeSDK, when transfer a token with optimism network on the MainNet', function () {
  beforeEach(async function () {
    var test = this;

    // initializating sdk
    try {
      optimismMainNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.OPTIMISM_CHAINID),
          projectKey: process.env.PROJECT_KEY,
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
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail(
        'The Etherspot Wallet Address is not displayed successfully.',
      );
    }

    // initializating Data service...
    optimismDataService = new DataUtils(
      process.env.PROJECT_KEY,
      graphqlEndpoints.PROD,
    );

    let output = await optimismDataService.getAccountBalances({
      account: data.sender,
      chainId: Number(process.env.OPTIMISM_CHAINID),
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
  });

  it('SMOKE: Perform the transfer native token with valid details on the optimism network', async function () {
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
        let transactionBatch;
        try {
          transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
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
          balance = await optimismMainNetSdk.getNativeBalance();

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
          op = await optimismMainNetSdk.estimate();

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
          uoHash = await optimismMainNetSdk.send(op);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN ON THE optimism NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer ERC20 token with valid details on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_optimism,
          );

          try {
            assert.isTrue(
              provider._isProvider,
              'The isProvider value is false in the provider response.',
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

          try {
            assert.isNotEmpty(
              decimals,
              'The decimals value is empty in the get decimals from erc20 contract response.',
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
            'The decimals from erc20 contract is not displayed correctly.',
          );
        }

        // get transferFrom encoded data
        let transactionData;
        try {
          transactionData = erc20Instance.interface.encodeFunctionData(
            'transfer',
            [data.recipient, ethers.utils.parseUnits(data.value, decimals)],
          );

          try {
            assert.isNotEmpty(
              transactionData,
              'The decimals value is empty in the get decimals from erc20 contract response.',
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

          try {
            assert.isNotEmpty(
              userOpsBatch.to,
              'The To Address value is empty in the userops batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              userOpsBatch.data,
              'The data value is empty in the userops batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              userOpsBatch.value[0]._hex,
              'The hex value of the userOpsBatch is empty in the userops batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isTrue(
              userOpsBatch.value[0]._isBigNumber,
              'The isBigNumber value of the userOpsBatch is false in the userops batch response.',
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
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch and get the fee data for the UserOp
        let op;
        try {
          op = await optimismMainNetSdk.estimate();

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
            'The estimate transactions added to the batch is not performed.',
          );
        }

        // sign the UserOp and sending to the bundler
        let uoHash;
        try {
          uoHash = await optimismMainNetSdk.send(op);

          assert.isNotEmpty(
            uoHash,
            'The uoHash value is empty in the sending bundler response.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The sending to the bundler action is not performed.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN ON THE optimism NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer ERC721 NFT token with valid details on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
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
              'The erc721 Contract Interface value is empty in the erc721 Contract Interface response.',
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
          assert.fail('The get erc721 Contract Interface is not performed.');
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
            to: data.nft_tokenAddress,
            data: erc721Data,
          });

          try {
            assert.isNotEmpty(
              userOpsBatch.to[0],
              'The To Address value is empty in the userops batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              userOpsBatch.data[0],
              'The data value is empty in the userops batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isNotEmpty(
              userOpsBatch.value[0]._hex,
              'The hex value of the userOpsBatch is empty in the userops batch response.',
            );
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            assert.isTrue(
              userOpsBatch.value[0]._isBigNumber,
              'The isBigNumber value of the userOpsBatch is false in the userops batch response.',
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
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        let op;
        try {
          op = await optimismMainNetSdk.estimate();

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
            'The estimate transactions added to the batch is not performed.',
          );
        }

        // sending to the bundler
        let uoHash;
        try {
          uoHash = await optimismMainNetSdk.send(op);

          assert.isNotEmpty(
            uoHash,
            'The uoHash value is empty in the sending bundler response.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The sending to the bundler action is not performed.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the incorrect To Address while estimate the added transactions to the batch on the optimism network', async function () {
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
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.incorrectRecipient, // incorrect to address
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

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when entered the incorrect To Address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('bad address checksum')) {
            console.log(
              'The validation for To Address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the incorrect To Address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INCORRECT TO ADDRESS ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid To Address i.e. missing character while estimate the added transactions to the batch on the optimism network', async function () {
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
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.invalidRecipient, // invalid to address
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

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when entered the invalid To Address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for To Address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid To Address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INVALID TO ADDRESS ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer native token with the same To Address i.e. sender address while estimate the added transactions to the batch on the optimism network', async function () {
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
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.sender, // same to address
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

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when entered the same To Address i.e. sender address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for the same To Address i.e. sender address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the the same To Address i.e. sender address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INVALID TO ADDRESS ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid Value while estimate the added transactions to the batch on the optimism network', async function () {
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
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: ethers.utils.parseUnits(data.invalidValue), // invalid value
          });

          assert.fail(
            'The expected validation is not displayed when entered the invalid value while adding the transactions to the batch.',
          );
        } catch (e) {
          if (e.reason === 'invalid decimal value') {
            console.log(
              'The validation for value is displayed as expected while adding the transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid value while adding the transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INVALID VALUE ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the very small Value while estimate the added transactions to the batch on the optimism network', async function () {
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
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: ethers.utils.parseUnits(data.smallValue), // very small value
          });

          assert.fail(
            'The expected validation is not displayed when entered the very small value while adding the transactions to the batch.',
          );
        } catch (e) {
          if (e.reason === 'fractional component exceeds decimals') {
            console.log(
              'The validation for value is displayed as expected while adding the transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the very small value while adding the transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH VERY SMALL VALUE ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer native token with the exceeded Value while estimate the added transactions to the batch on the optimism network', async function () {
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
        }

        // add transactions to the batch
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: data.exceededValue, // exceeded value
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

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when entered the exceeded value while estimate the added transactions to the batch.',
          );
        } catch (e) {
          console.log(e);
          if (e.reason === 'Transaction reverted') {
            console.log(
              'The validation for value is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the exceeded value while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH EXCEEDED VALUE ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without adding transaction to the batch while estimate the added transactions to the batch on the optimism network', async function () {
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

        // get balance of the account address
        try {
          await optimismMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
          );
        } catch (e) {
          if (e.message === 'cannot sign empty transaction batch') {
            console.log(
              'The validation for transaction batch is displayed as expected while adding the estimate transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITHOUT ADDED THE TRANSACTION TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid provider netowrk details while Getting the Decimal from ERC20 Contract on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.invalidProviderNetwork_optimism, // invalid provider
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
        try {
          await erc20Instance.functions.decimals();

          assert.fail(
            'The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract.',
          );
        } catch (e) {
          if (e.reason === 'could not detect network') {
            console.log(
              'The validation for Provider Network is displayed as expected while Getting the Decimal from ERC20 Contract.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID PROVIDER NETWORK WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without provider netowrk details while Getting the Decimal from ERC20 Contract on the optimism network', async function () {
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
        try {
          await erc20Instance.functions.decimals();

          assert.fail(
            'The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract.',
          );
        } catch (e) {
          if (e.reason === 'could not detect network') {
            console.log(
              'The validation for Provider Network is displayed as expected while Getting the Decimal from ERC20 Contract.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT PROVIDER NETWORK WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with other provider netowrk details while Getting the Decimal from ERC20 Contract on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.otherProviderNetwork_optimism, // other provider
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
        try {
          await erc20Instance.functions.decimals();

          assert.fail(
            'The expected validation is not displayed when entered the other Provider Network while Getting the Decimal from ERC20 Contract.',
          );
        } catch (e) {
          if (e.code === 'CALL_EXCEPTION') {
            console.log(
              'The validation for Provider Network is displayed as expected while Getting the Decimal from ERC20 Contract.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the other Provider Network while Getting the Decimal from ERC20 Contract.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH OTHER PROVIDER NETWORK WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect Token Address details while Getting the Decimal from ERC20 Contract on the optimism network', async function () {
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
            data.incorrectTokenAddress_optimismUSDC, // incorrect token address
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
        try {
          await erc20Instance.functions.decimals();

          assert.fail(
            'The expected validation is not displayed when entered the incorrect Token Address while Getting the Decimal from ERC20 Contract.',
          );
        } catch (e) {
          if (e.reason === 'bad address checksum') {
            console.log(
              'The validation for Token Address is displayed as expected while Getting the Decimal from ERC20 Contract.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the incorrect Token Address while Getting the Decimal from ERC20 Contract.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT TOKEN ADDRESS WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid Token Address i.e. missing character details while Getting the Decimal from ERC20 Contract on the optimism network', async function () {
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
            data.invalidTokenAddress_optimismUSDC, // invalid token address
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
        try {
          await erc20Instance.functions.decimals();

          assert.fail(
            'The expected validation is not displayed when entered the invalid Token Address i.e. missing character while Getting the Decimal from ERC20 Contract.',
          );
        } catch (e) {
          if (e.reason === 'invalid address') {
            console.log(
              'The validation for Token Address is displayed as expected while Getting the Decimal from ERC20 Contract.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid Token Address i.e. missing character while Getting the Decimal from ERC20 Contract.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID TOKEN ADDRESS WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with null Token Address details while Getting the Decimal from ERC20 Contract on the optimism network', async function () {
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
        try {
          new ethers.Contract(null, ERC20_ABI, provider); // null token address

          assert.fail(
            'The expected validation is not displayed when entered the null Token Address while Getting the Decimal from ERC20 Contract.',
          );
        } catch (e) {
          if (e.reason === 'invalid contract address or ENS name') {
            console.log(
              'The validation for Token Address is displayed as expected while Getting the Decimal from ERC20 Contract.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the null Token Address while Getting the Decimal from ERC20 Contract.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH NULL TOKEN ADDRESS WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect transfer method name while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transferr', [
            data.recipient,
            ethers.utils.parseUnits(data.value, decimals),
          ]);

          assert.fail(
            'The expected validation is not displayed when entered the incorrect transfer method name while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          if (e.reason === 'no matching function') {
            console.log(
              'The validation for transfer method name is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the incorrect transfer method name while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT TRANSFER METHOD NAME WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid value while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.recipient,
            ethers.utils.parseUnits(data.invalidValue, decimals), // invalid value
          ]);

          assert.fail(
            'The expected validation is not displayed when entered the invalid value while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          if (e.reason === 'invalid decimal value') {
            console.log(
              'The validation for value is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid value while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with very small value while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.recipient,
            ethers.utils.parseUnits(data.smallValue, decimals), // very small value
          ]);

          assert.fail(
            'The expected validation is not displayed when entered the very small value while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          if (e.reason === 'fractional component exceeds decimals') {
            console.log(
              'The validation for value is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the very small value while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH VERY SMALL VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer ERC20 token with exceeded value while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.recipient,
            ethers.utils.parseUnits(data.exceededValue, decimals), // exceeded value
          ]);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The expected validation is not displayed when entered the exceeded value while Getting the transferFrom encoded data.',
          );
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when entered the exceeded value while estimate the added transactions to the batch.',
          );
        } catch (e) {
          if (e.reason === 'Transaction reverted') {
            console.log(
              'The validation for value is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the exceeded value while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH EXCEEDED VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without value while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          await erc20Instance.functions.decimals();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The decimals from erc20 contract is not displayed correctly.',
          );
        }

        // get transferFrom encoded data
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.recipient,
          ]);

          assert.fail(
            'The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          if (e.reason === 'types/values length mismatch') {
            console.log(
              'The validation for value is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect recipient while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.incorrectRecipient, // incorrect recipient address
            ethers.utils.parseUnits(data.value, decimals),
          ]);

          assert.fail(
            'The expected validation is not displayed when entered the incorrect recipient while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('bad address checksum')) {
            console.log(
              'The validation for Recipient is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the incorrect recipient while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid recipient i.e. missing character while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.invalidRecipient, // invalid recipient address
            ethers.utils.parseUnits(data.value, decimals),
          ]);

          assert.fail(
            'The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for Recipient is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer ERC20 token with same recipient i.e. sender address while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.sender, // same recipient address
            ethers.utils.parseUnits(data.value, decimals),
          ]);

          assert.fail(
            'The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for Recipient is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH SAME RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without recipient while Getting the transferFrom encoded data on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            ethers.utils.parseUnits(data.value, decimals),
          ]);

          assert.fail(
            'The expected validation is not displayed when not entered the recepient while Getting the transferFrom encoded data.',
          );
        } catch (e) {
          if (e.reason === 'types/values length mismatch') {
            console.log(
              'The validation for recepient is displayed as expected while Getting the transferFrom encoded data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not entered the recepient while Getting the transferFrom encoded data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the incorrect Token Address while adding transactions to the batch on the optimism network', async function () {
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
            [data.recipient, ethers.utils.parseUnits(data.value, decimals)],
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.incorrectTokenAddress_optimismUSDC, // Incorrect Token Address
            data: transactionData,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();
          assert.fail(
            'The expected validation is not displayed when entered the incorrect Token Address while added the estimated transaction to the batch.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('bad address checksum')) {
            console.log(
              'The validation for Token Address is displayed as expected while added the estimated transaction to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the incorrect Token Address while added the estimated transaction to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the invalid Token Address i.e. missing character while adding transactions to the batch on the optimism network', async function () {
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
            [data.recipient, ethers.utils.parseUnits(data.value, decimals)],
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.invalidTokenAddress_optimismUSDC, // Invalid Token Address
            data: transactionData,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();
          assert.fail(
            'The expected validation is not displayed when entered the invalid Token Address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for Token Address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the invalid Token Address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the null Token Address while adding transactions to the batch on the optimism network', async function () {
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
            [data.recipient, ethers.utils.parseUnits(data.value, decimals)],
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: null, // Null Token Address
            data: transactionData,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when entered the null Token Address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          if (e.reason.includes('invalid address')) {
            console.log(
              'The validation for Token Address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the null Token Address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH NULL TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without Token Address while adding transactions to the batch on the optimism network', async function () {
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
            [data.recipient, ethers.utils.parseUnits(data.value, decimals)],
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            data: transactionData, // without tokenAddress
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not entered the Token Address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          if (e.reason.includes('invalid address')) {
            console.log(
              'The validation for Token Address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not entered the Token Address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer ERC20 token without transactionData while adding transactions to the batch on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.recipient,
            ethers.utils.parseUnits(data.value, decimals),
          ]);
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.tokenAddress_optimismUSDC, // without transactionData
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not entered the transactionData while estimate the added transactions to the batch.',
          );
        } catch (e) {
          if (e.reason === 'bad response') {
            console.log(
              'The validation for transactionData is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not entered the transactionData while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT TRANSACTIONDATA WHILE ADDING TRANSACTION TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without adding transaction to the batch while estimate the added transactions to the batch on the optimism network', async function () {
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
        try {
          erc20Instance.interface.encodeFunctionData('transfer', [
            data.recipient,
            ethers.utils.parseUnits(data.value, decimals),
          ]);
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

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
          );
        } catch (e) {
          if (e.message === 'cannot sign empty transaction batch') {
            console.log(
              'The validation for transaction batch is displayed as expected while adding the estimate transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT ADDING TRANSACTION TO THE BATCH WHILE ESTIMATE THE ADDED TRANSACTIONS TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect Sender Address while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when added the incorrect sender address while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason.includes('bad address checksum')) {
            console.log(
              'The validation for sender address is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when added the incorrect sender address while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INCORRECT SENDER ADDRESS WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with invalid Sender Address i.e. missing character while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when added the invalid Sender Address i.e. missing character while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason.includes('invalid address')) {
            console.log(
              'The validation for sender address is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when added the invalid Sender Address i.e. missing character while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INVALID SENDER ADDRESS WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without Sender Address while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when not added the Sender Address while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason === 'types/values length mismatch') {
            console.log(
              'The validation for sender address is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not added the Sender Address while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITHOUT SENDER ADDRESS WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect Recipient Address while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when added the incorrect recipient address while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason.includes('bad address checksum')) {
            console.log(
              'The validation for recipient address is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when added the incorrect recipient address while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INCORRECT RECEPIENT ADDRESS WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with invalid Recipient Address i.e. missing character while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when added the invalid Recipient Address i.e. missing character while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason.includes('invalid address')) {
            console.log(
              'The validation for recipient address is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when added the invalid Recipient Address i.e. missing character while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INVALID RECEPIENT ADDRESS WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without Recipient Address while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when not added the Recipient Address while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason === 'types/values length mismatch') {
            console.log(
              'The validation for recipient address is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not added the Recipient Address while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITHOUT RECEPIENT ADDRESS WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect tokenId while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when added the incorrect tokenId while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason === 'invalid BigNumber string') {
            console.log(
              'The validation for tokenId is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when added the incorrect tokenId while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INCORRECT TOKENID WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without tokenId while creating the NFT Data on the optimism network', async function () {
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

          assert.fail(
            'The expected validation is not displayed when not added the tokenid while creating the NFT Data.',
          );
        } catch (e) {
          if (e.reason === 'types/values length mismatch') {
            console.log(
              'The validation for tokenid is displayed as expected while creating the NFT Data.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not added the tokenid while creating the NFT Data.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITHOUT TOKENID WHILE CREATING THE NFT DATA ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer ERC721 NFT token with same sender address while creating the NFT Data on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get erc721 Contract Interface
        let erc721Interface;
        let erc721Data;
        try {
          erc721Interface = new ethers.utils.Interface(abi.abi);

          erc721Data = erc721Interface.encodeFunctionData('transferFrom', [
            data.sender,
            data.sender,
            data.tokenId,
          ]);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The get erc721 Contract Interface is not performed.');
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.nft_tokenAddress,
            data: erc721Data,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
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

        // sending to the bundler
        try {
          await optimismMainNetSdk.send(op);

          assert.fail(
            'The expected validation is not displayed when entered the same sender address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for sender address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the same sender address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH SAME SENDER ADDRESS WHILE ESTIMATE THE ADDED THE TRANSACTIONS TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  xit('REGRESSION: Perform the transfer ERC721 NFT token with same recipient address while creating the NFT Data on the optimism network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get erc721 Contract Interface
        let erc721Interface;
        let erc721Data;
        try {
          erc721Interface = new ethers.utils.Interface(abi.abi);

          erc721Data = erc721Interface.encodeFunctionData('transferFrom', [
            data.recipient,
            data.recipient,
            data.tokenId,
          ]);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The get erc721 Contract Interface is not performed.');
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
        try {
          await optimismMainNetSdk.addUserOpsToBatch({
            to: data.nft_tokenAddress,
            data: erc721Data,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
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

        // sending to the bundler
        try {
          await optimismMainNetSdk.send(op);

          assert.fail(
            'The expected validation is not displayed when entered the same recipient address while estimate the added transactions to the batch.',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          let error = e.reason;
          if (error.includes('invalid address')) {
            console.log(
              'The validation for recipient address is displayed as expected while estimate the added transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when entered the same recipient address while estimate the added transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH SAME RECEPIENT ADDRESS WHILE ESTIMATE THE ADDED THE TRANSACTIONS TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT Token without adding transaction to the batch while estimate the added transactions to the batch on the optimism network', async function () {
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
          assert.fail('The get erc721 Contract Interface is not performed.');
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

        // get balance of the account address
        try {
          await optimismMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the ERC721 NFT Token is not displayed.');
        }

        // estimate transactions added to the batch
        try {
          await optimismMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
          );
        } catch (e) {
          if (e.message === 'cannot sign empty transaction batch') {
            console.log(
              'The validation for transaction batch is displayed as expected while adding the estimate transactions to the batch.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH NOT ADDED THE TRANSACTION TO THE BATCH WHILE ADDING THE ESTIMATE TRANSACTIONS TO THE BATCH ON THE optimism NETWORK',
      );
    }
  });
});
