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
const { generateUniqueId } = require('./utils');
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
  UserId: String

});

const TagSchema = tag = new mongoose.Schema({
  tag: String
}, { timestamps: true });

const followingDataSchema = new mongoose.Schema({
  followerId: String, followingId: String
});

const CommentSchema = new mongoose.Schema({
  userId: String,
  postId: String,
  comment: String
})

const likesInfo = new mongoose.Schema({
  likedBy: String,
  postId: String
})


const following = mongoose.model("following", followingDataSchema)
const Tag = mongoose.model('Tag', TagSchema);
const LikesInfo = mongoose.model("LikesInfo", likesInfo)
const postSchema = new mongoose.Schema({
  PostId: String,
  title: String,
  description: String,
  postedBy: String,
  imgUrl: {
    type: String,
    default: null
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  sharedCount: Number,
  commentsCount: Number,
  likesCount: Number

}, {
  timestamps: true,
});
const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema)
const Comment = mongoose.model("Comment", CommentSchema)


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/posts/", async (req, res) => {
  const {title, description, postedBy, imgUrl, tags } = req.body;
  const postId=generateUniqueId()
  const tagObjectIds = await Promise.all(
    tags.map(async (tagName) => {
      const existingTag = await Tag.findOne({ tag: tagName });
      if (existingTag) {
        // console.log("exists")
        return existingTag._id;
      } else {
        // console.log("efefefe")
        const newTag = new Tag({ tag: tagName });
        await newTag.save();
        return newTag._id;
      }
    })
  );
  const newPost = new Post({
    PostId:postId, title, description, postedBy, imgUrl, tags: tagObjectIds, sharedCount: 0, commentsCount: 0, likesCount: 0

  });
  try {
    const result = await newPost.save();
    res.status(200)
    res.send({ "msg": "posted successfuly" })
    console.log(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e });
  }
});

app.put("/api/posts/share", async (req, res) => {
  const { postId } = req.body
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
  const { limit, start } = req.query
  try {

    const posts = await Post.find()
      .sort({ sharedCount: -1 })
      .skip(Number(start))
      .limit(Number(limit))
      .select({
        _id: 0,
        // we also want these 2 fields to be included in the response too
        // createdAt: 0,
        // updatedAt: 0,
        __v: 0,
      });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error.' });
  }
});

app.get("/api/recent", async (req, res) => {
  console.log("req.query", req.query);
  const { limit, start } = req.query
  try {

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(Number(start))
      .limit(Number(limit))
      .select({
        _id: 0,
        // createdAt: 0,
        // updatedAt: 0,
        __v: 0,
      });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error.' });
  }
});


app.post("/api/follow", async (req, res) => {
  const { followerId, followingId } = req.body
  try {
    const newFollower = new following({ followerId, followingId })
    const result = await newFollower.save()
    res.status(200).send({ message: "follower added successfully" })
    console.log(result)
  } catch (e) {
    res.status(500).send({ error: e })
  }
})

app.get("/api/following", async (req, res) => {
  const { userId, limit, start } = req.query
  try {
    const followerIds = await following.find({ followerId: userId })
      .distinct('followingId');
    console.log(followerIds)
    const posts = await Post.find({
      postedBy: { $in: followerIds },
    })
      .sort({ createdAt: -1 }).skip(Number(start))
      .limit(Number(limit))
      .select({
        _id: 0,
        // createdAt: 0,
        // updatedAt: 0,
        __v: 0
      });
    res.status(200).send(posts)
    console.log(posts)
  }
  catch (e) {
    res.status(500).send({ error: e })

  }
})


app.get("/api/tags/", async (req, res) => {
  const { date } = req.query//asuming date in in string not date object
  const datefromString = new Date(date)
  console.log(date)
  try {
    const result = await Tag.find({ createdAt: { $gt: datefromString } }).select({
      _id: 0,
      // createdAt: 0,
      // updatedAt: 0,
      __v: 0,
    });
    console.log(result)
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(e)
  }

});

app.get("/", async (req, res) => {
  res.send("ok")
})

app.post("/api/search-with-tags", async (req, res) => {
  const { tags, limit, start } = req.body
  try {
    const tagObjectIds = await Tag.find({ tag: { "$in": tags } }).select({ _id: 1 }) //tags.map(tag => );

    const result = await Post.find({ "tags": { "$in": tagObjectIds } }).populate('tags').sort({ createdAt: -1 })
    .skip(Number(start))
    .limit(Number(limit)).select({ _id: 0, __v: 0 })
    res.send(result)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

})


app.post("/api/comment", async (req, res) => {
  const { postId, userId, comment } = req.body;
  try {
    const NewComment = new Comment({ postId, userId, comment })
    await NewComment.save()
    const result = await Post.updateOne({ PostId: postId }, { $inc: { commentsCount: 1 } })
    console.log("result", result)
    res.send("comment posted successfully")

  }
  catch (e) {
    console.log("error", e)
    res.status(500).send("internal server error")

  }
});

app.post("/api/like", async (req, res) => {
  const { postId, userId } = req.body;
  try {
    const likedStatus = await LikesInfo.find({
      likedBy: userId,
      postId
    })
    if (likedStatus.length === 0) {
      const newLike = new LikesInfo({
        likedBy: userId,
        postId
      })
      const updatesLikesCount=await Post.updateOne({PostId:postId},{$inc:{likesCount:1}})
      await newLike.save()
      res.send("post liked")
    }
    else {
      const unlikeResult = await LikesInfo.deleteOne({
        likedBy: userId,
        postId
      })
      const updatesLikesCount=await Post.updateOne({PostId:postId},{$inc:{likesCount:-1}})
     
      console.log(unlikeResult)
      res.send("post unliked")
    }

  } catch (e) {
    console.log("error", e)
    res.status(500).send("internal server error")
  }

});

