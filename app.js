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
  email: String,
  password: String,
  password: {
    type: String,
    default: null,
  },
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

const following = mongoose.model("following", followingDataSchema)
const Tag = mongoose.model('Tag', TagSchema);
const LikesInfo = mongoose.model("LikesInfo", likesInfo)

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema)
const Comment = mongoose.model("Comment", CommentSchema)


const otpMap = {};

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

app.post("/api/posts/",authenticateToken, async (req, res) => {
  const { title, description, postedBy, imgUrl, tags } = req.body;
  const postId = generateUniqueId()
  const tagObjectIds = await Promise.all(
    tags.map(async (tagName) => {
      const existingTag = await Tag.findOne({ tag: tagName });
      if (existingTag) {
        // console.log("exists")
        const result=await Tag.updateOne({tag:tagName},{$inc:{usedCount:1}});
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

app.put("/api/posts/share",authenticateToken, async (req, res) => {
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

app.get("/api/hot",authenticateToken, async (req, res) => {
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

app.get("/api/recent",authenticateToken, async (req, res) => {
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

//no need to send userId it comes from  header through jwtloken
app.post("/api/follow", authenticateToken,async (req, res) => {
  const {  followingId } = req.body
  const followerId=req.UserId
  try {
    const newFollower = new following({ followerId, followingId })
    const result = await newFollower.save()
    res.status(200).send({ message: "follower added successfully" })
    console.log(result)
  } catch (e) {
    res.status(500).send({ error: e })
  }
})

//no need to send userId it comes from  header through jwtloken
app.get("/api/following",authenticateToken, async (req, res) => {
  const userId=req.UserId
  const {limit, start} = req.query
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


app.get("/api/tags/",authenticateToken,async (req, res) => {
  const { date } = req.query
  const datefromString = new Date(date)
  console.log(date)
  try {
    const result = await Tag.find({ createdAt: { $gt: datefromString } }).sort({usedCount:-1}).select({
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

//no need to send userId it comes from  header through jwtloken
app.post("/api/search-with-tags", authenticateToken,async (req, res) => {
  //
  const { tags, limit, start } = req.body
  const userId=req.UserId
  console.log(userId)
  try {
    if (userId == null) {
      const tagObjectIds = await Tag.find({ tag: { "$in": tags } }).select({ _id: 1 })

      const result = await Post.find({ "tags": { "$in": tagObjectIds } }).populate('tags').sort({ createdAt: -1 })
        .skip(Number(start))
        .limit(Number(limit)).select({ _id: 0, __v: 0 })
      res.send(result)
    }
    else if (tags == null || tags.length === 0) {
      const result = await Post.find({ "postedBy": userId })
        .skip(Number(start))
        .limit(Number(limit)).select({ _id: 0, __v: 0 })
      res.send(result)
    }
    else if (userId != null && tags.length > 0) {
      const tagObjectIds = await Tag.find({ tag: { "$in": tags } }).select({ _id: 1 })

      const result = await Post.find({ "tags": { "$in": tagObjectIds }, "postedBy": userId }).populate('tags').sort({ createdAt: -1 })
        .skip(Number(start))
        .limit(Number(limit)).select({ _id: 0, __v: 0 })
      res.send(result)
    }
  }
  catch (e) {
    console.log(e)
    res.status(500).send("internal server error")
  }

})

//no need to send userId it comes from  header through jwtloken
app.post("/api/comment",authenticateToken, async (req, res) => {

  const { postId, comment } = req.body;
  const userId=req.UserId
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
app.post("/api/like", authenticateToken,async (req, res) => {
  const userId=req.UserId
  const { postId } = req.body;
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


