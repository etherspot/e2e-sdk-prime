import { PrimeSdk } from "@etherspot/prime-sdk";
import { ethers } from "ethers";
import { assert } from "chai";
import { ERC20_ABI } from "@etherspot/prime-sdk/dist/sdk/helpers/abi/ERC20_ABI.js";
import * as dotenv from "dotenv";
dotenv.config(); // init dotenv

let optimismMainNetSdk;
let optimismEtherspotWalletAddress;
let sender = "0x97EC9803387fcBc4A238BCeA2C6C1b75438D39C3";
let recipient = "0x71Bec2309cC6BDD5F1D73474688A6154c28Db4B5";
let incorrectRecipient = "0x71Bec2309AC6BCD5F1D7347468AA6154c2DDb4BB";
let invalidRecipient = "0x71Bec2309cC6BDD5F1D73474688A6154c28Db4B";
let tokenAddress = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";
let incorrectTokenAddress = "0x7FFc764cBcc4f9669b888A7c11490cCa17c31600";
let invalidTokenAddress = "0x7F5c764cBc14f9669B88837ca1490cCa17c3160";
let value = "0.00001";
let invalidValue = "abcd";
let smallValue = "0.0000000000000000001";
let exceededValue = "1000000000";
let providerNetwork = "https://polygon-bundler.etherspot.io";
let invalidProviderNetwork = "http://polygon-bundler.etherspot.io";
let otherProviderNetwork = "https://optimism-bundler.etherspot.io";
let oddInvalidTxHash =
  "0x1a44fe659f15021f49315792be9c69bd76953baf422bfa306f9a3485a52d444";
let evenInvalidTxHash =
  "0x1a44fe659f15021f49315792be9c69bd76953baf422bfa306f9a3485a52d44";
let incorrectTxHash =
  "0x1a44fe659f1502ff49315722be9c69bd76653baf422bfa30669a3485a52d4446";
let pastTxHash =
  "0x1a44fe659f15021f49315792be9c69bd76953baf422bfa306f9a3485a52d4445";

