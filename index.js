const express = require('express');
const movieHelpers = require('./movieHelpers');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

let allMovieData;
const fs=require("fs");
fs.readFile("./mockMovieData.json", "utf8", (err, jsonString) => {
    if (err) throw err

    else allMovieData = JSON.parse(jsonString);
});

app.use(cors({
    origin: '*'
}));


app.get('/allMovies', (req, res) => {
    let alphabetizedMovies = allMovieData.sort((a, b) => (a.movieName > b.movieName) ? 1 : -1);
    res.send(alphabetizedMovies);    
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

app.listen(
    PORT, 
    () => console.log(`server running at http://localhost:${PORT}`)
)