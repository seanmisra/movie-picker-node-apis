const express = require('express');
const movieHelpers = require('./movieHelpers');
const cors = require('cors');
const app = express();
require('dotenv').config({ path: './local.env' })
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 8080;

let allMovieData;

let uri = process.env.DATABASE_URL;
let mongoClient = new MongoClient(uri);
connectToDB().catch(console.error);

app.use(express.json());

app.use(cors({
    origin: '*'
}));

app.listen(
    PORT, 
    () => console.log(`server running at http://localhost:${PORT}`)
)

app.get('/allMovies', (req, res) => {
    res.send(allMovieData);    
})

app.post('/recommendation', (req, res) => {
    const { movieOneInput } = req.body;
    const { movieTwoInput } = req.body;
    const { movieThreeInput } = req.body;

    let relevantKeywords = [];
    let allMovieDataLocal = allMovieData;

    if (!movieOneInput) {
        handleClientError(res, "movieOneInput is required");
    }
    const movieOne = movieHelpers.findMovie(allMovieData, movieOneInput);
    if (movieOne) {
        relevantKeywords.push(...movieOne.keywords);
        allMovieDataLocal = allMovieDataLocal.filter(movie => movie.movieName !== movieOne.movieName);
    } else {
        handleClientError(res, "movieOneInput is invalid");
    }

    if (movieTwoInput) {
        const movieTwo = movieHelpers.findMovie(allMovieData, movieTwoInput);
        if (movieTwo) {
          relevantKeywords.push(...movieTwo.keywords);
          allMovieDataLocal = allMovieDataLocal.filter(movie => movie.movieName !== movieTwo.movieName);      
        } else {
            handleClientError(res, "movieTwoInput is invalid");
        }
    }
    if (movieThreeInput) {
        const movieThree = movieHelpers.findMovie(allMovieData, movieThreeInput);
        if (movieThree) {
          relevantKeywords.push(...movieThree.keywords);
          allMovieDataLocal = allMovieDataLocal.filter(movie => movie.movieName !== movieThree.movieName);      
        } else {
            handleClientError(res, "movieThreeInput is invalid");
        }
    }


    relevantKeywords = [...new Set(relevantKeywords)];
    movieScores = movieHelpers.getMovieScores(allMovieDataLocal, relevantKeywords);
    recommendationObj = movieHelpers.getMovieRecommendation(allMovieDataLocal, movieScores);

    res.send(recommendationObj);
})

function handleClientError(res, messageString) {
    res.status(418).send({
        message: messageString 
    })
}

async function connectToDB() {
    try {
        let database = mongoClient.db(process.env.DATABASE_NAME);
        let movies = database.collection(process.env.COLLECTION_NAME);
    
        // sort alphabetically by the movieName; only include movieName, movieYear, keywords
        const options = {
            sort: { movieName: 1 },
            projection: { _id: 0, movieName: 1, movieYear: 1, keywords: 1 },
          };
    
        const cursor = movies.find({}, options);
    
        if ((await cursor.count()) === 0) {
          console.log("No movie data found!");
        } else {
            allMovieData = await cursor.toArray();
        }   
    } finally {
        await mongoClient.close();
    }
}

// for debugging
async function listDatabases(client) {
   const databasesList = await client.db().admin().listDatabases();
   console.log('databasesList');
   databasesList.databases.forEach(db => {
       console.log(db);
   });

}