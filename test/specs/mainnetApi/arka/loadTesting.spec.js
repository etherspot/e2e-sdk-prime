import saveToDatabase from '../../../utils/arkaCsvToDatabase.js';

describe('CSV to Database Test', function () {
  it('Saving the Arka CSV data to the database', function (done) {
    saveToDatabase(process.env.ARKA_CSV_PATH);

    // Added a delay to ensure the asynchronous operations are completed
    setTimeout(() => {
      done();
    }, 5000); // Adjust the timeout as needed
  });
});
