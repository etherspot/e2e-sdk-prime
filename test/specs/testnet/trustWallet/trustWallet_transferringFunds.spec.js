import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { createSmartAccountClient } from 'permissionless';
import { toTrustSmartAccount } from 'permissionless/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { http, createPublicClient, parseEther } from 'viem';
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
    // get the address details
    try {
      let signer = privateKeyToAccount(process.env.PRIVATE_KEY);
      console.log('signer ', signer);
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('An error occurred while getting the address details');
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
      console.log('publicClient ', publicClient);
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('An error occurred while creating the required clients');
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
      assert.fail('An error occurred in the trust account response');
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

      console.log(`smartAccountClient ${smartAccountClient.account.address}`);
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('An error occurred in the smart account client response');
    }

    try {
      const userOp = await smartAccountClient.sendUserOperation({
        calls: [
          {
            to: '0x09FD4F6088f2025427AB1e89257A44747081Ed59',
            value: parseEther('0.0000001'),
          },
        ],
      });

      console.log('userOp ', userOp);
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('An error occurred in the user operation response');
    }
  });
});
