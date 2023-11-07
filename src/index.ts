import { DatasetManager } from "./dataSetManager";
import { Recommender } from "./recommender";

// Usage
(async () => {
  const datasetPath = "src/ml-latest-small/ratings.csv";
  const datasetManager = new DatasetManager(datasetPath);
  await datasetManager.loadDataset();

  const testUserId = 1;
  const userRatings = datasetManager.getUserRatings(testUserId);
  //console.log(`Ratings for user ${testUserId}:`, userRatings);

  if (userRatings) {
    const recommender = new Recommender(datasetManager.getAllUserRatings());
    const nearestNeighbors = recommender.findNearestNeighbors(testUserId, 3);
    console.log(`Nearest neighbors for user ${testUserId}:`, nearestNeighbors);

    const recommendations = recommender.recommendMovies(
      testUserId,
      nearestNeighbors,
      100
    ); // Get top recommendations for user
    recommendations;
    recommendations.forEach((rec) => {
      console.log(
        `Movie ID: ${
          rec.movieId
        }, Average Weighted Score: ${rec.averageWeightedScore.toFixed(2)}`
      );
    });
  }
})();
