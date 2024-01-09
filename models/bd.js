const mongoose = require("mongoose");

const bdSchema = new mongoose.Schema({
    id: String,
    beans: { type: Number, default: 0 },
    owner: String,
}, {
    timestamps: true,
});

const BdData = mongoose.model("BdData", bdSchema);

const participantAgencies = new mongoose.Schema({
    bdId: String,
    agencyId: String,
    contributedBeans: { type: Number, default: 0 },
    exists: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const ParticipantAgencies = mongoose.model("ParticipantAgencies", participantAgencies);

module.exports = { BdData, ParticipantAgencies };
