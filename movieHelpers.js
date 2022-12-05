function getMovieScores(allMovieData, keywords) {
    const movieScores = {};

    allMovieData.forEach((movieObj) => {
        const sharedKeywords = movieObj.keywords.filter(kw => keywords.includes(kw)); 
        const score = sharedKeywords.length;
        movieScores[movieObj.movieName] = score; 
      });  

      return movieScores;
}

function getMovieRecommendation(allMovieData, movieScores) {
    const recommendation = Object.keys(movieScores).reduce((a, b) => movieScores[a] > movieScores[b] ? a : b);
    const recommendationObj = allMovieData.find(movie => movie.movieName.toLowerCase() === recommendation.toLowerCase()); 
    recommendationObj.hasData = true;

    return recommendationObj;
}

function findMovie(allMovieData, movieInput) {
    return allMovieData.find(movie => movie.movieName.toLowerCase() === movieInput.toLowerCase());
}

module.exports = { getMovieScores, getMovieRecommendation, findMovie };