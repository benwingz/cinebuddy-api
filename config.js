module.exports = {

  'secret': process.env.JWT_SECRET,
  'database': process.env.DATABASE_URI,
  'showtimeProviderAPIkey' : process.env.SHOWTIME_PROVIDER_API_KEY,
  'showtimeProviderUrl' : process.env.SHOWTIME_PROVIDER_API_URL,
  'apiKeyMovieDB' : process.env.MOVIE_DB_API_KEY,
  'movieApiBaseUrl' : process.env.MOVIE_DB_API_URL

};
