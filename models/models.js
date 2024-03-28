const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: String,
  agentId: { type: String, default: null },
  name: String,
  email: { type: String, default: null },
  photo: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  gender: Number,
  dob: {
    type: Date,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  frame: {
    type: String,
    default: null,
  },
  audioRoomBackground: {
    type: String,
    default: null,
  },
  chatBubble: {
    type: String,
    default: null,
  },
  entry: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
  beansCount: { type: Number, default: 0 },
  diamondsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  friends: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false },
  token: { type: String, required: false },

  creatorBeans: {
    total: { type: Number, default: 0 },
    basic: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  pinnedRooms: {
    type: [String],
    default: null,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
  bannedPeriod: {
    type: String,
    default: null,
  },
  activeTime:{
    type:Number,
    default:0
  }
  
});

const TagSchema = new mongoose.Schema(
  {
    tag: String,
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const followingDataSchema = new mongoose.Schema({
  followerId: String,
  followingId: String,
});

const CommentSchema = new mongoose.Schema({
  userId: String,
  postId: String,
  comment: String,
});

const likesInfo = new mongoose.Schema({
  likedBy: String,
  postId: String,
});
const postSchema = new mongoose.Schema(
  {
    PostId: String,
    title: String,
    description: String,
    postedBy: String,
    imgUrl: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    sharedCount: Number,
    commentsCount: Number,
    likesCount: Number,
  },
  {
    timestamps: true,
  }
);

const agentSchema = new mongoose.Schema({
  agentId: String,
  resellerOf: { type: String, default: null },
  diamondsCount: Number,
  paymentMethods: [String],
  status: { type: String, default: null },
});

const TransactionHistorySchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    paymentType: { type: String, default: null },
    beansAdded: { type: Number, default: 0 },
    diamondsAdded: { type: Number, default: 0 },
    game: { type: String, default: null },
    sentTo: String,
    sentby: { type: String, default: null },
    isGift: { type: Boolean, default: false },
    roomId: { type: String, default: null },
    // bonusDiamonds: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

const GameTransactionHistorySchema = new mongoose.Schema(
  {
    mode: String,
    userId: String,
    diamonds: Number,
    game: String,
  },
  { timestamps: true }
);

const agencyParticipantsSchema = new mongoose.Schema({
  userId: String,
  agencyId: String,
});

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  TransactionHistorySchema
);

const AgencyOwnershipSchema = new mongoose.Schema({
  ownerId: String,
  agencyId: String,
});

const AgencyDataSchema = new mongoose.Schema({
  ownerId: String,
  agencyId: String,
  name: String,
  totalBeansRecieved: { type: Number, default: 0 },
  // diamondsCount: Number,
  beansCount: { type: Number, default: 0 },
});

const monthlyAgentHistorySchema = new mongoose.Schema({
  month: Date,
  diamonds: { type: Number, default: 0 },
  agentId: String,
});

const monthlyAgencyHistorySchema = new mongoose.Schema({
  month: Date,
  beans: { type: Number, default: 0 },
  agencyId: String,
});

const monthlyBdHistorySchema = new mongoose.Schema({
  month: Date,
  beans: { type: Number, default: 0 },
  bdId: String,
});

const SpinnerGameWinnerHistorySchema = new mongoose.Schema(
  {
    wheelNo: Number,
    userId: String,
    diamondsEarned: { type: Number, default: 0 },
    diamondsSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AgentTransactionHistorySchema = new mongoose.Schema(
  {
    sentBy: String,
    sentTo: String,
    mode: String,
    diamondsAdded: Number,
  },
  { timestamps: true }
);

const AgencyCommissionHistorySchema = new mongoose.Schema(
  {
    sentBy: String,
    commission: Number,
    roomId: String,
    agencyId: String,
  },
  { timestamps: true }
);

const CreatorHistorySchema = new mongoose.Schema(
  {
    creatorId: String,
    sentBy: String,
    roomId: String,
    beansGifted: {
      basic: Number,
      bonus: Number,
    },
  },
  { timestamps: true }
);

const CreatorHistory = mongoose.model("CreatorHistory", CreatorHistorySchema);

const AgencyCommissionHistory = mongoose.model(
  "AgencyCommissionHistory",
  AgencyCommissionHistorySchema
);
const AgentTransactionHistory = mongoose.model(
  "AgentTransactionHistory",
  AgentTransactionHistorySchema
);
const bettingGameDataSchema = new mongoose.Schema(
  { participants: Number, winners: Number, wheelNo: String },
  { timestamps: true }
);

const Top3WinnersSchema = new mongoose.Schema({
  Winners: Array,
});

const CommissionRateSchema = new mongoose.Schema({
  bdRate: [
    {
      start: Number,
      rate: Number,
    },
  ],
  agencyRate: [
    {
      start: Number,
      rate: Number,
    },
  ],
  bonusRate: [
    {
      start: Number,
      rate: Number,
    },
  ],
});
const UserRechargeSchema = new mongoose.Schema({
  userId: String,
  diamondsRecharged: Number,
  richLevel: Number,
});

const UserGiftSchema = new mongoose.Schema({
  userId: String,
  beansRecieved: { type: Number, default: 0 },
  charmLevel: Number,
});
const UserRechargeMonthlySchema = new mongoose.Schema({
  userId: String,
  diamondsRecharged: { type: Number, default: 0 },
  // richLevel: Number,
  month: Date,
});

const UserGiftMonthlySchema = new mongoose.Schema({
  userId: String,
  beansRecieved: Number,
  // charmLevel: Number,
  month: Date,
});
const SpinnerGameBetInfoSchema = new mongoose.Schema({
  userId: String,
  price: { type: Number, default: 0 },
  wager: Number,
});
const SpinnerGameBetInfo = mongoose.model(
  "SpinnerGameBetInfo",
  SpinnerGameBetInfoSchema
);

const UserRecharge = mongoose.model("UserRecharge", UserRechargeSchema);
const UserGift = mongoose.model("UserGift", UserGiftSchema);
const UserRechargeMonthly = mongoose.model(
  "UserRechargeMonthly",
  UserRechargeMonthlySchema
);
const UserGiftMonthly = mongoose.model(
  "UserGiftMonthly",
  UserGiftMonthlySchema
);

const CommissionRate = mongoose.model("CommissionRate", CommissionRateSchema);
const SpinnerGameWinnerHistory = mongoose.model(
  "SpinnerGameWinnerHistory",
  SpinnerGameWinnerHistorySchema
);
const monthlyAgencyHistory = mongoose.model(
  "monthlyAgencyHistory",
  monthlyAgencyHistorySchema
);
const monthlyAgentHistory = mongoose.model(
  "monthlyAgentHistory",
  monthlyAgentHistorySchema
);
const monthlyBdHistory = mongoose.model(
  "monthlyBdHistory",
  monthlyBdHistorySchema
);
const GameTransactionHistory = mongoose.model(
  "GameTransactionHistory",
  GameTransactionHistorySchema
);
const withDrawalRequestSchema = new mongoose.Schema(
  {
    name: String,
    userId: String,
    upiId: { type: String, default: null },
    // adminId: String,
    beans: Number,
    accountNumber: { type: String, default: null },
    ifsc: { type: String, default: null },
    bankNumber: { type: String, default: null },
    status: { type: String, default: 0 },
  },
  { timestamps: true }
);
const withDrawalRequest = mongoose.model(
  "withDrawalRequest",
  withDrawalRequestSchema
);
const following = mongoose.model("following", followingDataSchema);
const Tag = mongoose.model("Tag", TagSchema);
const LikesInfo = mongoose.model("LikesInfo", likesInfo);

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", CommentSchema);
const Agent = mongoose.model("Agent", agentSchema);
const Top3Winners = mongoose.model("Top3Winners", Top3WinnersSchema);
const bettingGameData = mongoose.model(
  "bettingGameData",
  bettingGameDataSchema
);
const AgencyOwnership = mongoose.model(
  "AgencyOwnership",
  AgencyOwnershipSchema
);
const agencyParticipant = mongoose.model(
  "agencyParticipant",
  agencyParticipantsSchema
);
const AgencyData = mongoose.model("AgencyData", AgencyDataSchema);

exports.User = User;
exports.following = following;
exports.Tag = Tag;
exports.LikesInfo = LikesInfo;
exports.TransactionHistory = TransactionHistory;
exports.Post = Post;
exports.Comment = Comment;
exports.Agent = Agent;
exports.agencyParticipant = agencyParticipant;
exports.AgencyOwnership = AgencyOwnership;
exports.AgencyData = AgencyData;
exports.monthlyAgentHistory = monthlyAgentHistory;
exports.monthlyAgencyHistory = monthlyAgencyHistory;
exports.SpinnerGameWinnerHistory = SpinnerGameWinnerHistory;
exports.bettingGameData = bettingGameData;
exports.Top3Winners = Top3Winners;
exports.CommissionRate = CommissionRate;
exports.AgentTransactionHistory = AgentTransactionHistory;
exports.monthlyBdHistory = monthlyBdHistory;
exports.AgencyCommissionHistory = AgencyCommissionHistory;
exports.CreatorHistory = CreatorHistory;
exports.GameTransactionHistory = GameTransactionHistory;
exports.UserRecharge = UserRecharge;
exports.UserGift = UserGift;
exports.UserRechargeMonthly = UserRechargeMonthly;
exports.UserGiftMonthly = UserGiftMonthly;
exports.SpinnerGameBetInfo = SpinnerGameBetInfo;
exports.withDrawalRequest = withDrawalRequest;
