const mongoose = require("mongoose");

const initializeDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://achalsayee2:FAWltJHPQOWRFggR@otbound.c8kfayb.mongodb.net/?retryWrites=true&w=majority', {
    // await mongoose.connect('mongodb://0.0.0.0:27017/mastiplay', {
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