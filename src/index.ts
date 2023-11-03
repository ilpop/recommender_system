import * as fs from 'fs';
import { parse } from 'csv-parse';

const datasetPath = 'src/ml-latest-small/movies.csv';

let count = 0;

// Read the dataset and parse it
fs.createReadStream(datasetPath)
    .pipe(parse({ delimiter: ',', columns: true }))
    .on('data', (row: any) => {
        console.log(row); // Display each row to understand the dataset structure
        count++;
    })
    .on('end', () => {
        console.log('Total count of ratings:', count);
    });
