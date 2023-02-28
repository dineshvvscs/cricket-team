const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost/3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team`;
  const playersArray = await db.all(playersQuery);
  response.send(playersArray);
});

//Creates a new player in the team
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
            INSERT INTO
            cricket_team (player_name,jersey_number,role)
            VALUES
                (
                    '${playerName}',
                    ${jerseyNumber},
                    '${role}'
                );`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const playerArray = await db.get(playerQuery);
  response.send(playerArray);
});

//Updates the details of a player in the team based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetailsToUpdate = request.body;
  const { playerName, jerseyNumber, role } = playerDetailsToUpdate;
  const updateQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
        DELETE FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
