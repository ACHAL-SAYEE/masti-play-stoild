const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: String,
  agentId: { type: String, default: null },
  name: String,
  email: String,
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

const SpinnerGameWinnerHistorySchema = new mongoose.Schema(
  {
    wheelNo: Number,
    userId: String,
    diamondsEarned: { type: Number, default: 0 },
    diamondsSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const bettingGameDataSchema = new mongoose.Schema(
  { participants: Number, winners: Number },
  { timestamps: true }
);

const Top3WinnersSchema = new mongoose.Schema({
  Winners: Array,
});

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
