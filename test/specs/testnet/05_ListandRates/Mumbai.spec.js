import { PrimeSdk } from '@etherspot/prime-sdk';
import { utils } from 'ethers';
import { assert } from 'chai';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import addContext from 'mochawesome/addContext.js';
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let mumbaiTestNetSdk;
let mumbaiEtherspotWalletAddress;
let mumbaiNativeAddress = null;
let runTest;

describe('The PrimeSDK, when get the NFT List, Token List and Exchange Rates details with mumbai network on the MainNet', function () {
  beforeEach(async function () {
    var test = this;

    // initializating sdk
    try {
      mumbaiTestNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.MUMBAI_CHAINID),
          projectKey: process.env.PROJECT_KEY,
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

  it('SMOKE: Validate the NFT List on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let nfts;
        try {
          nfts = await mumbaiTestNetSdk.getNftList({
            chainId: Number(process.env.MUMBAI_CHAINID),
            account: data.sender,
          });

          if (nfts.items.length > 0) {
            console.log('The items are available in the NFT list.');

            try {
              assert.isNotEmpty(
                nfts.items[0].contractName,
                'The contractName value is empty in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].contractAddress,
                'The contractAddress value is empty in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].tokenType,
                'The tokenType value is empty in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                nfts.items[0].balance,
                'The balance value is not number in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].items[0].tokenId,
                'The tokenId value of the items is empty in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].items[0].name,
                'The name value of the items is empty in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                nfts.items[0].items[0].amount,
                'The amount value of the items is not number in the NFT list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log('The items are not available in the NFT list.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The get NFT list is not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE NFT LIST ON THE mumbai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the Token List on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let tokenLists;
        let tokenListTokens;
        let name;
        try {
          tokenLists = await mumbaiTestNetSdk.getTokenLists();
          name = tokenLists[0].name;

          if (tokenLists.length > 0) {
            console.log('The items are available in the token list.');
            addContext(test, 'The items are available in the token list.');

            try {
              assert.isNotEmpty(
                tokenLists[0].name,
                'The name value is empty in the token list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenLists[0].endpoint,
                'The endpoint value is empty in the token list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenLists[0].__typename,
                'The __typename value is empty in the token list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log('The items are not available in the tokenLists list.');
          }

          tokenListTokens = await mumbaiTestNetSdk.getTokenListTokens();

          if (tokenListTokens.length > 0) {
            console.log('The tokens are available in the token list tokens.');
            addContext(
              test,
              'The tokens are available in the token list tokens.',
            );

            try {
              assert.isNotEmpty(
                tokenListTokens[0].__typename,
                'The __typename value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].address,
                'The address value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].name,
                'The name value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].symbol,
                'The symbol value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].decimals,
                'The decimals value is not number in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].logoURI,
                'The logoURI value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].chainId,
                'The chainId value is not number in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log(
              'The Tokens are not available in the tokenListTokens list.',
            );
          }

          tokenListTokens = await mumbaiTestNetSdk.getTokenListTokens({
            name,
          });

          if (tokenListTokens.length > 0) {
            console.log(
              `${name} token list tokens length: ` + tokenListTokens.length,
            );
            addContext(
              test,
              `${name} token list tokens length: ` + tokenListTokens.length,
            );

            try {
              assert.isNotEmpty(
                tokenListTokens[0].__typename,
                'The __typename value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].address,
                'The address value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].name,
                'The name value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].symbol,
                'The symbol value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].decimals,
                'The decimals value is not number in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].logoURI,
                'The logoURI value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].chainId,
                'The chainId value is not number in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log(
              'The Tokens are not available in the tokenListTokens list.',
            );
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The get token list is not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE TOKEN LIST ON THE mumbai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the Exchange Rates on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;
        try {
          TOKEN_LIST = [data.tokenAddress_mumbaiUSDC];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(process.env.MUMBAI_CHAINID),
          };

          rates = await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);

          for (let i = 0; i < rates.items.length; i++) {
            try {
              assert.isNotEmpty(
                rates.items[i].address,
                'The address value is empty in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].eth,
                'The eth value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].eur,
                'The eur value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].gbp,
                'The gbp value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].usd,
                'The usd value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.strictEqual(
                rates.items[i].__typename,
                'RateInfo',
                'The __typename value is empty in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          }

          try {
            assert.strictEqual(
              rates.__typename,
              'RateData',
              'The __typename value is empty in the rate list response.',
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
          assert.fail('The fetch exchange rates are not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with invalid chainid on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await mumbaiTestNetSdk.getNftList({
            chainId: process.env.INVALID_mumbai_CHAINID,
            account: data.sender,
          });

          assert.fail(
            'Validate the NFT List with invalid chainid is performed',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'chainId') {
            console.log(
              'The correct validation is displayed while getting the NFT list with invalid chainid',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed for the NFT List with invalid chainid',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INVALID CHAINID ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with invalid account address on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await mumbaiTestNetSdk.getNftList({
            chainId: Number(process.env.MUMBAI_CHAINID),
            account: data.invalidSender,
          });

          assert.fail(
            'Validate the NFT List with invalid account address is performed',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'account') {
            console.log(
              'The correct validation is displayed while getting the NFT list with invalid account address',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed for the NFT List with invalid account address',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INVALID ACCOUNT ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with incorrect account address on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await mumbaiTestNetSdk.getNftList({
            chainId: Number(process.env.MUMBAI_CHAINID),
            account: data.incorrectSender,
          });
          assert.fail(
            'Validate the NFT List with inncorrect account address is performed',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'account') {
            console.log(
              'The correct validation is displayed while getting the NFT list with inncorrect account address',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed for the NFT List with incorrect account address',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INCORRECT ACCOUNT ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Token List with different argument in the on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let tokenLists;
        let tokenListTokens;
        // let name;
        let endpoint;
        try {
          tokenLists = await mumbaiTestNetSdk.getTokenLists();
          endpoint = tokenLists[0].endpoint;

          if (tokenLists.length > 0) {
            console.log('The items are available in the token list.');
            addContext(test, 'The items are available in the token list.');

            try {
              assert.isNotEmpty(
                tokenLists[0].name,
                'The name value is empty in the token list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenLists[0].endpoint,
                'The endpoint value is empty in the token list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenLists[0].__typename,
                'The __typename value is empty in the token list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log('The items are not available in the tokenLists list.');
          }

          tokenListTokens = await mumbaiTestNetSdk.getTokenListTokens();

          if (tokenListTokens.length > 0) {
            console.log('The tokens are available in the token list tokens.');
            addContext(
              test,
              'The tokens are available in the token list tokens.',
            );

            try {
              assert.isNotEmpty(
                tokenListTokens[0].__typename,
                'The __typename value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].address,
                'The address value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].name,
                'The name value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].symbol,
                'The symbol value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].decimals,
                'The decimals value is not number in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].logoURI,
                'The logoURI value is empty in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].chainId,
                'The chainId value is not number in the token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log(
              'The Tokens are not available in the tokenListTokens list.',
            );
          }

          tokenListTokens = await mumbaiTestNetSdk.getTokenListTokens({
            endpoint,
          });

          if (tokenListTokens.length > 0) {
            console.log(
              `${endpoint} token list tokens length: ` + tokenListTokens.length,
            );
            addContext(
              test,
              `${endpoint} token list tokens length: ` + tokenListTokens.length,
            );

            try {
              assert.isNotEmpty(
                tokenListTokens[0].__typename,
                'The __typename value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].address,
                'The address value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].name,
                'The name value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].symbol,
                'The symbol value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].decimals,
                'The decimals value is not number in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].logoURI,
                'The logoURI value is empty in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].chainId,
                'The chainId value is not number in the selected token list token response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.log(
              'The Tokens are not available in the tokenListTokens list.',
            );
          }
        } catch (e) {
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The get token list is not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE TOKEN LIST ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with other token address on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;
        try {
          TOKEN_LIST = [
            data.tokenAddress_mumbaiUSDC,
            data.tokenAddress_maticUSDC,
          ];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(process.env.MUMBAI_CHAINID),
          };

          rates = await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);

          for (let i = 0; i < rates.items.length; i++) {
            try {
              assert.isNotEmpty(
                rates.items[i].address,
                'The address value is empty in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].eth,
                'The eth value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].eur,
                'The eur value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].gbp,
                'The gbp value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].usd,
                'The usd value is not number in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.strictEqual(
                rates.items[i].__typename,
                'RateInfo',
                'The __typename value is empty in the rate list response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          }

          try {
            assert.strictEqual(
              rates.__typename,
              'RateData',
              'The __typename value is empty in the rate list response.',
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
          assert.fail('The fetch exchange rates are not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with invalid token address on the mumbai network*', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let TOKEN_LIST = [data.invalidTokenAddress_mumbaiUSDC];

          let requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(process.env.MUMBAI_CHAINID),
          };

          await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);

          assert.fail(
            'The fetchExchangeRates is passed with invalid token address',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The fetch exchange rates are not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with incorrect token address on the mumbai network*', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let TOKEN_LIST = [data.incorrectTokenAddress_mumbaiUSDC];

          let requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(process.env.MUMBAI_CHAINID),
          };

          await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);

          assert.fail(
            'The fetchExchangeRates is passed with incorrect token address',
          );
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The fetch exchange rates are not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates without token address on the mumbai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let TOKEN_LIST = [];

          let requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(process.env.MUMBAI_CHAINID),
          };

          await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);
        } catch (e) {
          let error = e.message;
          if (error.includes('Cannot set properties of undefined')) {
            console.log(
              'The correct validation is displayed when not added the token address while fetching the exchnage rates',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when not added the token address while fetching the exchnage rates',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with invalid chainid on the mumbai network*', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let TOKEN_LIST = [data.tokenAddress_mumbaiUSDC];

          let requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(process.env.INVALID_MUMBAI_CHAINID),
          };

          await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);

          assert.fail('The fetchExchangeRates is passed with invalid chainid');
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The fetch exchange rates are not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates without chainid on the mumbai network*', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let TOKEN_LIST = [data.tokenAddress_mumbaiUSDC];

          let requestPayload = {
            tokens: TOKEN_LIST,
          };

          await mumbaiTestNetSdk.fetchExchangeRates(requestPayload);

          assert.fail('The fetchExchangeRates is passed without chainid');
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail('The fetch exchange rates are not performed correctly.');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE mumbai NETWORK',
      );
    }
  });
});
