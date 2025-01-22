import addContext from 'mochawesome/addContext.js';
import { expect, assert } from 'chai';

function customRetryAsync(fn, maxRetries) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const retryDelay = 5000; // You can adjust the delay as needed

    async function run() {
      try {
        await fn();
        resolve(); // Resolve the promise if the test passes
      } catch (error) {
        if (retries < maxRetries) {
          console.log(
            `Test failed (retry ${retries + 1}/${maxRetries}): ${error.message}`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retries++;
          run(); // Retry the test
        } else {
          reject(error); // Reject the promise if all retries fail
        }
      }
    }
    run();
  });
}

function getRandomNetwork(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return randomIndex;
}

function getEpochTimeInSeconds() {
  const currentTime = Math.floor(new Date().getTime() / 1000);
  return currentTime;
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function handleErrorValidation(
  test,
  errorResponse,
  constantMessage,
  validationMessage,
  responseCode
) {
  try {
    let error = errorResponse.response.data.error;

    // Validate the error message and HTTP status code
    if (error.includes(constantMessage)) {
      expect(errorResponse.response.status).to.equal(responseCode);

      expect(errorResponse.response.data).to.have.property(
        'error',
        constantMessage
      );
    } else {
      // Add error context and fail the test
      const errorString = errorResponse.toString();
      addContext(test, errorString);
      assert.fail(validationMessage);
    }
  } catch (err) {
    // Handle unexpected errors
    const errorString = err.toString();
    addContext(test, errorString);
    assert.fail('Unexpected error occurred.');
  }
}

export {
  customRetryAsync,
  getRandomNetwork,
  getEpochTimeInSeconds,
  generateRandomString,
  handleErrorValidation,
};
