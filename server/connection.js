const mongoose = require("mongoose");
require("dotenv").config();

async function connect() {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjv1qkz.mongodb.net/`,
    () => {
      console.log("Database is connected");
    }
  );
}

connect();
