// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
require("dotenv").config();
const http = require("http");
const { exec } = require("child_process");
const socketIO = require("socket.io");
const PORT = process.env.PORT || 4000;
const multer = require("multer");
const bodyParser = require("body-parser");
const base64ToImage = require("base64-to-image");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
// const admin = require("firebase-admin");

const app = express();
const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: [{ origin: "http://localhost:5500" }],
// });
let tokenSecreat =
  "4233d702105f11041081e9aacd786076f8de2f4f33db08d5125e50397e31f890";
const io1 = socketIO(server, {
  // path: "/audioRoom/socket.io",
  cors: [{ origin: "http://localhost:5500" }],
});
const io2 = socketIO(server, {
  path: "/app/socket.io",
  cors: [{ origin: "http://localhost:5500" }],
});

// const firebase = require('firebase-admin');
// const firebaseConfig = require('./firebaseConfig.json');

// // Initialize Firebase with your configuration
// firebase.initializeApp(firebaseConfig);
// const admin = require('firebase-admin');
// const serviceAccount = require(__dirname + "/mastiplay-31ca8-firebase-adminsdk-7chw1-9d85969a11.json");

// admin.initializeApp({
//   credential: admin.credential.cert(firebaseConfig),
//   databaseURL: "https://mastiplay-31ca8-default-rtdb.firebaseio.com"
// });

