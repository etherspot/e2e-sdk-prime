import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { ethers, utils, providers } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import abi from '../../../data/nftabi.json' assert { type: 'json' };

let arbitrumMainNetSdk;
let arbitrumEtherspotWalletAddress;
let arbitrumNativeAddress = null;
let arbitrumDataService;
let runTest;

describe('The PrimeSDK, when transfer a token with arbitrum network on the MainNet', function () {
  before(async function () {
    var test = this;

    await customRetryAsync(async function () {
      // initializating sdk
      try {
        arbitrumMainNetSdk = new PrimeSdk(
          { privateKey: process.env.PRIVATE_KEY },
          {
            chainId: Number(data.arbitrum_chainid),
            bundlerProvider: new EtherspotBundler(Number(data.arbitrum_chainid), process.env.BUNDLER_API_KEY)
          },
        );

        try {
          assert.strictEqual(
            arbitrumMainNetSdk.state.EOAAddress,
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
        arbitrumEtherspotWalletAddress =
          await arbitrumMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            arbitrumEtherspotWalletAddress,
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
      try {
        arbitrumDataService = new DataUtils(
          process.env.DATA_API_KEY,
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail('The Data service is not initialled successfully.');
      }


      // validate the balance of the wallet
      try {
        let output = await arbitrumDataService.getAccountBalances({
          account: data.sender,
          chainId: Number(data.arbitrum_chainid),
        });
        let native_balance;
        let usdc_balance;
        let native_final;
        let usdc_final;

        for (let i = 0; i < output.items.length; i++) {
          let tokenAddress = output.items[i].token;
          if (tokenAddress === arbitrumNativeAddress) {
            native_balance = output.items[i].balance;
            native_final = utils.formatUnits(native_balance, 18);
          } else if (tokenAddress === data.tokenAddress_arbitrumUSDC) {
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

  it('SMOKE: Perform the transfer native token with valid details on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
            to: data.recipient,
            value: ethers.utils.parseEther(data.invalidValue),
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
          balance = await arbitrumMainNetSdk.getNativeBalance();

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
          op = await arbitrumMainNetSdk.estimate();

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
          uoHash = await arbitrumMainNetSdk.send(op);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer ERC20 token with valid details on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
            [data.recipient, ethers.utils.parseUnits(data.erc20_value, decimals)],
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let userOpsBatch;
        try {
          userOpsBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
            to: data.tokenAddress_arbitrumUSDC,
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
          op = await arbitrumMainNetSdk.estimate();

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
          uoHash = await arbitrumMainNetSdk.send(op);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer ERC721 NFT token with valid details on the arbitrum network', async function () {
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let userOpsBatch;
        try {
          userOpsBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
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
          op = await arbitrumMainNetSdk.estimate();

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
          uoHash = await arbitrumMainNetSdk.send(op);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('SMOKE: Perform the transfer native token by passing callGasLimit with valid details on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
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
          balance = await arbitrumMainNetSdk.getNativeBalance();

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
        // passing callGasLimit as 40000 to manually set it
        let op;
        try {
          op = await arbitrumMainNetSdk.estimate({ callGasLimit: 40000 });

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
          uoHash = await arbitrumMainNetSdk.send(op);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN ON THE arbitrum NETWORK',
      );
    }
  });

  it('SMOKE: Perform the concurrent userops with valid details on the arbitrum network', async function () {
    // NOTE: assume the sender wallet is deployed

    var test = this;
    if (runTest) {

      await customRetryAsync(async function () {
        const provider = new providers.JsonRpcProvider();

        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
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
          balance = await arbitrumMainNetSdk.getNativeBalance();

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

        // Note that usually Bundlers do not allow sending more than 10 concurrent userops from an unstaked entites (wallets, factories, paymaster)
        // Staked entities can send as many userops as they want
        let concurrentUseropsCount = 3;
        const userops = [];
        const uoHashes = [];

        try {
          while (--concurrentUseropsCount >= 0) {
            const op = await arbitrumMainNetSdk.estimate({ key: concurrentUseropsCount });
            userops.push(op);
          }

          console.log("Sending userops...");
          for (const op of userops) {
            const uoHash = await arbitrumMainNetSdk.send(op);
            uoHashes.push(uoHash);
          }
        } catch (e) {
          assert.fail('An error is display while sending the userops.')
        }

        try {
          console.log('Waiting for transactions...');
          const userOpsReceipts = new Array(uoHashes.length).fill(null);
          const timeout = Date.now() + 60000; // 1 minute timeout
          while ((userOpsReceipts.some(receipt => receipt == null)) && (Date.now() < timeout)) {
            Helper.wait(2000)
            for (let i = 0; i < uoHashes.length; ++i) {
              if (userOpsReceipts[i]) continue;
              const uoHash = uoHashes[i];
              userOpsReceipts[i] = await arbitrumMainNetSdk.getUserOpReceipt(uoHash);
            }
          }

          if (userOpsReceipts.some(receipt => receipt != null)) {
            for (const uoReceipt of userOpsReceipts) {
              if (!uoReceipt) continue;
              console.log('Submitted the user op successfully.');
            }
          } else {
            console.log("Could not submit any user op");
          }
        } catch (e) {
          assert.fail('An error is displayed while validating the userops receipts.')
        }

      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE CONCURRENT USEROPS ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the incorrect To Address while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        try {
          await arbitrumMainNetSdk.estimate();

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INCORRECT TO ADDRESS ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid To Address i.e. missing character while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        try {
          await arbitrumMainNetSdk.estimate();

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INVALID TO ADDRESS ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid Value while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INVALID VALUE ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token with the very small Value while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH VERY SMALL VALUE ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // get balance of the account address
        try {
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        try {
          await arbitrumMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
          );
        } catch (e) {
          if (e.message === 'Make sure the sdk fn called has valid parameters') {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITHOUT ADDED THE TRANSACTION TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token by passing callGasLimit with the incorrect To Address while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        // passing callGasLimit as 40000 to manually set it
        try {
          await arbitrumMainNetSdk.estimate({ callGasLimit: 40000 });

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INCORRECT TO ADDRESS ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token by passing callGasLimit with the invalid To Address i.e. missing character while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        // passing callGasLimit as 40000 to manually set it
        try {
          await arbitrumMainNetSdk.estimate({ callGasLimit: 40000 });

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITH INVALID TO ADDRESS ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer native token by passing callGasLimit without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // get balance of the account address
        try {
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // estimate transactions added to the batch
        // passing callGasLimit as 40000 to manually set it
        try {
          await arbitrumMainNetSdk.estimate({ callGasLimit: 40000 });

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND NATIVE TOKEN WITHOUT ADDED THE TRANSACTION TO THE BATCH ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid provider netowrk details while Getting the Decimal from ERC20 Contract on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.invalidProviderNetwork_arbitrum, // invalid provider
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
            data.tokenAddress_arbitrumUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID PROVIDER NETWORK WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without provider netowrk details while Getting the Decimal from ERC20 Contract on the arbitrum network', async function () {
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
            data.tokenAddress_arbitrumUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT PROVIDER NETWORK WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with other provider netowrk details while Getting the Decimal from ERC20 Contract on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.otherProviderNetwork_arbitrum, // other provider
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
            data.tokenAddress_arbitrumUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH OTHER PROVIDER NETWORK WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect Token Address details while Getting the Decimal from ERC20 Contract on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.incorrectTokenAddress_arbitrumUSDC, // incorrect token address
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT TOKEN ADDRESS WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid Token Address i.e. missing character details while Getting the Decimal from ERC20 Contract on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.invalidTokenAddress_arbitrumUSDC, // invalid token address
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID TOKEN ADDRESS WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with null Token Address details while Getting the Decimal from ERC20 Contract on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH NULL TOKEN ADDRESS WHILE GETTING THE DECIMAL FROM ERC20 CONTRACT ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect transfer method name while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
            ethers.utils.parseUnits(data.erc20_value, decimals),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT TRANSFER METHOD NAME WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid value while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with very small value while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH VERY SMALL VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without value while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT VALUE WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect recipient while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
            ethers.utils.parseUnits(data.erc20_value, decimals),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid recipient i.e. missing character while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
            ethers.utils.parseUnits(data.erc20_value, decimals),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without recipient while Getting the transferFrom encoded data on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
            ethers.utils.parseUnits(data.erc20_value, decimals),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT RECEPIENT WHILE GETTING THE TRANSFERFROM ENCODED DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the incorrect Token Address while adding transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
            to: data.incorrectTokenAddress_arbitrumUSDC, // Incorrect Token Address
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
          await arbitrumMainNetSdk.estimate();
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INCORRECT TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the invalid Token Address i.e. missing character while adding transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
            to: data.invalidTokenAddress_arbitrumUSDC, // Invalid Token Address
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
          await arbitrumMainNetSdk.estimate();
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH INVALID TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the null Token Address while adding transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
          await arbitrumMainNetSdk.estimate();

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITH NULL TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without Token Address while adding transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        try {
          await arbitrumMainNetSdk.addUserOpsToBatch({
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
          await arbitrumMainNetSdk.estimate();

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT TOKEN ADDRESS WHILE ADDED THE ESTIMATED TRANSACTION TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        // get the respective provider details
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(
            data.providerNetwork_arbitrum,
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
            data.tokenAddress_arbitrumUSDC,
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
            ethers.utils.parseUnits(data.erc20_value, decimals),
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // estimate transactions added to the batch
        try {
          await arbitrumMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
          );
        } catch (e) {
          if (e.message === 'Make sure the sdk fn called has valid parameters') {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC20 TOKEN WITHOUT ADDING TRANSACTION TO THE BATCH WHILE ESTIMATE THE ADDED TRANSACTIONS TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect Sender Address while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INCORRECT SENDER ADDRESS WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with invalid Sender Address i.e. missing character while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INVALID SENDER ADDRESS WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without Sender Address while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITHOUT SENDER ADDRESS WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect Recipient Address while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INCORRECT RECEPIENT ADDRESS WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with invalid Recipient Address i.e. missing character while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INVALID RECEPIENT ADDRESS WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without Recipient Address while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITHOUT RECEPIENT ADDRESS WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect tokenId while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH INCORRECT TOKENID WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without tokenId while creating the NFT Data on the arbitrum network', async function () {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITHOUT TOKENID WHILE CREATING THE NFT DATA ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT Token without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async function () {
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
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // get balance of the account address
        try {
          await arbitrumMainNetSdk.getNativeBalance();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the ERC721 NFT Token is not displayed.');
        }

        // estimate transactions added to the batch
        try {
          await arbitrumMainNetSdk.estimate();

          assert.fail(
            'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
          );
        } catch (e) {
          if (e.message === 'Make sure the sdk fn called has valid parameters') {
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE SEND ERC721 TOKEN WITH NOT ADDED THE TRANSACTION TO THE BATCH WHILE ADDING THE ESTIMATE TRANSACTIONS TO THE BATCH ON THE ARBITRUM NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the concurrent userops with invalid concurrentUseropsCount on the arbitrum network', async function () {
    // NOTE: assume the sender wallet is deployed

    var test = this;
    if (runTest) {

      await customRetryAsync(async function () {
        const provider = new providers.JsonRpcProvider();

        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
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
        let balance;
        try {
          balance = await arbitrumMainNetSdk.getNativeBalance();

        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // Note that usually Bundlers do not allow sending more than 10 concurrent userops from an unstaked entites (wallets, factories, paymaster)
        // Staked entities can send as many userops as they want
        let concurrentUseropsCount = -5; // invalid concurrent userops
        const userops = [];
        const uoHashes = [];

        try {
          while (--concurrentUseropsCount >= 0) {
            const op = await arbitrumMainNetSdk.estimate({ key: concurrentUseropsCount });
            userops.push(op);
          }

          console.log("Sending userops...");
          for (const op of userops) {
            const uoHash = await arbitrumMainNetSdk.send(op);
            uoHashes.push(uoHash);
          }
        } catch (e) {
          assert.fail('An error is display while sending the userops.')
        }

        try {
          console.log('Waiting for transactions...');
          const userOpsReceipts = new Array(uoHashes.length).fill(null);
          const timeout = Date.now() + 60000; // 1 minute timeout
          while ((userOpsReceipts.some(receipt => receipt == null)) && (Date.now() < timeout)) {
            Helper.wait(2000)
            for (let i = 0; i < uoHashes.length; ++i) {
              if (userOpsReceipts[i]) continue;
              const uoHash = uoHashes[i];
              userOpsReceipts[i] = await arbitrumMainNetSdk.getUserOpReceipt(uoHash);
            }
          }

          if (userOpsReceipts.some(receipt => receipt != null)) {
            for (const uoReceipt of userOpsReceipts) {
              if (!uoReceipt) continue;
              console.log('Submitted the user op successfully.');
            }
          } else {
            console.log("Could not submit any user op");
          }
        } catch (e) {
          assert.fail('An error is displayed while validating the userops receipts.')
        }

      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE CONCURRENT USEROPS ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the concurrent userops without concurrentUseropsCount on the arbitrum network', async function () {
    // NOTE: assume the sender wallet is deployed

    var test = this;
    if (runTest) {

      await customRetryAsync(async function () {
        const provider = new providers.JsonRpcProvider();

        // clear the transaction batch
        try {
          await arbitrumMainNetSdk.clearUserOpsFromBatch();
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The transaction of the batch is not clear correctly.');
        }

        // add transactions to the batch
        let transactionBatch;
        try {
          transactionBatch = await arbitrumMainNetSdk.addUserOpsToBatch({
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
        let balance;
        try {
          balance = await arbitrumMainNetSdk.getNativeBalance();

        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The balance of the native token is not displayed.');
        }

        // Note that usually Bundlers do not allow sending more than 10 concurrent userops from an unstaked entites (wallets, factories, paymaster)
        // Staked entities can send as many userops as they want
        let concurrentUseropsCount; // invalid concurrent userops
        const userops = [];
        const uoHashes = [];

        try {
          while (--concurrentUseropsCount >= 0) {
            const op = await arbitrumMainNetSdk.estimate({ key: concurrentUseropsCount });
            userops.push(op);
          }

          console.log("Sending userops...");
          for (const op of userops) {
            const uoHash = await arbitrumMainNetSdk.send(op);
            uoHashes.push(uoHash);
          }
        } catch (e) {
          assert.fail('An error is display while sending the userops.')
        }

        try {
          console.log('Waiting for transactions...');
          const userOpsReceipts = new Array(uoHashes.length).fill(null);
          const timeout = Date.now() + 60000; // 1 minute timeout
          while ((userOpsReceipts.some(receipt => receipt == null)) && (Date.now() < timeout)) {
            Helper.wait(2000)
            for (let i = 0; i < uoHashes.length; ++i) {
              if (userOpsReceipts[i]) continue;
              const uoHash = uoHashes[i];
              userOpsReceipts[i] = await arbitrumMainNetSdk.getUserOpReceipt(uoHash);
            }
          }

          if (userOpsReceipts.some(receipt => receipt != null)) {
            for (const uoReceipt of userOpsReceipts) {
              if (!uoReceipt) continue;
              console.log('Submitted the user op successfully.');
            }
          } else {
            console.log("Could not submit any user op");
          }
        } catch (e) {
          assert.fail('An error is displayed while validating the userops receipts.')
        }

      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE CONCURRENT USEROPS ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Perform the concurrent userops with non deployed address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {

      await customRetryAsync(async function () {
        const provider = new providers.JsonRpcProvider();

        try {
          if ((await provider.getCode(data.eoaAddress)).length <= 2) {
            console.log("Account must be created first");
            return;
          }
          assert.fail('The address is considered as a deployed.')
        } catch (e) {
          const errorMessage = e.message;
          if (errorMessage.includes('could not detect network')) {
            console.log(
              'The validation for non deployed address is displayed as expected while performing the concurrent userops.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The expected validation is not displayed when address is not deployed while performing the concurrent userops.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE CONCURRENT USEROPS ON THE arbitrum NETWORK',
      );
    }
  });
});
