import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { createSmartAccountClient } from 'permissionless';
import { toTrustSmartAccount } from 'permissionless/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { http, createPublicClient, parseEther } from 'viem';
import addContext from 'mochawesome/addContext.js';
import { assert } from 'chai';
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import {
  mainnet,
  sepolia,
  polygonAmoy,
  baseSepolia,
  base,
  opBNB,
  avalanche,
} from 'viem/chains';

describe('Perform the transaction of the tokens on trust wallet', function () {
  it('SMOKE: Perform the transfer native token on trust wallet with valid details', async function () {
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
    let remoteBundlerUrl = `https://rpc.etherspot.io/v1/11155111?api-key=${process.env.BUNDLER_API_KEY}`;

    // Create the required clients.
    let publicClient;
    try {
      publicClient = createPublicClient({
        transport: http(remoteBundlerUrl),
        chain: sepolia,
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

      console.log('trust account ', trustAccount);
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

  it.only('REGRESSION: Perform the transfer native token on trust wallet with invalid bunder url', async function () {
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
    let remoteBundlerUrl = `http://rpc.etherspot.io/v1/11155111?api-key=${process.env.BUNDLER_API_KEY}`; // invalid url

    // Create the required clients.
    let publicClient;
    try {
      publicClient = createPublicClient({
        transport: http(remoteBundlerUrl),
        chain: sepolia,
      });
    } catch (e) {
      console.error('error-publicClient:::::::::::', e);

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

      console.log('trust account ', trustAccount);
    } catch (e) {
      console.error('error-trustAccount:::::::::::', e);

      if (e.shortMessage === constant.trustWallet_1) {
        addContext(test, message.vali_connext_2);
        console.log(message.vali_connext_2);
      } else {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_connext_7);
      }

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
      console.error('error-smartAccountClient:::::::::::', e);
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
      console.error('error-userOp:::::::::::', e);
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail(message.fail_trustwallet_5);
    }
  });
});