// const db = admin.firestore();
// const usersCollection = db.collection('users');
const path = require("path");
const cron = require("node-cron");
const {
  generateUniqueId,
  generateUserId,
  getRandomInt,
  getcount,
} = require("./utils");
const initializeDB = require("./InitialiseDb/index");
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.json({
    limit: "50mb", //increased the limit to receive base64
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// const serviceAccount = require(__dirname + "/mastiplay-31ca8-firebase-adminsdk-7chw1-9d85969a11.json");
// const firebaseConfig = require("./firebaseConfig.json");

// admin.initializeApp({
//   credential: admin.credential.cert(firebaseConfig),
//   databaseURL: "https://mastiplay-31ca8-default-rtdb.firebaseio.com",
// });

const postsController = require("./controller/postsController");
const { gamesController, admin, adminApp } = require("./controller/gamesController");
const authenticationController = require("./controller/authentication");
const fixController = require("./controller/fixController");
const bdRoutes = require("./routes/bd");
const {
  User,
  bettingGameData,
  SpinnerGameWinnerHistory,
  Top3Winners,
  AgencyData,
  GameTransactionHistory,
  SpinnerGameBetInfo,
  TransactionHistory,
  AppToken,
  LuckyWallet,
  SpinnerGameHistory,
} = require("./models/models");
const { send } = require("process");
const { BdData } = require("./models/bd");
const { getAuth } = require("firebase-admin/auth");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `public/${req.body.path}`);
  },
  filename: (req, file, cb) => {
    const filename = req.body.fileName;
    cb(null, `${filename}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

const authenticateToken = (request, response, next) => {
  let mastiToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    mastiToken = authHeader.split(" ")[1];
  }
  if (mastiToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    getAuth()
      .verifyIdToken(mastiToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        console.log(`uid = ${uid}`);
        request.userId = uid;
        next();
      })
      .catch((err) => {
        response.status(401);
        response.send(`Invalid JWT Token: ${err}`);
      });
    // jwt.verify(mastiToken, tokenSecreat, async (error, payload) => {
    //   if (error) {
    //     response.status(401);
    //     response.send("Invalid JWT Token");
    //   } else {
    //     request.userId = payload.userId;
    //     next();
    //   }
    // });
  }
};

const authenticateRole = async (req, res, next) => {
  let user = await User.findOne({ userId: req.userId });
  if (user.role !== "admin") {
    res.status(403).send("you are not admin");
  } else {
    next();
  }
};

const CheckBanned = async (req, res, next) => {
  // let { userId } = req.query;
  // if (!userId) {
  //   userId = req.body.userId;
  // }
  // console.log("userId in middleware", userId);
  // if (!userId) {
  //   next();
  // } else {
  //   let userDetails = await User.findOne({ userId });
  //   let userRecord = await admin.auth().getUserByEmail(userDetails.email);
  //   userRecord = userRecord.toJSON();
  //   if (userRecord.disabled) {
  //     res.status(403).send("your account is banned");
  //   } else {
  //     next();
  //   }
  // }
  next();
};

// const authenticateAppUser = async (request, response, next) => {
//   let mastiToken;
//   const authHeader = request.headers["authorization"];
//   if (authHeader !== undefined) {
//     mastiToken = authHeader.split(" ")[1];
//   }
//   if (mastiToken === undefined) {
//     response.status(401);
//     response.send("Invalid JWT Token");
//   } else {
//     jwt.verify(mastiToken, tokenSecreat, async (error, payload) => {
//       if (error) {
//         response.status(401);
//         response.send("Invalid JWT Token");
//       } else {
//         let appTokens = await AppToken.findOne({});
//         if (appTokens[payload.userId] !== mastiToken) {
//           response.status(401).send("token expired");
//         } else {
//           request.userId = payload.userId;
//           request.appToken = mastiToken;
//           next();
//         }
//       }
//     });
//   }
// };
const authenticateAppUser = async (request, response, next) => {
  let mastiToken;
  const authHeader = request.headers["authorization"];
  const userId = request.headers["userid"];
  // console.log("request.headers", request.headers);
  if (authHeader !== undefined) {
    mastiToken = authHeader.split(" ")[1];
  }
  if (mastiToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    getAuth()
      .verifyIdToken(mastiToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        console.log(`uid = ${uid}`);
        request.userId = userId;
        request.appToken = mastiToken;
        next();
      })
      .catch((err) => {
        response.status(401);
        response.send(`Invalid JWT Token: ${err}`);
      });
    // let appTokens = await AppToken.findOne({});
    // if (appTokens.appTokens[userId] !== mastiToken) {
    //   response.status(401).send("token expired");
    // } else {
    //   request.userId = userId;
    //   request.appToken = mastiToken;
    //   next();
    // }
  }
};
// const authenticateAppUser=async(req,res,next)=>{
//   next();
// }

initializeDB().then(async () => {
  let appToken = await AppToken.findOne({});
  console.log("appToken", appToken);
  if (appToken === null) {
    await AppToken.create({ appToken: {} });
  }
  let luckycollection = await LuckyWallet.findOne({});
  if (luckycollection === null) {
    await LuckyWallet.create({});
  }
});
let appSockets = {};
let userIdAppSockets = {};
io2.on("connection", (socket) => {
  // console.log("io2", io2.sockets.sockets);

  socket.on("connected", (data) => {
    let { userId } = data;

    if (userIdAppSockets[userId]) {
      let existingSocketId = userIdAppSockets[userId];
      console.log(" io2.sockets.sockets", io2.sockets.sockets);
      // io2.sockets.sockets[existingSocketId].emit("another-device-connected");
      io2.sockets.sockets
        .get(existingSocketId)
        .emit("another-device-connected");
      appSockets[existingSocketId] = undefined;
      console.log("entered already exists");
    }
    // else {
    appSockets[socket.id] = userId;
    userIdAppSockets[userId] = socket.id;
    // }
  });
  socket.on("disconnect", () => {
    let disconnectedUser = appSockets[socket.id];
    delete userIdAppSockets[disconnectedUser];
    delete appSockets[socket.id];
  });
});
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/upload", (req, res, next) => {
  const uuid = uuidv4();
  var filename = req.body.filename;
  var base64url = req.body.base64url;
  var base64Str = "data:image/png;base64," + base64url;
  var path = "./public/";
  var optionalObj = {
    fileName: filename,
    type: "png",
  };
  base64ToImage(base64Str, path, optionalObj); //saving
  var imageInfo = base64ToImage(base64Str, path, optionalObj);
  var fileLink = "/" + filename;
});

app.post("/api/update-server", async (req, res) => {
  console.log("Updating Server: ");
  const payload = req.body;
  if (
    (payload && payload.force && payload.force == true) ||
    (payload && payload.ref === "refs/heads/master")
  ) {
    exec("git reset --hard && git pull", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log(`Git Pull Successful: ${stdout}`);
      res.status(200).send("Server Updated Successfully");
    });
  } else {
    res.status(200).send("Ignoring non-master branch push event");
  }
});

function ensureWheelNumbers(array) {
  const resultArray = [];

  // Create an object to store entries based on wheel number
  const wheelNumberMap = {};

  // Populate the map with existing entries
  array.forEach((entry) => {
    wheelNumberMap[entry.wheelNo] = entry;
  });

  // Check and add entries for missing wheel numbers
  for (let i = 1; i <= 8; i++) {
    const existingEntry = wheelNumberMap[i];

    if (existingEntry) {
      // If entry exists, add it to the result array
      resultArray.push(existingEntry);
    } else {
      // If entry doesn't exist, add an entry with zero amount
      resultArray.push({
        userids: [],
        wheelNo: i,
        totalAmount: 0,
        betreturnvalue: 0,
      });
    }
  }

  return resultArray;
}

app.post("/get-otp", authenticationController.sendOtp);

app.post("/verify-otp", authenticationController.verifyOtp);
app.post("/admin/verify-otp", authenticationController.verifyAdminOtp);

app.post("/api/register", authenticationController.register);

app.post("/api/user", async (req, res) => {
  const {
    id,
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
    let existingUserInfo;
    // if (phoneNumber && email) {
    //   existingUserInfo = await User.findOne({
    //     $or: [{ email }, { phoneNumber }],
    //   });
    // } else if (phoneNumber) {
    //   existingUserInfo = await User.findOne({ phoneNumber });
    // } else {
    //   existingUserInfo = await User.findOne({ email });
    // }
    if (phoneNumber && email) {
      existingUserInfo = await User.findOne({
        $or: [{ email }, { email: `${phoneNumber}@gmail.com` }],
      });
    } else if (phoneNumber) {
      existingUserInfo = await User.findOne({
        email: `${phoneNumber}@gmail.com`,
      });
    } else {
      existingUserInfo = await User.findOne({ email });
    }
    console.log("existingUserInfo", existingUserInfo);

    if (existingUserInfo) {
      res.status(400).send("email or phoneNumber is already taken");
      return;
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // let randomNumber = generateUserId();
    // const existingUserWithId = await User.find({ userId: randomNumber });
    // if (existingUserWithId.length > 0) {
    //   isUserIdMatched = true;
    //   while (isUserIdMatched) {
    //     randomNumber = generateUserId();
    //     const existingUserWithId = await User.find({ userId: randomNumber });
    //     isUserIdMatched = existingUserWithId.length > 0;
    //   }
    // }
    let newUserId;
    // const ExistingUsers = await User.find({});
    // const ExistingUsers = await User.find({}).sort({ userId: 1 });
    const ExistingUsers = await User.find({
      userId: { $regex: /^[0-9]{8}$/ },
    }).sort({ userId: 1 });

    if (ExistingUsers.length === 0) {
      newUserId = 20240000;
    } else {
      newUserId = parseInt(ExistingUsers[ExistingUsers.length - 1].userId) + 1;
    }
    const newUser = new User({
      userId: `${newUserId}`,
      // userId: id,
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
    let x = await newUser.save();
    res.status(200).send(x);
  } catch (e) {
    console.log(e);
    res.status(500).send(`internal server error ${e}`);
  }
});

app.put("/api/fix/user", fixController.fixUsers);

app.delete(
  "/api/user",
  authenticateAppUser,
  authenticationController.deleteUser
);
app.delete(
  "/api/agent",
  authenticateAppUser,
  authenticationController.deleteAgent
);
app.delete(
  "/api/agency",
  authenticateAppUser,
  authenticationController.deleteAgency
);
app.delete("/api/bd", authenticateAppUser, authenticationController.deleteBd);

// app.get("/api/user", async (req, res) => {
//   const { userId } = req.query
//   try {
//     const UserInfo = await User.findOne({ userId })
//     res.send(UserInfo)

//   } catch (e) {
//     console.log(e);
//     res.status(500).send("internal server error");
//   }
// })

app.put("/api/user", authenticateAppUser, async (req, res) => {
  const { userId } = req.body;
  try {
    const UserInfo = await User.findOneAndUpdate(
      { userId },
      { ...req.body },
      { new: true }
    );
    if (UserInfo) {
      res.send(UserInfo);
    } else {
      res.status(400).send("user not found");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("internal server error");
  }
});

app.post("/api/SignInWithGoggle", authenticationController.SignInWithGoggle);

app.post("/api/login", authenticationController.login);

app.post("/api/posts/", authenticateAppUser, postsController.storePost);

app.delete("/api/posts", authenticateAppUser, postsController.deletePost);

app.put("/api/posts/share", authenticateAppUser, postsController.sharePost);

app.get("/api/hot", authenticateAppUser, postsController.getHotPosts);

app.get("/api/recent", authenticateAppUser, postsController.getRecentPosts);

app.post("/api/follow", authenticateAppUser, postsController.followUser);

app.get(
  "/api/following",
  authenticateAppUser,
  postsController.getPostsOfFollowingUsers
);

app.get("/api/tags/", authenticateAppUser, postsController.getTagsAfterDate);

app.post(
  "/api/search-with-tags",
  authenticateAppUser,
  postsController.getPostsContaingTags
);

app.post("/api/comment", authenticateAppUser, postsController.commentPost);

app.post("/api/like", authenticateAppUser, postsController.likePost);

app.get(
  "/api/users/following",
  authenticateAppUser,
  postsController.getFollowingUsers
);

app.get(
  "/api/users/followingRooms",
  authenticateAppUser,
  postsController.getFollowingRooms
);

app.get(
  "/api/users/followers",
  authenticateAppUser,
  postsController.getFollowersOfUser
);

app.get(
  "/api/users/doesFollow",
  authenticateAppUser,
  postsController.doesFollow
);

app.get(
  "/api/followers",
  authenticateAppUser,
  postsController.getFollowersData
);

app.get(
  "/api/following-users",
  authenticateAppUser,
  postsController.getFollowingData
);

app.get("/api/friends", authenticateAppUser, postsController.getFriendsData);

app.post(
  "/api/create-transaction-history",
  authenticateAppUser,
  gamesController.postData
);

app.get(
  "/api/beans-history",
  authenticateAppUser,
  gamesController.getBeansHistory
);

app.get(
  "/api/diamonds-history",
  authenticateAppUser,
  gamesController.getDiamondsHistory
);

app.get("/api/users", gamesController.getUsers);

app.get("/api/convert", authenticateAppUser, gamesController.convert); // ACHAL: create a TransactionHistory here

app.put(
  "/api/agent/convert",
  authenticateAppUser,
  gamesController.convertUsertoAgent
); //done

app.post("/api/agent", authenticateAppUser, gamesController.postAgent);

app.get("/api/agent", authenticateAppUser, gamesController.getAgentData);

app.get("/api/users/all", authenticateAppUser, gamesController.getAllUsers);
app.get("/api/admin/users/all", authenticateToken, gamesController.getAllUsers);

app.get("/api/agents/all", authenticateAppUser, gamesController.getAllAgents);

app.get(
  "/api/agent/resellers",
  authenticateAppUser,
  gamesController.getResellers
);

app.post(
  "/api/change-role",
  authenticateAppUser,
  gamesController.ChangeUserRole
);

app.post(
  "/api/agency-joining",
  authenticateAppUser,
  gamesController.joinAgency
);

app.post(
  "/api/make-agency-owner",
  authenticateAppUser,
  gamesController.makeAgencyOwner
);

app.put("/api/send-gift", authenticateAppUser, gamesController.sendGift);

app.get(
  "/api/agency/commissionHistory",
  authenticateAppUser,
  gamesController.getAgencyCommissionHistory
);

app.put("/api/agent-recharge", authenticateAppUser, gamesController.recharge);

app.put(
  "/api/agent-admin-recharge",
  authenticateAppUser,
  gamesController.adminRecharge
);

app.get(
  "/api/agencies/all",
  authenticateAppUser,
  gamesController.getAllAgencies
);

app.put("/api/make-agent", authenticateAppUser, gamesController.makeAgent);

app.get(
  "/api/comments",
  authenticateAppUser,
  postsController.getsCommentsOfPost
);

app.get(
  "/api/agency",
  authenticateAppUser,
  gamesController.getAgencyDataOfUser
);

app.put("/api/rates", authenticateAppUser, gamesController.setComissionRate);

app.get(
  "/api/agent-history",
  authenticateAppUser,
  gamesController.getAgentTransactionHistory
);
// app.post("/api/spinner-betting", async (req, res) => {
//   const { userId, wheelNo, amount } = req.body;
//   var userExists = bettingInfoArray.some((item) => item.userId === userId);

//   if (!userExists) bettingGameparticipants += 1;
//   bettingInfoArray.push({ userId, wheelNo, amount });
//   await User.updateOne(
//     { userId: userId },
//     { $inc: { diamondsCount: -1 * amount } }
//   );
//   // res.send("betted successfully");
// });
// ACHAL: send winners's UsersData
app.post(
  "/api/top3-winner",
  authenticateAppUser,
  gamesController.getBettingResults
); // for 1 session

app.get(
  "/api/all-history",
  // authenticateAppUser,
  gamesController.getSpinnerHistory
); // for all sessions

app.get("/api/agency/all", authenticateAppUser, gamesController.getAllAgencies);

app.get(
  "/api/agencyParticipants",
  // authenticateToken,
  gamesController.getAgencyParticipantsforAdmin
);

app.get("/api/user/role", async (request, response) => {
  // console.log("request.headers",request.headers)
  let mastiToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    mastiToken = authHeader.split(" ")[1];
  }
  if (mastiToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(mastiToken, tokenSecreat, async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.userId = payload.userId;
        response.send(payload.role);
      }
    });
  }
});

app.get("/api/agency/participants", gamesController.getAgencyParticipants);

app.post(
  "/api/agency/collect",
  authenticateAppUser,
  gamesController.collectBeans
);

app.get(
  "/api/my-betting-history",
  // authenticateAppUser,
  gamesController.getUserAllBettingHistory
); // for a specific user, his betting history
// ACHAL: send top-winner's UsersData as well
app.get(
  "/api/top-winner",
  // authenticateAppUser,
  gamesController.getTopWinners
); // today's top winners

app.get(
  "/api/gift-history",
  authenticateAppUser,
  gamesController.getGiftHistory
);
// app.get("/api/agency/participants",gamesController.getAgencyParticipants)
app.get("/api/bd/all", authenticateAppUser, bdRoutes.getAllBD);
app.get("/api/bd", authenticateAppUser, bdRoutes.getBD);
app.get(
  "/api/bd/participants",
  authenticateAppUser,
  bdRoutes.getParticipantAgencies
);
app.post("/api/bd", authenticateAppUser, bdRoutes.createBD);
app.put("/api/bd", authenticateAppUser, bdRoutes.updateBD);
app.put("/api/bd/add-beans", authenticateAppUser, bdRoutes.addBeans); // ACHAL: create a TransactionHistory here
app.post("/api/bd/add-agency", authenticateAppUser, bdRoutes.addAgency);
app.put("/api/bd/remove-agency", authenticateAppUser, bdRoutes.removeAgency);
app.delete(
  "/api/agency/agent",
  authenticateAppUser,
  gamesController.removeAgentfromAgency
);
app.delete(
  "/api/bd/agency",
  authenticateAppUser,
  gamesController.removeAgencyfromBd
);

app.get(
  "/api/creator/history",
  authenticateAppUser,
  gamesController.getCreatorHistory
);
app.get(
  "/api/creator/monthly-history",
  authenticateAppUser,
  gamesController.getMonthlyCreatorHistory
);
app.get(
  "/api/creator/weekly-history",
  authenticateAppUser,
  gamesController.getWeeklyCreatorHistory
);

app.get("/api/rates", authenticateAppUser, gamesController.getRates);

app.get(
  "/api/richLevel",
  authenticateAppUser,
  gamesController.getUserRichLevel
);
app.get(
  "/api/charmLevel",
  authenticateAppUser,
  gamesController.getUserCharmLevel
);
app.get(
  "/api/monthlyGift",
  authenticateAppUser,
  gamesController.getMonthlyGift
);
app.get(
  "/api/monthlyRecharge",
  authenticateAppUser,
  gamesController.getMonthlyRecharge
);
app.get(
  "/api/admin/userInfo",
  authenticateAppUser,
  gamesController.getUserInfo
);
app.delete(
  "/api/admin/removeFrame",
  authenticateAppUser,
  gamesController.removeFrame
);
app.put("/api/admin/addFrame", authenticateAppUser, gamesController.addFrame);
app.put(
  "/api/admin/changeDiamond",
  authenticateToken,
  authenticateRole,
  gamesController.changeDiamonds
);
app.put(
  "/api/admin/banUser",
  authenticateToken,
  authenticateRole,
  gamesController.banUser
);
app.put(
  "/api/admin/unbanUser",
  CheckBanned,
  authenticateRole,
  gamesController.unbanUser
);
app.put(
  "/api/admin/accept",
  authenticateAppUser,
  gamesController.acceptBeansWithDraw
);
app.put(
  "/api/admin/reject",
  authenticateAppUser,
  gamesController.rejectBeansWithDraw
);
app.post(
  "/api/admin/sendWithDrawReq",
  authenticateAppUser,
  gamesController.sendWithDrawalRequest
);
app.get(
  "/api/admin/getUserReqs",
  authenticateAppUser,
  gamesController.getWithDrawalRequests
);
app.post("/api/jackpot-bet", authenticateAppUser, async (req, res) => {
  const { userId, lines, betAmount } = req.body;
  try {
    console.log("trigger rjvn");
    const index = jackpotInfo.findIndex((pot) => pot.userId == userId);
    console.log(index);
    if (index == -1) {
      jackpotInfo.push({
        userId: userId,
        UserBetAmount: betAmount,
        lines: lines,
        jackPotAmount: lines * betAmount,
      });
    } else {
      // jackpotInfo[index].jackPotAmount +
      jackpotInfo[index] = {
        jackPotAmount: lines * betAmount,
        userId: userId,
        UserBetAmount: betAmount,
        lines: lines,
      };
    }
    await TransactionHistory.create({
      userId: userId,
      game: "jackpot",
      diamondsAdded: -1 * betAmount,
      // mode: "outcome",
    });
    console.log(jackpotInfo);
    res.send("jackpot betted successfully");
  } catch (e) {
    res.status(500).send(`internal server error ${e}`);
  }
});
app.get("/api/spin-jackpot", authenticateAppUser, async (req, res) => {
  const { userId } = req.query;
  const jackpotUserInfo = jackpotInfo.find((item) => item.userId === userId);
  console.log("jackpotUserInfo", jackpotUserInfo);
  let { lines, betAmount, jackPotAmount } = jackpotUserInfo;
  console.log("jackPotAmount1", jackPotAmount);
  const generateLine = (indices) =>
    indices.map((index) => jackpotgameGrid[index[0]][index[1]]);

  const checkContinuousValues = (line) => {
    const result = [];
    let currentSymbol = line[0];
    let count = 1;

    for (let i = 1; i < line.length; i++) {
      if (line[i] === currentSymbol) {
        count++;
      } else {
        result.push({ [currentSymbol]: count });
        break;
      }
    }
    return result;
  };

  const rows = 3;
  const cols = 5;
  const jackpotgameGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 11) + 1)
  );

  const linePatterns = [
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
    [
      [0, 3],
      [0, 4],
      [1, 2],
      [2, 1],
      [2, 0],
    ],
    [
      [1, 0],
      [2, 1],
      [1, 2],
      [0, 3],
      [1, 4],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
    ],
    [
      [0, 0],
      [1, 1],
      [2, 2],
      [0, 3],
      [1, 4],
    ],
    [
      [2, 0],
      [1, 1],
      [0, 2],
      [1, 3],
      [2, 4],
    ],
  ];

  const selectedLines = linePatterns.slice(0, lines);

  const generatedLines = selectedLines.map(generateLine);
  let result = generatedLines.map(checkContinuousValues);
  result = result.flatMap((subArray) => Object.assign({}, ...subArray));
  console.log("result1234", result);

  let returnValue = 0;
  result.forEach((value) => {
    const key = Object.keys(value)[0];
    if (key === 1) {
      if (value[key] === 3) {
        returnValue += betAmount * 60;
      } else if (value[key] === 4) {
        returnValue += betAmount * 120;
      } else if (value[key] === 5) {
        returnValue += betAmount * 360;
      }
    } else if (key === 2) {
      if (value[key] === 3) {
        returnValue += betAmount * 40;
      } else if (value[key] === 4) {
        returnValue += betAmount * 80;
      } else if (value[key] === 5) {
        returnValue += betAmount * 240;
      }
    } else if (key === 3) {
      if (value[key] === 3) {
        returnValue += betAmount * 25;
      } else if (value[key] === 4) {
        returnValue += betAmount * 50;
      } else if (value[key] === 5) {
        returnValue += betAmount * 150;
      }
    } else if (key === 4) {
      if (value[key] === 2) {
        returnValue += betAmount * 6;
      } else if (value[key] === 3) {
        returnValue += betAmount * 20;
      } else if (value[key] === 4) {
        returnValue += betAmount * 40;
      } else if (value[key] === 5) {
        returnValue += betAmount * 120;
      }
    } else if (key === 5) {
      if (value[key] === 2) {
        returnValue += betAmount * 5;
      } else if (value[key] === 3) {
        returnValue += betAmount * 15;
      } else if (value[key] === 4) {
        returnValue += betAmount * 30;
      } else if (value[key] === 5) {
        returnValue += betAmount * 90;
      }
    } else if (key === 6) {
      if (value[key] === 2) {
        returnValue += betAmount * 3;
      } else if (value[key] === 3) {
        returnValue += betAmount * 12;
      } else if (value[key] === 4) {
        returnValue += betAmount * 24;
      } else if (value[key] === 5) {
        returnValue += betAmount * 72;
      }
    } else if (key === 7) {
      if (value[key] === 2) {
        returnValue += betAmount * 2;
      } else if (value[key] === 3) {
        returnValue += betAmount * 10;
      } else if (value[key] === 4) {
        returnValue += betAmount * 20;
      } else if (value[key] === 5) {
        returnValue += betAmount * 60;
      }
    } else if (key === 8) {
      if (value[key] === 2) {
        returnValue += betAmount * 1;
      } else if (value[key] === 3) {
        returnValue += betAmount * 6;
      } else if (value[key] === 4) {
        returnValue += betAmount * 12;
      } else if (value[key] === 5) {
        returnValue += betAmount * 36;
      }
    }
  });
  const rannum = Math.random();
  if (returnValue < 0.9 * jackpotUserInfo.jackPotAmount && rannum <= 0.5) {
    const jackpotUserInfoindex = jackpotInfo.findIndex(
      (item) => item.userId === userId
    );
    jackpotInfo[jackpotUserInfoindex] = {
      ...jackpotInfo[jackpotUserInfoindex],
      jackPotAmount: jackpotInfo[jackpotUserInfoindex] - returnValue,
    };
    jackPotAmount -= returnValue;
    await User.updateOne({ diamonds: returnValue });
  }
  console.log(`socket result`, result, jackpotgameGrid, jackPotAmount);
  // console.log("jackPotAmount2", jackPotAmount);
  // socket.emit("jackpot-result", { result, jackpotgameGrid, jackPotAmount });
  res.send({ result, jackpotgameGrid, jackPotAmount });
  if (returnValue > 0) {
    await TransactionHistory.create({
      sentby: userId,
      sentTo: null,
      diamondsAdded: -1 * betItem.amount * multiplyvalue,
      game: "jackpot",
    });
  }

  return { jackpotgameGrid, jackPotAmount };
});
app.put(
  "/api/update-jackpot",
  authenticateAppUser,
  gamesController.updateJackPot
);
app.post(
  "/api/update-jackpot",
  authenticateAppUser,
  gamesController.updateJackPot
);
app.get("/get-jackpot", authenticateAppUser, gamesController.getJackPotAmount);
app.get("/api/getDiamonds", authenticateAppUser, gamesController.getDiamonds);
app.get(
  "/api/admin/creators",
  // authenticateToken,
  gamesController.getAllCreators
);
app.get("/api/admin/bd/all", authenticateToken, bdRoutes.getAllBDforAdmin);

app.post("/api/admin/get-otp", authenticationController.getAdminOtp);
// app.delete("/api/admin/dele")
app.put("/api/user-transfer-agent", gamesController.transferToAgent);
app.put("/api/agent-transfer-user", gamesController.transferFromAgentToUser);

app.get("/api/checkToken", authenticateAppUser, async (req, res) => {
  let appToken = await AppToken.findOne({});
  let Tokens = appToken.appTokens;
  if (Tokens[req.userId] !== req.appToken) {
    res.status(400).send("new user loggedIn");
  } else {
    res.send("token valid");
  }
});

app.post("/api/token", async (req, res) => {
  const { userId, token } = req.body;
  const appTokens = await AppToken.findOne({});
  appTokens.appTokens[userId] = token;

  // console.log("appTokens123", appTokens);
  appTokens.markModified("appTokens");

  await appTokens.save();
  res.send("token saved successfully");
});

app.post("/api/luckyGift", gamesController.sendLuckyGift);

const socketIds = {};
const bettingWheelValues = [5, 5, 5, 5, 10, 15, 25, 45];
const royalBattleCardcombinationsConstants = {
  SET: "set",
  PURESEQUENCE: "pure sequence",
  SEQUENCE: "sequence",
  COLOR: "color",
  PAIR: "pair",
  HIGHCARD: "high card",
};
const royalBattleCardcombinations = [
  royalBattleCardcombinationsConstants.SET,
  royalBattleCardcombinationsConstants.PURESEQUENCE,
  royalBattleCardcombinationsConstants.SEQUENCE,
  royalBattleCardcombinationsConstants.COLOR,
  royalBattleCardcombinationsConstants.PAIR,
  royalBattleCardcombinationsConstants.HIGHCARD,
];
let royalBattleTotalBetAmount = 0;
const royalBattleBetInfo = [];
let bettingInfoArray = [];
const jackpotInfo = [];
const rows = 3;
const cols = 5;
// Define constants for suits and ranks
const SUITS = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
const RANKS = [
  "ACE",
  "KING",
  "QUEEN",
  "JACK",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];

// Function to generate three cards with the same rank and random suits
function generateThreeCardsSameRank() {
  // Choose a random rank

  const randomSuits = [];
  const randomRank = getRandomInt(0, 12);
  while (randomSuits.length < 3) {
    const randomSuit = getRandomInt(0, 3);
    randomSuits.push(`${SUITS[randomSuit]} ${RANKS[randomRank]}`);
  }
  return randomSuits;
}

function generatePureSequence() {
  let randomSuit = getRandomInt(0, 3);

  const threeCards = [];
  const startIndex = getRandomInt(0, 10);

  for (let i = 0; i < 3; i += 1) {
    threeCards.push(`${SUITS[randomSuit]} ${RANKS[startIndex + i]}`);
  }

  return threeCards;
}

function generateSequence() {
  const threeCards = [];
  const startIndex = getRandomInt(0, 10);

  for (let i = 0; i < 3; i += 1) {
    let randomSuit = getRandomInt(0, 3);
    threeCards.push(`${SUITS[randomSuit]} ${RANKS[startIndex + i]}`);
  }

  return threeCards;
}

function generateColor() {
  let SUITSCOLOR;
  const threeCards = [];
  const color = getRandomInt(0, 1) === 0 ? "red" : "black";
  if (color === "red") {
    SUITSCOLOR = SUITS.slice(0, 2);
  } else {
    SUITSCOLOR = SUITS.slice(2, 4);
  }
  for (let i = 0; i < 3; i += 1) {
    let randomSuit = getRandomInt(0, 1);
    threeCards.push(`${SUITSCOLOR[randomSuit]} ${RANKS[getRandomInt(0, 12)]}`);
  }

  return threeCards;
}
function getTwoDifferentRandomNumbersInRange(min, max) {
  let number1 = getRandomInt(min, max);
  let number2;

  do {
    number2 = getRandomInt(min, max);
  } while (number2 === number1);

  return [number1, number2];
}

function generatePair() {
  const threeCards = [];

  let [randomrank, randomRank2] = getTwoDifferentRandomNumbersInRange(0, 12);
  for (let i = 0; i < 2; i += 1) {
    let randomSuit = getRandomInt(0, 3);
    threeCards.push(`${SUITS[randomSuit]} ${RANKS[randomrank]}`);
  }
  threeCards.push(`${SUITS[getRandomInt(0, 3)]} ${RANKS[randomRank2]}`);

  return threeCards;
}

function generateHighCard() {
  const threeCards = [];

  for (let i = 0; i < 3; i += 1) {
    let randomSuit = getRandomInt(0, 3);
    let randomRank = getRandomInt(0, 12);
    threeCards.push(`${SUITS[randomSuit]} ${RANKS[randomRank]}`);
  }

  return threeCards;
}

const jackpotgameGrid = [];
for (let i = 0; i < rows; i++) {
  jackpotgameGrid[i] = [];
  for (let j = 0; j < cols; j++) {
    jackpotgameGrid[i][j] = 0;
  }
}
const beansToDiamondsRate = 1;
let bettingGameparticipants = 0;

var gameProperties = {
  gameStartTime: null,
  gameEndTime: null,
  bettingEndTime: null,
  totalBet: null,
  totalPlayers: null,
  result: null,
  // myBet: null,
  gameName: null,
};

function updateGameProperties(data) {
  if (data.gameStartTime) gameProperties.gameStartTime = data.gameStartTime;
  if (data.gameEndTime) gameProperties.gameEndTime = data.gameEndTime;
  if (data.bettingEndTime) gameProperties.bettingEndTime = data.bettingEndTime;
  if (data.totalBet) gameProperties.totalBet = data.totalBet;
  if (data.totalPlayers) gameProperties.totalPlayers = data.totalPlayers;
  if (data.result) gameProperties.result = data.result;
  if (data.myBet) gameProperties.myBet = data.myBet;
  if (data.gameName) gameProperties.gameName = data.gameName;
}

function sendGameUpdate(event, socket = null, data = null) {
  var sendData = {
    ...gameProperties,
    ...(data ? data : {}),
  };
  // console.log(`Sending Game Update: ${event} | gameProperties:`, sendData);
  if (socket) {
    socket.emit(event, sendData);
  } else {
    io1.emit(event, sendData);
  }
}
let happyZooGameId;
async function gameStarts() {
  happyZooGameId = generateUniqueId();

  bettingInfoArray = [];
  try {
    await Top3Winners.deleteMany({});
    await SpinnerGameBetInfo.deleteMany({});
  } catch (e) {
    console.log(e);
  }
  bettingGameparticipants = 0;
  gameProperties = {};
  updateGameProperties({ gameStartTime: new Date() });
  sendGameUpdate("game-started");
}

async function bettingEnds() {
  const { totalBet, result } = await endBetting();
  console.log(`result: ${result}`);
  updateGameProperties({
    bettingEndTime: new Date(),
    totalBet: totalBet,
    totalPlayers: bettingGameparticipants,
    result: result,
  });
  sendGameUpdate("betting-ended");
}

async function gameEnds() {
  updateGameProperties({ gameEndTime: new Date() });
  sendGameUpdate("game-ended");
  // bettingInfoArray = [];
  // try {
  //   await Top3Winners.deleteMany({});
  // } catch (e) {
  //   console.log(e);
  // }
  // bettingGameparticipants = 0;
}

async function endBetting() {
  // ACHAL: update TransactionHistory here for every user according to gamename
  console.log("bettingInfoArray", bettingInfoArray);
  let UserBetAmount = bettingInfoArray.reduce((acc, current) => {
    var existingUserIndex = acc.findIndex(
      (item) => item.userId === current.userId
    );
    // if (current.wheelNo !== nearestEntry.wheelNo) {
    if (existingUserIndex !== -1) {
      acc[existingUserIndex].amount += current.amount;
    } else {
      acc.push({
        userId: current.userId,
        amount: current.amount,
      });
      // }
    }

    return acc;
  }, []);
  console.log("UserBetAmount 12", UserBetAmount);
  if (bettingInfoArray.length === 0) {
    return {
      totalBet: 0,
      result: Math.floor(Math.random() * 8) + 1,
    };
  } else {
    const totalbettAmount = bettingInfoArray.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const amountToconsider = totalbettAmount * 0.9;
    let transformedData = bettingInfoArray.reduce((result, current) => {
      // Find the existing entry for the current wheelNo
      const existingEntry = result.findIndex(
        (entry) => entry.wheelNo === current.wheelNo
      );

      if (existingEntry !== -1) {
        // If the entry exists, update the userids and total amount
        if (!result[existingEntry].userids.includes(current.userId)) {
          result[existingEntry].userids.push(current.userId);
        }
        result[existingEntry].totalAmount += current.amount;
      } else {
        // If the entry doesn't exist, create a new one
        result.push({
          userids: [current.userId],
          wheelNo: current.wheelNo,
          totalAmount: current.amount,
        });
      }

      return result;
    }, []);
    console.log("transformedData", transformedData);
    let newtransformedData = transformedData.map((data, index) => ({
      userids: data.userids,
      wheelNo: data.wheelNo,
      totalAmount: data.totalAmount,
      betreturnvalue: bettingWheelValues[data.wheelNo - 1] * data.totalAmount,
    }));
    console.log("newtransformedData", newtransformedData);

    newtransformedData = ensureWheelNumbers(newtransformedData);
    console.log("newtransformedData after ensuring", newtransformedData);

    newtransformedData.sort((a, b) => b.betreturnvalue - a.betreturnvalue);
    console.log("newtransformedData after sorting", newtransformedData);

    let nearestEntry;
    let minDifference;
    if (newtransformedData.length > 0) {
      minDifference = amountToconsider - newtransformedData[0].betreturnvalue;
    }

    let i = 1;
    // newtransformedData = ensureWheelNumbers(newtransformedData);
    // while (minDifference < 0 && i <= newtransformedData.length - 1) {
    //   minDifference = amountToconsider - newtransformedData[i].betreturnvalue;
    //   nearestEntry = newtransformedData[i];
    //   i++;
    // }
    nearestEntry = newtransformedData[newtransformedData.length - 1];
    console.log("nearestEntry", nearestEntry);
    //nearestEntry contains wheelNo won and bettingGameparticipants conatins total players total bet in totalbettAmount
    let multiplyvalue = 0;
    console.log("this is nearestentrywheelnumber");
    console.log(nearestEntry.wheelNo);
    if (nearestEntry !== undefined) {
      multiplyvalue = bettingWheelValues[nearestEntry.wheelNo - 1];
    }
    let mybettingHistorywinAmount = {};
    bettingInfoArray.forEach(async (betItem) => {
      console.log("betItem:", betItem);

      const userspentInfo = UserBetAmount.find(
        (item) => item.userId === betItem.userId
      );

      if (
        nearestEntry.userids.includes(betItem.userId) &&
        betItem.wheelNo === nearestEntry.wheelNo
      ) {
        console.log(
          `Creating a bettingGameData entry with userId: ${betItem.userId
          } | userspentInfo.amount: ${userspentInfo.amount
          } | betItem.amount * multiplyvalue: ${betItem.amount * multiplyvalue
          } | betItem.wheelNo: ${betItem.wheelNo} | betItem: `,
          betItem
        );
        let resultBetItem = bettingInfoArray.find(
          (o) =>
            o.userId === betItem.userId && o.wheelNo === nearestEntry.wheelNo
        );
        await SpinnerGameWinnerHistory.create({
          userId: betItem.userId,
          diamondsSpent: userspentInfo.amount,
          diamondsEarned: betItem.amount * multiplyvalue,
          resultBet: resultBetItem.amount,
          wheelNo: betItem.wheelNo,
          gameId: happyZooGameId,
        });
        mybettingHistorywinAmount[betItem.userId] =
          betItem.amount * multiplyvalue;
        //	await SpinnerGameWinnerHistory.updateOne(
        //		          { userId: betItem.userId },
        //		          {       $set: { diamondsSpent: userspentInfo.amount },
        //			  $set: { wheelNo: betItem.wheelNo },
        //		  $inc: { diamondsEarned: betItem.amount * multiplyvalue } }
        //  );

        console.log("Updating wallet", betItem.amount * multiplyvalue);
        await User.updateOne(
          { userId: betItem.userId },
          { $inc: { diamondsCount: betItem.amount * multiplyvalue } }
        );
        await TransactionHistory.create({
          sentby: betItem.userId,
          sentTo: null,
          // mode: "outcome",
          diamondsAdded: -1 * userspentInfo.amount,
          game: "spinner-bet-game",
        });

        console.log(
          "saaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );
        console.log(multiplyvalue);
        console.log(betItem.amount);
        await SpinnerGameBetInfo.findOneAndUpdate(
          {
            userId: betItem.userId,
          },
          {
            $set: { wager: userspentInfo.amount },
            $inc: { price: betItem.amount * multiplyvalue },
          },
          { upsert: true }
        );
      } else {
        await SpinnerGameBetInfo.findOneAndUpdate(
          {
            userId: betItem.userId,
          },
          {
            wager: userspentInfo.amount,
            price: 0,
          },
          { upsert: true }
        );
      }
      // if(mybettingHistory[betItem.userId])
      // await
    });
    UserBetAmount.forEach(async (userAmount) => {
      if (mybettingHistorywinAmount[userAmount.userId]) {
        await SpinnerGameHistory.create({
          userId: userAmount.userId,
          diamondsSpent: userAmount.amount,
          diamondsEarned: mybettingHistorywinAmount[userAmount.userId],
          gameId: happyZooGameId,
          wheelNo: nearestEntry.wheelNo,
        });
      } else {
        await SpinnerGameHistory.create({
          userId: userAmount.userId,
          diamondsSpent: userAmount.amount,
          diamondsEarned: 0,
          gameId: happyZooGameId,
          wheelNo: nearestEntry.wheelNo,

        });
      }
    });
    let resultArray, betInfoFiltered;
    if (nearestEntry !== undefined) {
      await bettingGameData.create({
        participants: bettingGameparticipants,
        winners: nearestEntry.userids.length,
        wheelNo: nearestEntry.wheelNo,
        gameId: happyZooGameId,
      });
      betInfoFiltered = bettingInfoArray.filter(
        (item) =>
          item.wheelNo === nearestEntry.wheelNo &&
          nearestEntry.userids.includes(item.userId)
      );
      console.log("betInfoFiltered1234", betInfoFiltered);
      resultArray = betInfoFiltered.reduce((acc, current) => {
        var existingUser = acc.findIndex(
          (item) => item.userId === current.userId
        );

        if (existingUser !== -1) {
          acc[existingUser].amount += current.amount * multiplyvalue;
        } else {
          acc.push({
            userId: current.userId,
            wheelNo: current.wheelNo,
            amount: current.amount * multiplyvalue,
          });
        }

        return acc;
      }, []);
      console.log("resultArray before sort", resultArray);

      resultArray.sort((a, b) => b.amount - a.amount);

      for (let i = 0; i < resultArray.length; i++) {
        //console.log("saaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        //console.log(resultArray[i].amount)
        //console.log(multiplyvalue)
        //console.log(resultArray[i].amount * multiplyvalue)
        await TransactionHistory.create({
          sentby: null,
          sentTo: resultArray[i].userId,
          // mode: "outcome",
          diamondsAdded: resultArray[i].amount * multiplyvalue,
          game: "spinner-bet-game",
        });
      }
      // resultArray.forEach((result)=>{

      // })
      console.log("resultArray after sort", resultArray);

      let top3Entries = resultArray.slice(0, 3);
      console.log("top3Entries before map", top3Entries);

      top3Entries = top3Entries.map((item) => ({
        userId: item.userId,
        winningAmount: item.amount,
      }));
      console.log("top3Entries after map", top3Entries);
      await Top3Winners.create({ Winners: top3Entries });

      // let UserBetAmount = bettingInfoArray.reduce((acc, current) => {
      //   var existingUserIndex = acc.findIndex(
      //     (item) => item.userId === current.userId
      //   );
      //   if (current.wheelNo !== nearestEntry.wheelNo) {
      //     if (existingUserIndex !== -1) {
      //       acc[existingUserIndex].amount += current.amount;
      //     } else {
      //       acc.push({
      //         userId: current.userId,
      //         amount: current.amount,
      //       });
      //     }
      //   }

      //   return acc;
      // }, []);
      // UserBetAmount.forEach((item) => {
      //   SpinnerGameWinnerHistory.findOneAndUpdate(
      //     { userId: item.userId },
      //     { $inc: { diamondsSpent: item.amount } },
      //     { upsert: true }
      //   );
      // });
    }
    return {
      totalBet: totalbettAmount,
      result: nearestEntry !== undefined ? nearestEntry.wheelNo : null,
    };
  }
}

function getCards(x) {
  let cards;
  if (x === 0) {
    cards = generateThreeCardsSameRank();
  } else if (x === 1) {
    cards = generatePureSequence();
  } else if (x === 2) {
    cards = generateSequence();
  } else if (x === 3) {
    cards = generateColor();
  } else if (x === 4) {
    cards = generatePair();
  } else if (x === 5) {
    cards = generateHighCard();
  }
  return cards;
}
const ludoroomId = uuidv4();
let ludoPlayers = 0;
let LudoplayerPositions = [];
const ludoColors = ["RED", "GREEN", "YELLOW", "BLUE"];

function getBoardStartPosition(color) {
  let boardStartPosition;
  if (LudoplayerPositions[ludoPlayerIndex].color === "RED") {
    boardStartPosition = 27;
  } else if (LudoplayerPositions[ludoPlayerIndex].color === "GREEN") {
    boardStartPosition = 14;
  } else if (LudoplayerPositions[ludoPlayerIndex].color === "YELLOW") {
    boardStartPosition = 1;
  } else {
    boardStartPosition = 39;
  }
  return boardStartPosition;
}
const sheepGameRooms = [];
const userSheepRooms = {};
//emit some event on client side just after connecting .send userId for storing socketids of connected user
io1.on("connection", (socket) => {
  // console.log("io1",io1);
  // console.log("socket",socket);
  // console.log("io1.sockets",io1)
  console.log("io1", io1.sockets.sockets);

  socket.on("join-sheepgame", (data) => {
    // console.log("data1234",data,typeof(data))
    const { userId } = data;
    // if (socket.id in socketIds) {
    //   return;
    // }
    if (socketIds[socket.id] !== userId) return;
    if (userId === undefined) return;
    if (userSheepRooms[userId]) return;
    let sheepIndex = sheepGameRooms.findIndex((room) => {
      return room.player1 === null || room.player2 === null;
    });
    if (sheepIndex == -1) {
      const roomId = uuidv4();
      sheepGameRooms.push({ roomId, player1: userId, player2: null });
      socket.join(roomId);
      userSheepRooms[userId] = roomId;
      socket.emit("waiting");
      console.log("sheepGameRooms", sheepGameRooms);
      console.log("userSheepRooms", userSheepRooms);
    } else {
      let existingRoom = sheepGameRooms[sheepIndex];
      socket.join(existingRoom.roomId);
      sheepGameRooms[sheepIndex] = {
        ...sheepGameRooms[sheepIndex],
        player2: userId,
      };
      userSheepRooms[userId] = existingRoom.roomId;

      socket.to(existingRoom.roomId).emit("new-user-joined", userId);
      socket.emit("opponent", existingRoom.player1);
      console.log("sheepGameRooms", sheepGameRooms);
      console.log("userSheepRooms", userSheepRooms);
    }
  });
  console.log(`some user with id ${socket.id} connected`);
  socket.on("send-message", (data) => {
    const { userId, message } = data;
    console.log(" userId,message", userId, message, userSheepRooms[userId]);
    socket.to(userSheepRooms[userId]).emit("new-message", message);
  });
  socket.on("sheep-game-over", async (data) => {
    console.log("called sheep-game-over", data);

    const { userId, diamonds } = data;
    let currRoomId = userSheepRooms[userId];
    let sheepGameRoomsIndex = sheepGameRooms.findIndex((gameroom) => {
      return (gameroom.roomId = currRoomId);
    });
    if (sheepGameRoomsIndex !== -1) {
      if (sheepGameRooms[sheepGameRoomsIndex].player1 === userId) {
        delete userSheepRooms[sheepGameRooms[sheepGameRoomsIndex].player2];
      } else {
        delete userSheepRooms[sheepGameRooms[sheepGameRoomsIndex].player1];
      }
      delete userSheepRooms[userId];
      sheepGameRooms.splice(sheepGameRoomsIndex, 1);
      if (diamonds) {
        await User.updateOne({ userId }, { diamondsCount: diamonds });
      }
    }
    console.log("sheepGameRooms", sheepGameRooms);
    console.log("userSheepRooms", userSheepRooms);
  });

  socket.on("user-connected", (data) => {
    console.log("user-connected", data);
    socketIds[socket.id] = data.userId;
    console.log("socketIds", socketIds);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    // const disconnectedUserId = Object.keys(socketIds).find(
    //   (userId) => socketIds[userId] === socket.id
    // );

    // if (disconnectedUserId) {
    // console.log(`Socket ID for user ${disconnectedUserId} deleted`);
    // }
    let disconnectedSocketId = socket.id;
    let disconnectedUserId = socketIds[socket.id];
    delete socketIds[disconnectedSocketId];
    let disconnectedUserRoom = userSheepRooms[disconnectedUserId];
    delete userSheepRooms[disconnectedUserId];
    let disconnectedIndex = sheepGameRooms.findIndex(
      (room) => room.roomId === disconnectedUserRoom
    );
    if (disconnectedIndex != -1) {
      if (sheepGameRooms[disconnectedIndex].player1 == disconnectedUserId) {
        sheepGameRooms[disconnectedIndex].player1 = null;
        if (sheepGameRooms[disconnectedIndex].player2 === null) {
          sheepGameRooms.splice(disconnectedIndex, 1);
        }
      } else {
        sheepGameRooms[disconnectedIndex].player2 = null;
        if (sheepGameRooms[disconnectedIndex].player1 === null) {
          sheepGameRooms.splice(disconnectedIndex, 1);
        }
      }
    }
    console.log("sheepGameRooms", sheepGameRooms);
    console.log("userSheepRooms", userSheepRooms);
  });

  socket.on("get-status", async (data) => {
    const userId = data.userId;
    console.log("userId", userId);
    if (userId) {
      const user = await User.findOne({ userId: userId });
      console.log("user", user);
      sendGameUpdate("game-status", socket, {
        diamonds: user.diamondsCount,
      });
    } else {
      sendGameUpdate("game-status");
    }
  });
  socket.on("join-game", (data) => {
    const userId = data.userId;
    const gameName = data.gameName;
    console.log(`${userId} wants to join the game ${gameName}`);
    sendGameUpdate("game-status");
  });
  socket.on("bet", async (data) => {
    if (gameProperties.bettingEndTime) {
      console.log("Betting has already ended. Can't bet");
      return;
    }
    const userId = data.userId;
    const gameName = data.gameName;
    const wheelNo = data.wheelNo;
    const amount = data.amount;
    var userExists = bettingInfoArray.some((item) => item.userId === userId);

    if (!userExists) bettingGameparticipants += 1;

    const updatedUser = await User.findOneAndUpdate(
      { userId: userId, diamondsCount: { $gte: amount } },
      { $inc: { diamondsCount: -1 * amount } },
      { new: true }
    );

    if (!updatedUser) {
      sendGameUpdate("bet-status", socket, {
        diamonds: updatedUser.diamondsCount,
        status: "rejected",
      });
    } else {
      let existingBet = bettingInfoArray.findIndex(
        (item) => item.userId === userId && item.wheelNo === wheelNo
      );
      if (existingBet !== -1) {
        bettingInfoArray[existingBet] = {
          ...bettingInfoArray[existingBet],
          amount: bettingInfoArray[existingBet].amount + amount,
        };
      } else {
        bettingInfoArray.push({ userId, wheelNo, amount });
      }
      console.log(
        `${userId} betted on the game ${gameName} at ${wheelNo} with ${amount}`
      );
      await TransactionHistory.create({
        sentby: userId,
        game: gameName,
        diamondsAdded: -1 * amount,
        // mode: "outcome",
      });
      sendGameUpdate("bet-status", socket, {
        diamonds: updatedUser.diamondsCount,
        status: "accepted",
      });
    }
  });
  // TODO: an event for checking the leaderboard
  socket.on("jackpot-bet", async (data) => {
    console.log("trigger rjvn");
    const index = jackpotInfo.findIndex((pot) => pot.userId == data.userId);
    console.log(index);
    if (index == -1) {
      jackpotInfo.push({
        userId: data.userId,
        UserBetAmount: data.betAmount,
        lines: data.lines,
        jackPotAmount: data.lines * data.betAmount,
      });
    } else {
      // jackpotInfo[index].jackPotAmount +
      jackpotInfo[index] = {
        jackPotAmount: data.lines * data.betAmount,
        userId: data.userId,
        UserBetAmount: data.betAmount,
        lines: data.lines,
      };
    }
    await TransactionHistory.create({
      sentby: data.userId,
      game: "jackpot",
      diamondsAdded: -1 * data.betAmount,
      // mode: "outcome",
    });
    console.log(jackpotInfo);
  });

  socket.on("spin-jackpot", async (data) => {
    const jackpotUserInfo = jackpotInfo.find(
      (item) => item.userId === data.userId
    );
    console.log("jackpotUserInfo", jackpotUserInfo);
    let { lines, betAmount, jackPotAmount } = jackpotUserInfo;
    console.log("jackPotAmount1", jackPotAmount);
    const generateLine = (indices) =>
      indices.map((index) => jackpotgameGrid[index[0]][index[1]]);

    const checkContinuousValues = (line) => {
      const result = [];
      let currentSymbol = line[0];
      let count = 1;

      for (let i = 1; i < line.length; i++) {
        if (line[i] === currentSymbol) {
          count++;
        } else {
          result.push({ [currentSymbol]: count });
          break;
        }
      }
      return result;
    };

    const rows = 3;
    const cols = 5;
    const jackpotgameGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.floor(Math.random() * 11) + 1)
    );

    const linePatterns = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 4],
      ],
      [
        [0, 3],
        [0, 4],
        [1, 2],
        [2, 1],
        [2, 0],
      ],
      [
        [1, 0],
        [2, 1],
        [1, 2],
        [0, 3],
        [1, 4],
      ],
      [
        [1, 0],
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 4],
      ],
      [
        [0, 0],
        [1, 1],
        [2, 2],
        [0, 3],
        [1, 4],
      ],
      [
        [2, 0],
        [1, 1],
        [0, 2],
        [1, 3],
        [2, 4],
      ],
    ];

    const selectedLines = linePatterns.slice(0, lines);

    const generatedLines = selectedLines.map(generateLine);

    const result = generatedLines.map(checkContinuousValues);
    let returnValue = 0;
    result.forEach((value) => {
      const key = Object.keys(value)[0];
      if (key === 1) {
        if (value[key] === 3) {
          returnValue += betAmount * 60;
        } else if (value[key] === 4) {
          returnValue += betAmount * 120;
        } else if (value[key] === 5) {
          returnValue += betAmount * 360;
        }
      } else if (key === 2) {
        if (value[key] === 3) {
          returnValue += betAmount * 40;
        } else if (value[key] === 4) {
          returnValue += betAmount * 80;
        } else if (value[key] === 5) {
          returnValue += betAmount * 240;
        }
      } else if (key === 3) {
        if (value[key] === 3) {
          returnValue += betAmount * 25;
        } else if (value[key] === 4) {
          returnValue += betAmount * 50;
        } else if (value[key] === 5) {
          returnValue += betAmount * 150;
        }
      } else if (key === 4) {
        if (value[key] === 2) {
          returnValue += betAmount * 6;
        } else if (value[key] === 3) {
          returnValue += betAmount * 20;
        } else if (value[key] === 4) {
          returnValue += betAmount * 40;
        } else if (value[key] === 5) {
          returnValue += betAmount * 120;
        }
      } else if (key === 5) {
        if (value[key] === 2) {
          returnValue += betAmount * 5;
        } else if (value[key] === 3) {
          returnValue += betAmount * 15;
        } else if (value[key] === 4) {
          returnValue += betAmount * 30;
        } else if (value[key] === 5) {
          returnValue += betAmount * 90;
        }
      } else if (key === 6) {
        if (value[key] === 2) {
          returnValue += betAmount * 3;
        } else if (value[key] === 3) {
          returnValue += betAmount * 12;
        } else if (value[key] === 4) {
          returnValue += betAmount * 24;
        } else if (value[key] === 5) {
          returnValue += betAmount * 72;
        }
      } else if (key === 7) {
        if (value[key] === 2) {
          returnValue += betAmount * 2;
        } else if (value[key] === 3) {
          returnValue += betAmount * 10;
        } else if (value[key] === 4) {
          returnValue += betAmount * 20;
        } else if (value[key] === 5) {
          returnValue += betAmount * 60;
        }
      } else if (key === 8) {
        if (value[key] === 2) {
          returnValue += betAmount * 1;
        } else if (value[key] === 3) {
          returnValue += betAmount * 6;
        } else if (value[key] === 4) {
          returnValue += betAmount * 12;
        } else if (value[key] === 5) {
          returnValue += betAmount * 36;
        }
      }
    });
    const rannum = Math.random();
    if (returnValue < 0.9 * jackpotUserInfo.jackPotAmount && rannum <= 0.5) {
      const jackpotUserInfoindex = jackpotInfo.findIndex(
        (item) => item.userId === data.userId
      );
      jackpotInfo[jackpotUserInfoindex] = {
        ...jackpotInfo[jackpotUserInfoindex],
        jackPotAmount: jackpotInfo[jackpotUserInfoindex] - returnValue,
      };
      jackPotAmount -= returnValue;
      await User.updateOne({ diamonds: returnValue });
    }
    console.log(`socket result`, result, jackpotgameGrid, jackPotAmount);
    // console.log("jackPotAmount2", jackPotAmount);
    socket.emit("jackpot-result", { result, jackpotgameGrid, jackPotAmount });
    if (returnValue > 0) {
      await TransactionHistory.create({
        sentby: data.userId,
        // mode: "outcome",
        diamondsAdded: -1 * betItem.amount * multiplyvalue,
        game: "jackpot",
      });
    }

    return { jackpotgameGrid, jackPotAmount };
  });
  //send data like frontend this data={userId,betItems=[{item:blue,amount:100},{item:set,amount:100}]} .send bet data at once for particular user
  socket.on("royal-battle-bet", async (data) => {
    // royalBattleTotalBetAmount += data.betAmount;
    // const index = royalBattleBetInfo.findIndex(
    //   (item) => item.userId === data.userId
    // );
    // if (index === -1) {
    royalBattleBetInfo.push({
      userId: data.userId,
      betItems: data.betItems,
    });

    let totalBetAmount = 0;
    data.betItems.forEach((item) => {
      totalBetAmount += item.amount;
    });
    await TransactionHistory.create({
      sentby: data.userId,
      game: "royal-battle-bet",
      diamondsAdded: -1 * totalBetAmount,
      // mode: "outcome",
    });
    // } else {
    //   royalBattleBetInfo[index] = {
    //     ...royalBattleBetInfo[index],
    //     betAmount: royalBattleBetInfo[index] + data.betAmount,
    //   };
    // }
  });

  socket.on("royal-battle-result", async (data) => {
    let [BlueSiderandomNumber, RedSiderandomNumber] =
      getTwoDifferentRandomNumbersInRange(0, 5);
    const BluesideCards = getCards(BlueSiderandomNumber);
    const RedsideCards = getCards(RedSiderandomNumber);
    const winner1 = BlueSiderandomNumber < RedSiderandomNumber ? "BLUE" : "RED";
    const winner2 =
      BlueSiderandomNumber < RedSiderandomNumber
        ? royalBattleCardcombinations[BlueSiderandomNumber]
        : royalBattleCardcombinations[RedSiderandomNumber];
    console.log(
      "royalBattleCardcombinations[BlueSiderandomNumber]",
      royalBattleCardcombinations[BlueSiderandomNumber]
    );
    console.log(
      "royalBattleCardcombinations[RedSiderandomNumber]",
      royalBattleCardcombinations[RedSiderandomNumber]
    );
    const userbet = royalBattleBetInfo.filter(
      (x) => x.userId === socketIds[socket.id]
    );
    // royalBattleBetInfo.forEach(async (userbet) => {
    const winnerItems = userbet.betItems.filter(
      (betItem) => betItem.item === winner1 || betItem.item === winner2
    );
    let returnAmount = 0;
    if (winnerItems.length === 0) {
      socket.emit("royal-battle-result", {
        winner1,
        winner2,
        BluesideCards,
        RedsideCards,
        returnAmount,
      });
    } else {
      winnerItems.forEach((winnerItem) => {
        if (winnerItem.item === "Blue") {
          returnAmount += 1.95 * winnerItem.amount;
        }
        if (winnerItem.item === "Red") {
          returnAmount += 1.95 * winnerItem.amount;
        }
        if (winnerItem.item === "Pair") {
          returnAmount += 3.5 * winnerItem.amount;
        }
        if (winnerItem.item === "Color") {
          returnAmount += 10 * winnerItem.amount;
        }
        if (winnerItem.item === "Sequence") {
          returnAmount += 15 * winnerItem.amount;
        }
        if (winnerItem.item === "Pure Seq") {
          returnAmount += 100 * winnerItem.amount;
        }
        if (winnerItem.item === "Set") {
          returnAmount += 100 * winnerItem.amount;
        }
      });
      if (returnAmount < 0.9 * royalBattleTotalBetAmount) {
        await User.updateOne(
          { userId: userbet.userId },
          { $inc: { diamonds: returnAmount } }
        );
        socket.emit("royal-battle-result", {
          winner1,
          winner2,
          BluesideCards,
          RedsideCards,
          returnAmount,
        });
        //TODO :update game outcome
        // await GameTransactionHistory.create({
        //   userId: data.userId,
        //   mode: "outcome",
        //   diamonds: betItem.amount * multiplyvalue,
        //   game: "royal-battle",
        // });
      } else {
        socket.emit("royal-battle-result", {
          winner1,
          winner2,
          BluesideCards,
          RedsideCards,
          returnAmount: 0,
        });
      }
    }
    // });
    console.log({ winner1, winner2, BluesideCards, RedsideCards });
    // sendGameUpdate("royal-battle-result", socket, {
    //   winner1,
    //   winner2,
    //   BluesideCards,
    //   RedsideCards,
    //   // returnAmount,
    // });
    // return { winner1, winner2, BluesideCards, RedsideCards };
  });

  socket.on("join-ludo-game", (data) => {
    if (ludoPlayers < 4) {
      socket.join(ludoroomId);
      ludoPlayers += 1;
      LudoplayerPositions.push({
        userId: data.userId,
        socketId: socket.id,
        positions: [0, 0, 0, 0],
        boardPositions: [0, 0, 0, 0],
        isInHomeRow: [false, false, false, false],
        HomeRowPosition: [0, 0, 0, 0],
        color: ludoColors[ludoPlayers - 1],
      });
    }
  });
  let ludoPlayerIndex, diceNumber;
  socket.on("roll-dice", () => {
    diceNumber = getRandomInt(1, 6);
    socket.emit("dice-result", diceNumber);
    let ludoPlayerIndex = LudoplayerPositions.find(
      (playerPosition) => playerPosition.socketId === socket.id
    );

    const zerosCount = getcount(
      LudoplayerPositions[ludoPlayerIndex].positions,
      0
    );
    let boardStartPosition = getBoardStartPosition(
      LudoplayerPositions[ludoPlayerIndex].color
    );

    if (diceNumber === 6) {
      if (zerosCount === 4) {
        ludoPlayers[ludoPlayerIndex] = {
          ...ludoPlayers[ludoPlayerIndex],
          positions: [1, 0, 0, 0],
          boardPositions: [boardStartPosition, 0, 0, 0],
        };
        socket.emit({
          boardPositions: LudoplayerPositions[ludoPlayerIndex].boardPositions,
          positions: LudoplayerPositions[ludoPlayerIndex].positions,
          diceNumber,
        });
        socket.to(ludoroomId).emit("update-positions", {
          playersInfo: LudoplayerPositions,

          diceNumber,
        });
      } else {
        socket.emit("choose");
      }
    } else {
      if (zerosCount !== 4) {
        socket.emit("choose-move-pin");
      }
    }

    // if (ludoPlayers.) io1.to(ludoroomId).emit;
  });

  socket.on("move", (data) => {
    const { userId, pin } = data;

    let ludoPlayerIndex = LudoplayerPositions.find(
      (playerPosition) => playerPosition.socketId === socket.id
    );
    if (LudoplayerPositions[ludoPlayerIndex].isInHomeRow[pin] === true) {
      if (
        !(
          LudoplayerPositions[ludoPlayerIndex].HomeRowPosition[pin] +
          diceNumber >
          6
        )
      ) {
        LudoplayerPositions[ludoPlayerIndex].HomeRowPosition[pin] += diceNumber;
      }
    } else {
      let updatedPositions = [
        ...LudoplayerPositions[ludoPlayerIndex].positions,
      ];
      let updatedBoardPositions = [
        ...LudoplayerPositions[ludoPlayerIndex].boardPositions,
      ];

      updatedPositions[pin] += diceNumber;
      updatedBoardPositions[pin] =
        (updatedBoardPositions[pin] + diceNumber) % 52;
      let updatedHomePositions =
        LudoplayerPositions[ludoPlayerIndex].HomeRowPosition;
      let updatedIsInHomeRow = LudoplayerPositions[ludoPlayerIndex].isInHomeRow;
      if (updatedPositions[pin] > 52) {
        updatedHomePositions = [
          ...LudoplayerPositions[ludoPlayerIndex].HomeRowPosition,
        ];
        updatedHomePositions[pin] = updatedPositions[pin] - 52;
        updatedIsInHomeRow[pin] = true;
        updatedBoardPositions[pin] = 0;
      }
      LudoplayerPositions[ludoPlayerIndex] = {
        ...LudoplayerPositions[ludoPlayerIndex],
        positions: updatedPositions,
        boardPositions: updatedBoardPositions,
        HomeRowPosition: updatedHomePositions,
        isInHomeRow: updatedIsInHomeRow,
      };
      let matchedPinpPlayerIndex = LudoplayerPositions.findIndex(
        (player) =>
          player.userId != userId &&
          player.boardPositions[pin] === updatedBoardPositions[pin]
      );
      if (matchedPinpPlayerIndex != -1) {
        let updatedMatchedPlayerPositions = [
          ...LudoplayerPositions[matchedPinpPlayerIndex].positions,
        ];
        updatedMatchedPlayerPositions[pin] = 0;

        let updatedMatchedPlayerBoardPositions = [
          ...LudoplayerPositions[matchedPinpPlayerIndex].positions,
        ];
        updatedMatchedPlayerBoardPositions[pin] = 0;

        LudoplayerPositions[matchedPinpPlayerIndex] = {
          ...LudoplayerPositions[matchedPinpPlayerIndex],
          positions: updatedMatchedPlayerPositions,
          boardPositions: updatedMatchedPlayerBoardPositions,
        };
      }

      io1.to(ludoroomId).emit("player-pin-killed", {
        userId: LudoplayerPositions[matchedPinpPlayerIndex].userId,
      });
      socket.to(ludoroomId).emit("update-positions", {
        playersInfo: LudoplayerPositions,
        diceNumber,
      });
    }
    socket.emit({
      boardPositions: LudoplayerPositions[ludoPlayerIndex].boardPositions,
      positions: LudoplayerPositions[ludoPlayerIndex].positions,
      diceNumber,
    });
    socket.to(ludoroomId).emit("update-positions", {
      playersInfo: LudoplayerPositions,
      diceNumber,
    });
  });

  socket.on("unlock", (data) => {
    const { userId, pin } = data;
    let ludoPlayerIndex = LudoplayerPositions.find(
      (playerPosition) => playerPosition.socketId === socket.id
    );
    let updatedPositions = [...LudoplayerPositions[ludoPlayerIndex].positions];
    let updatedBoardPositions = [
      ...LudoplayerPositions[ludoPlayerIndex].boardPositions,
    ];

    updatedPositions[pin] = 0;
    updatedBoardPositions[pin] = getBoardStartPosition(
      LudoplayerPositions[ludoPlayerIndex].color
    );

    LudoplayerPositions[ludoPlayerIndex] = {
      ...LudoplayerPositions[ludoPlayerIndex],
      positions: updatedPositions,
      boardPositions: updatedBoardPositions,
    };
    socket.emit({
      boardPositions: LudoplayerPositions[ludoPlayerIndex].boardPositions,
      positions: LudoplayerPositions[ludoPlayerIndex].positions,
      // diceNumber,
    });
    socket.to(ludoroomId).emit("update-positions", {
      playersInfo: LudoplayerPositions,
      // diceNumber,
    });
  });
});

async function startANewGame() {
  try {
    // TODO: ACHAL - uncomment this to start the spinner game
    setTimeout(gameStarts, 0, io1); // Betting Starts
    setTimeout(bettingEnds, 30000); // Betting Ends & send result
    setTimeout(gameEnds, 40000, io1); // 10 sec spinner + 10 sec leaderboard
  } catch (e) {
    console.error("Error in Game:", e);
  }
  setTimeout(startANewGame, 45000); // New Game Begins
}

startANewGame();
cron.schedule("0 0 1 * *", async () => {
  try {
    const allAgencyData = await AgencyData.find({});
    // allAgencyData.forEach(async (agency) => {
    for (const agency of allAgencyData) {
      await AgencyData.updateOne(
        { agencyId: agency.agencyId },
        { beansCount: 0 }
      );
      await User.updateOne(
        { userId: agency.ownerId },
        { $inc: { beansCount: agency.beansCount } }
      );
    }
  } catch (e) {
    console.log(e);
  }
});

cron.schedule("0 0 1 * *", async () => {
  try {
    const allBdData = await BdData.find({});
    for (const Bd of allBdData) {
      await BdData.updateOne({ id: Bd.agencyId }, { beansCount: 0 });
      await User.updateOne(
        { userId: Bd.id },
        { $inc: { beansCount: Bd.beansCount } }
      );
    }
  } catch (e) {
    console.log(e);
  }
});

cron.schedule("0 0 * * 1", async () => {
  try {
    const allUsersData = await User.find({});
    for (const user of allUsersData) {
      await User.updateOne(
        { userId: user.userId },
        {
          $inc: { beansCount: user.creatorBeans.bonus },
          creatorBeans: {
            total: 0,
            basic: 0,
            bonus: 0,
          },
        }
      );
    }
  } catch (e) {
    console.log(e);
  }
});

cron.schedule("0 0 * * *", async () => {
  try {
    await User.updateMany(
      {},
      { isTodayTimeComplete: false, todayActiveTime: 0 }
    );
  } catch (e) {
    console.log(e);
  }
});

cron.schedule("0 0 1 * *", async () => {
  try {
    await User.updateMany({}, { activeTime: 0, activeDays: 0 });
  } catch (e) {
    console.log(e);
  }
});

// console.log("admin in app", admin);
// exports.admin = admin;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
