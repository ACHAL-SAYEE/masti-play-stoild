const {
  User,
  TransactionHistory,
  Agent,
  agencyParticipant,
  AgencyData,
} = require("../models/models");

// const { bettingInfoArray, bettingWheelValues } = require("../app");
// const { generateUniqueId, generateUserId } = require("../utils");
const bettingWheelValues = [2, 4, 5, 6, 7, 8, 9, 12];
const bettingInfoArray = [];

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
    console.log("called make user");
    const { resellerOf, paymentMethods, status, userId } = req.body;
    console.log(paymentMethods);
    try {
      const origUser = await User.findOneAndUpdate(
        { UserId: userId },
        { AgentId: `A${userId}` }
      );
      if (origUser.AgentId) {
        res.status(400).send("user is already an agent");
        return;
      }
      console.log(origUser);
      const newAgent = new Agent({
        resellerOf,
        paymentMethods,
        status,
        diamondsCount: 0,
        AgentId: `A${userId}`,
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
            AgencyId: AgencyIdInfo.agencyId,
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
    const { userId, agencyId, name } = req.body;
    console.log("userId, agencyId, name", userId, agencyId, name);
    let randomNumber;
    try {
      if (agencyId == null) {
        randomNumber = generateUserId();
        const existingUserWithId = await AgencyData.find({
          AgencyId: randomNumber,
        });
        if (existingUserWithId.length > 0) {
          isUserIdMatched = true;
          while (isUserIdMatched) {
            randomNumber = generateUserId();
            const existingUserWithId = await AgencyData.find({
              AgencyId: randomNumber,
            });
            isUserIdMatched = existingUserWithId.length > 0;
          }
        }
        const newAgencyData = new AgencyData({
          AgencyId: randomNumber,
          ownerId: userId,
          name,
        });
        await newAgencyData.save();
      }
      // const newOwner = new AgencyOwnership({ userId, agencyId });
      // await newOwner.save();
      const agencyData = await AgencyData.findOneAndUpdate(
        { AgencyId: agencyId == null ? randomNumber : agencyId },
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

  async recharge(req, res) {
    const { userId, agentId, diamonds } = req.body;
    try {
      const agentData = await Agent.findOne({ AgentId: agentId });
      if (agentData.diamondsCount < diamonds) {
        res.status(400).send("insufficient balance");
      } else {
        await Agent.updateOne(
          { AgentId: agentId },
          { $inc: { diamondsCount: -1 * diamonds } }
        );
        await User.updateOne(
          { UserId: userId },
          { $inc: { diamondsCount: diamonds } }
        );
        res.send("recharged successfully");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAllAgencies(req, res) {
    const { limit, start } = req.query;
    try {
      const agencyData = await AgencyData.find({})
        .skip(Number(start))
        .limit(Number(limit))
        .select({
          _id: 0,
          __v: 0,
        });
      res.send(agencyData);
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
        await User.updateOne({ UserId: userId }, { role: "agent" });
        const newAgent = new Agent({ AgentId: `A${userId}` });
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getAgencyDataOfUser(req, res) {
    const { userId } = req.query;
    try {
      const agencyJoined = await agencyParticipant.findOne({ userId });
      if (agencyJoined) {
        const AgencyData1 = await AgencyData.findOne({
          AgencyId: agencyJoined.agencyId,
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

  async storeBettingInfo(req, res) {
    const { userId, wheelNo, amount } = req.body;
    bettingInfoArray.push({ userId, wheelNo, amount });
    await User.updateOne(
      { UserId: userId },
      { $inc: { diamondsCount: -1 * amount } }
    );
    res.send("betted successfully");
  }

  async getBettingResults(req, res) {
    const totalbettAmount = bettingInfoArray.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const amountToconsider = totalbettAmount * 0.9;
    const transformedData = bettingInfoArray.reduce((result, current) => {
      // Find the existing entry for the current wheelNo
      const existingEntry = result.find(
        (entry) => entry.wheelNo === current.wheelNo
      );

      if (existingEntry) {
        // If the entry exists, update the userids and total amount
        if (!existingEntry.userids.includes(current.userId)) {
          existingEntry.userids.push(current.userId);
        }
        existingEntry.totalAmount += current.amount;
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
      nearestEntry=newtransformedData[i]
    }

    const multiplyvalue = bettingWheelValues[nearestEntry.wheelNo - 1];
    bettingInfoArray.forEach((betItem) => {
      if (betItem.userId in nearestEntry.userids && betItem.wheelNo===nearestEntry.wheelNo) {
        User.updateOne(
          { UserId: betItem.userId },
          { $inc: { diamondsCount: betItem.amount * multiplyvalue } }
        );
      }
    });
    res.send({ winners: nearestEntry.userids });
    bettingWheelValues = [];
    bettingInfoArray = [];
  }
}

const gamesController = new games();
module.exports = gamesController;
