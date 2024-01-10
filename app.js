// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
require("dotenv").config();
const http = require("http");
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
const app = express();
const server = http.createServer(app);
const  io = socketIO(server);
const path = require("path");
const cron = require('node-cron');
const { generateUniqueId, generateUserId } = require("./utils");
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
const bettingWheelValues = [2, 4, 5, 6, 7, 8, 9, 12];
let bettingInfoArray = [];
const beansToDiamondsRate = 1;
let bettingGameparticipants = 0;
const postsController = require("./controller/postsController");
const gamesController = require("./controller/gamesController");
const authenticationController = require("./controller/authentication");
const bdRoutes = require("./routes/bd");
const {
  User,
  Top3Winners,
  bettingGameData,
  SpinnerGameWinnerHistory,
} = require("./models/models");

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
        request.userId = payload.userId;
        next();
      }
    });
  }
};

initializeDB();
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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

app.post("/otp", authenticationController.sendOtp);

app.post("/verify-otp", authenticationController.verifyOtp);

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
    const ExistingUsers = await User.find({});
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
    await newUser.save();
    res.status(200).send("user created successfully");
  } catch (e) {
    console.log(e);
    res.status(500).send("internal server error");
  }
});

app.post("/api/SignInWithGoggle", authenticationController.SignInWithGoggle);

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

app.put("/api/agent/convert", gamesController.convertUsertoAgent);

app.post("/api/agent", gamesController.postAgent);

app.get("/api/agent", gamesController.getAgentData);

app.get("/api/users/all", gamesController.getAllUsers);

app.get("/api/agents/all", gamesController.getAllAgents);

app.get("/api/agent/resellers", gamesController.getResellers);

app.post("/api/change-role", gamesController.ChangeUserRole);

app.post("/api/agency-joining", gamesController.joinAgency);

app.post("/api/make-agency-owner", gamesController.makeAgencyOwner);

app.put("/api/send-gift", gamesController.sendGift);

app.put("/api/agent-recharge", gamesController.recharge);

app.get("/api/agencies/all", gamesController.getAllAgencies);

app.put("/api/make-agent", gamesController.makeAgent);

app.get("/api/comments", postsController.getsCommentsOfPost);

app.get("/api/agency", gamesController.getAgencyDataOfUser);

app.post("/api/spinner-betting", async (req, res) => {
  const { userId, wheelNo, amount } = req.body;
  var userExists = bettingInfoArray.some((item) => item.userId === userId);

  if (!userExists) bettingGameparticipants += 1;
  bettingInfoArray.push({ userId, wheelNo, amount });
  await User.updateOne(
    { userId: userId },
    { $inc: { diamondsCount: -1 * amount } }
  );
  res.send("betted successfully");
});

app.post("/api/top3-winner", gamesController.getBettingResults);

app.get("/api/all-history", gamesController.getSpinnerHistory);

app.get("/api/agency/all", gamesController.getAllAgencies);

app.get("/api/agency/participants", gamesController.getAgencyParticipants);

app.post("/api/agency/collect", gamesController.collectBeans);

app.get("/api/my-betting-history", gamesController.getUserAllBettingHistory);
// app.post("/api/top-3-winners",gamesController.getTop3winners)
app.get("/api/top-winner", gamesController.getTopWinners);

app.get("/api/bd/all", bdRoutes.getAllBD);
app.get("/api/bd", bdRoutes.getBD);
app.get("/api/bd/participants", bdRoutes.getParticipantAgencies);
app.post("/api/bd", bdRoutes.createBD);
app.put("/api/bd", bdRoutes.updateBD);
app.put("/api/bd/add-beans", bdRoutes.addBeans);
app.post("/api/bd/agency", bdRoutes.addAgency);
app.put("/api/bd/agency/remove", bdRoutes.removeAgency);

async function gameStarts(socket) {
  console.log("Game Started");
  // socket.emit("game-started", {
  //   gameName: "Happy Zoo",
  // });
}

async function gameEnds(socket) {
  console.log("Game Ends");
  // socket.emit("game-ended", {
  //   gameName: "Happy Zoo",
  // });
  // bettingInfoArray = [];
  // await Top3Winners.delete({});
}

