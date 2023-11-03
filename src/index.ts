import * as fs from 'fs';
import { parse } from 'csv-parse';

const datasetPath = 'src/ml-latest-small/ratings.csv';
const ratingsByUser = new Map<number, Map<number, number>>();
let count = 0;

// Read the dataset and parse it
fs.createReadStream(datasetPath)
    .pipe(parse({ delimiter: ',', columns: true }))
    .on('data', (row: any) => {
        const { userId, movieId, rating } = row;
        let userRatings = ratingsByUser.get(userId);
        if (!userRatings) {
            userRatings = new Map<number, number>();
            ratingsByUser.set(userId, userRatings);
        }
        userRatings.set(movieId, parseFloat(rating));
        count++;
        if (count <= 10) {
            console.log(row); // This will display the first 10 rows
            console.log('User ratings:', userRatings);
        }
    })
    .on('end', () => {
        console.log('Total count of ratings:', count);
    });
