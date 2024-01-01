const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    UserId: String,
    AgentId: { type: String, default: null },
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
    password: {
        type: String,
        default: null,
    },
    beansCount: { type: Number, default: 0 },
    diamondsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    friends: { type: Number, default: 0 },

});

const TagSchema = tag = new mongoose.Schema({
    tag: String,
    usedCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const followingDataSchema = new mongoose.Schema({
    followerId: String, followingId: String
});

const CommentSchema = new mongoose.Schema({
    userId: String,
    postId: String,
    comment: String
})

const likesInfo = new mongoose.Schema({
    likedBy: String,
    postId: String
})
const postSchema = new mongoose.Schema({
    PostId: String,
    title: String,
    description: String,
    postedBy: String,
    imgUrl: {
        type: String,
        default: null
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],
    sharedCount: Number,
    commentsCount: Number,
    likesCount: Number

}, {
    timestamps: true,
});

const agentSchema = new mongoose.Schema({
    AgentId: String,
    resellerOf: { type: String, default: null },
    beansCount: Number,
    diamondsCount: Number,
    paymentMethods: [String],
    status: { type: String, default: null }
})


const TransactionHistorySchema = new mongoose.Schema({

    paymentType: String,
    beansAdded: { type: Number, default: 0 },
    diamondsAdded: { type: Number, default: 0 },
    game: { type: String, default: null },
    sentTo: String,
    sentby: { type: String, default: null }
}, {
    timestamps: true,
})

const TransactionHistory = mongoose.model("TransactionHistory", TransactionHistorySchema)
const following = mongoose.model("following", followingDataSchema)
const Tag = mongoose.model('Tag', TagSchema);
const LikesInfo = mongoose.model("LikesInfo", likesInfo)

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema)
const Comment = mongoose.model("Comment", CommentSchema)
const Agent = mongoose.model("Agent", agentSchema)

exports.User = User
exports.following = following
exports.Tag = Tag
exports.LikesInfo = LikesInfo
exports.TransactionHistory = TransactionHistory
exports.Post = Post
exports.Comment = Comment
exports.Agent = Agent
