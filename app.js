const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dataBasePath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("this server running at http://localhost/3000");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const movieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const directorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

let db = null;

app.get("/movies/", async (request, response) => {
  const getAllMovies = `
    SELECT 
    movie_name
    FROM 
    movie`;
  const movieNames = await db.all(getAllMovies);
  response.send(
    movieNames.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getPlayerId = `
  SELECT * 
  FROM 
  movie 
  WHERE 
  movie_id=${movieId}`;
  const playerId = await db.get(getPlayerId);
  response.send(movieDbObjectToResponseObject(playerId));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovies = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES 
  (${directorId},'${movieName}','${leadActor}')`;
  const movies = await db.run(postMovies);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE 
     movie 
SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}' 
WHERE 
     movie_id=${movieId}
  
  
  `;
  db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
  DELETE  
  FROM 
  movie 
  WHERE 
  movie_id=${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
   SELECT * 
   FROM 
   director `;
  const allDirectors = await db.all(getAllDirectors);
  response.send(
    allDirectors.map((eachDirector) =>
      directorDbObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
  SELECT 
  movie_name 
  FROM 
  movie 
  WHERE 
  director_id=${directorId}`;
  const moviesArray = await db.all(getDirectorMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
