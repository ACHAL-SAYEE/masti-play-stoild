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
} = require("../models/models");

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
        query = { sentTo: userId, paymentType: null, beansAdded: { $gt: 0 } };
        break;
      case "cashout":
        query = { amount: { $gt: 0 }, sentTo: userId, beans: { $lt: 0 } };
        break;
      case "agent-transfer":
        query = {
          sentTo: { $regex: /^Ain/ },
          sentby: userId,
          beansAdded: { $gt: 0 },
        };
        break;
      default:
        query = { beansAdded: { $lt: 0 }, diamondsAdded: { $gt: 0 } };
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
          sentTo: userId,
          paymentType: null,
          diamondsAdded: { $gt: 0 },
        };
        break;
      case "recharge":
        query = { sentTo: userId, game: null, diamondsAdded: { $gt: 0 } };
        break;
      default:
        query = {
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
    const { userId } = req.query;
    try {
      const result = await User.findOne({ userId: userId }).select({
        _id: 0,
        __v: 0,
      });
      if (result === null) {
        res.status(400).send("user not found");
      } else {
        console.log(result);
        res.send(result);
      }
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
      await User.updateOne({ userId }, { $inc: { beansCount: -1 * beans } });
      await Agent.updateOne(
        { agentId: userId },
        { $inc: { diamondsCount: beans } }
      );
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async postAgent(req, res) {
    console.log("called make user");
    const { resellerOf, paymentMethods, status, userId } = req.body;
    console.log(paymentMethods);
    try {
      const origUser = await User.findOneAndUpdate(
        { userId: userId },
        { agentId: `A${userId}` }
      );
      if (origUser.agentId) {
        res.status(400).send("user is already an agent");
        return;
      }
      console.log(origUser);
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
    let agentData, ownedAgencyData;
    try {
      const existingUser = await User.findOne({ userId: userId })
        .select({ _id: 0, __v: 0, agentId: 0 })
        .lean();
      if (existingUser.agentId) {
        res.send(existingUser);
      } else {
        agentData = await Agent.findOne({ agentId: `A${userId}` }).select({
          _id: 0,
          __v: 0,
        });
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
    try {
      const Users = User.find({});
      res.send(Users);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
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
      const newAgent = new agencyParticipant({ userId, agencyId });
      await newAgent.save();
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
      if (agencyId == null) {
        randomNumber = generateUserId();
        const existingUserWithId = await AgencyData.find({
          agencyId: randomNumber,
        });
        if (existingUserWithId.length > 0) {
          isUserIdMatched = true;
          while (isUserIdMatched) {
            randomNumber = generateUserId();
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
      res.status(500).send("internal server error");
    }
  }

  async sendGift(req, res) {
    const { sentTo, sentby, diamondsSent } = req.body;
    try {
      const sendingUserBalance = await User.findOne({ userId: sentby });
      if (sendingUserBalance.diamondsCount < diamondsSent) {
        res.status(400).send("insufficient balance");
      }
      await User.updateOne(
        { userId: sentby },
        { $inc: { diamondsCount: -1 * Number(diamondsSent) } }
      );
      await User.updateOne(
        { userId: sentTo },
        { $inc: { beansCount: (9 * Number(diamondsSent)) / 10 } }
      );
      const agencyOfSentTo = await agencyParticipant.findOne({
        userId: sentTo,
      });

      await User.updateOne(
        { agencyId: agencyOfSentTo.agencyId },
        {
          $inc: {
            beansCount: Number(diamondsSent) / 10,
            totalBeansRecieved: Number(diamondsSent) / 10,
          },
        }
      );
      const currentDate = new Date();
      await monthlyAgencyHistory.findOneAndUpdate(
        {
          month: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        },
        {
          $inc: { beans: diamondsSent },
        },
        {
          upsert: true,
          new: true,
        }
      );

      await res.send("gift sent successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
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
              currentDate.getMonth(),
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
        res.send("recharged successfully");
      }
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
        const agencyData = await AgencyData.findOne({ agencyId });
        console.log(agencyData);
        res.send(agencyData);
        return;
      }
      const agencyJoined = await agencyParticipant.findOne({ userId });
      if (agencyJoined) {
        const AgencyData1 = await AgencyData.findOne({
          agencyId: agencyJoined.agencyId,
        });
        res.send(AgencyData1);
      } else {
        const agencyOwned = await AgencyData.findOne({ ownerId: userId });
        if (agencyOwned) {
          res.send(agencyOwned);
        } else {
          res
            .status(400)
            .send("user did not joined any agency or own an agency");
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getBettingResults(req, res) {
    const Top3Winnersinfo = await Top3Winners.find({});
    res.send({
      Top3Winnersinfo,
    });
  }

  async getAgencyParticipants(req, res) {
    const { agencyId } = req.query;
    try {
      const participants = await agencyParticipant.aggregate([
        { $match: { agencyId } },
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
    try {
      res.send(await bettingGameData.find({}));
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getUserAllBettingHistory(req, res) {
    const { userId } = req.query;
    try {
      const bettingHistory = await SpinnerGameWinnerHistory.find({
        userId,
      });
      res.send(bettingHistory);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
  async getTopWinners(req, res) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const TopWinners = await SpinnerGameWinnerHistory.find({
        createdAt: { $gte: todayStart, $lt: todayEnd },
      });
      res.send(TopWinners);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
}

const gamesController = new games();
module.exports = gamesController;
