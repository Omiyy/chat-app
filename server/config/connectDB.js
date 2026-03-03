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
    console.error("❌ MongoDB connection failed:", error.message)
    console.error("Please check:")
    console.error("  1. Your IP address is whitelisted in MongoDB Atlas")
    console.error("  2. Your MONGODB_URI in server/.env is correct")
    console.error("  3. Your network/internet connection is stable")
    process.exit(1) // Stop the server — app cannot work without a database
  }
}

module.exports = connectDB
