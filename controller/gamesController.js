const {
  User,
  TransactionHistory,
  Agent,
  Role,
  agencyParticipant,
  AgencyOwnership,
  AgencyData,
} = require("../models/models");

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
        { UserId: userId },
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
      const result = await User.findOne({ UserId: userId }).select({
        _id: 0,
        __v: 0,
      });

      console.log(result);
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async convert(req, res) {
    const { diamonds, beans, userId } = req.query;
    console.log(typeof diamonds);
    console.log(typeof beans);

    console.log(userId);

    try {
      if (diamonds == null) {
        console.log("entered2");
        const DiamondsToAdd = beans * beansToDiamondsRate;
        const result2 = await User.updateOne(
          { UserId: userId },
          { $inc: { diamondsCount: DiamondsToAdd, beansCount: -beans } }
        );
        const result = await User.findOne({ UserId: userId }).select({
          _id: 0,
          __v: 0,
        });
        console.log(result);
        res.send(result);
      } else {
        console.log("entered");
        const BeansToAdd = diamonds / beansToDiamondsRate;
        const result2 = await User.updateOne(
          { UserId: userId },
          { $inc: { diamondsCount: -diamonds, beansCount: BeansToAdd } }
        );
        const result = await User.findOne({ UserId: userId }).select({
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

  async postAgent(req, res) {
    const { resellerOf, paymentMethods, status, userId } = req.body;
    console.log(paymentMethods);
    try {
      const origUser = await User.findOneAndUpdate(
        { UserId: userId },
        { AgentId: `A${userId}` }
      );
      console.log(origUser);
      const newAgent = new Agent({
        resellerOf,
        paymentMethods,
        status,
        diamondsCount: origUser.diamondsCount,
        beansCount: origUser.beansCount,
        resellerOf,
        AgentId: `A${userId}`,
      });

      await newAgent.save();
      res.send("agent created");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAgentData(req, res) {
    const { userId } = req.query;
    let agentData, ownedAgencyData;
    try {
      const existingUser = await User.findOne({ UserId: userId })
        .select({ _id: 0, __v: 0, AgentId: 0 })
        .lean();
      if (existingUser.AgentId) {
        res.send(existingUser);
      } else {
        agentData = await Agent.findOne({ AgentId: `A${userId}` }).select({
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

  async getAllAgents(req, res) {
    const { limit, start } = req.query;
    try {
      const result = await User.aggregate([
        {
          $lookup: {
            from: "agents",
            localField: "AgentId",
            foreignField: "AgentId",
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
  async getResellers(req, res) {
    const { userId } = req.query;
    try {
      let rellersofUser = await Agent.find({ resellerOf: `A${userId}` }).select(
        {
          AgentId: 1,
        }
      );
      rellersofUser = rellersofUser.map((reseller) => reseller.AgentId);
      console.log(rellersofUser);
      const result = await User.aggregate([
        {
          $match: {
            AgentId: { $in: rellersofUser },
          },
        },
        {
          $lookup: {
            from: "agents",
            localField: "AgentId",
            foreignField: "AgentId",
            as: "AgentData",
          },
        },
        {
          $unwind: "$AgentData",
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
      // const newRole = new Role({ userId, role });
      // await newRole.save();
      await User.updateOne({ UserId: userId }, { role });
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
      res.send("joined agency successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async makeAgencyOwner(req, res) {
    const { userId, agencyId } = req.body;
    try {
      if (agencyId == null) {
        await AgencyData.create({ agencyId });
      }
      // const newOwner = new AgencyOwnership({ userId, agencyId });
      // await newOwner.save();
      const agencyData = await AgencyData.findOneAndUpdate(
        { agencyId },
        { ownerId: userId }
      ).lean();
      res.send({ ...agencyData, ownerId: userId });
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
  async sendGift(req, res) {
    const { sentTo, sentby, diamondsSent } = req.body;
    try {
      const sendingUserBalance = await User.findOne({ UserId: sentby });
      if (sendingUserBalance.diamondsCount < diamondsSent) {
        res.status(400).send("insufficient balance");
      }
      await User.updateOne(
        { UserId: sentby },
        { diamondsCount: { $inc: -1 * Number(diamondsSent) } }
      );
      await User.updateOne(
        { UserId: sentTo },
        { beansCount: { $inc: (9 * Number(diamondsSent)) / 10 } }
      );
      const agencyOfSentTo = await agencyParticipant.findOne({
        userId: sentTo,
      });

      await User.updateOne(
        { agencyId: agencyOfSentTo.agencyId },
        { beansCount: { $inc: Number(diamondsSent) / 10 } }
      );
      await res.send("gift sent successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
}

const gamesController = new games();
module.exports = gamesController;
