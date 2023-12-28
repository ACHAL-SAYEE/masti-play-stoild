require("dotenv").config();
const PORT = process.env.PORT || 4000;
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());


const initializeDBAndServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });


    app.listen(PORT, () => {
      console.log("Server running on port 3007");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

const authenticateToken = (request, response, next) => {
  let iChatJwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    iChatJwtToken = authHeader.split(" ")[1];
  }
  if (iChatJwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(iChatJwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.phoneNo = payload.phoneNo;
        next();
      }
    });
  }
};

initializeDBAndServer();
const userSchema = new mongoose.Schema({
  UserId:String,
  following: [String],
  followedBy:[String]
  });
  
  const TagSchema=tag = new mongoose.Schema({
     id:String
  });
  const Tag = mongoose.model('Tag', TagSchema);

const postSchema=new mongoose.Schema({
  PostId :String,
  title:String,
  description:  String ,
     postedBy:String,
     imgUrl: {
      type: String,
      default: null
    },
    tags:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    sharedCount:Number
    // List<Tags> tags;  // can be null
  
},{
  timestamps: true, // Add createdAt and updatedAt fields
});  
const User = mongoose.model("User", userSchema);
const Post=mongoose.model("Post",postSchema)



app.post("/api/posts/", async (req, res) => {
 const {PostId,title,description,postedBy,imgUrl,tags}=req.body;
 const tagObjectIds = await Promise.all(
  tags.map(async (tagName) => {
    const existingTag = await Tag.findOne({ id: tagName });
    if (existingTag) {
      return existingTag._id;
    } else {
      const newTag = new Tag({ id: tagName });
      await newTag.save();
      return newTag._id;
    }
  })
);
 const newPost = new Post({
  PostId,title,description,postedBy,imgUrl,      tags: tagObjectIds,sharedCount:0

});
try{const result=await newPost.save();
  res.status(200)
  res.send({"msg":"posted successfuly"})
  console.log(result)

}catch(e){
    console.log(e)
  }

});

app.put("/api/posts/share", async (req, res) => {
  const {postId}=req.body
  try {
   
    const result = await Post.updateOne(
      { PostId: postId },
      { $inc: { sharedCount: 1 } }
    );
console.log(result)
    if (result.modifiedCount === 1) {
      res.status(200).send({ message: 'Shared successfully.' });
    } else {
      res.status(404).send({ message: 'Post not found.' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

app.get("/api/hot", async (req, res) => {
  const {limit,start}=req.query
  try {

    const posts = await Post.find()
      .sort({ sharedCount: -1 }) 
      .skip(Number(start))
      .limit(Number(limit))
      .select({
        _id: 0, 
        createdAt: 0,
        updatedAt: 0, 
        __v: 0, 
      });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error.' });
  }
});

app.get("/api/recent", async (req, res) => {
  const {limit,start}=req.query
  try {

    const posts = await Post.find()
      .sort({ createdAt: -1 }) 
      .skip(Number(start))
      .limit(Number(limit))
      .select({
        _id: 0, 
        createdAt: 0,
        updatedAt: 0, 
        __v: 0, 
      });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error.' });
  }
});


app.get("/",async(req,res)=>{
    res.send("ok")
})
