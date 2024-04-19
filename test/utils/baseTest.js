import helper from "./helper.js";

function customRetryAsync(fn, maxRetries) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const retryDelay = 3000; // You can adjust the delay as needed

    async function run() {
      try {
        await fn();
        resolve(); // Resolve the promise if the test passes
      } catch (error) {
        if (retries < maxRetries) {
          console.log(
            `Test failed (retry ${retries + 1}/${maxRetries}): ${
              error.message
            }`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retries++;
          run(); // Retry the test
          helper.wait(10000);
        } else {
          reject(error); // Reject the promise if all retries fail
        }
      }
    }

    run();
  });
}

export default customRetryAsync;