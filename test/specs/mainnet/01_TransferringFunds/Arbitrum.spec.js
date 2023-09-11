import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import { assert } from 'chai';
import { ERC20_ABI } from '@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js';
import Helper from '../../../utils/Helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import abi from '../../../data/NFTabi.json' assert { type: 'json' };
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let arbitrumMainNetSdk;
let arbitrumEtherspotWalletAddress;

describe('The SDK, when transfer a token with arbitrum network on the MainNet', () => {
  beforeEach(async () => {
    // initializating sdk
    try {
      arbitrumMainNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.ARBITRUM_CHAINID),
          projectKey: process.env.PROJECT_KEY,
        },
      );

      try {
        assert.strictEqual(
          arbitrumMainNetSdk.state.walletAddress,
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
      }
    } catch (e) {
      console.error(e);
      assert.fail(
        'The Etherspot Wallet Address is not displayed successfully.',
      );
    }
  });

  it('SMOKE: Perform the transfer native token with valid details on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
      }

      try {
        assert.isNotEmpty(
          transactionBatch.data,
          'The data value is empty in the add transactions to batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          transactionBatch.value,
          'The value value is empty in the add transactions to batch response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
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
      }
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch and get the fee data for the UserOp
    let op;
    try {
      op = await arbitrumMainNetSdk.estimate();

      try {
        assert.strictEqual(
          op.sender,
          data.sender,
          'The sender value is not correct in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.nonce._hex,
          'The hex value of the nonce is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.nonce._isBigNumber,
          'The isBigNumber value of the nonce is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.initCode,
          'The initCode value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callData,
          'The callData value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callGasLimit._hex,
          'The hex value of the callGasLimit is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.callGasLimit._isBigNumber,
          'The isBigNumber value of the callGasLimit is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.verificationGasLimit._hex,
          'The hex value of the verificationGasLimit is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.verificationGasLimit._isBigNumber,
          'The isBigNumber value of the verificationGasLimit is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxFeePerGas,
          'The maxFeePerGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxPriorityFeePerGas,
          'The maxPriorityFeePerGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.paymasterAndData,
          'The paymasterAndData value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.preVerificationGas._hex,
          'The hex value of the preVerificationGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.preVerificationGas._isBigNumber,
          'The isBigNumber value of the preVerificationGas is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.signature,
          'The signature value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
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
      }
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
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(uoHash);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.userOpHash,
          'The userOpHash value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.sender,
          'The sender value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.nonce,
          'The nonce value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.actualGasCost,
          'The actualGasCost value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.actualGasUsed,
          'The actualGasUsed value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsReceipt.success,
          'The success value is false in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.to,
          'The to value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.from,
          'The from value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.transactionIndex,
          'The transactionIndex value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.gasUsed,
          'The gasUsed value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.logsBloom,
          'The logsBloom value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.blockHash,
          'The blockHash value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.transactionHash,
          'The transactionHash value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.logs,
          'The logs value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.blockNumber,
          'The blockNumber value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.confirmations,
          'The confirmations value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.cumulativeGasUsed,
          'The cumulativeGasUsed value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.effectiveGasPrice,
          'The effectiveGasPrice value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.status,
          'The status value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.type,
          'The type value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsReceipt.receipt.byzantium,
          'The byzantium value of the receipt is false in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The get transaction hash action is not performed.');
    }
  });

  it('SMOKE: Perform the transfer ERC20 token with valid details on the arbitrum network', async () => {
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
      }
    } catch (e) {
      console.error(e);
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
      }
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);

      try {
        assert.isNotEmpty(
          transactionData,
          'The decimals value is empty in the get decimals from erc20 contract response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
      }

      try {
        assert.isNotEmpty(
          userOpsBatch.data,
          'The data value is empty in the userops batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsBatch.value[0]._hex,
          'The hex value of the userOpsBatch is empty in the userops batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsBatch.value[0]._isBigNumber,
          'The isBigNumber value of the userOpsBatch is false in the userops batch response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch and get the fee data for the UserOp
    let op;
    try {
      op = await arbitrumMainNetSdk.estimate();

      try {
        assert.strictEqual(
          op.sender,
          data.sender,
          'The sender value is not correct in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.nonce._hex,
          'The hex value of the nonce is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.nonce._isBigNumber,
          'The isBigNumber value of the nonce is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.initCode,
          'The initCode value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callData,
          'The callData value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callGasLimit._hex,
          'The hex value of the callGasLimit is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.callGasLimit._isBigNumber,
          'The isBigNumber value of the callGasLimit is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.verificationGasLimit._hex,
          'The hex value of the verificationGasLimit is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.verificationGasLimit._isBigNumber,
          'The isBigNumber value of the verificationGasLimit is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxFeePerGas,
          'The maxFeePerGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxPriorityFeePerGas,
          'The maxPriorityFeePerGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.paymasterAndData,
          'The paymasterAndData value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.preVerificationGas._hex,
          'The hex value of the preVerificationGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.preVerificationGas._isBigNumber,
          'The isBigNumber value of the preVerificationGas is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.signature,
          'The signature value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
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
      assert.fail('The sending to the bundler action is not performed.');
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(uoHash);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.userOpHash,
          'The userOpHash value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.sender,
          'The sender value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.nonce,
          'The nonce value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.actualGasCost,
          'The actualGasCost value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.actualGasUsed,
          'The actualGasUsed value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsReceipt.success,
          'The success value is false in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.to,
          'The to value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.from,
          'The from value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.transactionIndex,
          'The transactionIndex value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.gasUsed,
          'The gasUsed value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.logsBloom,
          'The logsBloom value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.blockHash,
          'The blockHash value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.transactionHash,
          'The transactionHash value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.logs,
          'The logs value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.blockNumber,
          'The blockNumber value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.confirmations,
          'The confirmations value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.cumulativeGasUsed,
          'The cumulativeGasUsed value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.effectiveGasPrice,
          'The effectiveGasPrice value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.status,
          'The status value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.type,
          'The type value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsReceipt.receipt.byzantium,
          'The byzantium value of the receipt is false in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The get transaction hash action is not performed.');
    }
  });

  it('SMOKE: Perform the transfer ERC721 NFT token with valid details on the arbitrum network', async () => {
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
      }
    } catch (e) {
      console.error(e);
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
      }

      try {
        assert.isNotEmpty(
          userOpsBatch.data[0],
          'The data value is empty in the userops batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsBatch.value[0]._hex,
          'The hex value of the userOpsBatch is empty in the userops batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsBatch.value[0]._isBigNumber,
          'The isBigNumber value of the userOpsBatch is false in the userops batch response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    let op;
    try {
      op = await arbitrumMainNetSdk.estimate();

      try {
        assert.strictEqual(
          op.sender,
          data.sender,
          'The sender value is not correct in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.nonce._hex,
          'The hex value of the nonce is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.nonce._isBigNumber,
          'The isBigNumber value of the nonce is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.initCode,
          'The initCode value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callData,
          'The callData value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callGasLimit._hex,
          'The hex value of the callGasLimit is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.callGasLimit._isBigNumber,
          'The isBigNumber value of the callGasLimit is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.verificationGasLimit._hex,
          'The hex value of the verificationGasLimit is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.verificationGasLimit._isBigNumber,
          'The isBigNumber value of the verificationGasLimit is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxFeePerGas,
          'The maxFeePerGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxPriorityFeePerGas,
          'The maxPriorityFeePerGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.paymasterAndData,
          'The paymasterAndData value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.preVerificationGas._hex,
          'The hex value of the preVerificationGas is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.preVerificationGas._isBigNumber,
          'The isBigNumber value of the preVerificationGas is false in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.signature,
          'The signature value is empty in the estimate transactions added to the batch response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
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
      assert.fail('The sending to the bundler action is not performed.');
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(uoHash);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.userOpHash,
          'The userOpHash value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.sender,
          'The sender value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.nonce,
          'The nonce value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.actualGasCost,
          'The actualGasCost value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.actualGasUsed,
          'The actualGasUsed value is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsReceipt.success,
          'The success value is false in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.to,
          'The to value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.from,
          'The from value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.transactionIndex,
          'The transactionIndex value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.gasUsed,
          'The gasUsed value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.logsBloom,
          'The logsBloom value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.blockHash,
          'The blockHash value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.transactionHash,
          'The transactionHash value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.logs,
          'The logs value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.blockNumber,
          'The blockNumber value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.confirmations,
          'The confirmations value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.cumulativeGasUsed,
          'The cumulativeGasUsed value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.effectiveGasPrice,
          'The effectiveGasPrice value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.status,
          'The status value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsReceipt.receipt.type,
          'The type value of the receipt is empty in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsReceipt.receipt.byzantium,
          'The byzantium value of the receipt is false in the get transaction hash response.',
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail('The get transaction hash action is not performed.');
    }
  });

  it('REGRESSION: Perform the transfer native token with the incorrect To Address while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.incorrectRecipient, // incorrect to address
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the incorrect To Address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid To Address i.e. missing character while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.invalidRecipient, // invalid to address
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid To Address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer native token with the same To Address i.e. sender address while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.sender, // same to address
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

      assert.fail(
        'The expected validation is not displayed when entered the invalid recipient while estimate the added transactions to the batch.',
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes('invalid address')) {
        console.log(
          'The validation for Recipient is displayed as expected while estimate the added transactions to the batch.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when entered the invalid recipient while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid Value while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid value while adding the transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token with the very small Value while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the very small value while adding the transactions to the batch.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer native token with the exceeded Value while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.recipient,
        value: data.exceededValue, // exceeded value
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

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
        assert.fail(
          'The expected validation is not displayed when entered the exceeded value while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

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
        assert.fail(
          'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token with the invalid TxHash i.e. even number while getting the transaction hash on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.recipient,
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.evenInvalidTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token with the incorrect TxHash while getting the transaction hash on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.recipient,
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.incorrectTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer native token with the past TxHash while getting the transaction hash on the arbitrum network', async () => {
    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.recipient,
        value: ethers.utils.parseEther(data.value),
      });
    } catch (e) {
      console.error(e);
      assert.fail('The addition of transaction in the batch is not performed.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the native token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.pastTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the past TxHash while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the past TxHash while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid provider netowrk details while Getting the Decimal from ERC20 Contract on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.invalidProviderNetwork_arbitrum, // invalid provider
      );
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without provider netowrk details while Getting the Decimal from ERC20 Contract on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(); // without provider
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with other provider netowrk details while Getting the Decimal from ERC20 Contract on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.otherProviderNetwork_arbitrum, // other provider
      );
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the other Provider Network while Getting the Decimal from ERC20 Contract.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect Token Address details while Getting the Decimal from ERC20 Contract on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the incorrect Token Address while Getting the Decimal from ERC20 Contract.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid Token Address i.e. missing character details while Getting the Decimal from ERC20 Contract on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid Token Address i.e. missing character while Getting the Decimal from ERC20 Contract.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with null Token Address details while Getting the Decimal from ERC20 Contract on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the null Token Address while Getting the Decimal from ERC20 Contract.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect transfer method name while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the incorrect transfer method name while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid value while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid value while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with very small value while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the very small value while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer ERC20 token with exceeded value while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
      assert.fail(
        'The expected validation is not displayed when entered the exceeded value while Getting the transferFrom encoded data.',
      );
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

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
        assert.fail(
          'The expected validation is not displayed when entered the exceeded value while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without value while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    try {
      await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    try {
      erc20Instance.interface.encodeFunctionData('transfer', [data.recipient]);

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
        assert.fail(
          'The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with incorrect recipient while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the incorrect recipient while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with invalid recipient i.e. missing character while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer ERC20 token with same recipient i.e. sender address while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without recipient while Getting the transferFrom encoded data on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
        'The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data.',
      );
    } catch (e) {
      if (e.reason === 'types/values length mismatch') {
        console.log(
          'The validation for value is displayed as expected while Getting the transferFrom encoded data.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the incorrect To Address while adding transactions to the batch on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
      assert.fail(
        'The expected validation is not displayed when entered the incorrect Token Address while estimate the added transactions to the batch.',
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes('bad address checksum')) {
        console.log(
          'The validation for Token Address is displayed as expected while estimate the added transactions to the batch.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when entered the incorrect Token Address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the invalid Token Address i.e. missing character while adding transactions to the batch on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the invalid Token Address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the null Token Address while adding transactions to the batch on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when entered the null Token Address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without Token Address while adding transactions to the batch on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        data: transactionData, // without tokenAddress
      });
    } catch (e) {
      console.error(e);
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
        assert.fail(
          'The expected validation is not displayed when not entered the Token Address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer ERC20 token without transactionData while adding transactions to the batch on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.tokenAddress_arbitrumUSDC, // without transactionData
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

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
        assert.fail(
          'The expected validation is not displayed when not entered the transactionData while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
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
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

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
        assert.fail(
          'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the invalid TxHash i.e. even number while getting the transaction hash on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.tokenAddress_arbitrumUSDC,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.evenInvalidTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the incorrect TxHash while getting the transaction hash on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.tokenAddress_arbitrumUSDC,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.incorrectTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC20 token with the past TxHash while getting the transaction hash on the arbitrum network', async () => {
    // get the respective provider details
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        data.providerNetwork_arbitrum,
      );
    } catch (e) {
      console.error(e);
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
      assert.fail('The get erc20 Contract Interface is not performed.');
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData('transfer', [
        data.recipient,
        ethers.utils.parseUnits(data.value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        'The decimals from erc20 contract is not displayed correctly.',
      );
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.tokenAddress_arbitrumUSDC,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.pastTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the past TxHash while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the past TxHash while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect Sender Address while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when added the incorrect sender address while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with invalid Sender Address i.e. missing character while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when added the invalid Sender Address i.e. missing character while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without Sender Address while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when not added the Sender Address while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect Recipient Address while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when added the incorrect recipient address while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with invalid Recipient Address i.e. missing character while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when added the invalid Recipient Address i.e. missing character while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without Recipient Address while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when not added the Recipient Address while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token with incorrect tokenId while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when added the incorrect tokenId while creating the NFT Data.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT token without tokenId while creating the NFT Data on the arbitrum network', async () => {
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
        assert.fail(
          'The expected validation is not displayed when not added the tokenid while creating the NFT Data.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer ERC721 NFT token with same sender address while creating the NFT Data on the arbitrum network', async () => {
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
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.nft_tokenAddress,
        data: erc721Data,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    let op;
    try {
      op = await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // sending to the bundler
    try {
      await arbitrumMainNetSdk.send(op);

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
        assert.fail(
          'The expected validation is not displayed when entered the same sender address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  xit('REGRESSION: Perform the transfer ERC721 NFT token with same recipient address while creating the NFT Data on the arbitrum network', async () => {
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
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.nft_tokenAddress,
        data: erc721Data,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    let op;
    try {
      op = await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // sending to the bundler
    try {
      await arbitrumMainNetSdk.send(op);

      assert.fail(
        'The expected validation is not displayed when entered the same recipient address while estimate the added transactions to the batch.',
      );
    } catch (e) {
      console.error(e);
      let error = e.reason;
      if (error.includes('invalid address')) {
        console.log(
          'The validation for recipient address is displayed as expected while estimate the added transactions to the batch.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when entered the same recipient address while estimate the added transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT Token without adding transaction to the batch while estimate the added transactions to the batch on the arbitrum network', async () => {
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
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // get balance of the account address
    try {
      await arbitrumMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail('The balance of the ERC721 NFT Token is not displayed.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();

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
        assert.fail(
          'The expected validation is not displayed when not added the transaction to the batch while adding the estimate transactions to the batch.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT Token with the invalid TxHash i.e. even number while getting the transaction hash on the arbitrum network', async () => {
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
    } catch (e) {
      console.error(e);
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.nft_tokenAddress,
        data: erc721Data,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.evenInvalidTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT Token with the incorrect TxHash while getting the transaction hash on the arbitrum network', async () => {
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
    } catch (e) {
      console.error(e);
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.nft_tokenAddress,
        data: erc721Data,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.incorrectTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash.',
        );
      }
    }
  });

  it('REGRESSION: Perform the transfer ERC721 NFT Token with the past TxHash while getting the transaction hash on the arbitrum network', async () => {
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
    } catch (e) {
      console.error(e);
      assert.fail('The get erc721 Contract Interface is not performed.');
    }

    // clear the transaction batch
    try {
      await arbitrumMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // add transactions to the batch
    try {
      await arbitrumMainNetSdk.addUserOpsToBatch({
        to: data.nft_tokenAddress,
        data: erc721Data,
      });
    } catch (e) {
      console.error(e);
      assert.fail('The transaction of the batch is not clear correctly.');
    }

    // estimate transactions added to the batch
    try {
      await arbitrumMainNetSdk.estimate();
    } catch (e) {
      console.error(e);
      assert.fail(
        'The estimate transactions added to the batch is not performed.',
      );
    }

    // get transaction hash
    let userOpsReceipt = null;
    try {
      console.log('Waiting for transaction...');
      const timeout = Date.now() + 60000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await Helper.wait(2000);
        userOpsReceipt = await arbitrumMainNetSdk.getUserOpReceipt(
          data.pastTxHash,
        );
      }

      assert.fail(
        'The expected validation is not displayed when added the past TxHash while getting the transaction hash.',
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          'The validation for transaction is displayed as expected while getting the transaction hash.',
        );
      } else {
        console.error(e);
        assert.fail(
          'The expected validation is not displayed when added the past TxHash while getting the transaction hash.',
        );
      }
    }
  });
});
