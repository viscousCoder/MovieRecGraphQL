const axios = require("axios");
require("dotenv").config();

const url = process.env.BASE_URL;
const apikey = process.env.API_KEY;

/**
 * @function to get the trending movie or shows
 * @returns array of objects of trending movies and shows
 */
const trendingMoviesShows = async () => {
  try {
    const response = await axios.get(
      `${url}/trending/all/day?api_key=${apikey}`
    );
    return response.data.results;
  } catch (error) {
    throw new Error("Failed to fetch data from TMDb API.");
  }
};

/**
 * @function to get the trending movie
 * @returns array of object of trending movie
 */
const trendingMovies = async () => {
  try {
    const response = await axios.get(
      `${url}/trending/movie/day?api_key=${apikey}`
    );
    return response.data.results;
  } catch (error) {
    throw new Error("Failed to fetch data from TMDB API.");
  }
};

/**
 * @function to get the trending tv shows
 * @returns array of object of trending tv shows
 */
const tredingTvShows = async () => {
  try {
    const response = await axios.get(
      `${url}/trending/tv/day?api_key=${apikey}`
    );
    return response.data.results;
  } catch (error) {
    throw new Error("Failed to fetch data from TMDB API.");
  }
};

/**
 * @function to get the  trending, movies, tv shows details
 * @returns object of trending, movie, tv shows details
 */
const getMovieShowDetails = async (type, id) => {
  try {
    const response = await axios.get(
      `${url}/${type}/${id}?api_key=${apikey}&language=en-US`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to get movie or show details");
  }
};

/**
 * @function to get the credit details
 * @returns object that conatin id and array of object related to crew and another array of object related to cast
 */
const getCreditDetails = async (type, id) => {
  try {
    const response = await axios.get(
      `${url}/${type}/${id}/credits?api_key=${apikey}&language=en-US`
    );
    return response?.data;
  } catch (error) {
    throw new Error("Failed to get movie or show credits details", error);
  }
};

/**
 * @function to get the recommended movie according to the selected one
 * @param {Number} id of the selected movie
 * @returns array of object of recommended movie
 */
const getRecommendedMovieData = async (id) => {
  try {
    const response = await axios.get(
      `${url}/movie/${id}/recommendations?api_key=${apikey}&language=en-US&page=1`
    );
    // console.log(response.data.results);
    return response.data.results;
  } catch (error) {
    // console.log(`Error getting  recommended movie `, error);
    throw new Error("Failed to get  recommended movie");
  }
};

/**
 * @function to get the similar movie according to the selected one
 * @param {Number} id of the selected movie
 * @returns array of object of similar movie
 */
const getSimilarMovieData = async (id) => {
  try {
    const response = await axios.get(
      `${url}/movie/${id}/similar?api_key=${apikey}&language=en-US&page=1`
    );
    return response.data.results;
  } catch (error) {
    // console.log(`Error getting similar movie`, error);
    throw new Error("Failed to get similar movie");
  }
};

/**
 * @function to get the recommended tv shows according to the selected one
 * @param {Number} id of the selected tv shows
 * @returns array of object of recommended tv shows
 */
const getRecommendedTvData = async (id) => {
  try {
    const response = await axios.get(
      `${url}/tv/${id}/recommendations?api_key=${apikey}&language=en-US&page=1`
    );
    return response.data.results;
  } catch (error) {
    // console.log(`Error getting  recommended Tv `, error);
    throw new Error("Failed to get  recommended Tv");
  }
};

/**
 * @function to get the similar tv shows according to the selected one
 * @param {Number} id of the selected tv shows
 * @returns array of object of similar tv shows
 */
const getSimilarTvData = async (id) => {
  try {
    const response = await axios.get(
      `${url}/tv/${id}/similar?api_key=${apikey}&language=en-US&page=1`
    );
    return response.data.results;
  } catch (error) {
    // console.log(`Error getting similar Tv`, error);
    throw new Error("Failed to get similar Tv");
  }
};

/**
 * @function to get the reviews on the movie or tv shows which the user selected
 * @param {String} type i.e., the selected one is movie or tv show
 * @param {Number} id of the selected movie or tv shows
 * @returns array of object of reviews
 */
const getReviewData = async (type, id) => {
  try {
    const response = await axios.get(
      `${url}/${type}/${id}/reviews?api_key=${apikey}&language=en-US&page=1`
    );
    return response.data.results;
  } catch (error) {
    throw new Error("Failed to get search data");
  }
};

/**
 * @function to get the trending movie or shows
 * @returns array of objects of trending movies and shows
 */
const getSearchbarData = async (query) => {
  try {
    const response = await axios.get(
      `${url}/search/movie?api_key=${apikey}&query=${query}&include_adult=false&language=en-US&page=1`
    );
    // console.log(response.data.results);
    return response.data.results;
  } catch (error) {
    // console.log(`Error getting search data`, error);
    throw new Error("Failed to get search data");
  }
};

module.exports = {
  trendingMoviesShows,
  trendingMovies,
  tredingTvShows,
  getMovieShowDetails,
  getCreditDetails,
  getRecommendedMovieData,
  getSimilarMovieData,
  getRecommendedTvData,
  getSimilarTvData,
  getReviewData,
  getSearchbarData,
};
