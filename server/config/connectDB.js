const mongoose = require("mongoose");

async function connectDB() {
  try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully");

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });

    connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    console.log("Please check:");
    console.log("1. Your IP address is whitelisted in MongoDB Atlas");
    console.log("2. Your MongoDB connection string is correct");
    console.log("3. Your network connection is stable");
    
    // Don't exit the process, let the server run without DB for now
    console.log("Server will continue without database connection...");
  }
}

module.exports = connectDB
