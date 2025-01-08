import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv
import { assert } from 'chai';
import addContext from 'mochawesome/addContext.js';
import data from '../../../../data/testData.json' assert { type: 'json' };
import {
  randomChainId,
  randomChainName,
} from '../../../../utils/sharedData_mainnet.js';
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
      var test = this;

      // make the random address whitelisted
      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [data.value, randomChainId, process.env.API_KEY],
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_invalid, // invalid url
          {
            params: [data.value, randomChainId, process.env.API_KEY],
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_incorrect, // incorrect url
          {
            params: [data.value, randomChainId, process.env.API_KEY],
          },
          header
        );

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

  it.only(
    'REGRESSION: Validate the deposit endpoint with v1 and invalid value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [
              data.invalidValue, // invalid value
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

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

  it.only(
    'REGRESSION: Validate the deposit endpoint with v1 and exceeded value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [
              data.exceededValue, // exceeded value
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

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

  it.only(
    'REGRESSION: Validate the deposit endpoint with v1 and without value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [
              randomChainId, // without value
              process.env.API_KEY,
            ],
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [data.value, randomChainId, 'arka_public'], // invalid apikey
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [data.value, randomChainId], // without apikey
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit,
          {
            params: [data.value, process.env.API_KEY], // without chainid
          },
          header
        );

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
    'SMOKE: Validate the deposit endpoint with v2 of Arka on the ' +
      randomChainName +
      ' network',
    async function () {
      var test = this;

      // make the random address whitelisted
      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [data.value, randomChainId, process.env.API_KEY_ARKA],
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2_invalid, // invalid url
          {
            params: [data.value, randomChainId, process.env.API_KEY],
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2_incorrect, // incorrect url
          {
            params: [data.value, randomChainId, process.env.API_KEY],
          },
          header
        );

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

  it.only(
    'REGRESSION: Validate the deposit endpoint with v2 and invalid value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [
              data.invalidValue, // invalid value
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

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

  it.only(
    'REGRESSION: Validate the deposit endpoint with v2 and exceeded value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [
              data.exceededValue, // exceeded value
              randomChainId,
              process.env.API_KEY,
            ],
          },
          header
        );

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

  it.only(
    'REGRESSION: Validate the deposit endpoint with v2 and without value of Arka on ' +
      randomChainName +
      ' Network',
    async function () {
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [
              randomChainId, // without value
              process.env.API_KEY,
            ],
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [data.value, randomChainId, 'arka_public'], // invalid apikey
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [data.value, randomChainId], // without apikey
          },
          header
        );

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
      var test = this;

      try {
        const response = await axios.post(
          data.arka_deposit_v2,
          {
            params: [data.value, process.env.API_KEY], // without chainid
          },
          header
        );

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
});
