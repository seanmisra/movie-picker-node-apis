const express = require('express');
const app = express();
const PORT = 8080;
app.use(express.json());

let allMovieData;
const fs=require("fs");
fs.readFile("./mockMovieData.json", "utf8", (err, jsonString) => {
    if (err) throw err

    else allMovieData = JSON.parse(jsonString);
});


app.get('/allMovies', (req, res) => {
    res.send({
        allMovieData
    });    
})

app.post('/recommendation', (req, res) => {
    const { movieOneInput } = req.body;
    const { movieTwoInput } = req.body;
    const { movieThreeInput } = req.body;

    let relevantKeywords = [];
    let allMovieDataLocal = allMovieData;

    if (!movieOneInput) {
        res.status(418).send({
            message: "movieOneInput is required"
        })
    }
    const movieOne = allMovieDataLocal.find(movie => movie.movieName.toLowerCase() === movieOneInput.toLowerCase()); 
    if (movieOne) {
        relevantKeywords.push(...movieOne.keywords);
        allMovieDataLocal = allMovieDataLocal.filter(movie => movie.movieName !== movieOne.movieName);
    } else {
        res.status(418).send({
            message: "movieOneInput is invalid"
        }) 
    }

    if (movieTwoInput) {
        const movieTwo = allMovieDataLocal.find(movie => movie.movieName.toLowerCase() === movieTwoInput.toLowerCase()); 
        if (movieTwo) {
          relevantKeywords.push(...movieTwo.keywords);
          allMovieDataLocal = allMovieDataLocal.filter(movie => movie.movieName !== movieTwo.movieName);      
        } else {
            res.status(418).send({
                message: "movieTwoInput is invalid"
            }) 
        }
      }
      if (movieThreeInput) {
        const movieThree = allMovieDataLocal.find(movie => movie.movieName.toLowerCase() === movieThreeInput.toLowerCase()); 
        if (movieThree) {
          relevantKeywords.push(...movieThree.keywords);
          allMovieDataLocal = allMovieDataLocal.filter(movie => movie.movieName !== movieThree.movieName);      
        } else {
            res.status(418).send({
                message: "movieThreeInput is invalid"
            }) 
        }
      }


    relevantKeywords = [...new Set(relevantKeywords)];
    const movieScores = {};

    allMovieDataLocal.forEach((movieObj) => {
        const sharedKeywords = movieObj.keywords.filter(kw => relevantKeywords.includes(kw)); 
        const score = sharedKeywords.length;
        movieScores[movieObj.movieName] = score; 
      });  

      const recommendation = Object.keys(movieScores).reduce((a, b) => movieScores[a] > movieScores[b] ? a : b);
      const recommendationObj = allMovieDataLocal.find(movie => movie.movieName.toLowerCase() === recommendation.toLowerCase()); 
      recommendationObj.hasData = true;

    res.send({
        recommendationObj
    });
})

app.listen(
    PORT, 
    () => console.log(`server running at http://localhost:${PORT}`)
)