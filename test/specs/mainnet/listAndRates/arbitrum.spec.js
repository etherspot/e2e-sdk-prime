import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { utils } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let arbitrumMainNetSdk;
let arbitrumEtherspotWalletAddress;
let arbitrumNativeAddress = null;
let arbitrumDataService;
let runTest;

describe('The PrimeSDK, when get the NFT List, Token List and Exchange Rates details with arbitrum network on the MainNet', function () {
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
        console.error(e.message);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(
          'The Etherspot Wallet Address is not displayed successfully.',
        );
      }

      // initializating Data service...
      try {
        arbitrumDataService = new DataUtils(
          process.env.DATA_API_KEY
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

  it('SMOKE: Validate the NFT List on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let nfts;
        try {
          nfts = await arbitrumDataService.getNftList({
            chainId: Number(data.arbitrum_chainid),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE NFT LIST ON THE arbitrum NETWORK',
      );
    }
  });

  it('SMOKE: Validate the Token List on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let tokenLists;
        let tokenListTokens;
        let name;
        try {
          tokenLists = await arbitrumDataService.getTokenLists({ chainId: data.arbitrum_chainid });
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
          } else {
            console.log('The items are not available in the tokenLists list.');
          }

          tokenListTokens = await arbitrumDataService.getTokenListTokens({ chainId: data.arbitrum_chainid });

          if (tokenListTokens.length > 0) {
            console.log('The tokens are available in the token list tokens.');
            addContext(
              test,
              'The tokens are available in the token list tokens.',
            );

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

          tokenListTokens = await arbitrumDataService.getTokenListTokens({
            chainId: data.arbitrum_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE TOKEN LIST ON THE arbitrum NETWORK',
      );
    }
  });

  it('SMOKE: Validate the Exchange Rates on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;
        try {
          TOKEN_LIST = [data.tokenAddress_arbitrumUSDC, data.tokenAddress_arbitrumUSDT];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.arbitrum_chainid),
          };

          rates = await arbitrumDataService.fetchExchangeRates(requestPayload);

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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with invalid account address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await arbitrumDataService.getNftList({
            chainId: Number(data.arbitrum_chainid),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INVALID ACCOUNT ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the NFT List with incorrect account address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          await arbitrumDataService.getNftList({
            chainId: Number(data.arbitrum_chainid),
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE HISTORY OF THE NFT LIST WITH INCORRECT ACCOUNT ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Token List with different argument in the on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let tokenLists;
        let tokenListTokens;
        // let name;
        let endpoint;
        try {
          tokenLists = await arbitrumDataService.getTokenLists({ chainId: data.arbitrum_chainid });
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
          } else {
            console.log('The items are not available in the tokenLists list.');
          }

          tokenListTokens = await arbitrumDataService.getTokenListTokens({ chainId: data.arbitrum_chainid });

          if (tokenListTokens.length > 0) {
            console.log('The tokens are available in the token list tokens.');
            addContext(
              test,
              'The tokens are available in the token list tokens.',
            );

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

          tokenListTokens = await arbitrumDataService.getTokenListTokens({
            chainId: data.arbitrum_chainid,
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE TOKEN LIST ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with other token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;
        try {
          TOKEN_LIST = [
            data.tokenAddress_arbitrumUSDC,
            data.tokenAddress_arbitrumUSDT,
            data.tokenAddress_maticUSDC,
          ];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.arbitrum_chainid),
          };

          rates = await arbitrumDataService.fetchExchangeRates(requestPayload);

        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The respective validate is displayed with other Token Address while fetching the exchange rates.',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with invalid token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;
        try {
          TOKEN_LIST = [
            data.invalidTokenAddress_arbitrumUSDC,
            data.tokenAddress_arbitrumUSDT,
          ];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.arbitrum_chainid),
          };

          rates = await arbitrumDataService.fetchExchangeRates(requestPayload);

          assert.fail(
            'The list of rates are displayed with invalid Token Address while fetching the exchange rates',
          );
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Cannot set properties of undefined')) {
            console.log(
              'The correct validation is displayed with invalid Token Address while fetching the exchange rates.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed with invalid Token Address while fetching the exchange rates.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with incorrect token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;

        try {
          TOKEN_LIST = [
            data.incorrectTokenAddress_arbitrumUSDC,
            data.tokenAddress_arbitrumUSDT,
          ];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.arbitrum_chainid),
          };

          rates = await arbitrumDataService.fetchExchangeRates(requestPayload);

          assert.fail(
            'The list of rates are displayed with incorrect Token Address while fetching the exchange rates',
          );

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Cannot set properties of undefined')) {
            console.log(
              'The correct validation is displayed with incorrect Token Address while fetching the exchange rates.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed with incorrect Token Address while fetching the exchange rates.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates without token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        try {
          let TOKEN_LIST = [];

          let requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.arbitrum_chainid),
          };

          await arbitrumDataService.fetchExchangeRates(requestPayload);

          assert.fail(
            'The list of rates are displayed when not added the token address while fetching the exchange rates',
          );
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
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates with invalid chainid on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let requestPayload;

        try {
          TOKEN_LIST = [data.tokenAddress_arbitrumUSDC, data.tokenAddress_arbitrumUSDT];

          requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.invalid_arbitrum_chainid),
          };

          await arbitrumDataService.fetchExchangeRates(requestPayload);

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Cannot set properties of undefined')) {
            console.log(
              'The correct validation is displayed invalid ChainID while fetching the exchange rates.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed invalid ChainID while fetching the exchange rates.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange Rates without chainid on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let TOKEN_LIST;
        let rates;
        let requestPayload;

        try {
          TOKEN_LIST = [data.tokenAddress_arbitrumUSDC, data.tokenAddress_arbitrumUSDT];

          requestPayload = {
            tokens: TOKEN_LIST,
          };

          rates = await arbitrumDataService.fetchExchangeRates(requestPayload);

          assert.fail(
            'The list of rates are displayed without ChainID while fetching the exchange rates',
          );

        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes('Cannot set properties of undefined')) {
            console.log(
              'The correct validation is displayed without ChainID while fetching the exchange rates.',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed without ChainID while fetching the exchange rates.',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE RATE ON THE arbitrum NETWORK',
      );
    }
  });
});
