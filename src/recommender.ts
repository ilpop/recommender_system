import { SimilarityCalculator } from "./similarityCalculator";

export class Recommender {
  private ratingsByUser: Map<number, Map<number, number>>;

  constructor(ratingsByUser: Map<number, Map<number, number>>) {
    this.ratingsByUser = ratingsByUser;
  }

  public findNearestNeighbors(
    userId: number,
    numberOfNeighbors: number
  ): number[] {
    const similarities = new Map<number, number>();
    const userRatings = this.ratingsByUser.get(userId);
    if (!userRatings) return [];

    this.ratingsByUser.forEach((otherUserRatings, otherUserId) => {
      if (otherUserId !== userId) {
        const similarity = SimilarityCalculator.pearsonCorrelation(
          userRatings,
          otherUserRatings
        );
        similarities.set(otherUserId, similarity);
      }
    });

    // Sort by similarity and pick the top neighbors
    const sortedSimilarities = Array.from(similarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, numberOfNeighbors)
      .map(([userId]) => userId);

    return sortedSimilarities;
  }

public recommendMovies(
    userId: number,
    nearestNeighbors: number[],
    maxRecommendations: number = 100
): { movieId: number; averageWeightedScore: number }[]{
    const userRatings =
        this.ratingsByUser.get(userId) || new Map<number, number>();
    const totals = new Map<number, number>();
    const simSums = new Map<number, number>();

    for (const neighborId of nearestNeighbors) {
        const neighborRatings =
            this.ratingsByUser.get(neighborId) || new Map<number, number>();
        const similarity = SimilarityCalculator.pearsonCorrelation(
            userRatings,
            neighborRatings
        );

        if (similarity <= 0) continue; // Skip neighbors with zero or negative similarity

        for (const [movieId, neighborRating] of neighborRatings) {
            if (!userRatings.has(movieId)) {
                totals.set(
                    movieId,
                    (totals.get(movieId) || 0) + neighborRating * similarity
                );
                simSums.set(movieId, (simSums.get(movieId) || 0) + similarity);
            }
        }
    }

    // Calculate the rankings
    const rankings: [number, number][] = Array.from(totals).map(([movieId, total]) => {
        const sumSims = simSums.get(movieId) || 0;
        const averageWeightedScore = total / sumSims;
        return [movieId, averageWeightedScore]; // Now it's guaranteed to be a number, not undefined
      });
  
      // Sort the rankings by the highest scores and slice to get the top recommendations
      const sortedRankings = rankings
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxRecommendations)
        .map(([movieId, averageWeightedScore]) => {
          // Here we can be sure that averageWeightedScore is a number because we handled it above
          return { movieId, averageWeightedScore };
        });
  
      return sortedRankings;
    }
  }




