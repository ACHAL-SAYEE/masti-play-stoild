const mongoose = require("mongoose");

const initializeDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mastiplay', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).catch((error) => console.log(error));
    // await mongoose.connect(process.env.MONGO_URL, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    console.log("Connected to MongoDB");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

module.exports = initializeDB