async function bettingEnds() {
  bettingGameparticipants = 0;
  const totalbettAmount = bettingInfoArray.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const amountToconsider = totalbettAmount * 0.9;
  const transformedData = bettingInfoArray.reduce((result, current) => {
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
  const newtransformedData = transformedData.map((data, index) => ({
    userids: data.userids,
    wheelNo: data.wheelNo,
    totalAmount: data.totalAmount,
    betreturnvalue: bettingWheelValues[index] * data.totalAmount,
  }));

  newtransformedData.sort((a, b) => b.betreturnvalue - a.betreturnvalue);

  let nearestEntry;
  let minDifference = amountToconsider - newtransformedData[0].betreturnvalue;

  let i = 1;
  while (minDifference < 0 && i <= newtransformedData.length - 1) {
    minDifference = amountToconsider - newtransformedData[i].betreturnvalue;
    nearestEntry = newtransformedData[i];
  }

  const multiplyvalue = bettingWheelValues[nearestEntry.wheelNo - 1];
  bettingInfoArray.forEach(async (betItem) => {
    if (
      betItem.userId in nearestEntry.userids &&
      betItem.wheelNo === nearestEntry.wheelNo
    ) {
      await SpinnerGameWinnerHistory.create(
        { userId: betItem.userId },
        {
          diamondsEarned: betItem.amount * multiplyvalue,
          wheelNo: betItem.wheelNo,
        }
      );
      await User.updateOne(
        { userId: betItem.userId },
        { $inc: { diamondsCount: betItem.amount * multiplyvalue } }
      );
    }
  });

  await bettingGameData.create({
    participants: bettingGameparticipants,
    winners: nearestEntry.userids.length,
  });
  const betInfoFiltered = bettingInfoArray.filter(
    (item) =>
      item.wheelNo === nearestEntry.wheelNo &&
      nearestEntry.userids.includes(item.userId)
  );
  var resultArray = betInfoFiltered.reduce((acc, current) => {
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
  resultArray.sort((a, b) => b.amount - a.amount);

  let top3Entries = resultArray.slice(0, 3);
  top3Entries = top3Entries.map((item) => ({
    userId: item.userId,
    winningAmount: bettingWheelValues[item.wheelNo - 1] * item.amount,
  }));
  await Top3Winners.insertMany(top3Entries);

  let UserBetAmount = bettingInfoArray.reduce((acc, current) => {
    var existingUserIndex = acc.findIndex(
      (item) => item.userId === current.userId
    );
    if (current.wheelNo !== nearestEntry.wheelNo) {
      if (existingUserIndex !== -1) {
        acc[existingUserIndex].amount += current.amount;
      } else {
        acc.push({
          userId: current.userId,
          amount: current.amount,
        });
      }
    }

    return acc;
  }, []);
  UserBetAmount.forEach(
    SpinnerGameWinnerHistory.findOneAndUpdate(
      {
        userId: UserBetAmount.userId,
      },
      {
        $inc: { diamondsSpent: UserBetAmount.amount },
      },
      {
        upsert: true,
      }
    )
  );
}

// exports.bettingInfoArray = bettingInfoArray;
io.on("connection", (socket) => {
  socket.on("game-started", () => {
    gameStarts(socket);
  });
  socket.on("betting-ends", async () => {
    // bettingEnds();
    console.log("Betting Ends");
  });
  socket.on("game-ends", () => {
    gameEnds(socket);
  })
});

// 30 sec - bet time
// 10 sec - spin time
// 10 sec - leaderboard show time
// 10 sec - new game start time

async function startANewGame() {
  try {
    setTimeout(gameStarts, 0, io);  // Betting Starts
    setTimeout(bettingEnds, 30000); // Betting Ends & send result
    setTimeout(gameEnds, 50000, (io));  // 10 sec spinner + 10 sec leaderboard
  } catch (e) {
    console.error("Error in Game:", e);
  }
  setTimeout(startANewGame, 60000); // New Game Begins
}

startANewGame();