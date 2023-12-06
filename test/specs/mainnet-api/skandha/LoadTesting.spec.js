import saveToDatabase from '../../../utils/Skandha_CsvToDatabase.js';

describe('CSV to Database Test', function () {
  it('Saving the Skandha CSV data to the database', function (done) {
    const csvFilePath =
      'C:/Users/admin/apache-jmeter-5.6.2/apache-jmeter-5.6.2/skandha_summaryreport.csv';

    saveToDatabase(csvFilePath);

    // Added a delay to ensure the asynchronous operations are completed
    setTimeout(() => {
      done();
    }, 5000); // Adjust the timeout as needed
  });
});
