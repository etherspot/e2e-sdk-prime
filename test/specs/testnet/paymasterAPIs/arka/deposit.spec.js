import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import {
  randomChainId,
  randomChainName,
} from '../../../../utils/sharedData_testnet.js';
import axios from 'axios';
import message from '../../../../data/messages.json' assert { type: 'json' };
import constant from '../../../../data/constant.json' assert { type: 'json' };

// define header with valid details
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

describe('Validate the deposit endpoint of the Arka', function () {
  it(
    'SMOKE: Validate the deposit endpoint with v1 of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.deposit_2);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_depositv1_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_invalid}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid url

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_2);
        console.log(message.fail_depositv1_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_depositv1_2);
          console.log(message.vali_depositv1_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_incorrect}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // incorrect url

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_3);
        console.log(message.fail_depositv1_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_depositv1_3);
          console.log(message.vali_depositv1_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and invalid value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.invalidValue], // invalid value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_4);
        console.log(message.fail_depositv1_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_depositv1_4);
          console.log(message.vali_depositv1_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and exceeded value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.exceededValue], // exceeded value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_44);
        console.log(message.fail_depositv1_44);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deposit_3)) {
          addContext(test, message.vali_depositv1_44);
          console.log(message.vali_depositv1_44);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_44);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and without value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [], // without value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_5);
        console.log(message.fail_depositv1_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv1_5);
          console.log(message.vali_depositv1_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_6);
        console.log(message.fail_depositv1_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv1_6);
          console.log(message.vali_depositv1_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_7);
        console.log(message.fail_depositv1_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv1_7);
          console.log(message.vali_depositv1_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v1 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}`; // without chainid

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv1_8);
        console.log(message.fail_depositv1_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv1_8);
          console.log(message.vali_depositv1_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv1_8);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the deposit endpoint with v1 and userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(response.data.message, message.vali_deposit_message);

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.deposit_2,
          message.vali_deposit_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_deposit1_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and invalid value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.invalidValue], // invalid value
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_10);
        console.log(message.fail_deposit_10);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deposit_10);
          console.log(message.vali_deposit_10);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_10);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and exceeded value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.exceededValue], // exceeded value
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_11);
        console.log(message.fail_deposit_11);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deposit_3)) {
          addContext(test, message.vali_deposit_11);
          console.log(message.vali_deposit_11);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_11);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and without value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [], // without value
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_12);
        console.log(message.fail_deposit_12);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deposit_12);
          console.log(message.vali_deposit_12);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_12);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and incorrect apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.DATA_API_KEY}&chainId=${randomChainId}&useVp=true`; // incorrect apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_5);
        console.log(message.fail_deposit_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deposit_5);
          console.log(message.vali_deposit_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and invalid apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_6);
        console.log(message.fail_deposit_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deposit_6);
          console.log(message.vali_deposit_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and without apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?chainId=${randomChainId}&useVp=true`; // without apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_7);
        console.log(message.fail_deposit_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deposit_7);
          console.log(message.vali_deposit_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and invalid chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${data.invalid_chainId}&useVp=true`; // invalid chainId

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_8);
        console.log(message.fail_deposit_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_network_3)) {
          addContext(test, message.vali_deposit_8);
          console.log(message.vali_deposit_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_8);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter and without chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&useVp=true`; // without chainId

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_9);
        console.log(message.fail_deposit_9);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deposit_9);
          console.log(message.vali_deposit_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_9);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter with false value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=false`; // false value

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(response.data.message, message.vali_deposit_message);

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.deposit_2,
          message.vali_deposit_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_deposit2_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v1, userVp parameter with invalid data on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=qwerty`; // invalid data in userVp parameter

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_13);
        console.log(message.fail_deposit_13);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_3)) {
          addContext(test, message.vali_deposit_13);
          console.log(message.vali_deposit_13);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_13);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the deposit endpoint with v2 of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // perform assertions
        assert.include(response.data.message, constant.deposit_2);

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_depositv2_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and invalid url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2_invalid}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid url

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_2);
        console.log(message.fail_depositv2_2);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_depositv2_2);
          console.log(message.vali_depositv2_2);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_2);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and incorrect url of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2_incorrect}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // incorrect url

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_3);
        console.log(message.fail_depositv2_3);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.not_found)) {
          addContext(test, message.vali_depositv2_3);
          console.log(message.vali_depositv2_3);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_3);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and invalid value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.invalidValue], // invalid value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_4);
        console.log(message.fail_depositv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_depositv2_4);
          console.log(message.vali_depositv2_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and exceeded value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [data.exceededValue], // exceeded value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_4);
        console.log(message.fail_depositv2_4);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deposit_3)) {
          addContext(test, message.vali_depositv2_4);
          console.log(message.vali_depositv2_4);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_4);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and without value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}`;

      // define the payload
      const requestData = {
        params: [], // without value
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_5);
        console.log(message.fail_depositv2_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv2_5);
          console.log(message.vali_depositv2_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and invalid apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_6);
        console.log(message.fail_depositv2_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv2_6);
          console.log(message.vali_depositv2_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and without apikey of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?chainId=${randomChainId}`; // without apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_7);
        console.log(message.fail_depositv2_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv2_7);
          console.log(message.vali_depositv2_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint with v2 and without chainid of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}`; // without chainid

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the addStake endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_depositv2_8);
        console.log(message.fail_depositv2_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_depositv2_8);
          console.log(message.vali_depositv2_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_depositv2_8);
        }
      }
    }
  );

  it(
    'SMOKE: Validate the deposit endpoint with v2 and userVp parameter of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(response.data.message, message.vali_deposit_message);

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.deposit_2,
          message.vali_deposit_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_deposit1_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and invalid value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.invalidValue], // invalid value
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_10);
        console.log(message.fail_deposit_10);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deposit_10);
          console.log(message.vali_deposit_10);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_10);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and exceeded value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [data.exceededValue], // exceeded value
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_11);
        console.log(message.fail_deposit_11);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deposit_3)) {
          addContext(test, message.vali_deposit_11);
          console.log(message.vali_deposit_11);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_11);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and without value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`;

      // define the payload
      const requestData = {
        params: [], // without value
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_12);
        console.log(message.fail_deposit_12);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deposit_12);
          console.log(message.vali_deposit_12);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_12);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and incorrect apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.DATA_API_KEY}&chainId=${randomChainId}&useVp=true`; // incorrect apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_5);
        console.log(message.fail_deposit_5);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deposit_5);
          console.log(message.vali_deposit_5);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_5);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and invalid apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.INVALID_ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=true`; // invalid apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_6);
        console.log(message.fail_deposit_6);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deposit_6);
          console.log(message.vali_deposit_6);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_6);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and without apikey on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?chainId=${randomChainId}&useVp=true`; // without apikey

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_7);
        console.log(message.fail_deposit_7);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_apiKey)) {
          addContext(test, message.vali_deposit_7);
          console.log(message.vali_deposit_7);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_7);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and invalid chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${data.invalid_chainId}&useVp=true`; // invalid chainId

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_8);
        console.log(message.fail_deposit_8);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_network_3)) {
          addContext(test, message.vali_deposit_8);
          console.log(message.vali_deposit_8);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_8);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter and without chainId on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&useVp=true`; // without chainId

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_9);
        console.log(message.fail_deposit_9);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.invalid_data)) {
          addContext(test, message.vali_deposit_9);
          console.log(message.vali_deposit_9);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_9);
        }
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter with false value on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=false`; // false value

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        // validate the message parameter in the response
        assert.isNotEmpty(response.data.message, message.vali_deposit_message);

        // validate the text of the message parameter in the response
        assert.include(
          response.data.message,
          constant.deposit_2,
          message.vali_deposit_messageText
        );

        // perform assertions
        assert.equal(response.status, constant.successCode_1);
      } catch (e) {
        console.error(e);
        const eString = e.toString();
        addContext(test, eString);
        assert.fail(message.fail_deposit2_1);
      }
    }
  );

  it(
    'REGRESSION: Validate the deposit endpoint of Arka with v2, userVp parameter with invalid data on ' +
      randomChainName +
      ' Network',
    async function () {
      // define the url
      const url = `${data.arka_deposit_v2}?apiKey=${process.env.ARKA_API_KEY_PROD}&chainId=${randomChainId}&useVp=qwerty`; // invalid data in userVp parameter

      // define the payload
      const requestData = {
        params: [data.value],
      };

      var test = this;
      // validate the deposit endpoint
      try {
        const response = await axios.post(url, requestData, header);

        addContext(test, message.fail_deposit_13);
        console.log(message.fail_deposit_13);
      } catch (e) {
        const error = e.response.data.error;

        if (error.includes(constant.deployVp_3)) {
          addContext(test, message.vali_deposit_13);
          console.log(message.vali_deposit_13);
        } else {
          console.error(e);
          const eString = e.toString();
          addContext(test, eString);
          assert.fail(message.fail_deposit_13);
        }
      }
    }
  );
});
