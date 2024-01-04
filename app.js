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
const { generateUniqueId, generateUserId } = require("./utils");
const initializeDB = require("./InitialiseDb/index");
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
const postsController = require("./controller/postsController");
const gamesController = require("./controller/gamesController");
const authenticationController = require("./controller/authentication");
const { User } = require("./models/models");

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

const beansToDiamondsRate = 0.5;

app.post("/otp", authenticationController.sendOtp);

app.post("/verify-otp", authenticationController.verifyOtp);

app.post("/api/register", authenticationController.register);

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

    // let randomNumber = generateUserId();
    // const existingUserWithId = await User.find({ UserId: randomNumber });
    // if (existingUserWithId.length > 0) {
    //   isUserIdMatched = true;
    //   while (isUserIdMatched) {
    //     randomNumber = generateUserId();
    //     const existingUserWithId = await User.find({ UserId: randomNumber });
    //     isUserIdMatched = existingUserWithId.length > 0;
    //   }
    // }
    let newUserId;
    const ExistingUsers = await User.find({});
    if (ExistingUsers.length === 0) {
      newUserId = 20240000;
    } else {
      newUserId = ExistingUsers[ExistingUsers.length - 1].UserId + 1;
    }
    const newUser = new User({
      UserId: `${newUserId}`,
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

app.post("/api/SignInWithGoggle",authenticationController.SignInWithGoggle)

app.post("/api/login", authenticationController.login);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/posts/", postsController.storePost);

app.put("/api/posts/share", postsController.sharePost);

app.get("/api/hot", postsController.getHotPosts);

app.get("/api/recent", postsController.getRecentPosts);

app.post("/api/follow", postsController.followUser);

app.get("/api/following", postsController.getPostsOfFollowingUsers);

app.get("/api/tags/", postsController.getTagsAfterDate);

app.post("/api/search-with-tags", postsController.getPostsContaingTags);

app.post("/api/comment", postsController.commentPost);

app.post("/api/like", postsController.likePost);

app.get("/api/users/following", postsController.getFollowingUsers);

app.get("/api/users/followers", postsController.getFollowersOfUser);

app.get("/api/users/doesFollow", postsController.doesFollow);

app.get("/api/followers", postsController.getFollowersData);

app.get("/api/following-users", postsController.getFollowingData);

app.get("/api/friends", postsController.getFriendsData);

app.post("/api/beansDiamonds", gamesController.postData);

app.get("/api/beans-history", gamesController.getBeansHistory);

app.get("/api/diamonds-history", gamesController.getDiamondsHistory);

app.get("/api/users", gamesController.getUsers);

app.get("/api/convert", gamesController.convert);

app.post("/api/agent", gamesController.postAgent);

app.get("/api/agent", gamesController.getAgentData);

app.get("/api/agent/all", gamesController.getAllAgents);

app.get("/api/agent/resellers", gamesController.getResellers);

app.post("/api/change-role", gamesController.ChangeUserRole);

app.post("/api/agency-joining", gamesController.joinAgency);

app.post("/api/make-agency-owner", gamesController.makeAgencyOwner);

app.put("/api/send-gift", gamesController.sendGift);

app.put("/api/agent-recharge", gamesController.recharge);

app.get("/api/api/agencies/all", gamesController.getAllAgencies);

app.put("/api/make-agent", gamesController.makeAgent);
