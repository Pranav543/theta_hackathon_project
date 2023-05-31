const path = require("path");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("./connection");
const users = require("./routes/users");
const messages = require("./routes/messages");
const notifications = require("./routes/notifications");
const video = require("./routes/videos");
const comments = require("./routes/comments");
const likes = require("./routes/likes");
const analytics = require("./routes/analytics");
const live = require("./routes/lives");
const nft = require("./routes/nfts");
require("./rtmp");
const compression = require("compression");
app.use(compression({ level: 6, threshold: 0 }));
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
    limit: "1000mb",
    parameterLimit: 1000000,
  })
);
app.use(express.json({ limit: "1000mb" }));

app.use("/api/users", users);
app.use("/api/messages", messages);
app.use("/api/notifications", notifications);
app.use("/api/video", video);
app.use("/api/video/comments", comments);
app.use("/api/video/likes", likes);
app.use("/api/live", live);
app.use("/api/nft", nft);
app.use("/api/analytics", analytics);
app.use("/uploads", express.static("uploads"));

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname1, "/client/build")));

  // index.html for all page routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5001;

const server = require("http").createServer(app);

const io = require("./socket").init(server);

app.post('/generateToken', (req, res) => {
  const user = req.body.user;

  // Create a JWT token
  const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });

  res.json({ token });
});

server.listen(PORT, () => {
  // console.log("server is listening");
  const port = server.address().port;
  console.log(`Server started on port ${port}`);
});

module.exports = app;
