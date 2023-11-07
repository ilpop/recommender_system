export class SimilarityCalculator {
public static pearsonCorrelation(
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
}