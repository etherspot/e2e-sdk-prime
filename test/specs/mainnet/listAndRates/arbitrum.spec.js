import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { utils } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };

let arbitrumMainNetSdk;
let arbitrumEtherspotWalletAddress;
let arbitrumNativeAddress = null;
let arbitrumDataService;
let runTest;

describe('The PrimeSDK, when get the NFT List, Token List and Exchange Rates details with arbitrum network on the MainNet', function () {
  before(async function () {
    var test = this;

    await customRetryAsync(async function () {

      helper.wait(data.longTimeout);

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
        arbitrumEtherspotWalletAddress =
          await arbitrumMainNetSdk.getCounterFactualAddress();

        try {
          assert.strictEqual(
            arbitrumEtherspotWalletAddress,
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
        assert.fail(message.fail_smart_address);
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
        assert.fail(message.fail_data_service);
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
        assert.fail(message.fail_wallet_balance);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  it('SMOKE: Validate the NFT List on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.longTimeout);

        let nfts;
        try {
          nfts = await arbitrumDataService.getNftList({
            chainId: Number(data.arbitrum_chainid),
            account: data.sender,
          });

          if (nfts.items.length > 0) {
            addContext(test, message.pass_nft_list_1)
            console.log(message.pass_nftList_1);

            try {
              assert.isNotEmpty(
                nfts.items[0].contractName,
                message.vali_nftList_contractName,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].contractAddress,
                message.vali_nftList_contractAddress,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].tokenType,
                message.vali_nftList_tokenType
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                nfts.items[0].balance,
                message.vali_nftList_balance
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].items[0].tokenId,
                message.vali_nftList_items_tokenId
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                nfts.items[0].items[0].name,
                message.vali_nftList_items_name,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                nfts.items[0].items[0].amount,
                message.vali_nftList_items_amount,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            addContext(test, message.pass_nftList_2)
            console.log(message.pass_nftList_2);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_nftList_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.nftList_insufficientBalance);
    }
  });

  it('SMOKE: Validate the Token List on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.longTimeout);

        let tokenLists;
        let tokenListTokens;
        try {
          tokenLists = await arbitrumDataService.getTokenLists({ chainId: data.arbitrum_chainid });

          if (tokenLists.length > 0) {
            console.log(message.pass_tokenList_1);
            addContext(test, message.pass_tokenList_1);

            try {
              assert.isNotEmpty(
                tokenLists[0].name,
                message.vali_tokenList_name,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenLists[0].endpoint,
                message.vali_tokenList_endpoint,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            addContext(test, message.pass_tokenList_2)
            console.log(message.pass_tokenList_2);
          }

          tokenListTokens = await arbitrumDataService.getTokenListTokens({ chainId: data.arbitrum_chainid });

          if (tokenListTokens.length > 0) {
            console.log(message.pass_tokenList_3);
            addContext(test, message.pass_tokenList_3);

            try {
              assert.isNotEmpty(
                tokenListTokens[0].address,
                message.vali_tokenListTokens_address,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].name,
                message.vali_tokenListTokens_name,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].symbol,
                message.vali_tokenListTokens_symbol,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].decimals,
                message.vali_tokenListTokens_decimals,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                tokenListTokens[0].logoURI,
                message.vali_tokenListTokens_logoURI
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                tokenListTokens[0].chainId,
                message.vali_tokenListTokens_chainId,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            addContext(test, message.pass_tokenList_4)
            console.log(message.pass_tokenList_4);
          }

          if (tokenLists.length > 0) {

            const { name } = tokenLists[0];

            tokenListTokens = await arbitrumDataService.getTokenListTokens({
              chainId: data.arbitrum_chainid,
              name,
            });

            if (tokenListTokens.length > 0) {
              addContext(test, message.pass_tokenList_5)
              console.log(message.pass_tokenList_5);
              
              try {
                assert.isNotEmpty(
                  tokenListTokens[0].address,
                  message.vali_selectedTokenListTokens_address,
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  tokenListTokens[0].name,
                  message.vali_selectedTokenListTokens_name
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  tokenListTokens[0].symbol,
                  message.vali_selectedTokenListTokens_symbol
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  tokenListTokens[0].decimals,
                  message.vali_selectedTokenListTokens_decimals
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  tokenListTokens[0].logoURI,
                  message.vali_selectedTokenListTokens_logoURI
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  tokenListTokens[0].chainId,
                  message.vali_selectedTokenListTokens_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.pass_tokenList_6)
              console.log(message.pass_tokenList_6);
            }
          } else {
            addContext(test, message.pass_tokenList_2)
            console.log(message.pass_tokenList_2);
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_tokenList_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.tokenList_insufficientBalance);
    }
  });

  it('SMOKE: Validate the Exchange Rates on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.longTimeout);

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
                message.vali_exchangeRates_address,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].eth,
                message.vali_exchangeRates_eth,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].eur,
                message.vali_exchangeRates_eur,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].gbp,
                message.vali_exchangeRates_gbp,
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                rates.items[i].usd,
                message.vali_exchangeRates_usd,
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
          assert.fail(message.fail_exchangeRates_1);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the NFT List with invalid account address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        try {
          await arbitrumDataService.getNftList({
            chainId: Number(data.arbitrum_chainid),
            account: data.invalidSender,
          });

          addContext(test, message.fail_nftList_2)
          assert.fail(message.fail_nftList_2);
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].constraints.isAddress === constant.invalid_address_1) {
            addContext(test, message.pass_nftList_3)
            console.log(message.pass_nftList_3);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_nftList_2);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.nftList_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the NFT List with incorrect account address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        try {
          await arbitrumDataService.getNftList({
            chainId: Number(data.arbitrum_chainid),
            account: data.incorrectSender,
          });

          addContext(test, message.fail_nftList_3)
          assert.fail(message.fail_nftList_3);
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].constraints.isAddress === constant.invalid_address_1) {
            addContext(test, message.pass_nftList_4)
            console.log(message.pass_nftList_4);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_nftList_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.nftList_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the Exchange Rates with other token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        let TOKEN_LIST;
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

          await arbitrumDataService.fetchExchangeRates(requestPayload);
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_exchangeRates_2);
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the Exchange Rates with invalid token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        let TOKEN_LIST;
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

          await arbitrumDataService.fetchExchangeRates(requestPayload);

          addContext(test, message.fail_exchangeRates_3)
          assert.fail(message.fail_exchangeRates_3);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.property_undefined)) {
            addContext(test, message.pass_exchangeRates_1)
            console.log(message.pass_exchangeRates_1);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeRates_3);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the Exchange Rates with incorrect token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        let TOKEN_LIST;
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

          await arbitrumDataService.fetchExchangeRates(requestPayload);

          addContext(test, message.fail_exchangeRates_4)
          assert.fail(message.fail_exchangeRates_4);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.property_undefined)) {
            addContext(test, message.pass_exchangeRates_2)
            console.log(message.pass_exchangeRates_2);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeRates_4);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the Exchange Rates without token address on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        try {
          let TOKEN_LIST = [];

          let requestPayload = {
            tokens: TOKEN_LIST,
            chainId: Number(data.arbitrum_chainid),
          };

          await arbitrumDataService.fetchExchangeRates(requestPayload);

          addContext(test, message.fail_exchangeRates_5)
          assert.fail(message.fail_exchangeRates_5);
        } catch (e) {
          let error = e.message;
          if (error.includes(constant.property_undefined)) {
            addContext(test, message.pass_exchangeRates_3)
            console.log(message.pass_exchangeRates_3);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeRates_5);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the Exchange Rates with invalid chainid on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

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
          if (errorMessage.includes(constant.property_undefined)) {
            addContext(test, message.pass_exchangeRates_4)
            console.log(message.pass_exchangeRates_4);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeRates_6);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });

  it('REGRESSION: Validate the Exchange Rates without chainid on the arbitrum network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {

        helper.wait(data.mediumTimeout);

        let TOKEN_LIST;
        let requestPayload;

        try {
          TOKEN_LIST = [data.tokenAddress_arbitrumUSDC, data.tokenAddress_arbitrumUSDT];

          requestPayload = {
            tokens: TOKEN_LIST,
          };

          await arbitrumDataService.fetchExchangeRates(requestPayload);

          addContext(test, message.fail_exchangeRates_7)
          assert.fail(message.fail_exchangeRates_7);
        } catch (e) {
          let errorMessage = e.message;
          if (errorMessage.includes(constant.property_undefined)) {
            addContext(test, message.pass_exchangeRates_5)
            console.log(message.pass_exchangeRates_5);
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeRates_7);
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(message.exchangeRates_insufficientBalance);
    }
  });
});
