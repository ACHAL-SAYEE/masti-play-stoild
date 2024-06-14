const {
  User,
  following,
  Tag,
  LikesInfo,
  Post,
  Comment,
} = require("../models/models");

const { generateUniqueId } = require("../utils");

class PostApis {
  async storePost(req, res) {
    const { title, description, postedBy, imgUrl, tags } = req.body;
    const postId = generateUniqueId();
    const tagObjectIds = await Promise.all(
      tags.map(async (tagName) => {
        const existingTag = await Tag.findOne({ tag: tagName });
        if (existingTag) {
          // console.log("exists")
          const result = await Tag.updateOne(
            { tag: tagName },
            { $inc: { usedCount: 1 } }
          );
          return existingTag._id;
        } else {
          // console.log("efefefe")
          const newTag = new Tag({ tag: tagName });
          await newTag.save();
          return newTag._id;
        }
      })
    );
    const newPost = new Post({
      PostId: postId,
      title,
      description,
      postedBy,
      imgUrl,
      tags: tagObjectIds,
      sharedCount: 0,
      commentsCount: 0,
      likesCount: 0,
    });
    try {
      const result = await newPost.save();
      res.status(200);
      res.send({ msg: "posted successfuly" });
      console.log(result);
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: e });
    }
  }

  async deletePost(req, res) {
    const { postId } = req.query;
    try {
      await Post.deleteOne({
        PostId: postId,
      });
      res.send("post deleted successfully");
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error:${e}`);
    }
  }

  async sharePost(req, res) {
    const { postId } = req.body;
    try {
      const result = await Post.updateOne(
        { PostId: postId },
        { $inc: { sharedCount: 1 } }
      );
      console.log(result);
      if (result.modifiedCount === 1) {
        res.status(200).send({ message: "Shared successfully." });
      } else {
        res.status(404).send({ message: "Post not found." });
      }
    } catch (e) {
      res.status(500).json({ message: "Internal Server Error." });
    }
  }

  async getHotPosts(req, res) {
    const { userId, limit, start } = req.query;
    // console.log(userId)
    try {
      const posts = await Post.find()
        .sort({ sharedCount: -1 })
        .skip(Number(start))
        .limit(Number(limit))
        .select({
          _id: 0,
          // we also want these 2 fields to be included in the response too
          // createdAt: 0,
          // updatedAt: 0,
          __v: 0,
        });
      let hasLiked, hasCommented, doesFollow;
      console.log("posts", posts);

      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          console.log(post);
          const likedResult = await LikesInfo.findOne({
            likedBy: userId,
            postId: post.PostId,
          });
          const CommentResult = await Comment.findOne({
            userId,
            postId: post.PostId,
          });
          const followResult = await following.findOne({
            followerId: userId,
            followingId: post.postedBy,
          });
          if (likedResult === null) {
            hasLiked = false;
          } else {
            hasLiked = true;
          }
          if (CommentResult === null) {
            hasCommented = false;
          } else {
            hasCommented = true;
          }
          if (followResult === null) {
            doesFollow = false;
          } else {
            doesFollow = true;
          }
          const plainPost = post.toObject();
          return { ...plainPost, hasCommented, hasLiked, doesFollow };
        })
      );
      // console.log(posts)

      console.log("updatedPosts", updatedPosts);
      res.status(200).send(updatedPosts);
    } catch (error) {
      res.status(500).send({ message: `Internal Server Error.${error}` });
    }
  }

  async getRecentPosts(req, res) {
    console.log("req.query", req.query);
    const { limit, start, userId } = req.query;
    try {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(Number(start))
        .limit(Number(limit))
        .select({
          _id: 0,
          // createdAt: 0,
          // updatedAt: 0,
          __v: 0,
        });
      let hasLiked, hasCommented, doesFollow;
      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          console.log(post);
          const likedResult = await LikesInfo.findOne({
            likedBy: userId,
            postId: post.PostId,
          });
          const CommentResult = await Comment.findOne({
            userId,
            postId: post.PostId,
          });
          const followResult = await following.findOne({
            followerId: userId,
            followingId: post.postedBy,
          });
          if (likedResult === null) {
            hasLiked = false;
          } else {
            hasLiked = true;
          }
          if (CommentResult === null) {
            hasCommented = false;
          } else {
            hasCommented = true;
          }
          if (followResult === null) {
            doesFollow = false;
          } else {
            doesFollow = true;
          }
          const plainPost = post.toObject();
          return { ...plainPost, hasCommented, hasLiked, doesFollow };
        })
      );
      res.status(200).send(updatedPosts);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: `Internal Server Error.${error}` });
    }
  }
  async followUser(req, res) {
    const { followerId, followingId } = req.body;
    // const followerId=req.userId
    try {
      const followStatus = await following.find({
        followerId,
        followingId,
      });
      if (followStatus.length === 0) {
        const newFollower = new following({ followerId, followingId });
        const result = await newFollower.save();
        const bidirection = await following.findOne({
          followerId: followingId,
          followingId: followerId,
        });
        if (bidirection !== null) {
          const updateFriend = await User.updateMany(
            { userId: { $in: [followerId, followingId] } },
            { $inc: { friends: 1 } }
          );
        }

        const updatefollowerUser = await User.updateOne(
          { userId: followerId },
          { $inc: { followingCount: 1 } }
        );
        const updatefollowingUser = await User.updateOne(
          { userId: followingId },
          { $inc: { followersCount: 1 } }
        );
        res.status(200).send("following");
        console.log(result);
      } else {
        const bidirection = await following.findOne({
          followerId: followingId,
          followingId: followerId,
        });
        if (bidirection !== null) {
          const updateFriend = await User.updateMany(
            { userId: { $in: [followerId, followingId] } },
            { $inc: { friends: -1 } }
          );
        }
        const unfollowResult = await following.deleteOne({
          followerId,
          followingId,
        });
        const updatefollowerUser = await User.updateOne(
          { userId: followerId },
          { $inc: { followingCount: -1 } }
        );
        const updatefollowingUser = await User.updateOne(
          { userId: followingId },
          { $inc: { followersCount: -1 } }
        );
        res.send("unfollowing");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ error: e });
    }
  }
  async getPostsOfFollowingUsers(req, res) {
    // const userId=req.userId
    const { limit, start, userId } = req.query;
    try {
      const followerIds = await following
        .find({ followerId: userId })
        .distinct("followingId");
      console.log(followerIds);
      const posts = await Post.find({
        postedBy: { $in: followerIds },
      })
        .sort({ createdAt: -1 })
        .skip(Number(start))
        .limit(Number(limit))
        .select({
          _id: 0,
          // createdAt: 0,
          // updatedAt: 0,
          __v: 0,
        });
      let hasLiked, hasCommented, doesFollow;

      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          console.log(post);
          const likedResult = await LikesInfo.findOne({
            likedBy: userId,
            postId: post.PostId,
          });
          const CommentResult = await Comment.findOne({
            userId,
            postId: post.PostId,
          });
          const followResult = await following.findOne({
            followerId: userId,
            followingId: post.postedBy,
          });
          if (likedResult === null) {
            hasLiked = false;
          } else {
            hasLiked = true;
          }
          if (CommentResult === null) {
            hasCommented = false;
          } else {
            hasCommented = true;
          }
          if (followResult === null) {
            doesFollow = false;
          } else {
            doesFollow = true;
          }
          const plainPost = post.toObject();
          return { ...plainPost, hasCommented, hasLiked, doesFollow };
        })
      );
      res.status(200).send(updatedPosts);
      console.log(posts);
    } catch (e) {
      console.log(e);
      res.status(500).send({ error: e });
    }
  }

  async getTagsAfterDate(req, res) {
    const { date } = req.query;
    const datefromString = new Date(date);
    console.log(date);
    try {
      const result = await Tag.find({ createdAt: { $gt: datefromString } })
        .sort({ usedCount: -1 })
        .select({
          _id: 0,
          // createdAt: 0,
          // updatedAt: 0,
          __v: 0,
        });
      console.log(result);
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send(e);
    }
  }
  async getPostsContaingTags(req, res) {
    //
    const { userId, tags, limit, start } = req.body;
    let posts;
    // const userId=req.userId
    console.log(userId);
    try {
      if (userId == null) {
        const tagObjectIds = await Tag.find({ tag: { $in: tags } }).select({
          _id: 1,
        });

        posts = await Post.find({ tags: { $in: tagObjectIds } })
          .populate("tags")
          .sort({ createdAt: -1 })
          .skip(Number(start))
          .limit(Number(limit))
          .select({ _id: 0, __v: 0 });
      } else if (tags == null || tags.length === 0) {
        posts = await Post.find({ postedBy: userId })
          .skip(Number(start))
          .limit(Number(limit))
          .select({ _id: 0, __v: 0 });
      } else if (userId != null && tags.length > 0) {
        const tagObjectIds = await Tag.find({ tag: { $in: tags } }).select({
          _id: 1,
        });

        posts = await Post.find({
          tags: { $in: tagObjectIds },
          postedBy: userId,
        })
          .populate("tags")
          .sort({ createdAt: -1 })
          .skip(Number(start))
          .limit(Number(limit))
          .select({ _id: 0, __v: 0 });
      }
      let hasLiked, hasCommented, doesFollow;

      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          console.log("post", post);
          const likedResult = await LikesInfo.findOne({
            likedBy: userId,
            postId: post.PostId,
          });
          const CommentResult = await Comment.findOne({
            userId,
            postId: post.PostId,
          });
          const followResult = await following.findOne({
            followerId: userId,
            followingId: post.postedBy,
          });
          if (likedResult === null) {
            hasLiked = false;
          } else {
            hasLiked = true;
          }
          if (CommentResult === null) {
            hasCommented = false;
          } else {
            hasCommented = true;
          }
          if (followResult === null) {
            doesFollow = false;
          } else {
            doesFollow = true;
          }
          const plainPost = post.toObject();
          return { ...plainPost, hasCommented, hasLiked, doesFollow };
        })
      );
      res.status(200).send(updatedPosts);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async commentPost(req, res) {
    const { postId, comment, userId } = req.body;
    // const userId=req.userId
    try {
      const NewComment = new Comment({ postId, userId, comment });
      await NewComment.save();
      const result = await Post.updateOne(
        { PostId: postId },
        { $inc: { commentsCount: 1 } }
      );
      console.log("result", result);
      res.send("comment posted successfully");
    } catch (e) {
      console.log("error", e);
      res.status(500).send("internal server error");
    }
  }

  async likePost(req, res) {
    // const userId=req.userId
    const { postId, userId } = req.body;
    try {
      const likedStatus = await LikesInfo.find({
        likedBy: userId,
        postId,
      });
      if (likedStatus.length === 0) {
        const newLike = new LikesInfo({
          likedBy: userId,
          postId,
        });
        const updatesLikesCount = await Post.updateOne(
          { PostId: postId },
          { $inc: { likesCount: 1 } }
        );
        await newLike.save();
        res.send("post liked");
      } else {
        const unlikeResult = await LikesInfo.deleteOne({
          likedBy: userId,
          postId,
        });
        const updatesLikesCount = await Post.updateOne(
          { PostId: postId },
          { $inc: { likesCount: -1 } }
        );
        console.log(unlikeResult);
        res.send("post unliked");
      }
    } catch (e) {
      console.log("error", e);
      res.status(500).send("internal server error");
    }
  }

  async getFollowingRooms(req, res) {
    const { userId, limit, start } = req.query;
    try {
      /// Find the users followed by user with userId
      console.log("userId=", userId);
      const usersFollowedBy = (await following.find({ followerId: userId })).map((user) => user.followingId);
      console.log("usersFollowedBy=", usersFollowedBy);
      /// Find their userDatas and check the rooms they are in (see the joinedRoomId field in the user model)
      const allUsers = await User.aggregate([
        { $match: { userId: { $in: usersFollowedBy } } },
        { $unwind: "$joinedRoomId" },
        { $skip: Number(start) },
        { $limit: Number(limit) }
      ]);
      console.log("allUsers=", allUsers);
      /// If joinedRoomId != null then add it to the result
      /// when result reaches the limit then return the result
      res.send(allUsers);
    } catch (e) {
      console.log(e);
      res.status(500).send(`internal server error: ${e}`);
    }
  }

  async getFollowingUsers(req, res) {
    console.log("called following");

    const { userId, limit, start } = req.body;
    try {
      const result = await following
        .find({ followerId: userId })
        .skip(Number(start))
        .limit(Number(limit))
        .select({ followingId: 1, _id: 0, __v: 0 });
      res.send(result);
      console.log("following result", result);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getFollowersOfUser(req, res) {
    const { userId, limit, start } = req.body;
    try {
      const result = await following
        .find({ followingId: userId })
        .skip(Number(start))
        .limit(Number(limit))
        .select({ followerId: 1, _id: 0, __v: 0 });
      res.send(result);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async doesFollow(req, res) {
    const { followedBy, followed } = req.body;
    try {
      const result = await following.find({
        followerId: followedBy,
        followingId: followed,
      });
      if (result.length === 0) {
        res.send(false);
      } else {
        res.send(true);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getFollowersData(req, res) {
    const { userId, limit, start } = req.query;
    console.log("api hit");
    try {
      let FollowersData = await following.aggregate([
        { $match: { followingId: userId } },
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "userId",
            as: "userData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $skip: Number(start),
        },
        {
          $limit: Number(limit),
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            followerId: 0,
            followingId: 0,
            "userData._id": 0,
            "userData.__v": 0,
          },
        },
      ]);
      FollowersData = FollowersData.map((follower) => follower.userData);
      //   console.log(FollowersData);
      res.send(FollowersData);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getFollowingData(req, res) {
    console.log("called following users data");
    const { userId, limit, start } = req.query;
    try {
      let FollowingData = await following.aggregate([
        { $match: { followerId: userId } },
        {
          $lookup: {
            from: "users",
            localField: "followingId",
            foreignField: "userId",
            as: "userData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $skip: Number(start),
        },
        {
          $limit: Number(limit),
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            followerId: 0,
            followingId: 0,
            "userData._id": 0,
            "userData.__v": 0,
          },
        },
      ]);
      console.log("FollowingData", FollowingData);
      FollowingData = FollowingData.map((follower) => follower.userData);
      console.log(FollowingData);
      res.send(FollowingData);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getFriendsData(req, res) {
    const { userId, limit, start } = req.query;
    console.log(userId);
    try {
      let FollowingData = await following.aggregate([
        {
          $match: { followerId: userId },
        },
        {
          $lookup: {
            from: "followings",
            localField: "followingId",
            foreignField: "followerId",
            as: "friends",
          },
        },
        {
          $unwind: "$friends",
        },
        {
          $match: {
            $expr: {
              $eq: ["$followerId", "$friends.followingId"],
            },
          },
        },
        {
          $project: {
            friends: 0,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followingId",
            foreignField: "userId",
            as: "userData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $skip: Number(start),
        },
        {
          $limit: Number(limit),
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            followerId: 0,
            followingId: 0,
            "userData._id": 0,
            "userData.__v": 0,
          },
        },
      ]);
      //   console.log("FollowingData",FollowingData);
      console.log(FollowingData);
      // FollowingData = FollowingData.map((follower) => follower.userData);

      res.send(FollowingData);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }

  async getsCommentsOfPost(req, res) {
    const { start, limit, postId } = req.query;
    try {
      const comments = await Post.aggregate([
        { $match: { PostId: postId } },
        {
          $lookup: {
            from: "comments",
            localField: "PostId",
            foreignField: "postId",
            as: "comments",
          },
        },
        {
          $unwind: "$comments", // Unwind the comments array
        },
        {
          $replaceRoot: { newRoot: "$comments" }, // Replace the root with the comments
        },
        {
          $project: { userId: 1, comment: 1, _id: 0 },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "userId",
            as: "commentedBy",
          },
        },
        {
          $unwind: "$commentedBy", // Unwind the comments array
        },
        { $skip: Number(start) },
        { $limit: Number(limit) },
      ]);
      console.log(comments);
      res.send(comments);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  }
}

const postsController = new PostApis();
module.exports = postsController;
