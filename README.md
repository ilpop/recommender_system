## Getting Started

To get this project up and running on your local machine, follow these steps:

### Prerequisites

- Node.js installed on your local machine.
- TypeScript installed globally or as a part of your project dependencies.
- A package manager like npm or Yarn to install the project dependencies.

### Installation
1. Clone the repository to your local machine:

```
git clone https://github.com/ilpop/recommender_system.git
```
2. Navigate to the cloned repository directory:
```
cd ecommender_system
```
    

3. Install the project dependencies:

```
npm install
```

4. Build and Run

After you have installed the dependencies, you can build and start the application using npm scripts defined in your package.json:

Build the project. This compiles the TypeScript files to JavaScript and prepares the app for execution:

```
npm run build
```

Start the application. This runs the compiled JavaScript code:
```
npm start
```
### Usage

Once the application is started, it will load the user rating data, calculate similarities, and provide movie recommendations based on user preferences.
```
const recommender = new Recommender(ratingsByUser);
const testUserId = 1; // Specify the user ID
const nearestNeighbors = recommender.findNearestNeighbors(testUserId, 3); // Find 3 nearest neighbors
const recommendations = recommender.recommendMovies(testUserId, nearestNeighbors, 5); // Recommend top 5 movies
```
Print the recommendations
```
console.log(`Top 5 recommendations for user ${testUserId}:`, recommendations);
```
