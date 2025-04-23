const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const querystring = require("querystring");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

//add necessary scopes

app.get("/login", (req, res) => {
  const scope =
    "user-read-private user-read-email user-read-playback-state playlist-read-private playlist-modify-private playlist-modify-public user-top-read user-read-recently-played";
  const params = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    // ✅ Gib die Tokens zurück an dein Frontend
    res.json({ access_token, refresh_token });
  } catch (error) {
    console.error("Fehler beim Token-Austausch:", error.response.data);
    res.status(500).json({ error: "Token-Austausch fehlgeschlagen" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth-Server läuft auf Port ${PORT}`);
});
