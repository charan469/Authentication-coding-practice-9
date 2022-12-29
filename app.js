const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());
let db = null;

const initiateDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`dbError:${error.message}`);
    process.exit(1);
  }
};
initiateDbAndServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `select * from user where username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      const createUserQuery = `insert into user (username, name,
             password, gender, location) values ('${username}','${name}',
             '${password}','${gender}','${location}')`;
      await db.run(createUserQuery);
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

module.exports = app;
