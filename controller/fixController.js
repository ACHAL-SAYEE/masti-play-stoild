const { User } = require("../models/models");

class fix {
  async fixUsers(req, res) {
    try {
      // Step 1: Aggregate to find duplicate emailIds
      const duplicateEmails = await User.aggregate([
        { $group: { _id: "$email", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]);

      // Step 2: Iterate over duplicate emailIds and delete duplicate accounts
      console.log("duplicateEmails",duplicateEmails)
      for (const { _id: email } of duplicateEmails) {
        console.log(" _id: email ", {_id: email} )
        // Find duplicate accounts
        const duplicateAccounts = await User.find({ email });

        // Sort accounts by some criteria (e.g., creation date) to keep one and delete the rest
        // duplicateAccounts.sort((a, b) => a.createdAt - b.createdAt);

        // Delete all but the first account
        const accountsToDelete = duplicateAccounts.slice(1);

        // Delete duplicate accounts
        for (const account of accountsToDelete) {
          await User.findByIdAndDelete(account._id);
          console.log(`Deleted duplicate account with emailId: ${email}`);
        }
      }
      const ExistingUsers = await User.find({
        userId: { $regex: /^[0-9]{8}$/ },
      }).sort({ userId: 1 });
      let lastUserId = parseInt(ExistingUsers[ExistingUsers.length - 1].userId);
      let inc = 1;
      let malformedUser = await User.findOne({
        userId: {
          $not: {
            $regex: /^[0-9]{8}$/,
          },
        },
      });
      while(malformedUser!==null){
        await User.updateOne({
            userId: {
              $not: {
                $regex: /^[0-9]{8}$/,
              },
            },
          },{userId:`${lastUserId+inc}`})
          inc++;
          malformedUser= await User.findOne({
            userId: {
              $not: {
                $regex: /^[0-9]{8}$/,
              },
            },
          });
      }
      res.send("fixed users");
    } catch (error) {
      res.status(500).send(`error`);
      console.error("Error removing duplicate accounts:", error);
    }
  }
}
const fixController = new fix();
module.exports = fixController;
