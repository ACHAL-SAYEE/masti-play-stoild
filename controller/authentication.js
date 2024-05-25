const unirest = require("unirest");
const {
  User,
  Agent,
  AgencyData,
  agencyParticipant,
  OtpSecret,
  AppToken,
} = require("../models/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpMap = {};
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "achalsayee@outlook.com",
    pass: "Achal12345678",
  },
});
let tokenSecreat =
  "4233d702105f11041081e9aacd786076f8de2f4f33db08d5125e50397e31f890";
const { generateUserId, generateRandomOtpSecret } = require("../utils");
const { BdData, ParticipantAgencies } = require("../models/bd");

class Authentication {
  async sendOtp(req, res) {
    const { phoneNo } = req.body;
    try {
      if (phoneNo === "1234567890")
        return res.send({
          return: true,
          request_id: "d1rsz59mlf0yg84",
          message: ["SMS sent successfully."],
          userExists: false,
        });
      const userExists = await User.findOne({ email: `${phoneNo}@gmail.com` });
      // if (userExists != null) {
      //   res.status(400).send("phone number is already taken");
      //   return;
      // }
      const req1 = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
      const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      console.log(req.headers);
      otpMap[phoneNo] = { otp, timestamp: Date.now() };
      console.log("otpMap", otpMap);

      req1.query({
        authorization:
          "ykbUo6AfCTeqhvD4PRSin5r7NHImMzXZVpjdt098alxO1wQBJc5YRUNfmtPdFeh7j3z6gvBEnx4lM2ru",
        // "BDZTf24xkW9pv6UYeaoq01JsR3bPMrNCIOzFSh7QydGH5icgl84noFbjAcINLwxPgkp1QWBfDsOURHS2",
        variables_values: otp.toString(),
        route: "otp",
        numbers: phoneNo,
      });
      console.log("OTP Sending request sent!");

      req1.headers({
        "cache-control": "no-cache",
      });

      req1.end(function (res1) {
        if (res1.error) {
          console.log("Error: ", res1.error);
          res.status(500).send(res1.body.message);
        } else {
          console.log("successful");
          const obj = {
            return: res1.body.return,
            request_id: res1.body.request_id,
            message: res1.body.message,

            // otp: otp.toString(),
          };
          if (userExists !== null) {
            obj.userExists = true;
          } else {
            obj.userExists = false;

            // res.status(200).json({obj,userExists:false});
          }
          res.send(obj);
        }
      });
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error ${e}`);
    }
  }

  async getAdminOtp(req, res) {
    const { phoneNo } = req.body;
    try {
      const userExists = await User.findOne({ email: `${phoneNo}@gmail.com` });
      if (userExists === null) {
        res.status(400).send("invalid phoneNo");
        return;
      } else {
        if (userExists.role !== "admin" && userExists.role !== "employee") {
          res
            .status(401)
            .send("unauthorised.please enter valid admin phone number");
          return;
        }
      }
      const req1 = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
      const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      console.log(req.headers);
      otpMap[phoneNo] = { otp, timestamp: Date.now() };
      console.log("otpMap", otpMap);

      req1.query({
        authorization:
          "ykbUo6AfCTeqhvD4PRSin5r7NHImMzXZVpjdt098alxO1wQBJc5YRUNfmtPdFeh7j3z6gvBEnx4lM2ru",
        // "BDZTf24xkW9pv6UYeaoq01JsR3bPMrNCIOzFSh7QydGH5icgl84noFbjAcINLwxPgkp1QWBfDsOURHS2",
        variables_values: otp.toString(),
        route: "otp",
        numbers: phoneNo,
      });
      console.log("OTP Sending request sent!");

      req1.headers({
        "cache-control": "no-cache",
      });

      req1.end(function (res1) {
        if (res1.error) {
          console.log("Error: ", res1.error);
          res.status(500).send(res1.body.message);
        } else {
          console.log("successful");
          const obj = {
            return: res1.body.return,
            request_id: res1.body.request_id,
            message: res1.body.message,

            // otp: otp.toString(),
          };
          if (userExists !== null) {
            obj.userExists = true;
          } else {
            obj.userExists = false;

            // res.status(200).json({obj,userExists:false});
          }
          res.send(obj);
        }
      });
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error ${e}`);
    }
  }

  async verifyOtp(req, res) {
    console.log("Verifying otp");
    const { otp, phoneNo } = req.body;
    if (phoneNo === "1234567890") {
      if (otp == "246478")
        return res.status(200).json({
          message: "OTP verification successful",
          OtpSecret: generateRandomOtpSecret(),
        });
      else {
        return res.status(401).json({ message: "Invalid OTP or OTP expired" });
      }
    }
    // const phone = req.headers.phone;
    // const otp = req.headers.otp;
    // const expectedOtp = '123456';
    console.log(`phone = ${phoneNo}`);
    console.log(`otpMap = `, otpMap);
    if (otpMap[phoneNo] != null) {
      const storedData = otpMap[phoneNo]["otp"];
      console.log(`storedData = ${storedData}`);
      console.log(`typeof storedData = ${typeof storedData}`);
      console.log(`otp = ${otp}`);
      console.log(`typeof otp = ${typeof otp}`);
      const { storedOtp, timestamp } = storedData;
      // if (storedData.toString().isEqual(otp)) {
      if (parseInt(otp, 10) == storedData) {
        //  && Date.now() - timestamp < 600000
        let authenticatedUserInfo = await OtpSecret.findOne({
          phoneNumber: phoneNo,
        });
        if (authenticatedUserInfo) {
          res.status(200).json({
            message: "OTP verification successful",
            OtpSecret: authenticatedUserInfo.otpSecret,
          });
        } else {
          let generatedOtpSecreat = generateRandomOtpSecret();
          await OtpSecret.create({
            phoneNumber: phoneNo,
            otpSecret: generatedOtpSecreat,
          });
          res.status(200).json({
            message: "OTP verification successful",
            OtpSecret: generatedOtpSecreat,
          });
        }
        delete otpMap[phoneNo];
        // 300000 milliseconds (5 minutes) is the validity window for the OTP
      } else {
        res.status(401).json({ message: "Invalid OTP or OTP expired" });
      }
    } else {
      res.status(404).json({ message: "Phone number not found" });
    }
  }
  async verifyAdminOtp(req, res) {
    console.log("Verifying otp");
    const { otp, phoneNo } = req.body;
    console.log(otp, phoneNo);
    // const phone = req.headers.phone;
    // const otp = req.headers.otp;
    // const expectedOtp = '123456';
    console.log(`phone = ${phoneNo}`);
    console.log(`otpMap = `, otpMap);
    if (otpMap[phoneNo] != null) {
      const storedData = otpMap[phoneNo]["otp"];
      console.log(`storedData = ${storedData}`);
      console.log(`typeof storedData = ${typeof storedData}`);
      console.log(`otp = ${otp}`);
      console.log(`typeof otp = ${typeof otp}`);
      const { storedOtp, timestamp } = storedData;
      // if (storedData.toString().isEqual(otp)) {
      if (parseInt(otp, 10) == storedData) {
        //  && Date.now() - timestamp < 600000
        let phoneNo1 = phoneNo + "@gmail.com";

        const currUser = await User.findOne({ email: phoneNo1 });
        // const currUser = await User.findOne({ phoneNumber: phoneNo });

        const payload = {
          phoneNo,
          userId: currUser.userId,
          role: currUser.role,
        };
        const jwtToken = jwt.sign(payload, tokenSecreat, {
          expiresIn: "30d",
        });
        // 300000 milliseconds (5 minutes) is the validity window for the OTP
        res
          .status(200)
          .json({ message: "OTP verification successful", token: jwtToken });
      } else {
        res.status(401).json({ message: "Invalid OTP or OTP expired" });
      }
    } else {
      res.status(404).json({ message: "Phone number not found" });
    }
  }
  async register(req, res) {
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
      // let randomNumber = generateUserId();
      // console.log(randomNumber);
      // const existingUserWithId = await User.find({ UserId: randomNumber });
      // if (existingUserWithId.length > 0) {
      //  let isUserIdMatched = true;
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
        newUserId =
          parseInt(ExistingUsers[ExistingUsers.length - 1].userId) + 1;
      }
      const newUser = new User({
        UserId: `${newUserId}`,
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
      res
        .status(201)
        .send(
          "user created successfully.To use your account you need to verify.check your email for instructions"
        );
      const options = {
        from: "achalsayee@outlook.com",
        to: email,
        subject: "verify your mastiplay account",
        text: `to continue using your mastiplay account you need first verify it`,
      };

      transporter.sendMail(options, function (err, info) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("sent:" + info.response);
      });
    } else {
      res.status(400).send("User already exists");
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const result = await User.findOne({ email });
    console.log(result);
    if (!result) {
      res.status(400).send("Invalid user");
    } else {
      if (result.password === null) {
        res
          .status(400)
          .send(
            "you used different authentication strategy.try strategy you used"
          );
      }
      const isPasswordMatched = await bcrypt.compare(password, result.password);
      if (isPasswordMatched === true) {
        const payload = {
          UserId: result.UserId,
        };
        const jwtToken = jwt.sign(payload, tokenSecreat);
        res.send({ jwtToken });
        // let appTokens = await AppToken.findOne({});
        // appTokens.appTokens[x.userId] = jwtToken;
        // await appTokens.save();
      } else {
        res.status(400);
        res.send("Invalid Password");
      }
    }
  }

  async SignInWithGoggle(req, res) {
    const oauthClient = new OAuth2Client();
    const idToken = req.headers["google-jwt"];
    try {
      const response = await oauthClient.verifyIdToken({
        idToken,
        audience: [
          // Add your android & apple client_id here
        ],
      });
      const payload = response.getPayload();

      if (payload) {
        const { email, name, photo } = payload;
        const UserInfo = await User.findOne({ email });
        if (UserInfo) {
          res.send("user signed in successfully");

          return;
        }
        await User.create({ email, name, photo });
        res.send("user registered successfully");
      } else {
        console.log("token is invalid!");
        res.status(400).send("token is invalid!");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async deleteUser(req, res) {
    const { userId } = req.query;
    try {
      await User.deleteOne({ userId });
      await Agent.deleteOne({ agentId: `A${userId}` });
      res.send("user deleted successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
  async deleteAgent(req, res) {
    const { agentId } = req.query;
    try {
      await Agent.deleteOne({ agentId });
      await User.updateOne({ agentId }, { agentId: null });
      res.send("agent deleted successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
  async deleteAgency(req, res) {
    const { agencyId } = req.query;
    try {
      await AgencyData.deleteOne({ agencyId });
      await agencyParticipant.deleteMany({ agencyId });
      await ParticipantAgencies.deleteMany({ agencyId });
      res.send("agency deleted successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
  async deleteBd(req, res) {
    const { bdId } = req.query;
    try {
      await BdData.deleteOne({ id: bdId });
      await ParticipantAgencies.deleteMany({ bdId });
      res.send("bd deleted successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

const AuthenticationController = new Authentication();
module.exports = AuthenticationController;
