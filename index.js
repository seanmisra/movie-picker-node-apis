const express = require('express');
const app = express();
const PORT = 8080;
app.use(express.json());

let allMovieData;
const fs=require("fs");
fs.readFile("./mockMovieData.json", "utf8", (err, jsonString) => {
    if (err) throw err;

    allMovieData = JSON.parse(jsonString);
});

app.get('/allMovies', (req, res) => {
    res.send({
        allMovieData
    });    
})

app.listen(
    PORT, 
    () => console.log(`server running at http://localhost:${PORT}`)
)