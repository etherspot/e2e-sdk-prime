import mysql from 'mysql2';
import fs from 'fs';
import csv from 'csv-parser';
import * as dotenv from 'dotenv';
dotenv.config(); // init dotenv

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect();

const insertQuery = `INSERT INTO arka_summaryreport (Label,No_Samples,Average,Min,Max,Std_Dev,Error_Per,Throughput,Received_Kbpersec,Sent_Kbpersec,Avg_Bytes) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function saveToDatabase(csvFilePath) {
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const values = [
        row.Label,
        row.No_Samples,
        row.Average,
        row.Min,
        row.Max,
        row.Std_Dev,
        row.Error_Per,
        row.Throughput,
        row.Received_Kbpersec,
        row.Sent_Kbpersec,
        row.Avg_Bytes,
      ]; // these column names exist in your CSV

      connection.query(insertQuery, values, (error) => {
        if (error) {
          console.error('Error inserting row into the database:', error);
        } else {
          console.log('Row inserted into the database');
        }
      });
    })
    .on('end', () => {
      console.log('CSV file successfully processed.');
      connection.end();
    });
}

export default saveToDatabase;
