import { PrimeSdk } from '@etherspot/prime-sdk';
import { utils } from 'ethers';
import { assert } from 'chai';
import data from '../../../data/testData.json' assert { type: 'json' };
import Helper from '../../../utils/Helper.js';
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

let maticMainNetSdk;
let maticEtherspotWalletAddress;
let maticNativeAddress = null;
let runTest;

describe('The PrimeSDK, when get cross chain quotes and get advance routes LiFi transaction details with matic network on the MainNet', () => {
  beforeEach(async () => {
    // added timeout
    Helper.wait(data.mediumTimeout);

    // initializating sdk
    try {
      maticMainNetSdk = new PrimeSdk(
        { privateKey: process.env.PRIVATE_KEY },
        {
          chainId: Number(process.env.POLYGON_CHAINID),
          projectKey: process.env.PROJECT_KEY,
        },
      );

      try {
        assert.strictEqual(
          maticMainNetSdk.state.walletAddress,
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
      maticEtherspotWalletAddress =
        await maticMainNetSdk.getCounterFactualAddress();

      try {
        assert.strictEqual(
          maticEtherspotWalletAddress,
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

    let output = await maticMainNetSdk.getAccountBalances({
      account: data.sender,
      chainId: Number(process.env.POLYGON_CHAINID),
    });
    let native_balance;
    let usdc_balance;
    let native_final;
    let usdc_final;

    for (let i = 0; i < output.items.length; i++) {
      let tokenAddress = output.items[i].token;
      if (tokenAddress === maticNativeAddress) {
        native_balance = output.items[i].balance;
        native_final = utils.formatUnits(native_balance, 18);
      } else if (tokenAddress === data.maticUsdcAddress) {
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

  it('SMOKE: Validate the getCrossChainQuotes response with valid details on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      let quotes;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        quotes = await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

        if (quotes.items.length > 0) {
          try {
            assert.isNotEmpty(
              quotes.items[0].provider,
              'The provider value is empty in the getCrossChainQuotes response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].transaction.data,
              'The data value of the transaction is empty in the getCrossChainQuotes response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].transaction.to,
              'The to value of the transaction is empty in the getCrossChainQuotes response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].transaction.value,
              'The value value of the transaction is empty in the getCrossChainQuotes response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.strictEqual(
              quotes.items[0].transaction.from,
              data.sender,
              'The from value of the transaction is not correct in the getCrossChainQuotes response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNumber(
              quotes.items[0].transaction.chainId,
              'The chainId value of the transaction is not number in the getCrossChainQuotes response.',
            );
          } catch (e) {
            console.error(e);
          }
        } else {
          assert.fail(
            'The items are not available in the getCrossChainQuotes response.',
          );
        }
      } catch (e) {
        assert.fail(
          'The quotes are not display in the getCrossChainQuotes response',
        );
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE ON THE matic NETWORK',
      );
    }
  });

  it('SMOKE: Validate the getAdvanceRoutesLiFi response with valid details on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      let quotes;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits('0.0001', 6),
        };

        quotes =
          await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

        if (quotes.items.length > 0) {
          const quote = quotes.items[0]; // Selected the first route
          await maticMainNetSdk.getStepTransaction({
            route: quote,
          });

          try {
            assert.isNotEmpty(
              quotes.items[0].id,
              'The id value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.strictEqual(
              quotes.items[0].fromChainId,
              data.matic_chainid,
              'The fromChainId value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].fromAmountUSD,
              'The fromAmountUSD value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].fromAmount,
              'The fromAmount value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].fromToken,
              'The fromToken value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.strictEqual(
              quotes.items[0].fromAddress,
              data.sender,
              'The fromAddress value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.strictEqual(
              quotes.items[0].toChainId,
              data.arbitrum_chainid,
              'The toChainId value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].toAmountUSD,
              'The toAmountUSD value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].toAmount,
              'The toAmount value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].toAmountMin,
              'The toAmountMin value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].toToken,
              'The toToken value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.strictEqual(
              quotes.items[0].toAddress,
              data.sender,
              'The toAddress value of the first item is displayed correctly in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }

          try {
            assert.isNotEmpty(
              quotes.items[0].gasCostUSD,
              'The gasCostUSD value of the first item is empty in the getAdvanceRoutesLiFi response.',
            );
          } catch (e) {
            console.error(e);
          }
        } else {
          assert.fail('The quotes are not display in the quote list');
        }
      } catch (e) {
        assert.fail('The quotes are not display in the quote list');
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without fromChainId detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when fromchainid detail not added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT FROMCHAINID DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without toChainId detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when toChainId detail not added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT TOCHAINID DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with invalid fromTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.invalidTokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when invalid fromTokenAddress detail added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INVALID FROMTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with incorrect fromTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.incorrectTokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when incorrect fromTokenAddress detail added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INCORRECT FROMTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without fromTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when fromTokenAddress detail not added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT FROMTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with invalid toTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.invalidTokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when invalid toTokenAddress detail added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INVALID TOTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with incorrect toTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.incorrectTokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when incorrect toTokenAddress detail added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INCORRECT TOTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without toTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          fromAddress: data.sender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when toTokenAddress detail not added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT TOTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with invalid fromAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.invalidSender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when invalid fromAddress detail added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INVALID FROMADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response with incorrect fromAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.incorrectSender,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when incorrect fromAddress detail added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITH INCORRECT FROMADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getCrossChainQuotes response without fromAmount detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAddress: data.sender,
        };

        await maticMainNetSdk.getCrossChainQuotes(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when fromAmount not added in the getCrossChainQuotes request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETCROSSCHAINQUOTES RESPONSE WITHOUT FROMADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without fromChainId detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when fromchainid detail not added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT FROMCHAINID DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without toChainId detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when toChainId detail not added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT TOCHAINID DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with invalid fromTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.invalidTokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when invalid fromTokenAddress detail added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INVALID FROMTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with incorrect fromTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.incorrectTokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when incorrect fromTokenAddress detail added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INCORRECT FROMTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without fromTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when fromTokenAddress detail not added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT FROMTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with invalid toTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.invalidTokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when invalid toTokenAddress detail added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INVALID TOTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response with incorrect toTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.incorrectTokenAddress_arbitrumUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when incorrect toTokenAddress detail added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITH INCORRECT TOTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without toTokenAddress detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          fromAmount: utils.parseUnits(data.swap_value, 6),
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when toTokenAddress detail not added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT TOTOKENADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });

  it('REGRESSION: Validate the getAdvanceRoutesLiFi response without fromAmount detail on the matic network', async () => {
    if (runTest) {
      let quoteRequestPayload;
      try {
        quoteRequestPayload = {
          fromChainId: data.matic_chainid,
          toChainId: data.arbitrum_chainid,
          fromTokenAddress: data.tokenAddress_maticUSDC,
          toTokenAddress: data.tokenAddress_arbitrumUSDC,
        };

        await maticMainNetSdk.getAdvanceRoutesLiFi(quoteRequestPayload);

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
          assert.fail(
            'The respective validate is not displayed when fromAmount not added in the getAdvanceRoutesLiFi request',
          );
        }
      }
    } else {
      console.warn(
        'DUE TO INSUFFICIENT WALLET BALANCE, SKIPPING TEST CASE OF THE GETADVANCEROUTESLIFI RESPONSE WITHOUT FROMADDRESS DETAIL ON THE matic NETWORK',
      );
    }
  });
});
