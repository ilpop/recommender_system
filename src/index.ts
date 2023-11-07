import * as fs from "fs";
import { parse } from "csv-parse";

const datasetPath = "src/ml-latest-small/ratings.csv";
const ratingsByUser = new Map<number, Map<number, number>>();
let count = 0;

// Read the dataset and parse it
fs.createReadStream(datasetPath)
  .pipe(parse({ delimiter: ",", columns: true }))
  .on("data", (row: any) => {
    const userId = parseInt(row.userId, 10); // Convert userId to number
    const movieId = parseInt(row.movieId, 10); // Convert movieId to number
    const rating = parseFloat(row.rating); // Ensure rating is a number

    let userRatings = ratingsByUser.get(userId);
    if (!userRatings) {
      userRatings = new Map<number, number>();
      ratingsByUser.set(userId, userRatings);
    }
    userRatings.set(movieId, rating);
    count++;
    if (count <= 5) {
      console.log(row); // This will display the first 10 rows
      console.log("User ratings:", userRatings);
    }
  })
  .on("end", () => {
    console.log("Total count of ratings:", count);

    //testing..
    const testUserId = 1; // Choose a user to test
    let userRatings = ratingsByUser.get(testUserId);
    console.log(`Ratings for user ${testUserId}:`, userRatings);
    const similarities = new Map<number, number>();

    if (userRatings) {
      ratingsByUser.forEach((ratings, userId) => {
        if (userId !== testUserId) {
          const similarity = pearsonCorrelation(userRatings, ratings);
          similarities.set(userId, similarity);
        }
      });
    }

    console.log(`Similarities for user ${testUserId}:`, similarities);

    // Step 3: Identify the nearest neighbors
    const nearestNeighbors = findNearestNeighbors(testUserId, ratingsByUser, 3);
    console.log(`Nearest neighbors for user ${testUserId}:`, nearestNeighbors);

    // Step 4: Generate recommendations
    const recommendations = recommendMovies(
      testUserId,
      findNearestNeighbors(testUserId, ratingsByUser, 3),
      ratingsByUser
    );
    console.log(`Recommendations for user ${testUserId}:`, recommendations);
  });

function pearsonCorrelation(
  user1Ratings: Map<number, number> | undefined,
  user2Ratings: Map<number, number | undefined>
): number {
  // Extract the set of mutually rated items
  const mutualRatings = [];
  if (user1Ratings) {
    for (const [movieId, rating] of user1Ratings) {
      if (user2Ratings.has(movieId)) {
        mutualRatings.push([rating, user2Ratings.get(movieId)]);
      }
    }
  }

  const numRatings = mutualRatings.length;
  if (numRatings === 0) return 0; // No mutual ratings, so return correlation of 0

  // Calculate the sum and square sum for both sets of ratings
  let sum1 = 0,
    sum2 = 0,
    sum1Sq = 0,
    sum2Sq = 0,
    pSum = 0;
  for (const [rating1, rating2] of mutualRatings) {
    if (typeof rating1 !== "undefined") {
      sum1 += rating1;
      sum1Sq += rating1 * rating1;
    }
    if (typeof rating2 !== "undefined") {
      sum2 += rating2;
      sum2Sq += rating2 * rating2;
    }
    if (typeof rating1 !== "undefined" && typeof rating2 !== "undefined") {
      pSum += rating1 * rating2;
    }
  }

  // Calculate Pearson score
  const num = pSum - (sum1 * sum2) / numRatings;
  const den = Math.sqrt(
    (sum1Sq - (sum1 * sum1) / numRatings) *
      (sum2Sq - (sum2 * sum2) / numRatings)
  );
  if (den === 0) return 0;

  return num / den;
}

function findNearestNeighbors(
  userId: number,
  ratingsByUser: Map<number, Map<number, number>>,
  numberOfNeighbors: number
): number[] {
  const similarities = new Map<number, number>();

  const userRatings = ratingsByUser.get(userId);
  if (!userRatings) return [];

  for (const [otherUserId, otherUserRatings] of ratingsByUser) {
    if (otherUserId !== userId) {
      const similarity = pearsonCorrelation(userRatings, otherUserRatings);
      similarities.set(otherUserId, similarity);
    }
  }

  // Sort by similarity and pick the top neighbors
  const sortedSimilarities = [...similarities].sort((a, b) => b[1] - a[1]);
  return sortedSimilarities
    .slice(0, numberOfNeighbors)
    .map(([userId]) => userId);
}

function recommendMovies(
  userId: number,
  nearestNeighbors: number[],
  ratingsByUser: Map<number, Map<number, number>>
): [number, number][] {
  const userRatings = ratingsByUser.get(userId) ?? new Map<number, number>();
  const totals = new Map<number, number>(); // To accumulate the total weighted scores by movie
  const simSums = new Map<number, number>(); // To accumulate the sum of similarities by movie

  for (const neighborId of nearestNeighbors) {
    // Check that neighbor is not the user and has a similarity greater than zero
    if (neighborId !== userId) {
      const neighborRatings =
        ratingsByUser.get(neighborId) ?? new Map<number, number>();
      const similarity = pearsonCorrelation(userRatings, neighborRatings);

      if (similarity > 0) {
        // Only consider neighbors with positive similarity
        for (const [movieId, neighborRating] of neighborRatings.entries()) {
          // Only recommend movies the user hasn't seen
          if (!userRatings.has(movieId)) {
            // Initialize if this is the first neighbor rating for this movie
            if (!totals.has(movieId)) {
              totals.set(movieId, 0);
              simSums.set(movieId, 0);
            }
            // Add the neighbor's weighted rating to the total scores
            const currentTotal = totals.get(movieId) ?? 0;
            totals.set(
              movieId,
              currentTotal + (neighborRating ?? 0) * similarity
            );
            // Sum the similarities for normalization
            const currentSimSum = simSums.get(movieId) ?? 0;
            simSums.set(movieId, currentSimSum + similarity);
          }
        }
      }
    }
  }

  for (const neighborId of nearestNeighbors) {
    // Check that neighbor is not the user and has a similarity greater than zero
    if (neighborId !== userId) {
      const neighborRatings =
        ratingsByUser.get(neighborId) || new Map<number, number>();
      const similarity = pearsonCorrelation(userRatings, neighborRatings);

      if (similarity > 0) {
        // Only consider neighbors with positive similarity
        for (const [movieId, neighborRating] of neighborRatings) {
          // Only recommend movies the user hasn't seen
          if (!userRatings.has(movieId)) {
            // Initialize if this is the first neighbor rating for this movie
            if (!totals.has(movieId)) {
              totals.set(movieId, 0);
              simSums.set(movieId, 0);
            }
            // Add the neighbor's weighted rating to the total scores
            const currentTotal = totals.get(movieId) ?? 0;
            totals.set(
              movieId,
              currentTotal + (neighborRating ?? 0) * similarity
            );
            // Sum the similarities for normalization
            const currentSimSum = simSums.get(movieId) ?? 0;
            simSums.set(movieId, currentSimSum + similarity);
          }
        }
      }
    }
  }

  // Normalize the total scores by the sum of similarities to get the average weighted score
  const rankings: [number, number][] = Array.from(totals.keys()).map(
    (movieId) => {
      const total = totals.get(movieId);
      const sumSims = simSums.get(movieId);
      return [movieId, total! / sumSims!];
    }
  );

  // Sort the rankings by the highest scores
  rankings.sort((a, b) => b[1] - a[1]);

  return rankings;
}
