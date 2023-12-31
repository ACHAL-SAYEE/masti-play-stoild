const unirest = require('unirest');
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
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
const { generateUniqueId, generateUserId } = require('./utils');
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
        request.UserId = payload.UserId;
        next();
      }
    });
  }
};


initializeDBAndServer();

const userSchema = new mongoose.Schema({
  UserId: String,
  AgentId: { type: String, default: null },
  name: String,
  email: String,
  photo: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  gender: Number,
  dob: {
    type: Date,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  frame: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
  beansCount: { type: Number, default: 0 },
  diamondsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  friends: { type: Number, default: 0 },

});

const TagSchema = tag = new mongoose.Schema({
  tag: String,
  usedCount: {
    type: Number,
    default: 0,
  },
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

const agentSchema = new mongoose.Schema({
  AgentId: String,
  resellerOf: { type: String, default: null },
  beansCount: Number,
  diamondsCount: Number,
  paymentMethods: [String],
  status: { type: String, default: null }
})


const TransactionHistorySchema = new mongoose.Schema({

  paymentType: String,
  beansAdded: { type: Number, default: 0 },
  diamondsAdded: { type: Number, default: 0 },
  game: { type: String, default: null },
  sentby: String,
  sentTo: String
  // sentTo: { type: String, default: null }
}, {
  timestamps: true,
})

const TransactionHistory = mongoose.model("TransactionHistory", TransactionHistorySchema)
const following = mongoose.model("following", followingDataSchema)
const Tag = mongoose.model('Tag', TagSchema);
const LikesInfo = mongoose.model("LikesInfo", likesInfo)

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema)
const Comment = mongoose.model("Comment", CommentSchema)
const Agent = mongoose.model("Agent", agentSchema)

const otpMap = {};
const beansToDiamondsRate = 0.5
app.post('/otp', (req, res) => {
  const req1 = unirest('GET', 'https://www.fast2sms.com/dev/bulkV2');
  const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  otpMap[req.headers.phone] = { otp, timestamp: Date.now() };
  console.log("otpMap", otpMap);

  req1.query({
    authorization: 'BDZTf24xkW9pv6UYeaoq01JsR3bPMrNCIOzFSh7QydGH5icgl84noFbjAcINLwxPgkp1QWBfDsOURHS2',
    variables_values: otp.toString(),
    route: 'otp',
    numbers: req.headers.phone,
  });
  console.log("OTP Sending request sent!");

  req1.headers({
    'cache-control': 'no-cache',
  });

  req1.end(function (res1) {
    if (res1.error) {
      console.log("Error: ", res1.error);
      res.status(500).send(res1.error);
    } else {
      console.log("successful");
      const obj = {
        return: res1.body.return,
        request_id: res1.body.request_id,
        message: res1.body.message,
        // otp: otp.toString(),
      };
      res.status(200).json(obj);
    }
  });
});

app.post('/verify-otp', (req, res) => {
  console.log("Verifying otp");
  const phone = req.headers.phone;
  const otp = req.headers.otp;
  // const expectedOtp = '123456';
  console.log(`phone = ${phone}`);
  console.log(`otpMap = `, otpMap);
  if (otpMap[phone] != null) {
    const storedData = otpMap[phone]['otp'];
    console.log(`storedData = ${storedData}`);
    console.log(`typeof storedData = ${typeof storedData}`);
    console.log(`otp = ${otp}`);
    console.log(`typeof otp = ${typeof otp}`);
    const { storedOtp, timestamp } = storedData;
    // if (storedData.toString().isEqual(otp)) {
    if (parseInt(otp, 10) == storedData) { //  && Date.now() - timestamp < 600000

      // 300000 milliseconds (5 minutes) is the validity window for the OTP
      res.status(200).json({ message: 'OTP verification successful' });
    } else {
      res.status(401).json({ message: 'Invalid OTP or OTP expired' });
    }
  } else {
    res.status(404).json({ message: 'Phone number not found' });
  }
});


app.post("/api/register", async (req, res) => {

  const { email, password, name, gender, dob, country, frame, photo, phoneNumber } = req.body

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await User.find({ email })
  if (result.length === 0) {
    if (password.length < 8) {
      res.status(400).send("password is too short .minimum length of password shoud be 8")
      return
    }
    let randomNumber = generateUserId()
    console.log(randomNumber)
    const existingUserWithId = await User.find({ UserId: randomNumber })
    if (existingUserWithId.length > 0) {
      isUserIdMatched = true
      while (isUserIdMatched) {
        randomNumber = generateUserId()
        const existingUserWithId = await User.find({ UserId: randomNumber })
        isUserIdMatched = existingUserWithId.length > 0
      }
    }
    const newUser = new User({ UserId: `${randomNumber}`, email, password: hashedPassword, name, gender, dob, country, frame, photo, phoneNumber })
    await newUser.save()
    res.status(200).send("user created successfully")

  }
  else {
    res.status(400).send("User already exists")
  }
})

app.post("/api/user", async (req, res) => {
  const { email, password, name, gender, dob, country, frame, photo, phoneNumber } = req.body
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    let randomNumber = generateUserId()
    const existingUserWithId = await User.find({ UserId: randomNumber })
    if (existingUserWithId.length > 0) {
      isUserIdMatched = true
      while (isUserIdMatched) {
        randomNumber = generateUserId()
        const existingUserWithId = await User.find({ UserId: randomNumber })
        isUserIdMatched = existingUserWithId.length > 0
      }
    }
    const newUser = new User({ UserId: `${randomNumber}`, email, password: hashedPassword, name, gender, dob: new Date(dob), country, frame, photo, phoneNumber })
    await newUser.save()
    res.status(200).send("user created successfully")

  } catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body
  const result = await User.findOne({ email })
  console.log(result)
  if (result.length === 0) {

    res.status(400).send("Invalid user")
  }
  else {
    const isPasswordMatched = await bcrypt.compare(password, result.password);
    if (isPasswordMatched === true) {
      const payload = {
        UserId: result.UserId
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.send({ jwtToken });
    } else {
      res.status(400);
      res.send("Invalid Password");
    }
  }
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/posts/", async (req, res) => {
  const { title, description, postedBy, imgUrl, tags } = req.body;
  const postId = generateUniqueId()
  const tagObjectIds = await Promise.all(
    tags.map(async (tagName) => {
      const existingTag = await Tag.findOne({ tag: tagName });
      if (existingTag) {
        // console.log("exists")
        const result = await Tag.updateOne({ tag: tagName }, { $inc: { usedCount: 1 } });
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
    PostId: postId, title, description, postedBy, imgUrl, tags: tagObjectIds, sharedCount: 0, commentsCount: 0, likesCount: 0

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

  const { userId, limit, start } = req.query
  // console.log(userId)
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
    let hasLiked, hasCommented, doesFollow;
    console.log("posts", posts)

    const updatedPosts = await Promise.all(posts.map(async post => {
      console.log(post)
      const likedResult = await LikesInfo.findOne({ likedBy: userId, postId: post.PostId });
      const CommentResult = await Comment.findOne({ userId, postId: post.PostId });
      const followResult = await following.findOne({ followerId: userId, followingId: post.postedBy })
      if (likedResult === null) { hasLiked = false } else { hasLiked = true }
      if (CommentResult === null) { hasCommented = false } else { hasCommented = true }
      if (followResult === null) { doesFollow = false } else { doesFollow = true }
      const plainPost = post.toObject();
      return { ...plainPost, hasCommented, hasLiked, doesFollow }
    }))
    // console.log(posts)

    console.log("updatedPosts", updatedPosts)
    res.status(200).send(updatedPosts);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error.' });
  }
});

app.get("/api/recent", async (req, res) => {
  console.log("req.query", req.query);
  const { limit, start, userId } = req.query
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
    const updatedPosts = await Promise.all(posts.map(async post => {
      console.log(post)
      const likedResult = await LikesInfo.findOne({ likedBy: userId, postId: post.PostId });
      const CommentResult = await Comment.findOne({ userId, postId: post.PostId });
      const followResult = await following.findOne({ followerId: userId, followingId: post.postedBy })
      if (likedResult === null) { hasLiked = false } else { hasLiked = true }
      if (CommentResult === null) { hasCommented = false } else { hasCommented = true }
      if (followResult === null) { doesFollow = false } else { doesFollow = true }
      const plainPost = post.toObject();
      return { ...plainPost, hasCommented, hasLiked, doesFollow }
    }))
    res.status(200).send(updatedPosts);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error.' });
  }
});

app.post("/api/follow", async (req, res) => {
  const { followerId, followingId } = req.body
  // const followerId=req.UserId
  try {

    const followStatus = await following.find({
      followerId, followingId
    })
    if (followStatus.length === 0) {
      const newFollower = new following({ followerId, followingId })
      const result = await newFollower.save()
      const bidirection = await following.findOne({ followerId: followingId, followingId: followerId })
      if (bidirection !== null) {
        const updateFriend = await User.updateMany({ UserId: { $in: [followerId, followingId] } }, { $inc: { friends: 1 } })
      }

      const updatefollowerUser = await User.updateOne({ UserId: followerId }, { $inc: { followingCount: 1 } })
      const updatefollowingUser = await User.updateOne({ UserId: followingId }, { $inc: { followersCount: 1 } })
      res.status(200).send("following")
      console.log(result)
    }
    else {
      const bidirection = await following.findOne({ followerId: followingId, followingId: followerId })
      if (bidirection !== null) {
        const updateFriend = await User.updateMany({ UserId: { $in: [followerId, followingId] } }, { $inc: { friends: -1 } })
      }
      const unfollowResult = await following.deleteOne({
        followerId, followingId
      })
      const updatefollowerUser = await User.updateOne({ UserId: followerId }, { $inc: { followingCount: -1 } })
      const updatefollowingUser = await User.updateOne({ UserId: followingId }, { $inc: { followersCount: -1 } })
      res.send("unfollowing")

    }

  } catch (e) {
    console.log(e)
    res.status(500).send({ error: e })
  }
})

app.get("/api/following", async (req, res) => {
  // const userId=req.UserId
  const { limit, start, userId } = req.query
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
    const updatedPosts = await Promise.all(posts.map(async post => {
      console.log(post)
      const likedResult = await LikesInfo.findOne({ likedBy: userId, postId: post.PostId });
      const CommentResult = await Comment.findOne({ userId, postId: post.PostId });
      const followResult = await following.findOne({ followerId: userId, followingId: post.postedBy })
      if (likedResult === null) { hasLiked = false } else { hasLiked = true }
      if (CommentResult === null) { hasCommented = false } else { hasCommented = true }
      if (followResult === null) { doesFollow = false } else { doesFollow = true }
      const plainPost = post.toObject();
      return { ...plainPost, hasCommented, hasLiked, doesFollow }
    }))
    res.status(200).send(updatedPosts)
    console.log(posts)
  }
  catch (e) {
    res.status(500).send({ error: e })

  }
})

app.get("/api/tags/", async (req, res) => {
  const { date } = req.query
  const datefromString = new Date(date)
  console.log(date)
  try {
    const result = await Tag.find({ createdAt: { $gt: datefromString } }).sort({ usedCount: -1 }).select({
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

app.post("/api/search-with-tags", async (req, res) => {
  //
  const { userId, tags, limit, start } = req.body
  let posts;
  // const userId=req.UserId
  console.log(userId)
  try {
    if (userId == null) {
      const tagObjectIds = await Tag.find({ tag: { "$in": tags } }).select({ _id: 1 })

      posts = await Post.find({ "tags": { "$in": tagObjectIds } }).populate('tags').sort({ createdAt: -1 })
        .skip(Number(start))
        .limit(Number(limit)).select({ _id: 0, __v: 0 })

    }
    else if (tags == null || tags.length === 0) {
      posts = await Post.find({ "postedBy": userId })
        .skip(Number(start))
        .limit(Number(limit)).select({ _id: 0, __v: 0 })

    }
    else if (userId != null && tags.length > 0) {
      const tagObjectIds = await Tag.find({ tag: { "$in": tags } }).select({ _id: 1 })

      posts = await Post.find({ "tags": { "$in": tagObjectIds }, "postedBy": userId }).populate('tags').sort({ createdAt: -1 })
        .skip(Number(start))
        .limit(Number(limit)).select({ _id: 0, __v: 0 })

    }
    const updatedPosts = await Promise.all(posts.map(async post => {
      console.log("post", post)
      const likedResult = await LikesInfo.findOne({ likedBy: userId, postId: post.PostId });
      const CommentResult = await Comment.findOne({ userId, postId: post.PostId });
      const followResult = await following.findOne({ followerId: userId, followingId: post.postedBy })
      if (likedResult === null) { hasLiked = false } else { hasLiked = true }
      if (CommentResult === null) { hasCommented = false } else { hasCommented = true }
      if (followResult === null) { doesFollow = false } else { doesFollow = true }
      const plainPost = post.toObject();
      return { ...plainPost, hasCommented, hasLiked, doesFollow }
    }))
    res.status(200).send(updatedPosts)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

})

app.post("/api/comment", async (req, res) => {

  const { postId, comment, userId } = req.body;
  // const userId=req.UserId
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

//no need to send userId it comes from  header through jwtloken
app.post("/api/like", async (req, res) => {
  // const userId=req.UserId
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
      const updatesLikesCount = await Post.updateOne({ PostId: postId }, { $inc: { likesCount: 1 } })
      await newLike.save()
      res.send("post liked")
    }
    else {
      const unlikeResult = await LikesInfo.deleteOne({
        likedBy: userId,
        postId
      })
      const updatesLikesCount = await Post.updateOne({ PostId: postId }, { $inc: { likesCount: -1 } })
      console.log(unlikeResult)
      res.send("post unliked")
    }

  } catch (e) {
    console.log("error", e)
    res.status(500).send("internal server error")
  }

});


app.get("/api/users/following", async (req, res) => {
  const { userId, limit, start } = req.body
  try {
    const result = await following.find({ followerId: userId }).skip(Number(start)).limit(Number(limit)).select({ followingId: 1, _id: 0 })
    res.send(result)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

});

app.get("/api/users/followers", async (req, res) => {
  const { userId, limit, start } = req.body
  try {
    const result = await following.find({ followingId: userId }).skip(Number(start)).limit(Number(limit)).select({ followerId: 1, _id: 0 })
    res.send(result)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

});

app.get("/api/users/doesFollow", async (req, res) => {
  const { followedBy, followed } = req.body
  try {
    const result = await following.find({ followerId: followedBy, followingId: followed })
    if (result.length === 0) {
      res.send(false)
    }
    else {
      res.send(true)
    }
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

})


app.post("/api/beansDiamonds", async (req, res) => {
  const { userId, beans, diamonds, game, paymentType, sentby, sentTo } = req.body
  console.log(userId)
  try {
    let transaction
    //recharge
    if (paymentType !== null && sentTo === userId) {
      transaction = new TransactionHistory({ diamondsAdded: diamonds, beansAdded: beans, sentby, sentTo: userId, paymentType })

    }
    //outcome
    else if (game !== null && sentTo == userId && sentby == userId) {
      transaction = new TransactionHistory({ diamondsAdded: diamonds, beansAdded: beans, sentby: userId, sentTo: userId, game })
    }
    //income
    else if (game != null && sentTo == userId) {
      transaction = new TransactionHistory({ diamondsAdded: diamonds, beansAdded: beans, sentby: userId, game, })

    }
    await transaction.save()
    const result = await User.updateOne({ UserId: userId }, { $inc: { diamondsCount: diamonds == undefined ? 0 : diamonds, beansCount: beans == undefined ? 0 : beans } })
    await transaction.save()
    console.log(result)
    res.send("transaction done")
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.get("/api/beans-history", async (req, res) => {
  const { userId, start, limit } = req.query
  try {

    const result = await TransactionHistory.find({ sentTo: userId, diamondsAdded: 0 }).skip(start).limit(limit).select({ _id: 0, __v: 0, diamondsAdded: 0, updatedAt: 0, sentTo: 0 })

    console.log(result)
    res.send(result)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.get("/api/diamonds-history", async (req, res) => {
  const { userId, start, limit, mode } = req.query
  let result;
  try {
    if (mode === "income")
      result = await TransactionHistory.find({ sentTo: userId, paymentType: null, beansAdded: 0 }).skip(start).limit(limit).select({ _id: 0, __v: 0, beansAdded: 0, updatedAt: 0, sentTo: 0 })
    else if (mode == "recharge")
      result = await TransactionHistory.find({ sentTo: userId, game: null, beansAdded: 0 }).skip(start).limit(limit).select({ _id: 0, __v: 0, beansAdded: 0, updatedAt: 0, sentTo: 0 })
    else
      result = await TransactionHistory.find({ sentTo: userId, game: null, sentby: null, beansAdded: 0 }).skip(start).limit(limit).select({ _id: 0, __v: 0, beansAdded: 0, updatedAt: 0, sentTo: 0 })
    console.log(result)
    res.send(result)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.get("/api/users", async (req, res) => {
  const { userId } = req.query
  try {

    const result = await User.findOne({ UserId: userId }).select({ _id: 0, __v: 0 })

    console.log(result)
    res.send(result)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.get("/api/convert", async (req, res) => {
  const { diamonds, beans, userId } = req.query
  console.log(typeof (diamonds))
  console.log(typeof (beans))

  console.log(userId)

  try {
    if (diamonds == null) {
      console.log("entered2")
      const DiamondsToAdd = beans * beansToDiamondsRate
      const result2 = await User.updateOne({ UserId: userId }, { $inc: { diamondsCount: DiamondsToAdd, beansCount: -beans } })
      const result = await User.findOne({ UserId: userId }).select({ _id: 0, __v: 0 })
      console.log(result)
      res.send(result)
    }
    else {
      console.log("entered")
      const BeansToAdd = diamonds / beansToDiamondsRate
      const result2 = await User.updateOne({ UserId: userId }, { $inc: { diamondsCount: -diamonds, beansCount: BeansToAdd } })
      const result = await User.findOne({ UserId: userId }).select({ _id: 0, __v: 0 })
      console.log(result)
      res.send(result)
    }

  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.post("/api/agent", async (req, res) => {
  const { resellerOf, paymentMethods, status, userId } = req.body
  console.log(paymentMethods)
  try {
    const origUser = await User.findOneAndUpdate({ UserId: userId }, { AgentId: `A${userId}` })
    console.log(origUser)
    const newAgent = new Agent({ resellerOf, paymentMethods, status, diamondsCount: origUser.diamondsCount, beansCount: origUser.beansCount, resellerOf, AgentId: `A${userId}` })

    await newAgent.save()
    res.send("agent created")
  } catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }
})

app.get("/api/agent", async (req, res) => {
  const { userId } = req.query
  let agentData
  try {
    const existingUser = await User.findOne({ UserId: userId }).select({ _id: 0, __v: 0, AgentId: 0 }).lean()
    if (existingUser.AgentId) {
      res.send(existingUser)
    }
    else {
      agentData = await Agent.findOne({ AgentId: `A${userId}` }).select({ _id: 0, __v: 0, diamondsCount: 0, beansCount: 0 })
    }
    res.send({ ...existingUser, agentData })
  } catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

})
