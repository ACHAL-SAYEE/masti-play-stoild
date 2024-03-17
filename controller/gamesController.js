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
  GameTransactionHistory,
  UserRecharge,
  UserGift,
  UserGiftMonthly,
  UserRechargeMonthly,
  SpinnerGameBetInfo,
  withDrawalRequest,
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
function getRichLevel(diamonds) {
  if (diamonds > 1508560000) {
    return 40;
  } else if (diamonds > 1028560000) {
    return 39;
  } else if (diamonds > 778560000) {
    return 38;
  } else if (diamonds > 578560000) {
    return 37;
  } else if (diamonds > 408560000) {
    return 36;
  } else if (diamonds > 288560000) {
    return 35;
  } else if (diamonds > 188560000) {
    return 34;
  } else if (diamonds > 106360000) {
    return 33;
  } else if (diamonds > 85160000) {
    return 32;
  } else if (diamonds > 74060000) {
    return 31;
  } else if (diamonds > 63760000) {
    return 30;
  } else if (diamonds > 54360000) {
    return 29;
  } else if (diamonds > 45960000) {
    return 28;
  } else if (diamonds > 38460000) {
    return 27;
  } else if (diamonds > 31560000) {
    return 26;
  } else if (diamonds > 25360000) {
    return 25;
  } else if (diamonds > 20660000) {
    return 24;
  } else if (diamonds > 16960000) {
    return 23;
  } else if (diamonds > 13960000) {
    return 22;
  } else if (diamonds > 11460000) {
    return 21;
  } else if (diamonds > 9260000) {
    return 20;
  } else if (diamonds > 7460000) {
    return 19;
  } else if (diamonds > 5960000) {
    return 18;
  } else if (diamonds > 4710000) {
    return 17;
  } else if (diamonds > 3510000) {
    return 16;
  } else if (diamonds > 2610000) {
    return 15;
  } else if (diamonds > 2060000) {
    return 14;
  } else if (diamonds > 1610000) {
    return 13;
  } else if (diamonds > 1230000) {
    return 12;
  } else if (diamonds > 930000) {
    return 11;
  } else if (diamonds > 680000) {
    return 10;
  } else if (diamonds > 480000) {
    return 9;
  } else if (diamonds > 350000) {
    return 8;
  } else if (diamonds > 250000) {
    return 7;
  } else if (diamonds > 180000) {
    return 6;
  } else if (diamonds > 120000) {
    return 5;
  } else if (diamonds > 80000) {
    return 4;
  } else if (diamonds > 50000) {
    return 3;
  } else if (diamonds > 24000) {
    return 2;
  } else if (diamonds > 10000) {
    return 1;
  } else {
    return 0;
  }
}

function getCharmLevel(diamonds) {
  if (diamonds > 3017120000) {
    return 40;
  } else if (diamonds > 2057120000) {
    return 39;
  } else if (diamonds > 1557120000) {
    return 38;
  } else if (diamonds > 1157120000) {
    return 37;
  } else if (diamonds > 817120000) {
    return 36;
  } else if (diamonds > 577120000) {
    return 35;
  } else if (diamonds > 377120000) {
    return 34;
  } else if (diamonds > 212720000) {
    return 33;
  } else if (diamonds > 170320000) {
    return 32;
  } else if (diamonds > 148120000) {
    return 31;
  } else if (diamonds > 127520000) {
    return 30;
  } else if (diamonds > 108720000) {
    return 29;
  } else if (diamonds > 91920000) {
    return 28;
  } else if (diamonds > 76920000) {
    return 27;
  } else if (diamonds > 63120000) {
    return 26;
  } else if (diamonds > 50720000) {
    return 25;
  } else if (diamonds > 41320000) {
    return 24;
  } else if (diamonds > 33920000) {
    return 23;
  } else if (diamonds > 27920000) {
    return 22;
  } else if (diamonds > 22920000) {
    return 21;
  } else if (diamonds > 18520000) {
    return 20;
  } else if (diamonds > 14920000) {
    return 19;
  } else if (diamonds > 11920000) {
    return 18;
  } else if (diamonds > 9420000) {
    return 17;
  } else if (diamonds > 7020000) {
    return 16;
  } else if (diamonds > 5220000) {
    return 15;
  } else if (diamonds > 4120000) {
    return 14;
  } else if (diamonds > 3220000) {
    return 13;
  } else if (diamonds > 2460000) {
    return 12;
  } else if (diamonds > 1860000) {
    return 11;
  } else if (diamonds > 1360000) {
    return 10;
  } else if (diamonds > 960000) {
    return 9;
  } else if (diamonds > 700000) {
    return 8;
  } else if (diamonds > 500000) {
    return 7;
  } else if (diamonds > 360000) {
    return 6;
  } else if (diamonds > 240000) {
    return 5;
  } else if (diamonds > 160000) {
    return 4;
  } else if (diamonds > 100000) {
    return 3;
  } else if (diamonds > 48000) {
    return 2;
  } else if (diamonds > 20000) {
    return 1;
  } else {
    return 0;
  }
}

