const unirest = require("unirest");
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());

require("dotenv").config();
const PORT = process.env.PORT || 4000;

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const { generateUniqueId, generateUserId } = require("./utils");
const initializeDB = require("./InitialiseDb/index");
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
const postsController = require("./controller/postsController");
const gamesController=require("./controller/gamesController");
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

initializeDB();
app.listen(PORT, () => {
  console.log("Server running on port 3007");
});

const otpMap = {};
const beansToDiamondsRate = 0.5;
app.post("/otp", (req, res) => {
  const req1 = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
  const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  otpMap[req.headers.phone] = { otp, timestamp: Date.now() };
  console.log("otpMap", otpMap);

  req1.query({
    authorization:
      "BDZTf24xkW9pv6UYeaoq01JsR3bPMrNCIOzFSh7QydGH5icgl84noFbjAcINLwxPgkp1QWBfDsOURHS2",
    variables_values: otp.toString(),
    route: "otp",
    numbers: req.headers.phone,
  });
  console.log("OTP Sending request sent!");

  req1.headers({
    "cache-control": "no-cache",
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

app.post("/verify-otp", (req, res) => {
  console.log("Verifying otp");
  const phone = req.headers.phone;
  const otp = req.headers.otp;
  // const expectedOtp = '123456';
  console.log(`phone = ${phone}`);
  console.log(`otpMap = `, otpMap);
  if (otpMap[phone] != null) {
    const storedData = otpMap[phone]["otp"];
    console.log(`storedData = ${storedData}`);
    console.log(`typeof storedData = ${typeof storedData}`);
    console.log(`otp = ${otp}`);
    console.log(`typeof otp = ${typeof otp}`);
    const { storedOtp, timestamp } = storedData;
    // if (storedData.toString().isEqual(otp)) {
    if (parseInt(otp, 10) == storedData) {
      //  && Date.now() - timestamp < 600000

      // 300000 milliseconds (5 minutes) is the validity window for the OTP
      res.status(200).json({ message: "OTP verification successful" });
    } else {
      res.status(401).json({ message: "Invalid OTP or OTP expired" });
    }
  } else {
    res.status(404).json({ message: "Phone number not found" });
  }
});

app.post("/api/register", async (req, res) => {
  const {
    email,
    password,
    name,
    gender,
    dob,
    country,
    frame,
    photo,
    phoneNumber,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await User.find({ email });
  if (result.length === 0) {
    if (password.length < 8) {
      res
        .status(400)
        .send("password is too short .minimum length of password shoud be 8");
      return;
    }
    let randomNumber = generateUserId();
    console.log(randomNumber);
    const existingUserWithId = await User.find({ UserId: randomNumber });
    if (existingUserWithId.length > 0) {
      isUserIdMatched = true;
      while (isUserIdMatched) {
        randomNumber = generateUserId();
        const existingUserWithId = await User.find({ UserId: randomNumber });
        isUserIdMatched = existingUserWithId.length > 0;
      }
    }
    const newUser = new User({
      UserId: `${randomNumber}`,
      email,
      password: hashedPassword,
      name,
      gender,
      dob,
      country,
      frame,
      photo,
      phoneNumber,
    });
    await newUser.save();
    res.status(200).send("user created successfully");
  } else {
    res.status(400).send("User already exists");
  }
});

app.post("/api/user", async (req, res) => {
  const {
    email,
    password,
    name,
    gender,
    dob,
    country,
    frame,
    photo,
    phoneNumber,
  } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    let randomNumber = generateUserId();
    const existingUserWithId = await User.find({ UserId: randomNumber });
    if (existingUserWithId.length > 0) {
      isUserIdMatched = true;
      while (isUserIdMatched) {
        randomNumber = generateUserId();
        const existingUserWithId = await User.find({ UserId: randomNumber });
        isUserIdMatched = existingUserWithId.length > 0;
      }
    }
    const newUser = new User({
      UserId: `${randomNumber}`,
      email,
      password: hashedPassword,
      name,
      gender,
      dob: new Date(dob),
      country,
      frame,
      photo,
      phoneNumber,
    });
    await newUser.save();
    res.status(200).send("user created successfully");
  } catch (e) {
    console.log(e);
    res.status(500).send("internal server error");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await User.findOne({ email });
  console.log(result);
  if (result.length === 0) {
    res.status(400).send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, result.password);
    if (isPasswordMatched === true) {
      const payload = {
        UserId: result.UserId,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.send({ jwtToken });
    } else {
      res.status(400);
      res.send("Invalid Password");
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/posts/", postsController.storePost);

app.put("/api/posts/share", postsController.sharePost);

app.get("/api/hot",postsController.getHotPosts);

app.get("/api/recent", postsController.getRecentPosts);

app.post("/api/follow",postsController.followUser);

app.get("/api/following", postsController.getPostsOfFollowingUsers);

app.get("/api/tags/", postsController.getTagsAfterDate);

app.post("/api/search-with-tags", postsController.getPostsContaingTags);

app.post("/api/comment",postsController.commentPost);

app.post("/api/like", postsController.likePost);

app.get("/api/users/following", postsController.getFollowingUsers);

app.get("/api/users/followers", postsController.getFollowersOfUser);

app.get("/api/users/doesFollow", postsController.doesFollow);

app.post("/api/beansDiamonds", gamesController.postData);

app.get("/api/beans-history", gamesController.getBeansHistory);

app.get("/api/diamonds-history",gamesController.getDiamondsHistory);

app.get("/api/users", gamesController.getUsers);

app.get("/api/convert", gamesController.convert);

app.post("/api/agent", gamesController.postAgent);

app.get("/api/agent", gamesController.getAgentData);

app.get("/api/agent/all",gamesController.getAllAgents)

app.get("/api/agent/resellers",gamesController.getResellers)

app.get("/api/followers",postsController.getFollowersData)

app.get("/api/following-users",postsController.getFollowingData)

app.get("/api/friends",postsController.getFriendsData)

