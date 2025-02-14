import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { createSmartAccountClient } from 'permissionless';
import { toTrustSmartAccount } from 'permissionless/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { http, createPublicClient, parseEther } from 'viem';
import addContext from 'mochawesome/addContext.js';
import { assert } from 'chai';
import constant from '../../data/constant.json' assert { type: 'json' };
import message from '../../data/messages.json' assert { type: 'json' };
import helper from '../../utils/helper.js';
import data from '../../data/testData.json' assert { type: 'json' };
import { mainnet } from 'viem/chains';

const chainData = {
  Avalanche: 43114,
  Arbitrum: 42161,
  Base: 8453,
  Ethereum: 1,
  Polygon: 137,
  Optimism: 10,
  BSC: 56,
  opBNB: 204,
};

describe('Perform the transaction of the tokens on trust wallet with multi chains', function () {
  Object.entries(chainData).forEach(function ([chainName, chainId]) {
    describe(`${chainName} Chain Tests (Chain ID: ${chainId})`, function () {
      it(`SMOKE: Perform the transfer of the native token on trust wallet with valid details the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);

          try {
            assert.isNotEmpty(
              signer.address,
              message.vali_trustwallet_signer_address
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
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });

          try {
            assert.isNotEmpty(
              smartAccountClient,
              message.vali_trustwallet_smartAccountClient
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
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                value: parseEther(data.value),
              },
            ],
          });

          try {
            assert.isNotEmpty(
              smartAccountClient,
              message.vali_trustwallet_sendUserOperation
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
          assert.fail(message.fail_trustwallet_5);
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with invalid bunder url the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }
        // get the remote bundler url
        let remoteBundlerUrl = `http://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`; // invalid url

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });

          addContext(test, message.fail_trustwallet_7);
          console.log(message.fail_trustwallet_7);
        } catch (e) {
          const error = e.shortMessage;

          if (error.includes(constant.trustWallet_1)) {
            addContext(test, message.vali_trustwallet_7);
            console.log(message.vali_trustwallet_7);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_7);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with incorrect bunder url the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }
        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.ethersport.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`; // incorrect url

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });

          addContext(test, message.fail_trustwallet_8);
          console.log(message.fail_trustwallet_8);
        } catch (e) {
          const error = e.shortMessage;

          if (error.includes(constant.trustWallet_1)) {
            addContext(test, message.vali_trustwallet_8);
            console.log(message.vali_trustwallet_8);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_8);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with invalid api key the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }
        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${data.invalid_bundler_apikey}`; // invalid api key

        // Create the required clients
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });

          addContext(test, message.fail_trustwallet_9);
          console.log(message.fail_trustwallet_9);
        } catch (e) {
          const error = e.shortMessage;

          if (error.includes(constant.trustWallet_1)) {
            addContext(test, message.vali_trustwallet_9);
            console.log(message.vali_trustwallet_9);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_9);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with incorrect api key the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }
        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${data.incorrect_bundler_apikey}`; // incorrect api key

        // Create the required clients
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });

          addContext(test, message.fail_trustwallet_10);
          console.log(message.fail_trustwallet_10);
        } catch (e) {
          const error = e.shortMessage;

          if (error.includes(constant.trustWallet_1)) {
            addContext(test, message.vali_trustwallet_10);
            console.log(message.vali_trustwallet_10);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_10);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without api key the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }
        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/11155111`; // without api key

        // Create the required clients
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });

          addContext(test, message.fail_trustwallet_11);
          console.log(message.fail_trustwallet_11);
        } catch (e) {
          const error = e.shortMessage;

          if (error.includes(constant.trustWallet_1)) {
            addContext(test, message.vali_trustwallet_11);
            console.log(message.vali_trustwallet_11);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_11);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with invalid chain while creating the public client the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: 'qwert',
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                value: parseEther(data.value),
              },
            ],
          });

          addContext(test, message.vali_trustwallet_12);
          console.log(message.vali_trustwallet_12);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_2)) {
            addContext(test, message.vali_trustwallet_12);
            console.log(message.vali_trustwallet_12);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_12);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with other chain while creating the public client the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                value: parseEther(data.value),
              },
            ],
          });

          addContext(test, message.vali_trustwallet_13);
          console.log(message.vali_trustwallet_13);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_3)) {
            addContext(test, message.vali_trustwallet_13);
            console.log(message.vali_trustwallet_13);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_13);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without chain while creating the public client the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                value: parseEther(data.value),
              },
            ],
          });

          addContext(test, message.vali_trustwallet_14);
          console.log(message.vali_trustwallet_14);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_14);
            console.log(message.vali_trustwallet_14);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_14);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without transport while creating the public client the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            chain: mainnet,
          });
          addContext(test, message.vali_trustwallet_15);
          console.log(message.vali_trustwallet_15);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_5)) {
            addContext(test, message.vali_trustwallet_15);
            console.log(message.vali_trustwallet_15);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_15);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without client while utilizing the toTrustSmartAccount function the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            owner: signer, // without client
          });

          addContext(test, message.vali_trustwallet_16);
          assert.fail(message.vali_trustwallet_16);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_16);
            console.log(message.vali_trustwallet_16);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_16);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without owner while utilizing the toTrustSmartAccount function the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient, // without owner
          });

          addContext(test, message.vali_trustwallet_17);
          assert.fail(message.vali_trustwallet_17);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_17);
            console.log(message.vali_trustwallet_17);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_17);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without account while creating the smart account client the ${chainName} network`, async function () {
        var test = this;

        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            // without account
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
          addContext(test, message.vali_trustwallet_18);
          assert.fail(message.fail_trustwallet_18);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_18);
            console.log(message.vali_trustwallet_18);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_18);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without chain while creating the smart account client the ${chainName} network`, async function () {
        var test = this;

        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount, // without chain
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
          addContext(test, message.vali_trustwallet_19);
          assert.fail(message.fail_trustwallet_19);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_19);
            console.log(message.vali_trustwallet_19);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_19);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with invalid method while creating the smart account client the ${chainName} network`, async function () {
        var test = this;

        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGas',
                });
              },
            },
          });
          addContext(test, message.vali_trustwallet_20);
          assert.fail(message.fail_trustwallet_20);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_20);
            console.log(message.vali_trustwallet_20);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_20);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without method while creating the smart account client the ${chainName} network`, async function () {
        var test = this;

        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({});
              },
            },
          });
          addContext(test, message.vali_trustwallet_20);
          assert.fail(message.fail_trustwallet_20);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_20);
            console.log(message.vali_trustwallet_20);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_20);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without middleware while creating the smart account client the ${chainName} network`, async function () {
        var test = this;

        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
          });
          addContext(test, message.vali_trustwallet_21);
          assert.fail(message.fail_trustwallet_21);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_21);
            console.log(message.vali_trustwallet_21);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_21);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without bundlerTransport while creating the smart account client the ${chainName} network`, async function () {
        var test = this;

        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient, // without bundlerTransport
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
          addContext(test, message.vali_trustwallet_22);
          assert.fail(message.fail_trustwallet_22);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_4)) {
            addContext(test, message.vali_trustwallet_22);
            console.log(message.vali_trustwallet_22);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_22);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with invalid sender address while sending the user operation the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.invalidSender, // invalid sender address
                value: parseEther(data.value),
              },
            ],
          });
          addContext(test, message.vali_trustwallet_23);
          assert.fail(message.fail_trustwallet_23);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_6)) {
            addContext(test, message.vali_trustwallet_23);
            console.log(message.vali_trustwallet_23);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_23);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with incorrect sender address while sending the user operation the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.incorrectSender, // incorrect sender address
                value: parseEther(data.value),
              },
            ],
          });
          addContext(test, message.vali_trustwallet_24);
          assert.fail(message.fail_trustwallet_24);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_6)) {
            addContext(test, message.vali_trustwallet_24);
            console.log(message.vali_trustwallet_24);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_24);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without sender address while sending the user operation the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                // without sender address
                value: parseEther(data.value),
              },
            ],
          });
          addContext(test, message.vali_trustwallet_25);
          assert.fail(message.fail_trustwallet_25);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_6)) {
            addContext(test, message.vali_trustwallet_25);
            console.log(message.vali_trustwallet_25);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_25);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with incorrect sender address while sending the user operation the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                value: parseEther(data.invalidValue), // invalid value
              },
            ],
          });
          addContext(test, message.vali_trustwallet_26);
          assert.fail(message.fail_trustwallet_26);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_7)) {
            addContext(test, message.vali_trustwallet_26);
            console.log(message.vali_trustwallet_26);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_26);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet with exceeded value while sending the user operation the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                value: parseEther(data.exceededValue), // exceeded value
              },
            ],
          });
          addContext(test, message.vali_trustwallet_27);
          assert.fail(message.fail_trustwallet_27);
        } catch (e) {
          const error = e.message;

          if (error.includes(constant.trustWallet_8)) {
            addContext(test, message.vali_trustwallet_27);
            console.log(message.vali_trustwallet_27);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_27);
          }
        }
      });

      it(`REGRESSION: Perform the transfer of the native token on trust wallet without value while sending the user operation the ${chainName} network`, async function () {
        var test = this;
        // get the address details
        let signer;
        try {
          signer = privateKeyToAccount(process.env.PRIVATE_KEY);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_1);
        }

        // get the remote bundler url
        let remoteBundlerUrl = `https://rpc.etherspot.io/v1/${chainId}?api-key=${process.env.BUNDLER_API_KEY}`;

        // Create the required clients.
        let publicClient;
        try {
          publicClient = createPublicClient({
            transport: http(remoteBundlerUrl),
            chain: mainnet,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_2);
        }

        let trustAccount;
        try {
          trustAccount = await toTrustSmartAccount({
            client: publicClient,
            owner: signer,
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_3);
        }

        let smartAccountClient;
        try {
          smartAccountClient = createSmartAccountClient({
            account: trustAccount,
            chain: publicClient,
            bundlerTransport: http(remoteBundlerUrl),
            middleware: {
              gasPrice() {
                return publicClient.request({
                  method: 'skandha_getGasPrice',
                });
              },
            },
          });
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_trustwallet_4);
        }

        try {
          const userOp = await smartAccountClient.sendUserOperation({
            calls: [
              {
                to: data.sender,
                // without value
              },
            ],
          });
          addContext(test, message.vali_trustwallet_28);
          assert.fail(message.fail_trustwallet_28);
        } catch (e) {
          const error = e.message;

          // TODO: ADD VALIDATION MESSAGE

          if (error.includes(constant.trustWallet_8)) {
            addContext(test, message.vali_trustwallet_28);
            console.log(message.vali_trustwallet_28);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_trustwallet_28);
          }
        }
      });
    });
  });
});