describe("The SDK, when transfer a token with optimism network on the MainNet", () => {
  beforeEach(async () => {
    // initializating sdk
    try {
      optimismMainNetSdk = new PrimeSdk(process.env.PRIVATE_KEY, {
        chainId: Number(process.env.POLYGON_CHAINID),
      });

      assert.strictEqual(
        optimismMainNetSdk.state.walletAddress,
        "0xa5494Ed2eB09F37b4b0526a8e4789565c226C84f",
        "The EOA Address is not calculated correctly."
      );
    } catch (e) {
      console.error(e);
      assert.fail("The SDK is not initialled successfully.");
    }

    // get EtherspotWallet address
    try {
      optimismEtherspotWalletAddress =
        await optimismMainNetSdk.getCounterFactualAddress();

      assert.strictEqual(
        optimismEtherspotWalletAddress,
        sender,
        "The Etherspot Wallet Address is not calculated correctly."
      );
    } catch (e) {
      console.error(e);
      assert.fail(
        "The Etherspot Wallet Address is not displayed successfully."
      );
    }
  });

  it("SMOKE: Perform the transfer native token with valid details on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseEther(value),
      });

      try {
        assert.isNotEmpty(
          transactionBatch.to,
          "The To Address value is empty in the transaction batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          transactionBatch.data,
          "The data value is empty in the transaction batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          transactionBatch.value,
          "The value's value is empty in the transaction batch response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();

      try {
        assert.isNotEmpty(
          balance,
          "The balance is not number in the get native balance response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      try {
        assert.strictEqual(
          op.sender,
          sender,
          "The send value is not correct in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.nonce._hex,
          "The hex value of the nonce is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.nonce._isBigNumber,
          "The isBigNumber value of the nonce is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.initCode,
          "The initCode value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callData,
          "The callData value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callGasLimit._hex,
          "The hex value of the callGasLimit is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.callGasLimit._isBigNumber,
          "The isBigNumber value of the callGasLimit is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.verificationGasLimit._hex,
          "The hex value of the verificationGasLimit is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.verificationGasLimit._isBigNumber,
          "The isBigNumber value of the verificationGasLimit is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxFeePerGas._hex,
          "The hex value of the maxFeePerGas is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.maxFeePerGas._isBigNumber,
          "The isBigNumber value of the maxFeePerGas is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxPriorityFeePerGas._hex,
          "The hex value of the maxPriorityFeePerGas is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.maxPriorityFeePerGas._isBigNumber,
          "The isBigNumber value of the maxPriorityFeePerGas is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNumber(
          op.chainId,
          "The chainId value is not number in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.paymasterAndData,
          "The paymasterAndData value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.preVerificationGas._hex,
          "The hex value of the preVerificationGas is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.preVerificationGas._isBigNumber,
          "The isBigNumber value of the preVerificationGas is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.signature,
          "The signature value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // sending to the bundler
    let uoHash;
    try {
      uoHash = await optimismMainNetSdk.send(op);

      assert.isNotEmpty(
        uoHash,
        "The uoHash value is empty in the sending bundler response."
      );
    } catch (e) {
      console.error(e);
      assert.fail("The sending to the bundler action is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      let txHash = await optimismMainNetSdk.getUserOpReceipt(uoHash);

      assert.isNotEmpty(
        txHash,
        "The txHash value is empty in the sending bundler response."
      );
    } catch (e) {
      console.error(e);
      assert.fail("The get transaction hash action is not performed.");
    }
  });

  it("SMOKE: Perform the transfer ERC20 token with valid details on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);

      try {
        assert.isTrue(
          provider._isProvider,
          "The isProvider value is false in the provider response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();

      try {
        assert.isNotEmpty(
          decimals,
          "The decimals value is empty in the get decimals from erc20 contract response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);

      try {
        assert.isNotEmpty(
          transactionData,
          "The decimals value is empty in the get decimals from erc20 contract response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: transactionData,
      });

      try {
        assert.isNotEmpty(
          userOpsBatch.to,
          "The To Address value is empty in the transaction batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsBatch.data,
          "The data value is empty in the transaction batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          userOpsBatch.value._hex,
          "The hex value of the userOpsBatch is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          userOpsBatch.value._isBigNumber,
          "The isBigNumber value of the userOpsBatch is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      try {
        assert.strictEqual(
          op.sender,
          sender,
          "The send value is not correct in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.nonce._hex,
          "The hex value of the nonce is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.nonce._isBigNumber,
          "The isBigNumber value of the nonce is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.initCode,
          "The initCode value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callData,
          "The callData value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.callGasLimit._hex,
          "The hex value of the callGasLimit is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.callGasLimit._isBigNumber,
          "The isBigNumber value of the callGasLimit is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.verificationGasLimit._hex,
          "The hex value of the verificationGasLimit is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.verificationGasLimit._isBigNumber,
          "The isBigNumber value of the verificationGasLimit is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxFeePerGas._hex,
          "The hex value of the maxFeePerGas is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.maxFeePerGas._isBigNumber,
          "The isBigNumber value of the maxFeePerGas is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.maxPriorityFeePerGas._hex,
          "The hex value of the maxPriorityFeePerGas is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.maxPriorityFeePerGas._isBigNumber,
          "The isBigNumber value of the maxPriorityFeePerGas is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNumber(
          op.chainId,
          "The chainId value is not number in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.paymasterAndData,
          "The paymasterAndData value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.preVerificationGas._hex,
          "The hex value of the preVerificationGas is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isTrue(
          op.preVerificationGas._isBigNumber,
          "The isBigNumber value of the preVerificationGas is false in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }

      try {
        assert.isNotEmpty(
          op.signature,
          "The signature value is empty in the sign transactions added to the batch response."
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // sending to the bundler
    let uoHash;
    try {
      uoHash = await optimismMainNetSdk.send(op);

      assert.isNotEmpty(
        uoHash,
        "The uoHash value is empty in the sending bundler response."
      );
    } catch (e) {
      console.error(e);
      assert.fail("The sending to the bundler action is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      let txHash = await optimismMainNetSdk.getUserOpReceipt(uoHash);

      assert.isNotEmpty(
        txHash,
        "The txHash value is empty in the sending bundler response."
      );
    } catch (e) {
      console.error(e);
      assert.fail("The get transaction hash action is not performed.");
    }
  });

  it("Regression: Perform the transfer native token with the incorrect To Address while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: incorrectRecipient, // incorrect to address
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when entered the incorrect To Address while sign the added transactions to the batch."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("bad address checksum")) {
        console.log(
          "The validation for To Address is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the incorrect To Address while sign the added transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the invalid To Address i.e. missing character while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: invalidRecipient, // invalid to address
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when entered the invalid To Address while sign the added transactions to the batch."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("invalid address")) {
        console.log(
          "The validation for To Address is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid To Address while sign the added transactions to the batch."
        );
      }
    }
  });

  xit("Regression: Perform the transfer native token with the same To Address i.e. sender address while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: sender, // same to address
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e.error);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // sending to the bundler
    let uoHash;
    try {
      uoHash = await optimismMainNetSdk.send(op);
    } catch (e) {
      console.error(e);
      assert.fail("The sending to the bundler action is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(uoHash);
    } catch (e) {
      console.error(e);
      assert.fail("The get transaction hash action is not performed.");
    }
  });

  it("Regression: Perform the transfer native token with the invalid Value while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseUnits(invalidValue), // invalid value
      });

      assert.fail(
        "The expected validation is not displayed when entered the invalid value while adding the transactions to the batch."
      );
    } catch (e) {
      if (e.reason === "invalid decimal value") {
        console.log(
          "The validation for value is displayed as expected while adding the transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid value while adding the transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the very small Value while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseUnits(smallValue), // very small value
      });

      assert.fail(
        "The expected validation is not displayed when entered the very small value while adding the transactions to the batch."
      );
    } catch (e) {
      if (e.reason === "fractional component exceeds decimals") {
        console.log(
          "The validation for value is displayed as expected while adding the transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the very small value while adding the transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the exceeded Value while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: exceededValue, // exceeded value
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when entered the exceeded value while sign the added transactions to the batch."
      );
    } catch (e) {
      if (e.reason === "bad response") {
        console.log(
          "The validation for value is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the exceeded value while sign the added transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token without adding transaction to the batch while sign the added transactions to the batch on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when not added the transaction to the batch while adding the sign transactions to the batch."
      );
    } catch (e) {
      if (e.message === "cannot sign empty transaction batch") {
        console.log(
          "The validation for transaction batch is displayed as expected while adding the sign transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when not added the transaction to the batch while adding the sign transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the invalid TxHash i.e. odd number while getting the transaction hash on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(oddInvalidTxHash);

      assert.fail(
        "The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash."
      );
    } catch (e) {
      if (e.reason === "hex data is odd-length") {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the invalid TxHash i.e. even number while getting the transaction hash on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(evenInvalidTxHash);

      assert.fail(
        "The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash."
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the incorrect TxHash while getting the transaction hash on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(incorrectTxHash);

      assert.fail(
        "The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash."
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash."
        );
      }
    }
  });

  it("Regression: Perform the transfer native token with the incorrect TxHash while getting the transaction hash on the optimism network", async () => {
    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let transactionBatch;
    try {
      transactionBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: recipient,
        value: ethers.utils.parseEther(value),
      });
    } catch (e) {
      console.error(e);
      assert.fail("The addition of transaction in the batch is not performed.");
    }

    // get balance of the account address
    let balance;
    try {
      balance = await optimismMainNetSdk.getNativeBalance();
    } catch (e) {
      console.error(e);
      assert.fail("The balance of the native token is not displayed.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(pastTxHash);

      assert.fail(
        "The expected validation is not displayed when added the past TxHash while getting the transaction hash."
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the past TxHash while getting the transaction hash."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with invalid provider netowrk details while Getting the Decimal from ERC20 Contract on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        invalidProviderNetwork // invalid provider
      );
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();

      assert.fail(
        "The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract."
      );
    } catch (e) {
      if (e.reason === "could not detect network") {
        console.log(
          "The validation for Provider Network is displayed as expected while Getting the Decimal from ERC20 Contract."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token without provider netowrk details while Getting the Decimal from ERC20 Contract on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(); // without provider
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();

      assert.fail(
        "The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract."
      );
    } catch (e) {
      if (e.reason === "could not detect network") {
        console.log(
          "The validation for Provider Network is displayed as expected while Getting the Decimal from ERC20 Contract."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid Provider Network while Getting the Decimal from ERC20 Contract."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with other provider netowrk details while Getting the Decimal from ERC20 Contract on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(
        otherProviderNetwork // other provider
      );
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();

      assert.fail(
        "The expected validation is not displayed when entered the other Provider Network while Getting the Decimal from ERC20 Contract."
      );
    } catch (e) {
      if (e.code === "CALL_EXCEPTION") {
        console.log(
          "The validation for Provider Network is displayed as expected while Getting the Decimal from ERC20 Contract."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the other Provider Network while Getting the Decimal from ERC20 Contract."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with incorrect Token Address details while Getting the Decimal from ERC20 Contract on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(
        incorrectTokenAddress, // incorrect token address
        ERC20_ABI,
        provider
      );
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();

      assert.fail(
        "The expected validation is not displayed when entered the incorrect Token Address while Getting the Decimal from ERC20 Contract."
      );
    } catch (e) {
      if (e.reason === "bad address checksum") {
        console.log(
          "The validation for Token Address is displayed as expected while Getting the Decimal from ERC20 Contract."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the incorrect Token Address while Getting the Decimal from ERC20 Contract."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with invalid Token Address i.e. missing character details while Getting the Decimal from ERC20 Contract on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(
        invalidTokenAddress, // invalid token address
        ERC20_ABI,
        provider
      );
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();

      assert.fail(
        "The expected validation is not displayed when entered the invalid Token Address i.e. missing character while Getting the Decimal from ERC20 Contract."
      );
    } catch (e) {
      if (e.reason === "invalid address") {
        console.log(
          "The validation for Token Address is displayed as expected while Getting the Decimal from ERC20 Contract."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid Token Address i.e. missing character while Getting the Decimal from ERC20 Contract."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with null Token Address details while Getting the Decimal from ERC20 Contract on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(null, ERC20_ABI, provider); // null token address

      assert.fail(
        "The expected validation is not displayed when entered the null Token Address while Getting the Decimal from ERC20 Contract."
      );
    } catch (e) {
      if (e.reason === "invalid contract address or ENS name") {
        console.log(
          "The validation for Token Address is displayed as expected while Getting the Decimal from ERC20 Contract."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the null Token Address while Getting the Decimal from ERC20 Contract."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with incorrect transfer method name while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData(
        "transferr",
        [recipient, ethers.utils.parseUnits(value, decimals)]
      );

      assert.fail(
        "The expected validation is not displayed when entered the incorrect transfer method name while Getting the transferFrom encoded data."
      );
    } catch (e) {
      if (e.reason === "no matching function") {
        console.log(
          "The validation for transfer method name is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the incorrect transfer method name while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with invalid value while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(invalidValue, decimals), // invalid value
      ]);

      assert.fail(
        "The expected validation is not displayed when entered the invalid value while Getting the transferFrom encoded data."
      );
    } catch (e) {
      if (e.reason === "invalid decimal value") {
        console.log(
          "The validation for value is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid value while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with very small value while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(smallValue, decimals), // very small value
      ]);

      assert.fail(
        "The expected validation is not displayed when entered the very small value while Getting the transferFrom encoded data."
      );
    } catch (e) {
      if (e.reason === "fractional component exceeds decimals") {
        console.log(
          "The validation for value is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the very small value while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with exceeded value while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(exceededValue, decimals), // exceeded value
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The expected validation is not displayed when entered the exceeded value while Getting the transferFrom encoded data."
      );
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when entered the exceeded value while sign the added transactions to the batch."
      );
    } catch (e) {
      if (e.reason === "bad response") {
        console.log(
          "The validation for value is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the exceeded value while sign the added transactions to the batch."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token without value while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
      ]);

      assert.fail(
        "The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data."
      );
    } catch (e) {
      if (e.reason === "types/values length mismatch") {
        console.log(
          "The validation for value is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with incorrect recipient while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        incorrectRecipient, // incorrect recipient address
        ethers.utils.parseUnits(value, decimals),
      ]);

      assert.fail(
        "The expected validation is not displayed when entered the incorrect recipient while Getting the transferFrom encoded data."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("bad address checksum")) {
        console.log(
          "The validation for Recipient is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the incorrect recipient while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with invalid recipient i.e. missing character while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        invalidRecipient, // invalid recipient address
        ethers.utils.parseUnits(value, decimals),
      ]);

      assert.fail(
        "The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("invalid address")) {
        console.log(
          "The validation for Recipient is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data."
        );
      }
    }
  });

  xit("REGRESSION: Perform the transfer ERC20 token with same recipient i.e. sender address while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        sender, // same recipient address
        ethers.utils.parseUnits(value, decimals),
      ]);

      assert.fail(
        "The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("invalid address")) {
        console.log(
          "The validation for Recipient is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid recipient while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token without recipient while Getting the transferFrom encoded data on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        ethers.utils.parseUnits(value, decimals),
      ]);

      assert.fail(
        "The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data."
      );
    } catch (e) {
      if (e.reason === "types/values length mismatch") {
        console.log(
          "The validation for value is displayed as expected while Getting the transferFrom encoded data."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when not entered the value while Getting the transferFrom encoded data."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with the incorrect To Address while adding transactions to the batch on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: incorrectTokenAddress, // Incorrect Token Address
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
      assert.fail(
        "The expected validation is not displayed when entered the incorrect Token Address while sign the added transactions to the batch."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("bad address checksum")) {
        console.log(
          "The validation for Token Address is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the incorrect Token Address while sign the added transactions to the batch."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with the invalid Token Address i.e. missing character while adding transactions to the batch on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: invalidTokenAddress, // Invalid Token Address
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
      assert.fail(
        "The expected validation is not displayed when entered the invalid Token Address while sign the added transactions to the batch."
      );
    } catch (e) {
      let error = e.reason;
      if (error.includes("invalid address")) {
        console.log(
          "The validation for Token Address is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the invalid Token Address while sign the added transactions to the batch."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token with the null Token Address while adding transactions to the batch on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: null, // Null Token Address
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when entered the null Token Address while sign the added transactions to the batch."
      );
    } catch (e) {
      if (e.reason.includes("invalid address")) {
        console.log(
          "The validation for Token Address is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when entered the null Token Address while sign the added transactions to the batch."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token without Token Address while adding transactions to the batch on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        data: transactionData, // without tokenAddress
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when not entered the Token Address while sign the added transactions to the batch."
      );
    } catch (e) {
      if (e.reason.includes("invalid address")) {
        console.log(
          "The validation for Token Address is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when not entered the Token Address while sign the added transactions to the batch."
        );
      }
    }
  });

  it("REGRESSION: Perform the transfer ERC20 token without transactionData while adding transactions to the batch on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: tokenAddress, // without transactionData
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when not entered the transactionData while sign the added transactions to the batch."
      );
    } catch (e) {
      if (e.reason === "bad response") {
        console.log(
          "The validation for transactionData is displayed as expected while sign the added transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when not entered the transactionData while sign the added transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer ERC20 token without adding transaction to the batch while sign the added transactions to the batch on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();

      assert.fail(
        "The expected validation is not displayed when not added the transaction to the batch while adding the sign transactions to the batch."
      );
    } catch (e) {
      if (e.message === "cannot sign empty transaction batch") {
        console.log(
          "The validation for transaction batch is displayed as expected while adding the sign transactions to the batch."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when not added the transaction to the batch while adding the sign transactions to the batch."
        );
      }
    }
  });

  it("Regression: Perform the transfer ERC20 token with the invalid TxHash i.e. odd number while getting the transaction hash on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(uoHash);

      assert.fail(
        "The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash."
      );
    } catch (e) {
      if (e.reason === "hex data is odd-length") {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the invalid TxHash i.e. odd number while getting the transaction hash."
        );
      }
    }
  });

  it("Regression: Perform the transfer ERC20 token with the invalid TxHash i.e. even number while getting the transaction hash on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(uoHash);

      assert.fail(
        "The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash."
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the invalid TxHash i.e. even number while getting the transaction hash."
        );
      }
    }
  });

  it("Regression: Perform the transfer ERC20 token with the incorrect TxHash while getting the transaction hash on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(uoHash);

      assert.fail(
        "The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash."
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the incorrect TxHash while getting the transaction hash."
        );
      }
    }
  });

  it("Regression: Perform the transfer ERC20 token with the past TxHash while getting the transaction hash on the optimism network", async () => {
    let provider;
    try {
      provider = new ethers.providers.JsonRpcProvider(providerNetwork);
    } catch (e) {
      console.error(e);
      assert.fail("The provider response is not displayed correctly.");
    }

    // get erc20 Contract Interface
    let erc20Instance;
    try {
      erc20Instance = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    } catch (e) {
      console.error(e);
      assert.fail("The get erc20 Contract Interface is not performed.");
    }

    // get decimals from erc20 contract
    let decimals;
    try {
      decimals = await erc20Instance.functions.decimals();
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // get transferFrom encoded data
    let transactionData;
    try {
      transactionData = erc20Instance.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(value, decimals),
      ]);
    } catch (e) {
      console.error(e);
      assert.fail(
        "The decimals from erc20 contract is not displayed correctly."
      );
    }

    // clear the transaction batch
    try {
      await optimismMainNetSdk.clearUserOpsFromBatch();
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // add transactions to the batch
    let userOpsBatch;
    try {
      userOpsBatch = await optimismMainNetSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: transactionData,
      });
    } catch (e) {
      console.error(e);
      assert.fail("The transaction of the batch is not clear correctly.");
    }

    // sign transactions added to the batch
    let op;
    try {
      op = await optimismMainNetSdk.sign();
    } catch (e) {
      console.error(e);
      assert.fail("The sign transactions added to the batch is not performed.");
    }

    // get transaction hash
    try {
      console.log("Waiting for transaction...");
      await optimismMainNetSdk.getUserOpReceipt(uoHash);

      assert.fail(
        "The expected validation is not displayed when added the past TxHash while getting the transaction hash."
      );
    } catch (e) {
      if (e.showDiff === false) {
        console.log(
          "The validation for transaction is displayed as expected while getting the transaction hash."
        );
      } else {
        console.error(e);
        assert.fail(
          "The expected validation is not displayed when added the past TxHash while getting the transaction hash."
        );
      }
    }
  });
});