const richLevelNext = {
  0: { level: 10000, REWARD: "Vip exclusive id nameplate and emoji pack" },
  1: { level: 24000, REWARD: "Vip exclusive id nameplate and emoji pack" },
  2: { level: 50000, REWARD: "Vip exclusive id nameplate and emoji pack" },
  3: {
    level: 80000,
    REWARD: "Vip exclusive id nameplate and emoji pack + teen patti game",
  },
  4: {
    level: 120000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game",
  },
  5: {
    level: 180000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo",
  },
  6: {
    level: 250000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification",
  },
  7: {
    level: 350000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate",
  },
  8: {
    level: 480000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  9: {
    level: 680000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  10: {
    level: 930000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + (vip entry for 5 days)",
  },
  11: {
    level: 1230000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  12: {
    level: 1610000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  13: {
    level: 2060000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  14: {
    level: 2610000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  15: {
    level: 3510000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + Family Create Option",
  },
  16: {
    level: 4710000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  17: {
    level: 5960000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  18: {
    level: 7460000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  19: {
    level: 9260000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box",
  },
  20: {
    level: 11460000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + vip frame and entry (for 7 days)",
  },
  21: {
    level: 13960000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  22: {
    level: 16960000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + Permanent Entrance effect",
  },
  23: {
    level: 20660000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  24: {
    level: 25360000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  25: {
    level: 31560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  26: {
    level: 38460000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  27: {
    level: 45960000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + 1 room background",
  },
  28: {
    level: 54360000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  29: {
    level: 63760000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  30: {
    level: 74060000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + 2 room background",
  },
  31: {
    level: 85160000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  32: {
    level: 106360000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + Permanent VIP Entry",
  },
  33: {
    level: 188560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement",
  },
  34: {
    level: 288560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + No kick out",
  },
  35: {
    level: 408560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + 2 new room background",
  },
  36: {
    level: 578560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + permanent chatbubble",
  },
  37: {
    level: 778560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + Vip Bronze frame",
  },
  38: {
    level: 1028560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + Vip silver frame",
  },
  39: {
    level: 1508560000,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + Vip Gold frame",
  },
  // 40: {level:}
  40: {
    level: 0,
    REWARD:
      "Vip exclusive id nameplate and emoji pack + teen patti game + jackpot game + Happy zoo + vip exclusive room entry notification + display floating vip id nameplate + vip gift in gift box + level up announcement + Vip Gold frame",
  },
};

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
    let result;
    try {
      if (mode === "income") {
        await GameTransactionHistory.find({
          userId,
          mode: "income",
        })
          .skip(Number(start))
          .limit(Number(limit));
      } else if (mode === "outcome") {
        await GameTransactionHistory.find({
          userId,
          mode: "income",
        })
          .skip(Number(start))
          .limit(Number(limit));
      } else if (mode === "recharge") {
        //TODO
      }

      // const result = await queryDiamondsTransactionHistory(
      //   query,
      //   start,
      //   limit,
      //   selectFields
      // );
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
      let result, ownedAgency, ownedBd;

      if (email) {
        result = await User.findOne({ email: email }).select({
          _id: 0,
          __v: 0,
        });
        ownedAgency = await AgencyData.findOne({ ownerId: result.userId });
        ownedBd = await BdData.findOne({ owner: result.userId });
      } else {
        result = await User.findOne({ userId: userId }).select({
          _id: 0,
          __v: 0,
        });
        ownedAgency = await AgencyData.findOne({ ownerId: userId });
        ownedBd = await BdData.findOne({ owner: userId });
      }
      if (result === null) {
        res.status(400).send("user not found");
        return;
      }
      console.log(result);
      res.send({
        ...result._doc,
        ownedAgencyBata: ownedAgency,
        ownedBdData: ownedBd,
      });
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
    const todayDate = new Date();
    const { limit, start } = req.query;
    console.log(Number(start), start);
    console.log(Number(limit), limit);

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
          $lookup: {
            from: "monthlyagenthistories",
            localField: "agentId",
            foreignField: "agentId",
            as: "monthlyAgentData",
          },
        },
        {
          $unwind: {
            path: "$monthlyAgentData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            monthlyDiamonds: "$monthlyAgentData.diamonds",
          },
        },
        {
          $project: {
            monthlyAgentData: 0,
          },
        },
        // {
        //   $project: {
        //     monthlyAgentData: 0,
        //     monthlyDiamonds: "$monthlyAgentData.diamonds",
        //   },
        // },
        // {
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
    let { sentTo, sentBy, diamondsSent, roomId, Quantity } = req.body;
    // diamondsSent = diamondsSent * Quantity;
    console.log("sentTo, sentBy, diamondsSent =", sentTo, sentBy, diamondsSent);
    try {
      const sendingUserBalance = await User.findOne({ userId: sentBy });
      if (!sendingUserBalance) {
        res.status(400).send("user not found");
        return;
      }
      if (sendingUserBalance.diamondsCount < diamondsSent * Quantity) {
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
      const DiamondsToAdd = 0.68 * diamondsSent * Quantity;
      const bonusDiamonds = bonusRate * diamondsSent * Quantity;
      await User.updateOne(
        { userId: sentBy },
        { $inc: { diamondsCount: -1 * diamondsSent * Quantity } }
      );
      // await User.updateOne(
      //   { userId: sentTo },
      //   { $inc: { beansCount: DiamondsToAdd + bonusDiamonds } }
      // );
      await User.updateOne(
        { userId: sentTo },
        {
          $inc: {
            beansCount: DiamondsToAdd,
            "creatorBeans.total": DiamondsToAdd + bonusDiamonds,
            "creatorBeans.basic": DiamondsToAdd,
            "creatorBeans.": bonusDiamonds,
          },
        }
      );

      const ExistingGift = await UserGift.findOne({
        userId: sentTo,
      });
      let level;
      if (ExistingGift === null) {
        level = getCharmLevel(DiamondsToAdd);
        await UserGift.create({
          userId: sentTo,
          beansRecieved: DiamondsToAdd,
          charmLevel: level,
        });
      } else {
        level = getCharmLevel(DiamondsToAdd + ExistingGift.beansRecieved);
        await UserGift.updateOne(
          { userId: sentTo },
          {
            $inc: { beansRecieved: DiamondsToAdd },
            $set: { charmLevel: level },
          }
        );
      }
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      await UserGiftMonthly.findOneAndUpdate(
        {
          userId: sentTo,
          month: startOfMonth,
        },
        { $inc: { beansRecieved: DiamondsToAdd } },
        { upsert: true }
      );
      // await UserGift.findOneAndUpdate(
      //   { userId: sentTo },
      //   { $inc: { beansRecieved: parseInt(DiamondsToAdd + bonusDetails) } },
      //   { upsert: true }
      // );

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
  async getUserRichLevel(req, res) {
    const { userId } = req.query;
    try {
      const Rechargeres = await UserRecharge.findOne({ userId });
      console.log("Rechargeres", Rechargeres);

      console.log(Rechargeres);
      if (Rechargeres === null) {
        res.json({
          richLevel: 0,
        });
      } else {
        console.log("Rechargeres.richLevel", Rechargeres.richLevel);
        res.send({
          ...Rechargeres._doc,
          diamondsToNextLevel:
            richLevelNext[Rechargeres.richLevel ? Rechargeres.richLevel : 0]
              .level,
          richLevelNext:
            richLevelNext[Rechargeres.richLevel ? Rechargeres.richLevel : 0]
              .REWARD,
        });
      }
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
    }
  }

  async getUserCharmLevel(req, res) {
    const { userId } = req.query;
    try {
      const Rechargeres = await UserGift.findOne({ userId });
      console.log("Rechargeres", Rechargeres);
      // Rechargeres.diamondsToNextLevel=richLevelNext[Rechargeres.richLevel].level*2
      // Rechargeres.reward=richLevelNext[Rechargeres.richLevel].REWARD
      if (Rechargeres === null) {
        res.json({
          charmLevel: 0,
        });
      } else {
        console.log("Rechargeres.charmLevel", Rechargeres.charmLevel);
        res.send({
          ...Rechargeres._doc,
          diamondsToNextLevel:
            richLevelNext[Rechargeres.charmLevel ? Rechargeres.charmLevel : 0]
              .level * 2,
          richLevelNext:
            richLevelNext[Rechargeres.charmLevel ? Rechargeres.charmLevel : 0]
              .REWARD,
        });
      }
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
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

  async getMonthlyCreatorHistory(req, res) {
    const currentDate = new Date();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    firstDayOfMonth.setHours(0, 0, 0, 0); // Set time to 12:00 AM

    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    lastDayOfMonth.setHours(23, 59, 59, 999);
    console.log(firstDayOfMonth, lastDayOfMonth);
    const { userId } = req.query;
    try {
      const history = await CreatorHistory.aggregate([
        {
          $match: {
            creatorId: userId,
            createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          },
        },
        {
          $group: {
            _id: "$creatorId",
            monthlyBasicBeans: { $sum: "$beansGifted.basic" },
            monthlyBonusBeans: { $sum: "$beansGifted.basic" },
          },
        },
      ]);

      res.send(history);
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async getWeeklyCreatorHistory(req, res) {
    const currentDate = new Date();

    let currentDayOfWeek = currentDate.getDay();

    if (currentDayOfWeek === 0) {
      currentDayOfWeek = 7;
    }

    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDayOfWeek + 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    console.log(startDate);
    console.log(endDate);

    const { userId } = req.query;
    try {
      const history = await CreatorHistory.aggregate([
        {
          $match: {
            creatorId: userId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        // {
        //   $group: {
        //     _id: null,
        //     monthlyBasicBeans: { $sum: "$beansGifted.basic" },
        //     monthlyBonusBeans: { $sum: "$beansGifted.basic" },
        //   },
        // },
      ]);

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
        })
          .skip(Number(start))
          .limit(Number(limit));
      } else {
        commissionData = await AgencyCommissionHistory.find({
          agencyId,
        })
          .skip(Number(start))
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
      const agentData = await Agent.findOne({ agentId });
      console.log("agentData", agentData);
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
            agentId,
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
        const ExistingRecharge = await UserRecharge.findOne({
          userId,
        });
        let level;
        if (ExistingRecharge === null) {
          level = getRichLevel(diamonds);
          await UserRecharge.create({
            userId,
            diamondsRecharged: diamonds,
            richLevel: level,
          });
        } else {
          level = getRichLevel(diamonds + ExistingRecharge.diamondsRecharged);
          await UserRecharge.updateOne(
            { userId },
            {
              $inc: { diamondsRecharged: diamonds },
              $set: { richLevel: level },
            }
          );
        }
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );

        await UserRechargeMonthly.findOneAndUpdate(
          {
            userId,
            month: startOfMonth,
          },
          { $inc: { diamondsRecharged: diamonds } },
          { upsert: true }
        );
        //  const rechargeInfo= await UserRecharge.findOneAndUpdate(
        //     {
        //       userId,
        //     },
        //     { $inc: { diamondsRecharged: diamonds } },
        //     { upsert: true }
        //   );

        res.send("recharged successfully");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
  async getMonthlyGift(req, res) {
    const { userId } = req.query;
    try {
      const currentDate = new Date(); // Get current date
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const result = await UserGiftMonthly.findOne({
        userId,
        month: startOfMonth,
      });
      res.send(result);
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
    }
  }
  async getMonthlyRecharge(req, res) {
    const { userId } = req.query;
    try {
      const currentDate = new Date(); // Get current date
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const result = await UserRechargeMonthly.findOne({
        userId,
        month: startOfMonth,
      });
      res.send(result);
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
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
    const { userId } = req.query;
    let Top3Winnersinfo = await Top3Winners.findOne({});
    console.log("Top3Winnersinfo:", Top3Winnersinfo);
    if (Top3Winnersinfo === null) {
      res.send({ Top3Winnersinfo: [] });
      return;
    }
    let userdata = [];
    let winningAmount = [];
    // Top3Winnersinfo = await Promise.all(
    //   Top3Winnersinfo.Winners.map(async (winner) => {
    //     const userdata = await User.findOne({ userId: winner.userId });
    //     console.log("userdata", userdata);
    //     return { ...winner, userdata };
    //   })
    // );
    let Winners = Top3Winnersinfo.Winners;
    for (let i = 0; i < Winners.length; i++) {
      let userInfo = await User.findOne({
        userId: Winners[i].userId,
      });

      userdata.push(userInfo);
      winningAmount.push(Winners[i].winningAmount);
    }
    const betInfo = await SpinnerGameBetInfo.findOne({ userId });
    res.send({
      data: { userdata, winningAmount },
      price: betInfo.price,
      wager: betInfo.wager,
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
    const { mode, userId, agentId, startDate, endDate, start, limit } =
      req.query;
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
        })
          .skip(Number(start))
          .limit(Number(limit));
        res.send(history);
        return;
      } else if (userId) {
        const history = await AgentTransactionHistory.find({
          sentBy: agentId,
          sentTo: userId,
          mode,
        })
          .skip(Number(start))
          .limit(Number(limit));
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
        })
          .skip(Number(start))
          .limit(Number(limit));
        res.send(history);
        return;
      }
      const history = await AgentTransactionHistory.find({
        $or: [{ sentBy: agentId }, { sentTo: agentId }],
        mode,
      })
        .skip(Number(start))
        .limit(Number(limit));
      res.send(history);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async getRates(req, res) {
    try {
      const rates = await CommissionRate.findOne({});
      console.log(rates);
      if (rates === null) {
        res.send({});
      } else {
        res.send(rates);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  async getUserInfo(req, res) {
    const { userId } = req.query;
    try {
      const result = await User.findOne({ userId });
      res.send({ beans: result.beansCount, diamonds: result.diamondsCount });
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }
  async removeFrame(req, res) {
    const { userId } = req.query;
    try {
      await User.updateOne({ userId }, { frame: null });
      res.send("frame removed successfully");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }
  async addFrame(req, res) {
    const { userId, frame } = req.query;
    try {
      await User.updateOne({ userId }, { frame });
      res.send("frame added successfully");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }
  async changeDiamonds(req, res) {
    const { userId, mode, diamonds } = req.query;
    try {
      if (mode == "add") {
        await User.updateOne({ userId }, { $inc: { diamondsCount: diamonds } });
      } else {
        const user = await User.findOne({ userId });
        if (user.diamondsCount - diamonds < 0) {
        } else {
          await User.updateOne({ userId }, { diamondsCount: 0 });
        }
        await User.updateOne(
          { userId },
          { $inc: { diamondsCount: -1 * diamonds } }
        );
      }
      res.send(`diamonds ${mode}ed successfully`);
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }
  async banUser(req, res) {
    const { userId } = req.query;
    try {
      await User.updateOne({ userId }, { isBanned: true });
      res.send("user banned successfully");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }
  async unbanUser(req, res) {
    const { userId } = req.query;
    try {
      await User.updateOne({ userId }, { isBanned: false });
      res.send("user unbanned successfully");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }

  async acceptBeansWithDraw(req, res) {
    const { _id, userId, beans } = req.body;
    try {
      const currentBeans = await User.findOne({ userId });
      if (currentBeans.beansCount < beans) {
        res.status(400).send("insufficient balance");
        return;
      }
      await User.updateOne({ userId }, { $inc: { beansCount: -1 * beans } });
      // updating status to 1 (approved)
      await withDrawalRequest.findOneAndUpdate(
        { _id },
        { status: 1 }
      );
      res.send("Withdrawal request approved!");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }

  async rejectBeansWithDraw(req, res) {
    const { _id } = req.body;
    try {
      // updating status to 2 (rejected)
      await withDrawalRequest.findOneAndUpdate(
        { _id },
        { status: 2 }
      );
      res.send("Withdrawal request rejected!");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }

  async sendWithDrawalRequest(req, res) {
    const {
      userId,
      upiId,
      accountNumber,
      beans,
      ifsc,
      bankNumber,
      name,
    } = req.body;
    console.log("userId", userId);
    console.log("upiId", upiId);
    console.log("accountNumber", accountNumber);
    console.log("beans", beans);
    console.log("ifsc", ifsc);
    console.log("bankNumber", bankNumber);
    console.log("name", name);
    try {
      if (upiId === undefined || upiId === "" || upiId === null) {
        console.log("Upi id was not given");
        await withDrawalRequest.create({
          userId,
          accountNumber,
          ifsc,
          bankNumber,
          name,
          beans,
        });
      } else {
        console.log("Upi id was given");
        await withDrawalRequest.create({ userId, upiId, name, beans });
      }
      res.send("Withdrawal request sent to admin successfully!");
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }

  async getWithDrawalRequests(req, res) {
    const status = req.query.status;
    try {
      const withdrawalReqs = await withDrawalRequest.find(
        status ? { status } : {}
      );
      res.send(withdrawalReqs);
    } catch (e) {
      res.status(500).send(`internal server error ${e}`);
      console.log(e);
    }
  }
}

const gamesController = new games();
module.exports = gamesController;

// async getDiamondsHistory(req, res) {
//   const { userId, start, limit, mode } = req.query;

//   let query = {};
//   let selectFields = {
//     _id: 0,
//     __v: 0,
//     beansAdded: 0,
//     updatedAt: 0,
//     sentTo: 0,
//   };

//   switch (mode) {
//     case "income":
//       query = {
//         isGift: false,
//         sentTo: userId,
//         paymentType: null,
//         diamondsAdded: { $gt: 0 },
//       };
//       break;
//     case "recharge":
//       query = {
//         isGift: false,
//         sentTo: userId,
//         game: null,
//         diamondsAdded: { $gt: 0 },
//       };
//       break;
//     default:
//       query = {
//         isGift: false,
//         paymentType: null,
//         sentby: userId,
//         diamondsAdded: { $lt: 0 },
//       };
//       break;
//   }

//   try {
//     const result = await queryDiamondsTransactionHistory(
//       query,
//       start,
//       limit,
//       selectFields
//     );
//     console.log(result);
//     res.send(result);
//   } catch (e) {
//     res.status(500).send("Internal server error");
//   }
// }
