import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, graphqlEndpoints } from '@etherspot/prime-sdk';
import { utils, constants, BigNumber } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import customRetryAsync from '../../../utils/baseTest.js';
import data from '../../../data/testData.json' assert { type: 'json' };

let xdaiMainNetSdk;
let xdaiEtherspotWalletAddress;
let xdaiNativeAddress = null;
let xdaiDataService;
let runTest;

describe('The PrimeSDK, when get cross chain quotes and get advance routes LiFi transaction details with xdai network on the MainNet', function () {
  before(async function () {
    var test = this;

    // initializating sdk
    try {
      xdaiMainNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(data.xdai_chainid),
          projectKey: process.env.PROJECT_KEY,
        },
      );

      try {
        assert.strictEqual(
          xdaiMainNetSdk.state.EOAAddress,
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
      xdaiEtherspotWalletAddress =
        await xdaiMainNetSdk.getCounterFactualAddress();

      try {
        assert.strictEqual(
          xdaiEtherspotWalletAddress,
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
      xdaiDataService = new DataUtils(
        process.env.PROJECT_KEY,
        graphqlEndpoints.PROD,
      );
    } catch (e) {
      console.error(e);
      const eString = e.toString();
      addContext(test, eString);
      assert.fail('The Data service is not initialled successfully.');
    }
  });

  beforeEach(async function () {
    let output = await xdaiDataService.getAccountBalances({
      account: data.sender,
      chainId: Number(data.xdai_chainid),
    });
    let native_balance;
    let usdc_balance;
    let native_final;
    let usdc_final;

    for (let i = 0; i < output.items.length; i++) {
      let tokenAddress = output.items[i].token;
      if (tokenAddress === xdaiNativeAddress) {
        native_balance = output.items[i].balance;
        native_final = utils.formatUnits(native_balance, 18);
      } else if (tokenAddress === data.tokenAddress_xdaiUSDC) {
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

  it('SMOKE: Validate the Exchange offers response with ERC20 to ERC20 and valid details on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        let offers;
        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromAmount = data.exchange_offer_value;
          let fromChainId = data.xdai_chainid;

          offers = await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });

          if (offers.length > 0) {
            for (let i = 0; i < offers.length; i++) {
              try {
                assert.isNotEmpty(
                  offers[i].provider,
                  'The provider value is empty in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  offers[i].receiveAmount._hex,
                  'The receiveAmount value of the transaction is empty in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  offers[i].exchangeRate,
                  'The exchangeRate value of the transaction is not number in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  offers[i].transactions,
                  'The transactions value of the transaction is empty in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  offers[i].__typename,
                  'The __typename value of the transaction is not correct in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            }
          } else {
            addContext(
              test,
              'The Offers are not available in the getExchangeOffers response.',
            );
            assert.fail(
              'The Offers are not available in the getExchangeOffers response.',
            );
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The offers are not display in the Exchange offers response',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the Exchange offers response with ERC20 to Native Token and valid details on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        let offers;
        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = constants.AddressZero;
          let fromAmount = data.exchange_offer_value;
          let fromChainId = data.xdai_chainid;

          offers = await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });

          if (offers.length > 0) {
            for (let i = 0; i < offers.length; i++) {
              try {
                assert.isNotEmpty(
                  offers[i].provider,
                  'The provider value is empty in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  offers[i].receiveAmount._hex,
                  'The receiveAmount value of the transaction is empty in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  offers[i].exchangeRate,
                  'The exchangeRate value of the transaction is not number in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  offers[i].transactions,
                  'The transactions value of the transaction is empty in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  offers[i].__typename,
                  'The __typename value of the transaction is not correct in the getExchangeOffers response.',
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            }
          } else {
            addContext(
              test,
              'The Offers are not available in the getExchangeOffers response.',
            );
            assert.fail(
              'The Offers are not available in the getExchangeOffers response.',
            );
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(
            'The offers are not display in the Exchange offers response',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the getCrossChainQuotes response with valid details on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        let quotes;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          quotes =
            await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          if (quotes.items.length > 0) {
            try {
              assert.isNotEmpty(
                quotes.items[0].provider,
                'The provider value is empty in the getCrossChainQuotes response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].transaction.data,
                'The data value of the transaction is empty in the getCrossChainQuotes response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].transaction.to,
                'The to value of the transaction is empty in the getCrossChainQuotes response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].transaction.value,
                'The value value of the transaction is empty in the getCrossChainQuotes response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].transaction.from,
                'The from value of the transaction is not correct in the getCrossChainQuotes response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                quotes.items[0].transaction.chainId,
                'The chainId value of the transaction is not number in the getCrossChainQuotes response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The items are not available in the getCrossChainQuotes response.',
            );
          }
        } catch (e) {
          assert.fail(
            'The quotes are not display in the getCrossChainQuotes response',
          );
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('SMOKE: Validate the getAdvanceRoutesLiFi response with valid details on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        let quotes;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          quotes =
            await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          if (quotes.items.length > 0) {
            const quote = quotes.items[0]; // Selected the first route
            await xdaiDataService.getStepTransaction({
              route: quote,
              account: data.sender,
            });

            try {
              assert.isNotEmpty(
                quotes.items[0].id,
                'The id value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                quotes.items[0].fromChainId,
                'The fromChainId value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].fromAmountUSD,
                'The fromAmountUSD value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].fromAmount,
                'The fromAmount value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].fromToken,
                'The fromToken value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].fromAddress,
                'The fromAddress value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNumber(
                quotes.items[0].toChainId,
                'The toChainId value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].toAmountUSD,
                'The toAmountUSD value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].toAmount,
                'The toAmount value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].toAmountMin,
                'The toAmountMin value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].toToken,
                'The toToken value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].toAddress,
                'The toAddress value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }

            try {
              assert.isNotEmpty(
                quotes.items[0].gasCostUSD,
                'The gasCostUSD value of the first item is empty in the getAdvanceRoutesLiFi response.',
              );
            } catch (e) {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
            }
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail('The quotes are not display in the quote list');
          }
        } catch (e) {
          assert.fail('The quotes are not display in the quote list');
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response with invalid fromTokenAddress details on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.invalidTokenAddress_xdaiUSDC; // Invalid fromTokenAddress
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromAmount = data.exchange_offer_value;
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (
            errorResponse[0].constraints.isAddress ===
            'fromTokenAddress must be an address'
          ) {
            console.log(
              'The correct validation is displayed when invalid fromTokenAddress detail added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid fromTokenAddress detail added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response without fromTokenAddress details on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromAmount = data.exchange_offer_value;
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            // without fromTokenAddress
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (
            errorResponse[0].constraints.isAddress ===
            'fromTokenAddress must be an address'
          ) {
            console.log(
              'The correct validation is displayed when fromTokenAddress detail not added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromTokenAddress detail not added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response with invalid toTokenAddress details on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = data.invalidTokenAddress_xdaiUSDT; // Invalid toTokenAddress
          let fromAmount = data.exchange_offer_value;
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (
            errorResponse[0].constraints.isAddress ===
            'toTokenAddress must be an address'
          ) {
            console.log(
              'The correct validation is displayed when invalid toTokenAddress detail added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid toTokenAddress detail added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response without toTokenAddress details on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let fromAmount = data.exchange_offer_value;
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            // without toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (
            errorResponse[0].constraints.isAddress ===
            'toTokenAddress must be an address'
          ) {
            console.log(
              'The correct validation is displayed when toTokenAddress detail not added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when toTokenAddress detail not added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response with invalid fromAmount on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromAmount = data.invalidValue; // invalid fromAmount
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          if (e.reason === 'invalid BigNumber string') {
            console.log(
              'The correct validation is displayed when invalid fromAmount detail added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid fromAmount detail added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response with decimal fromAmount on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromAmount = data.exchange_offer_decimal_value; // decimal fromAmount
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          if (e.reason === 'invalid BigNumber string') {
            console.log(
              'The correct validation is displayed when decimal fromAmount detail added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when decimal fromAmount detail added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response with big fromAmount on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromAmount = data.exchange_offer_big_value; // big fromAmount
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: BigNumber.from(fromAmount),
          });
        } catch (e) {
          if (e.reason === 'invalid BigNumber string') {
            console.log(
              'The correct validation is displayed when big fromAmount detail added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when big fromAmount detail added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the Exchange offers response without fromAmount on the xdai network', async function () {
    var test = this;
    let exchangeSupportedAssets;
    if (runTest) {
      await customRetryAsync(async function () {
        exchangeSupportedAssets =
          await xdaiDataService.getExchangeSupportedAssets({
            page: 1,
            limit: 100,
            account: data.sender,
            chainId: Number(data.xdai_chainid),
          });

        try {
          if (exchangeSupportedAssets.items.length > 0) {
            console.log('Found exchange supported assets.');
          } else {
            addContext(test, 'The exchange supported assets is not displayed.');
            console.error('The exchange supported assets is not displayed.');
          }
        } catch (e) {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
        }

        try {
          let fromAddress = data.sender;
          let fromTokenAddress = data.tokenAddress_xdaiUSDC;
          let toTokenAddress = data.tokenAddress_xdaiUSDT;
          let fromChainId = data.xdai_chainid;

          await xdaiDataService.getExchangeOffers({
            fromAddress,
            fromChainId,
            fromTokenAddress,
            toTokenAddress,
            // without fromAmount
          });
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (
            errorResponse[0].constraints.IsBigNumberish ===
            'fromAmount must be positive big numberish'
          ) {
            console.log(
              'The correct validation is displayed when fromAmount detail not added in the getExchangeOffers request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromAmount detail not added in the getExchangeOffers request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE EXCHANGE OFFERS RESPONSE ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without fromChainId detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform without fromchainid detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromChainId') {
            console.log(
              'The correct validation is displayed when fromchainid detail not added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromchainid detail not added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT FROMCHAINID DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without toChainId detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform without toChainId detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toChainId') {
            console.log(
              'The correct validation is displayed when toChainId detail not added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when toChainId detail not added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT TOCHAINID DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with invalid fromTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.invalidTokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform with invalid fromTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromTokenAddress') {
            console.log(
              'The correct validation is displayed when invalid fromTokenAddress detail added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid fromTokenAddress detail added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INVALID FROMTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with incorrect fromTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.incorrectTokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform with incorrect fromTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromTokenAddress') {
            console.log(
              'The correct validation is displayed when incorrect fromTokenAddress detail added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when incorrect fromTokenAddress detail added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INCORRECT FROMTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without fromTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform without fromTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromTokenAddress') {
            console.log(
              'The correct validation is displayed when fromTokenAddress detail not added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromTokenAddress detail not added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT FROMTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with invalid toTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.invalidTokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform with invalid toTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toTokenAddress') {
            console.log(
              'The correct validation is displayed when invalid toTokenAddress detail added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid toTokenAddress detail added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INVALID TOTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with incorrect toTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.incorrectTokenAddress_maticUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform with incorrect toTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toTokenAddress') {
            console.log(
              'The correct validation is displayed when incorrect toTokenAddress detail added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when incorrect toTokenAddress detail added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INCORRECT TOTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without toTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            fromAddress: data.sender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform without toTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toTokenAddress') {
            console.log(
              'The correct validation is displayed when toTokenAddress detail not added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when toTokenAddress detail not added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT TOTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with invalid fromAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.invalidSender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform with invalid fromAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromAddress') {
            console.log(
              'The correct validation is displayed when invalid fromAddress detail added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid fromAddress detail added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INVALID FROMADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with incorrect fromAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.incorrectSender,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform with incorrect fromAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromAddress') {
            console.log(
              'The correct validation is displayed when incorrect fromAddress detail added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when incorrect fromAddress detail added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INCORRECT FROMADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without fromAmount detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAddress: data.sender,
          };

          await xdaiDataService.getCrossChainQuotes(quoteRequestPayload);

          assert.fail(
            'The getCrossChainQuotes request allowed to perform without fromAmount detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromAmount') {
            console.log(
              'The correct validation is displayed when fromAmount not added in the getCrossChainQuotes request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromAmount not added in the getCrossChainQuotes request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT FROMADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without fromChainId detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform without fromchainid detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromChainId') {
            console.log(
              'The correct validation is displayed when fromchainid detail not added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromchainid detail not added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT FROMCHAINID DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without toChainId detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform without toChainId detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toChainId') {
            console.log(
              'The correct validation is displayed when toChainId detail not added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when toChainId detail not added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT TOCHAINID DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with invalid fromTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.invalidTokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform with invalid fromTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromTokenAddress') {
            console.log(
              'The correct validation is displayed when invalid fromTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid fromTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INVALID FROMTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with incorrect fromTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.incorrectTokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform with incorrect fromTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromTokenAddress') {
            console.log(
              'The correct validation is displayed when incorrect fromTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when incorrect fromTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INCORRECT FROMTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without fromTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            toTokenAddress: data.tokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform without fromTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromTokenAddress') {
            console.log(
              'The correct validation is displayed when fromTokenAddress detail not added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromTokenAddress detail not added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT FROMTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with invalid toTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.invalidTokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform with invalid toTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toTokenAddress') {
            console.log(
              'The correct validation is displayed when invalid toTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when invalid toTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INVALID TOTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with incorrect toTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.incorrectTokenAddress_maticUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform with incorrect toTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toTokenAddress') {
            console.log(
              'The correct validation is displayed when incorrect toTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when incorrect toTokenAddress detail added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INCORRECT TOTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without toTokenAddress detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            fromAmount: utils.parseUnits(data.swap_value, 6),
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform without toTokenAddress detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'toTokenAddress') {
            console.log(
              'The correct validation is displayed when toTokenAddress detail not added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when toTokenAddress detail not added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT TOTOKENADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without fromAmount detail on the xdai network', async function () {
    var test = this;
    if (runTest) {
      await customRetryAsync(async function () {
        let quoteRequestPayload;
        try {
          quoteRequestPayload = {
            fromAddress: data.sender,
            fromChainId: data.xdai_chainid,
            toChainId: data.matic_chainid,
            fromTokenAddress: data.tokenAddress_xdaiUSDC,
            toTokenAddress: data.tokenAddress_maticUSDC,
          };

          await xdaiDataService.getAdvanceRoutesLiFi(quoteRequestPayload);

          assert.fail(
            'The getAdvanceRoutesLiFi request allowed to perform without fromAmount detail',
          );
        } catch (e) {
          const errorResponse = JSON.parse(e.message);
          if (errorResponse[0].property === 'fromAmount') {
            console.log(
              'The correct validation is displayed when fromAmount not added in the getAdvanceRoutesLiFi request',
            );
          } else {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(
              'The respective validate is not displayed when fromAmount not added in the getAdvanceRoutesLiFi request',
            );
          }
        }
      }, data.retry); // Retry this async test up to 5 times
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT FROMADDRESS DETAIL ON THE xdai NETWORK',
      );
    }
  });
});
