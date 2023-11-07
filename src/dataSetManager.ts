import * as fs from "fs";
import { parse } from "csv-parse";

export class DatasetManager {
  getAllUserRatings(): Map<number, Map<number, number>> {
    return this.ratingsByUser;
  }
  private ratingsByUser: Map<number, Map<number, number>> = new Map<
    number,
    Map<number, number>
  >();

  constructor(private datasetPath: string) {}

  public async loadDataset(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.datasetPath)
        .pipe(parse({ delimiter: ",", columns: true }))
        .on("data", (row: any) => {
          this.processRow(row);
        })
        .on("end", () => {
          console.log("Dataset loaded");
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  private processRow(row: any): void {
    const userId = parseInt(row.userId, 10);
    const movieId = parseInt(row.movieId, 10);
    const rating = parseFloat(row.rating);

    let userRatings = this.ratingsByUser.get(userId);
    if (!userRatings) {
      userRatings = new Map<number, number>();
      this.ratingsByUser.set(userId, userRatings);
    }
    userRatings.set(movieId, rating);
  }

  public getUserRatings(userId: number): Map<number, number> | undefined {
    return this.ratingsByUser.get(userId);
  }
}
