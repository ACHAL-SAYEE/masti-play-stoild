const mongoose = require("mongoose");

const initializeDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
     
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };

  module.exports=initializeDB