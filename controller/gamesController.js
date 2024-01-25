const {
  User,
  TransactionHistory,
  Agent,
  agencyParticipant,
  AgencyData,
  monthlyAgentHistory,
  monthlyAgencyHistory,
  SpinnerGameWinnerHistory,
  bettingGameData,
  Top3Winners,
  CommissionRate,
  AgentTransactionHistory,
  monthlyBdHistory,
  AgencyCommissionHistory,
  CreatorHistory,
} = require("../models/models");
const { ParticipantAgencies, BdData } = require("../models/bd");
const beansToDiamondsRate = 1;
// const { bettingInfoArray, bettingWheelValues } = require("../app");
const { generateUniqueId, generateUserId } = require("../utils");

async function queryBeansTransactionHistory(query, start, limit, selectFields) {
  try {
    return await TransactionHistory.find(query)
      .skip(start)
      .limit(limit)
      .select(selectFields);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function queryDiamondsTransactionHistory(
  query,
  start,
  limit,
  selectFields
) {
  try {
    console.log(query);
    return await TransactionHistory.find(query)
      .skip(start)
      .limit(limit)
      .select(selectFields);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

class games {
  async postData(req, res) {
    const { userId, beans, diamonds, game, paymentType, sentby, sentTo } =
      req.body;
    console.log(userId);
    try {
      let transaction;
      //recharge
      if (paymentType !== null && sentTo === userId) {
        transaction = new TransactionHistory({
          diamondsAdded: diamonds,
          beansAdded: beans,
          sentby,
          sentTo: userId,
          paymentType,
        });
      }
      //outcome
      else if (game !== null && sentTo == userId && sentby == userId) {
        transaction = new TransactionHistory({
          diamondsAdded: diamonds,
          beansAdded: beans,
          sentby: userId,
          sentTo: userId,
          game,
        });
      }
      //income
      else if (game != null && sentTo == userId) {
        transaction = new TransactionHistory({
          diamondsAdded: diamonds,
          beansAdded: beans,
          sentby: userId,
          game,
        });
      }
      await transaction.save();
      const result = await User.updateOne(
        { userId: userId },
        {
          $inc: {
            diamondsCount: diamonds == undefined ? 0 : diamonds,
            beansCount: beans == undefined ? 0 : beans,
          },
        }
      );
      await transaction.save();
      console.log(result);
      res.send("transaction done");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getBeansHistory(req, res) {
    const { userId, start, limit, mode } = req.query;

    let query = {};
    let selectFields = {
      _id: 0,
      __v: 0,
      diamondsAdded: 0,
      updatedAt: 0,
      sentTo: 0,
    };

    switch (mode) {
      case "income":
        query = {
          isGift: false,
          sentTo: userId,
          paymentType: null,
          beansAdded: { $gt: 0 },
        };
        break;
      case "cashout":
        query = {
          isGift: false,
          amount: { $gt: 0 },
          sentTo: userId,
          beans: { $lt: 0 },
        };
        break;
      case "agentTransfer":
        query = {
          isGift: false,
          sentTo: { $regex: /^Ain/ },
          sentby: userId,
          beansAdded: { $gt: 0 },
        };
        break;
      default:
        query = {
          isGift: false,
          beansAdded: { $lt: 0 },
          diamondsAdded: { $gt: 0 },
        };
        break;
    }

    try {
      const result = await queryBeansTransactionHistory(
        query,
        start,
        limit,
        selectFields
      );
      console.log(result);
      res.send(result);
    } catch (e) {
      res.status(500).send("Internal server error");
    }
  }

  async getDiamondsHistory(req, res) {
    const { userId, start, limit, mode } = req.query;

    let query = {};
    let selectFields = {
      _id: 0,
      __v: 0,
      beansAdded: 0,
      updatedAt: 0,
      sentTo: 0,
    };

    switch (mode) {
      case "income":
        query = {
          isGift: false,
          sentTo: userId,
          paymentType: null,
          diamondsAdded: { $gt: 0 },
        };
        break;
      case "recharge":
        query = {
          isGift: false,
          sentTo: userId,
          game: null,
          diamondsAdded: { $gt: 0 },
        };
        break;
      default:
        query = {
          isGift: false,
          paymentType: null,
          sentby: userId,
          diamondsAdded: { $lt: 0 },
        };
        break;
    }

    try {
      const result = await queryDiamondsTransactionHistory(
        query,
        start,
        limit,
        selectFields
      );
      console.log(result);
      res.send(result);
    } catch (e) {
      res.status(500).send("Internal server error");
    }
  }

  async getUsers(req, res) {
    const { userId, email } = req.query;
    console.log("email =", email);
    console.log("userId =", userId);
    try {
      let result;
      if (email) {
        result = await User.findOne({ email: email }).select({
          _id: 0,
          __v: 0,
        });
      } else {
        result = await User.findOne({ userId: userId }).select({
          _id: 0,
          __v: 0,
        });
      }
      if (result === null) {
        res.status(400).send("user not found");
        return;
      }
      console.log(result);
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async convert(req, res) {
    const { diamonds, beans, userId } = req.query;
    try {
      if (diamonds == null) {
        console.log("entered2");
        const DiamondsToAdd = beans * beansToDiamondsRate;
        const result2 = await User.updateOne(
          { userId: userId },
          { $inc: { diamondsCount: DiamondsToAdd, beansCount: -1 * beans } }
        );
        const result = await User.findOne({ userId: userId }).select({
          _id: 0,
          __v: 0,
        });
        console.log(result);
        res.send(result);
      } else {
        console.log("entered");
        const BeansToAdd = diamonds / beansToDiamondsRate;
        const result2 = await User.updateOne(
          { userId: userId },
          { $inc: { diamondsCount: -1 * diamonds, beansCount: BeansToAdd } }
        );
        const result = await User.findOne({ userId: userId }).select({
          _id: 0,
          __v: 0,
        });
        console.log(result);
        res.send(result);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async convertUsertoAgent(req, res) {
    const { userId, beans } = req.body;
    try {
      const balance = await User.findOne({ userId });
      if (balance.beansCount < beans) {
        res.status(400).send("insufficient balance");
        return;
      }
      await User.updateOne({ userId }, { $inc: { beansCount: -1 * beans } });
      await Agent.updateOne(
        { agentId: `A${userId}` },
        { $inc: { diamondsCount: beans } }
      );
      await TransactionHistory.create({
        diamondsAdded: beans,
        beansAdded: -1 * beans,
        sentby: userId,
        sentTo: `A${userId}`,
      });
      await AgentTransactionHistory.create({
        sentBy: userId,
        sentTo: `A${userId}`,
        diamondsAdded: beans,
        mode: "exchange",
      });
      res.send("beans added to your agent wallet successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async postAgent(req, res) {
    // console.log("called make user");
    const { resellerOf, paymentMethods, status, userId } = req.body;
    console.log(paymentMethods);
    try {
      const origUser = await User.findOneAndUpdate(
        { userId: userId },
        { agentId: `A${userId}` }
      );
      // console.log("origUser",origUser);
      if (origUser.agentId) {
        res.status(400).send("user is already an agent");
        return;
      }
      const newAgent = new Agent({
        resellerOf,
        paymentMethods,
        status,
        diamondsCount: 0,
        agentId: `A${userId}`,
      });

      await newAgent.save();
      res.send(newAgent);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAgentData(req, res) {
    console.log("called agent data");

    const { userId } = req.query;
    console.log(userId);
    let agentData;
    try {
      const existingUser = await User.findOne({ userId: userId })
        .select({ _id: 0, __v: 0 })
        .lean();
      console.log("existingUser=", existingUser);
      if (existingUser.agentId == null) {
        res.status(404).send("user is not an agent");
      } else {
        agentData = await Agent.findOne({
          agentId: existingUser.agentId,
        }).select({
          _id: 0,
          __v: 0,
        });
        console.log("agentData:", agentData);
        const ownedAgencyData = await AgencyData.findOne({ ownerId: userId });

        if (ownedAgencyData) {
          res.send({ ...existingUser, ownedAgencyData, agentData });
          return;
        } else {
          const AgencyIdInfo = await agencyParticipant.find({ userId });
          const joinedAgencyData = await AgencyData.findOne({
            agencyId: AgencyIdInfo.agencyId,
          });
          res.send({ ...existingUser, joinedAgencyData, agentData });
        }
      }
      // res.send({ ...existingUser, agentData });
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAllUsers(req, res) {
    const { limit, start } = req.query;
    try {
      const Users = await User.find({})
        .skip(Number(start))
        .limit(Number(limit));
      res.send(Users);
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async getAllAgents(req, res) {
    const { limit, start } = req.query;
    try {
      const result = await User.aggregate([
        {
          $match: { agentId: { $ne: null } },
        },
        {
          $lookup: {
            from: "agents",
            localField: "agentId",
            foreignField: "agentId",
            as: "AgentData",
          },
        },
        {
          $unwind: "$AgentData",
        },
        {
          $skip: Number(start),
        },
        {
          $limit: Number(limit),
        },
      ]);
      console.log(result);
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAllAgencies(req, res) {
    const { start, limit } = req.query;
    try {
      const Agencies = await User.aggregate([
        { $match: { agentId: { $ne: null } } },
        {
          $lookup: {
            from: "agencydatas",
            localField: "userId",
            foreignField: "ownerId",
            as: "ownedAgencyData",
          },
        },
        {
          $unwind: "$ownedAgencyData",
        },
        {
          $skip: Number(start),
        },
        { $limit: Number(limit) },
      ]);
      res.send(Agencies);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getResellers(req, res) {
    const { userId, limit, start } = req.query;
    try {
      let rellersofUser = await Agent.find({ resellerOf: `A${userId}` }).select(
        {
          agentId: 1,
        }
      );
      rellersofUser = rellersofUser.map((reseller) => reseller.agentId);
      console.log(rellersofUser);
      const result = await User.aggregate([
        {
          $match: {
            agentId: { $in: rellersofUser },
          },
        },
        {
          $lookup: {
            from: "agents",
            localField: "agentId",
            foreignField: "agentId",
            as: "AgentData",
          },
        },
        {
          $unwind: "$AgentData",
        },
        {
          $skip: Number(start),
        },
        {
          $limit: Number(limit),
        },
      ]);
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async ChangeUserRole(req, res) {
    const { userId, role } = req.body;
    try {
      await User.updateOne({ userId: userId }, { role });
      res.send("role changed successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async joinAgency(req, res) {
    const { userId, agencyId } = req.body;
    try {
      const newCreator = new agencyParticipant({ userId, agencyId });
      await newCreator.save();
      const agencyData = await AgencyData.findOne({ agencyId });
      res.send(agencyData);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async makeAgencyOwner(req, res) {
    const { userId, agencyId, name } = req.body;
    console.log("userId, agencyId, name", userId, agencyId, name);
    let randomNumber;
    try {
      const AlreadyAgencyOwner = await AgencyData.findOne({ ownerId: userId });
      if (AlreadyAgencyOwner) {
        res.status(400).send("user is already agency owner");
        return;
      }
      if (agencyId == null) {
        randomNumber = generateUserId(4);
        const existingUserWithId = await AgencyData.find({
          agencyId: randomNumber,
        });

        if (existingUserWithId.length > 0) {
          let isUserIdMatched = true;
          while (isUserIdMatched) {
            randomNumber = generateUserId(4);
            const existingUserWithId = await AgencyData.find({
              agencyId: randomNumber,
            });
            isUserIdMatched = existingUserWithId.length > 0;
          }
        }
        const newAgencyData = new AgencyData({
          agencyId: randomNumber,
          ownerId: userId,
          name,
        });
        await newAgencyData.save();
      }
      // const newOwner = new AgencyOwnership({ userId, agencyId });
      // await newOwner.save();
      const agencyData = await AgencyData.findOneAndUpdate(
        { agencyId: agencyId == null ? randomNumber : agencyId },
        { ownerId: userId }
      )
        .select({ _id: 0, __v: 0 })
        .lean();
      console.log("agencyData", agencyData);
      res.send({ ...agencyData, ownerId: userId });
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async sendGift(req, res) {
    const { sentTo, sentBy, diamondsSent, roomId } = req.body;
    console.log("sentTo, sentBy, diamondsSent =", sentTo, sentBy, diamondsSent);
    try {
      const sendingUserBalance = await User.findOne({ userId: sentBy });
      if (!sendingUserBalance) {
        res.status(400).send("user not found");
        return;
      }
      if (sendingUserBalance.diamondsCount < diamondsSent) {
        res.status(400).send("insufficient balance");
        return;
      }
      const currentDate = new Date();

      // const currentDate2 = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(
        currentDate.getDate() -
        currentDate.getDay() +
        (currentDate.getDay() === 0 ? -6 : 1)
      );

      const bonusDetails = await TransactionHistory.aggregate([
        {
          $match: {
            isGift: true,
            sentTo,
            createdAt: {
              $gte: startOfWeek,
              $lt: currentDate,
            },
          },
        },
        {
          $group: {
            _id: "$sentTo",
            weeklyDiamonds: { $sum: "$diamondsAdded" },
          },
        },
      ]);
      let bonusRate;
      const earning =
        bonusDetails.length == 0 ? 0 : bonusDetails[0].weeklyDiamonds;
      if (earning < 50000) {
        bonusRate = 0;
      } else if (earning < 200000) {
        bonusRate = 0.05;
      } else if (earning < 500000) {
        bonusRate = 0.1;
      } else {
        bonusRate = 0.15;
      }
      const DiamondsToAdd = 0.68 * diamondsSent;
      const bonusDiamonds = bonusRate * diamondsSent;
      await User.updateOne(
        { userId: sentBy },
        { $inc: { diamondsCount: -1 * diamondsSent } }
      );
      // await User.updateOne(
      //   { userId: sentTo },
      //   { $inc: { beansCount: DiamondsToAdd + bonusDiamonds } }
      // );
      await User.updateOne(
        { userId: sentTo },
        {
          $inc: {
            "creatorBeans.total": DiamondsToAdd + bonusDiamonds,
            "creatorBeans.basic": DiamondsToAdd,
            "creatorBeans.": bonusDiamonds,
          },
        }
      );
      const agencyOfSentTo = await agencyParticipant.findOne({
        userId: sentTo,
      });
      let agencyCommision;

      if (agencyOfSentTo) {
        // console.log("currentDate.getFullYear()vdsbvvvvvvvvvvvvvvvvvvvvvvvv",currentDate.getFullYear(),currentDate.getMonth())
        const currentMonthAgencydata = await monthlyAgencyHistory.findOne({
          agencyId: agencyOfSentTo.agencyId,
          month: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        });
        if (currentMonthAgencydata === null) {
          agencyCommision = 0.05;
        } else {
          const currentMonthBeans = currentMonthAgencydata.beans;

          if (currentMonthBeans < 1000000000) agencyCommision = 0.05;
          else if (currentMonthBeans < 5000000000) agencyCommision = 0.1;
          else if (currentMonthBeans < 10000000000) agencyCommision = 0.15;
          else if (currentMonthBeans < 30000000000) agencyCommision = 0.17;
          else if (currentMonthBeans < 50000000000) agencyCommision = 0.19;
          else if (currentMonthBeans < 70000000000) agencyCommision = 0.21;
          else agencyCommision = 0.23;
        }

        await AgencyData.updateOne(
          { agencyId: agencyOfSentTo.agencyId },
          {
            $inc: {
              beansCount: Math.floor(DiamondsToAdd * agencyCommision),
              totalBeansRecieved: Math.floor(DiamondsToAdd * agencyCommision),
            },
          }
        );
        await monthlyAgencyHistory.findOneAndUpdate(
          {
            agencyId: agencyOfSentTo.agencyId,
            month: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              1
            ),
          },
          {
            $inc: { beans: DiamondsToAdd * agencyCommision },
          },
          {
            upsert: true,
            new: true,
          }
        );
        await AgencyCommissionHistory.create({
          roomId,
          sentBy: sentTo,
          agencyId: agencyOfSentTo.agencyId,
          commission: DiamondsToAdd * agencyCommision,
        });

        const bdOfsentTo = await ParticipantAgencies.findOne(
          { agencyId: agencyOfSentTo.agencyId }
          // { $inc: { contributedBeans: Math.floor(DiamondsToAdd / 100) } }
        );
        let BdCommision;
        console.log("bdOfsentTo", bdOfsentTo);
        if (bdOfsentTo) {
          const currentMonthBddata = await monthlyBdHistory.findOne({
            bdId: bdOfsentTo.bdId,
            month: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              1
            ),
          });
          if (currentMonthBddata === null) {
            BdCommision = 0.05;
          } else {
            const currentMonthBeans = currentMonthBddata.beans;

            if (currentMonthBeans < 40000000000) BdCommision = 0.07;
            else BdCommision = 0.1;
          }
          await BdData.updateOne(
            { id: bdOfsentTo.bdId },
            { $inc: { beans: Math.floor(DiamondsToAdd * BdCommision) } }
          );
          await monthlyAgencyHistory.findOneAndUpdate(
            {
              bdId: bdOfsentTo.bdId,
              month: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                1
              ),
              agencyId: agencyOfSentTo.agencyId,
            },
            {
              $inc: { beans: DiamondsToAdd * BdCommision },
            },
            {
              upsert: true,
              new: true,
            }
          );
          // AgencyData.updateOne(
          //   { agencyId: agencyOfSentTo.agencyId },
          //   { $inc: { beansCount: (-1 * DiamondsToAdd) / 100 } }
          // );
        }
      }
      await CreatorHistory.create({
        creatorId: sentTo,
        sentBy,
        roomId,
        beansGifted: {
          basic: DiamondsToAdd,
          bonus: bonusDiamonds,
        },
      });
      await TransactionHistory.create({
        roomId,
        sentby: sentBy,
        sentTo,
        diamondsAdded: DiamondsToAdd,
        // beansAdded: (9 * Number(diamondsSent)) / 10,
        isGift: true,
      });

      await res.send("gift sent successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async getCreatorHistory(req, res) {
    const { userId, date, start, limit } = req.query;
    const dateObj = new Date(date);
    const startDate = new Date(dateObj);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateObj);
    endDate.setHours(23, 59, 59, 999);
    try {
      const history = await CreatorHistory.find({
        creatorId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .skip(Number(start))
        .limit(Number(limit));
      res.send(history);
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async getAgencyCommissionHistory(req, res) {
    const { agencyId, startDate, endDate, start, limit } = req.query;
    let commissionData;
    try {
      if (startDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        commissionData = await AgencyCommissionHistory.find({
          agencyId,
          createdAt: { $gte: startDateObj, $lte: endDateObj },
        }).skip(Number(start))
          .limit(Number(limit));
      } else {
        commissionData = await AgencyCommissionHistory.find({
          agencyId,
        }).skip(Number(start))
          .limit(Number(limit));
      }
      console.log(`start = ${start}, limit = ${limit}`);
      console.log("commissionData", commissionData);
      res.send(commissionData);
    } catch (e) {
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async getGiftHistory(req, res) {
    const { userId, month, year, day } = req.query;
    try {
      let query = {
        sentTo: userId,
        isGift: true,
        $expr: {
          $and: [
            { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
            { $eq: [{ $month: "$createdAt" }, parseInt(month)] },
          ],
        },
      };

      if (day != null) {
        query.$expr.$and.push({
          $eq: [{ $dayOfMonth: "$createdAt" }, parseInt(day)],
        });
      }

      const history = await TransactionHistory.find(query);
      res.send(history);
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal Server Error");
    }
  }

  async recharge(req, res) {
    const { userId, agentId, diamonds } = req.body;
    try {
      const agentData = await Agent.findOne({ agentId: agentId });
      if (agentData.diamondsCount < diamonds) {
        res.status(400).send("insufficient balance");
      } else {
        await Agent.updateOne(
          { agentId: agentId },
          { $inc: { diamondsCount: -1 * diamonds } }
        );
        await User.updateOne(
          { userId: userId },
          { $inc: { diamondsCount: diamonds } }
        );
        const currentDate = new Date();
        await monthlyAgentHistory.findOneAndUpdate(
          {
            month: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              1
            ),
          },
          {
            $inc: { diamonds },
          },
          {
            upsert: true,
            new: true,
          }
        );
        await TransactionHistory.create({
          sentby: agentId,
          sentTo: userId,
          diamondsAdded: diamonds,
        });
        await AgentTransactionHistory.create({
          sentBy: agentId,
          sentTo: userId,
          diamondsAdded: diamonds,
          mode: "transfer",
        });
        res.send("recharged successfully");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async adminRecharge(req, res) {
    const { agentId, diamonds } = req.body;
    try {
      const agentData = await Agent.findOne({ agentId: agentId });
      await Agent.updateOne(
        { agentId: agentId },
        { $inc: { diamondsCount: diamonds } }
      );
      await TransactionHistory.create({
        sentTo: agentId,
        diamondsAdded: diamonds,
      });
      await AgentTransactionHistory.create({
        sentBy: "admin",
        sentTo: agentId,
        diamondsAdded: diamonds,
        mode: "recharge",
      });
      // await monthlyAgentHistory.findOneAndUpdate(
      //   {
      //     month: new Date(
      //       currentDate.getFullYear(),
      //       currentDate.getMonth(),
      //       1
      //     ),
      //   },
      //   {
      //     $inc: { diamonds },
      //   },
      //   {
      //     upsert: true,
      //     new: true,
      //   }
      // );
      res.send("recharged successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async makeAgent(req, res) {
    const { userId } = req.body;
    try {
      const isAgencyowner = await AgencyData.findOne({ ownerId: userId });
      if (isAgencyowner) {
        res.status(400).send("you aleady own a agency");
      } else {
        await User.updateOne({ userId: userId }, { role: "agent" });
        const newAgent = new Agent({ agentId: `A${userId}` });
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAgencyDataOfUser(req, res) {
    const { userId, agencyId } = req.query;
    try {
      if (userId == null) {
        console.log(agencyId);
        const agencyData = await AgencyData.find({ agencyId });
        if (agencyData.length === 0) {
          res
            .status(404)
            .send("user did not joined any agency or own an agency");
          return;
        }
        console.log(agencyData[0]);
        res.send(agencyData[0]);
        return;
      }
      const agencyJoined = await agencyParticipant.findOne({ userId });
      if (agencyJoined) {
        const AgencyData1 = await AgencyData.findOne({
          agencyId: agencyJoined.agencyId,
        });
        res.send(AgencyData1);
      } else {
        const agencyOwned = await AgencyData.find({ ownerId: userId });
        if (agencyOwned.length > 0) {
          res.send(agencyOwned[0]);
          return;
        } else {
          res
            .status(404)
            .send("user did not joined any agency or own an agency");
          return;
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getBettingResults(req, res) {
    let Top3Winnersinfo = await Top3Winners.findOne({});
    console.log("Top3Winnersinfo:", Top3Winnersinfo);
    if (Top3Winnersinfo === null) {
      res.send({ Top3Winnersinfo: [] });
      return;
    }
    Top3Winnersinfo = await Promise.all(
      Top3Winnersinfo.Winners.map(async (winner) => {
        const userdata = await User.findOne({ userId: winner.userId });
        console.log("userdata", userdata);
        return { ...winner, userdata };
      })
    );
    res.send({
      Top3Winnersinfo,
    });
  }

  async getAgencyParticipants(req, res) {
    const { agencyId, start, limit, searchId } = req.query;

    try {
      let condition;
      if (searchId) {
        console.log("ee");
        condition = { agencyId, userId: { $regex: `.*${searchId}.*` } };
      } else {
        condition = { agencyId };
      }
      const participants = await agencyParticipant.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "userId",
            as: "participentsData",
          },
        },
        {
          $unwind: "$participentsData",
        },
        {
          $replaceRoot: { newRoot: "$participentsData" },
        },
        {
          $project: { _id: 0, __v: 0 },
        },
        {
          $skip: Number(start),
        },
        {
          $limit: Number(limit),
        },
      ]);

      res.send(participants);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async collectBeans(req, res) {
    const { agencyId } = req.body;
    try {
      console.log(agencyId);
      const agencyData = await AgencyData.findOneAndUpdate(
        { agencyId },
        { beansCount: 0 }
      );
      console.log(agencyData);
      await User.updateOne(
        { userId: agencyData.ownerId },
        { $inc: { beansCount: agencyData.beansCount } }
      );
      res.send("collected successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getSpinnerHistory(req, res) {
    const { start, limit } = req.query;
    try {
      res.send(
        await bettingGameData.find({}).skip(Number(start)).limit(Number(limit))
      );
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getUserAllBettingHistory(req, res) {
    const { userId, start, limit } = req.query;
    try {
      const bettingHistory = await SpinnerGameWinnerHistory.find({
        userId,
      });
      const userdata = await User.findOne({ userId })
        .skip(Number(start))
        .limit(Number(limit));
      res.send({ bettingHistory, userdata });
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
  async getTopWinners(req, res) {
    const { start, limit } = req.query;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const TopWinners = await SpinnerGameWinnerHistory.aggregate([
        {
          $match: { createdAt: { $gte: todayStart, $lt: todayEnd } },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",

            foreignField: "userId",
            as: "userData",
          },
        },
        { $unwind: "$userData" },
        { $skip: Number(start) },
        { $limit: Number(limit) },
      ]);

      console.log("TopWinners", TopWinners);
      res.send(TopWinners);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async setComissionRate(req, res) {
    // const {bdRate,agencyRate}=req.body
    try {
      await CommissionRate.findOneAndUpdate(
        {},
        { ...req.body },
        { upsert: true }
      );
      res.send("commission rate updated");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
  async removeAgentfromAgency(req, res) {
    const { userId } = req.query;
    try {
      await agencyParticipant.deleteOne({ userId });
      res.send("agent removed from agency");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
  async removeAgencyfromBd(req, res) {
    const { agencyId } = req.query;
    try {
      await ParticipantAgencies.deleteOne({ agencyId });
      res.send("agency removed from bd");
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  async getAgentTransactionHistory(req, res) {
    const { mode, userId, agentId, startDate, endDate } = req.query;
    let startDateObj, endDateObj;

    try {
      if (userId && startDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
        const history = await AgentTransactionHistory.find({
          sentBy: agentId,
          sentTo: userId,
          mode,
          createdAt: { $gte: startDateObj, $lte: endDateObj },
        });
        res.send(history);
        return;
      } else if (userId) {
        const history = await AgentTransactionHistory.find({
          sentBy: agentId,
          sentTo: userId,
          mode,
        });
        res.send(history);
        return;
      } else if (startDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
        console.log(startDateObj, endDateObj);

        const history = await AgentTransactionHistory.find({
          // sentBy: agentId,
          $or: [{ sentBy: agentId }, { sentTo: agentId }],

          mode,
          createdAt: { $gte: startDateObj, $lte: endDateObj },
        });
        res.send(history);
        return;
      }
      const history = await AgentTransactionHistory.find({
        $or: [{ sentBy: agentId }, { sentTo: agentId }],
        mode,
      });
      res.send(history);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async getRates(req, res) {
    try {
      const rates = await CommissionRate.findOne({});
      res.send(rates);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}

const gamesController = new games();
module.exports = gamesController;
