import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { PrimeSdk, DataUtils, EtherspotBundler } from '@etherspot/prime-sdk';
import { utils, constants, BigNumber } from 'ethers';
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import { customRetryAsync } from '../../../utils/baseTest.js';
import {
  randomChainId,
  randomChainName,
  randomIncorrectToTokenAddress,
  randomIncorrectTokenAddress,
  randomInvalidToTokenAddress,
  randomInvalidTokenAddress,
  randomInvalidTokenAddressUsdt,
  randomToChainId,
  randomToTokenAddress,
  randomTokenAddress,
  randomTokenAddressUsdt,
} from '../../../utils/sharedData_mainnet.js';
import helper from '../../../utils/helper.js';
import data from '../../../data/testData.json' assert { type: 'json' };
import constant from '../../../data/constant.json' assert { type: 'json' };
import message from '../../../data/messages.json' assert { type: 'json' };
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let mainnetPrimeSdk;
let nativeAddress = null;
let dataService;
let runTest;
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Perform the get cross chain quotes and get advance routes LiFi transaction details on the MainNet (with new wallet)', function () {
  before(async function () {
    const filePath = path.join(__dirname, '../../../utils/testUtils.json');
    const sharedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    var test = this;

    await customRetryAsync(async function () {
      helper.wait(data.mediumTimeout);

      // initializating sdk
      try {
        mainnetPrimeSdk = new PrimeSdk(
          { privateKey: sharedState.newPrivateKey },
          {
            chainId: Number(randomChainId),
            bundlerProvider: new EtherspotBundler(
              Number(randomChainId),
              process.env.BUNDLER_API_KEY
            ),
          }
        );
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_sdk_initialize);
      }

      // initializating Data service...
      try {
        dataService = new DataUtils(process.env.BUNDLER_API_KEY);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_data_service);
      }
    }, data.retry); // Retry this async test up to 5 times
  });

  beforeEach(async function () {
    // validate the balance of the wallet
    try {
      let output = await dataService.getAccountBalances({
        account: data.sender,
        chainId: Number(randomChainId),
      });
      let native_balance;
      let usdc_balance;
      let native_final;
      let usdc_final;

      for (let i = 0; i < output.items.length; i++) {
        let tokenAddress = output.items[i].token;
        if (tokenAddress === nativeAddress) {
          native_balance = output.items[i].balance;
          native_final = utils.formatUnits(native_balance, 18);
        } else if (tokenAddress === randomTokenAddress) {
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
  });

  it(
    'SMOKE: Validate the Exchange offers response with ERC20 to ERC20 and valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].address,
                  message.vali_exchangeOffers_address
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  exchangeSupportedAssets.items[0].chainId,
                  message.vali_exchangeOffers_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].name,
                  message.vali_exchangeOffers_name
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].symbol,
                  message.vali_exchangeOffers_symbol
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  exchangeSupportedAssets.items[0].decimals,
                  message.vali_exchangeOffers_decimals
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].logoURI,
                  message.vali_exchangeOffers_logoURI
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          let offers;
          try {
            let fromChainId = randomChainId;
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let toTokenAddress = randomTokenAddressUsdt;
            let fromAmount = data.exchange_offer_value;

            offers = await dataService.getExchangeOffers({
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
                    message.vali_exchangeOffers_provider
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    offers[i].receiveAmount,
                    message.vali_exchangeOffers_receiveAmount
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    offers[i].exchangeRate,
                    message.vali_exchangeOffers_exchangeRate
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    offers[i].transactions,
                    message.vali_exchangeOffers_transactions
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }
              }
            } else {
              addContext(test, message.vali_exchangeOffers_3);
              console.log(message.vali_exchangeOffers_3);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeOffers_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the Exchange offers response with ERC20 to Native Token and valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].address,
                  message.vali_exchangeOffers_address
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  exchangeSupportedAssets.items[0].chainId,
                  message.vali_exchangeOffers_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].name,
                  message.vali_exchangeOffers_name
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].symbol,
                  message.vali_exchangeOffers_symbol
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  exchangeSupportedAssets.items[0].decimals,
                  message.vali_exchangeOffers_decimals
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].logoURI,
                  message.vali_exchangeOffers_logoURI
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          let offers;
          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let toTokenAddress = constants.AddressZero;
            let fromAmount = data.exchange_offer_value;
            let fromChainId = randomChainId;

            offers = await dataService.getExchangeOffers({
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
                    message.vali_exchangeOffers_provider
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    offers[i].receiveAmount,
                    message.vali_exchangeOffers_receiveAmount
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNumber(
                    offers[i].exchangeRate,
                    message.vali_exchangeOffers_exchangeRate
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }

                try {
                  assert.isNotEmpty(
                    offers[i].transactions,
                    message.vali_exchangeOffers_transactions
                  );
                } catch (e) {
                  console.error(e);
                  const eString = e.toString();
                  addContext(test, eString);
                }
              }
            } else {
              addContext(test, message.vali_exchangeOffers_3);
              console.log(message.vali_exchangeOffers_3);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_exchangeOffers_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'SMOKE: Validate the getCrossChainQuotes response with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          let quotes;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            quotes = await dataService.getCrossChainQuotes(quoteRequestPayload);

            if (quotes.items.length > 0) {
              try {
                assert.isNotEmpty(
                  quotes.items[0].provider,
                  message.vali_crossChainQuotes_provider
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].transaction.data,
                  message.vali_crossChainQuotes_data
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].transaction.to,
                  message.vali_crossChainQuotes_to
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].transaction.value,
                  message.vali_crossChainQuotes_value
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].transaction.from,
                  message.vali_crossChainQuotes_from
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  quotes.items[0].transaction.chainId,
                  message.vali_crossChainQuotes_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.vali_crossChainQuotes_1);
              console.log(message.vali_crossChainQuotes_1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_crossChainQuotes_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'SMOKE: Validate the getAdvanceRoutesLiFi response with valid details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          let quotes;
          let stepTransaction;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            quotes =
              await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            if (quotes.items.length > 0) {
              const quote = quotes.items[0]; // Selected the first route
              stepTransaction = await dataService.getStepTransaction({
                route: quote,
                account: data.sender,
              });

              try {
                assert.isNotEmpty(
                  quotes.items[0].id,
                  message.vali_advanceRoutesLiFi_id
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  quotes.items[0].fromChainId,
                  message.vali_advanceRoutesLiFi_fromChainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].fromAmountUSD,
                  message.vali_advanceRoutesLiFi_fromAmountUSD
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].fromAmount,
                  message.vali_advanceRoutesLiFi_fromAmount
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].fromToken,
                  message.vali_advanceRoutesLiFi_fromToken
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].fromAddress,
                  message.vali_advanceRoutesLiFi_fromAddress
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  quotes.items[0].toChainId,
                  message.vali_advanceRoutesLiFi_toChainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].toAmountUSD,
                  message.vali_advanceRoutesLiFi_toAmountUSD
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].toAmount,
                  message.vali_advanceRoutesLiFi_toAmount
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].toAmountMin,
                  message.vali_advanceRoutesLiFi_toAmountMin
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].toToken,
                  message.vali_advanceRoutesLiFi_toToken
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].toAddress,
                  message.vali_advanceRoutesLiFi_toAddress
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  quotes.items[0].gasCostUSD,
                  message.vali_advanceRoutesLiFi_gasCostUSD
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[0].data,
                  message.vali_stepTransaction_data
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[0].value,
                  message.vali_stepTransaction_value
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[0].to,
                  message.vali_stepTransaction_to
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  stepTransaction.items[0].chainId,
                  message.vali_stepTransaction_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[0].transactionType,
                  message.vali_stepTransaction_transactionType
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[1].transactionType,
                  message.vali_stepTransaction_transactionType
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[1].data,
                  message.vali_stepTransaction_data
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[1].to,
                  message.vali_stepTransaction_to
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[1].value,
                  message.vali_stepTransaction_value
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  stepTransaction.items[1].chainId,
                  message.vali_stepTransaction_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[1].gasLimit,
                  message.vali_stepTransaction_gasLimit
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  stepTransaction.items[1].gasPrice,
                  message.vali_stepTransaction_gasPrice
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.vali_advanceRoutesLiFi_1);
              console.log(message.vali_advanceRoutesLiFi_1);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
            assert.fail(message.fail_advanceRoutesLiFi_1);
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response with invalid fromTokenAddress details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].address,
                  message.vali_exchangeOffers_address
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  exchangeSupportedAssets.items[0].chainId,
                  message.vali_exchangeOffers_chainId
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].name,
                  message.vali_exchangeOffers_name
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].symbol,
                  message.vali_exchangeOffers_symbol
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNumber(
                  exchangeSupportedAssets.items[0].decimals,
                  message.vali_exchangeOffers_decimals
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }

              try {
                assert.isNotEmpty(
                  exchangeSupportedAssets.items[0].logoURI,
                  message.vali_exchangeOffers_logoURI
                );
              } catch (e) {
                console.error(e);
                const eString = e.toString();
                addContext(test, eString);
              }
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomInvalidTokenAddress; // Invalid fromTokenAddress
            let toTokenAddress = randomTokenAddressUsdt;
            let fromAmount = data.exchange_offer_value;
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              fromTokenAddress,
              toTokenAddress,
              fromAmount: BigNumber.from(fromAmount),
            });

            addContext(test, message.fail_exchangeOffers_2);
            assert.fail(message.fail_exchangeOffers_2);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_exchangeOffers_4);
              console.log(message.vali_exchangeOffers_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_2);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response without fromTokenAddress details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let toTokenAddress = randomTokenAddressUsdt;
            let fromAmount = data.exchange_offer_value;
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              // without fromTokenAddress
              toTokenAddress,
              fromAmount: BigNumber.from(fromAmount),
            });

            addContext(test, message.fail_exchangeOffers_3);
            assert.fail(message.fail_exchangeOffers_3);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_exchangeOffers_5);
              console.log(message.vali_exchangeOffers_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_3);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response with invalid toTokenAddress details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let toTokenAddress = randomInvalidTokenAddressUsdt; // Invalid toTokenAddress
            let fromAmount = data.exchange_offer_value;
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              fromTokenAddress,
              toTokenAddress,
              fromAmount: BigNumber.from(fromAmount),
            });

            addContext(test, message.fail_exchangeOffers_4);
            assert.fail(message.fail_exchangeOffers_4);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_exchangeOffers_6);
              console.log(message.vali_exchangeOffers_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response without toTokenAddress details on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let fromAmount = data.exchange_offer_value;
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              fromTokenAddress,
              // without toTokenAddress,
              fromAmount: BigNumber.from(fromAmount),
            });

            addContext(test, message.fail_exchangeOffers_5);
            assert.fail(message.fail_exchangeOffers_5);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_exchangeOffers_7);
              console.log(message.vali_exchangeOffers_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_5);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response with invalid fromAmount on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let toTokenAddress = randomTokenAddressUsdt;
            let fromAmount = data.invalidValue; // invalid fromAmount
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              fromTokenAddress,
              toTokenAddress,
              fromAmount: BigNumber.from(fromAmount),
            });

            addContext(test, message.fail_exchangeOffers_6);
            assert.fail(message.fail_exchangeOffers_6);
          } catch (e) {
            if (e.reason === constant.invalid_bignumber_1) {
              addContext(test, message.vali_exchangeOffers_8);
              console.log(message.vali_exchangeOffers_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_6);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response with decimal fromAmount on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let toTokenAddress = randomTokenAddressUsdt;
            let fromAmount = data.exchange_offer_decimal_value; // decimal fromAmount
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              fromTokenAddress,
              toTokenAddress,
              fromAmount: BigNumber.from(fromAmount),
            });

            addContext(test, message.fail_exchangeOffers_7);
            assert.fail(message.fail_exchangeOffers_7);
          } catch (e) {
            if (e.reason === constant.invalid_bignumber_1) {
              addContext(test, message.vali_exchangeOffers_9);
              console.log(message.vali_exchangeOffers_9);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_7);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the Exchange offers response without fromAmount on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      let exchangeSupportedAssets;
      if (runTest) {
        await customRetryAsync(async function () {
          exchangeSupportedAssets =
            await dataService.getExchangeSupportedAssets({
              page: 1,
              limit: 100,
              account: data.sender,
              chainId: Number(randomChainId),
            });

          try {
            if (exchangeSupportedAssets.items.length > 0) {
              addContext(test, message.vali_exchangeOffers_1);
              console.log(message.vali_exchangeOffers_1);
            } else {
              addContext(test, message.vali_exchangeOffers_2);
              console.error(message.vali_exchangeOffers_2);
            }
          } catch (e) {
            console.error(e);
            const eString = e.toString();
            addContext(test, eString);
          }

          try {
            let fromAddress = data.sender;
            let fromTokenAddress = randomTokenAddress;
            let toTokenAddress = randomTokenAddressUsdt;
            let fromChainId = randomChainId;

            await dataService.getExchangeOffers({
              fromAddress,
              fromChainId,
              fromTokenAddress,
              toTokenAddress,
              // without fromAmount
            });

            addContext(test, message.fail_exchangeOffers_9);
            assert.fail(message.fail_exchangeOffers_9);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.IsBigNumberish ===
              constant.invalid_bignumber_2
            ) {
              addContext(test, message.vali_exchangeOffers_11);
              console.log(message.vali_exchangeOffers_11);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_exchangeOffers_9);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.exchangeOffers_insufficientBalance);
        console.warn(message.exchangeOffers_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response without fromChainId detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_2);
            assert.fail(message.fail_crossChainQuotes_2);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (errorResponse[0].property === constant.invalid_chainid_1) {
              addContext(test, message.vali_crossChainQuotes_2);
              console.log(message.vali_crossChainQuotes_2);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_2);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response without toChainId detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_3);
            assert.fail(message.fail_crossChainQuotes_3);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (errorResponse[0].property === constant.invalid_chainid_2) {
              addContext(test, message.vali_crossChainQuotes_3);
              console.log(message.vali_crossChainQuotes_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_3);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response with invalid fromTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomInvalidTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_4);
            assert.fail(message.fail_crossChainQuotes_4);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_crossChainQuotes_4);
              console.log(message.vali_crossChainQuotes_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response with incorrect fromTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomIncorrectTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_5);
            assert.fail(message.fail_crossChainQuotes_5);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_crossChainQuotes_5);
              console.log(message.vali_crossChainQuotes_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_5);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response without fromTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_6);
            assert.fail(message.fail_crossChainQuotes_6);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_crossChainQuotes_6);
              console.log(message.vali_crossChainQuotes_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_6);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response with invalid toTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomInvalidToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_7);
            assert.fail(message.fail_crossChainQuotes_7);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_crossChainQuotes_7);
              console.log(message.vali_crossChainQuotes_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_7);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response with incorrect toTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomIncorrectToTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_8);
            assert.fail(message.fail_crossChainQuotes_8);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_crossChainQuotes_8);
              console.log(message.vali_crossChainQuotes_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_8);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response without toTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              fromAddress: data.sender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_9);
            assert.fail(message.fail_crossChainQuotes_9);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_crossChainQuotes_9);
              console.log(message.vali_crossChainQuotes_9);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_9);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response with invalid fromAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.invalidSender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_10);
            assert.fail(message.fail_crossChainQuotes_10);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_1
            ) {
              addContext(test, message.vali_crossChainQuotes_10);
              assert.fail(message.vali_crossChainQuotes_10);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_10);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response with incorrect fromAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.incorrectSender,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_11);
            assert.fail(message.fail_crossChainQuotes_11);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_1
            ) {
              addContext(test, message.vali_crossChainQuotes_11);
              assert.fail(message.vali_crossChainQuotes_11);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              addContext(test, message.fail_crossChainQuotes_12);
              assert.fail(message.fail_crossChainQuotes_11);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  xit(
    'REGRESSION: Validate the getCrossChainQuotes response without fromAmount detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAddress: data.sender,
            };

            await dataService.getCrossChainQuotes(quoteRequestPayload);

            addContext(test, message.fail_crossChainQuotes_12);
            assert.fail(message.fail_crossChainQuotes_12);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_1
            ) {
              addContext(test, message.vali_crossChainQuotes_12);
              console.log(message.vali_crossChainQuotes_12);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_crossChainQuotes_12);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.crossChainQuotes_insufficientBalance);
        console.warn(message.crossChainQuotes_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response without fromChainId detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_2);
            assert.fail(message.fail_advanceRoutesLiFi_2);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (errorResponse[0].property === constant.invalid_chainid_1) {
              addContext(test, message.vali_advanceRoutesLiFi_2);
              console.log(message.vali_advanceRoutesLiFi_2);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_2);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response without toChainId detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_3);
            assert.fail(message.fail_advanceRoutesLiFi_3);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (errorResponse[0].property === constant.invalid_chainid_2) {
              addContext(test, message.vali_advanceRoutesLiFi_3);
              console.log(message.vali_advanceRoutesLiFi_3);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_3);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response with invalid fromTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomInvalidTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_4);
            assert.fail(message.fail_advanceRoutesLiFi_4);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_4);
              console.log(message.vali_advanceRoutesLiFi_4);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_4);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response with incorrect fromTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomIncorrectTokenAddress,
              toTokenAddress: randomToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_5);
            assert.fail(message.fail_advanceRoutesLiFi_5);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_5);
              console.log(message.vali_advanceRoutesLiFi_5);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_5);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response without fromTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              toTokenAddress: randomToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_6);
            assert.fail(message.fail_advanceRoutesLiFi_6);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_2
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_6);
              console.log(message.vali_advanceRoutesLiFi_6);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_6);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response with invalid toTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomInvalidToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_7);
            assert.fail(message.fail_advanceRoutesLiFi_7);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_7);
              console.log(message.vali_advanceRoutesLiFi_7);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_7);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response with incorrect toTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomIncorrectToTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_8);
            assert.fail(message.fail_advanceRoutesLiFi_8);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_8);
              console.log(message.vali_advanceRoutesLiFi_8);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_8);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response without toTokenAddress detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              fromAmount: utils.parseUnits(data.swap_value, 6),
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_9);
            assert.fail(message.fail_advanceRoutesLiFi_9);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.isAddress ===
              constant.invalid_address_3
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_9);
              console.log(message.vali_advanceRoutesLiFi_9);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_9);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );

  it(
    'REGRESSION: Validate the getAdvanceRoutesLiFi response without fromAmount detail on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;
      if (runTest) {
        await customRetryAsync(async function () {
          let quoteRequestPayload;
          try {
            quoteRequestPayload = {
              fromAddress: data.sender,
              fromChainId: randomChainId,
              toChainId: randomToChainId,
              fromTokenAddress: randomTokenAddress,
              toTokenAddress: randomToTokenAddress,
            };

            await dataService.getAdvanceRoutesLiFi(quoteRequestPayload);

            addContext(test, message.fail_advanceRoutesLiFi_10);
            assert.fail(message.fail_advanceRoutesLiFi_10);
          } catch (e) {
            const errorResponse = JSON.parse(e.message);
            if (
              errorResponse[0].constraints.IsBigNumberish ===
              constant.invalid_bignumber_3
            ) {
              addContext(test, message.vali_advanceRoutesLiFi_10);
              console.log(message.vali_advanceRoutesLiFi_10);
            } else {
              console.error(e);
              const eString = e.toString();
              addContext(test, eString);
              assert.fail(message.fail_advanceRoutesLiFi_10);
            }
          }
        }, data.retry); // Retry this async test up to 5 times
      } else {
        addContext(test, message.advanceRoutesLiFi_insufficientBalance);
        console.warn(message.advanceRoutesLiFi_insufficientBalance);
        test.skip();
      }
    }
  );
});
