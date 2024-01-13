const { BdData, ParticipantAgencies } = require('../models/bd');
const { generateUniqueId, generateUserId } = require("../utils");
const { User, AgencyData } = require("../models/models");

class bdController {
    async getAllBD(start, limit) {
        try {
            const bdDataList = await BdData.find()
                .skip(start)
                .limit(limit)
                .exec();
            console.log("bdDataList", bdDataList);
            const ownerDatas = await User.find({ userId: { $in: bdDataList.map((bd) => bd.owner) } }).exec();
            console.log("ownerDatas", ownerDatas);
            const result = bdDataList.map((bd) => {
                const ownerData = ownerDatas.find((user) => user.userId === bd.owner);
                return {
                    id: bd.id,
                    beans: bd.beans,
                    owner: bd.owner,
                    createdAt: bd.createdAt,
                    updatedAt: bd.updatedAt,
                    ownerData: ownerData,
                };
            });
            console.log("result", result);
            return result;
        } catch (error) {
            console.error('Error fetching BdData:', error.message);
            throw error;
        }
    }

    async getBD(id, userId) {
        try {
            let bdData;

            if (id) {
                bdData = await BdData.aggregate([
                    { $match: { id: id } },
                    {
                        $lookup: {
                            from: 'participantagencies',
                            localField: 'id',
                            foreignField: 'bdId',
                            as: 'agencies',
                        },
                    },
                    {
                        $group: {
                            _id: '$_id',
                            id: { $first: '$id' },
                            owner: { $first: '$owner' },
                            beans: { $first: '$beans' },
                            totalIncome: { $sum: '$agencies.contributedBeans' },
                        },
                    },
                ]).exec();
            } else if (userId) {
                bdData = await BdData.aggregate([
                    { $match: { owner: userId } },
                    {
                        $lookup: {
                            from: 'participantagencies',
                            localField: 'id',
                            foreignField: 'bdId',
                            as: 'agencies',
                        },
                    },
                    {
                        $group: {
                            _id: '$_id',
                            id: { $first: '$id' },
                            owner: { $first: '$owner' },
                            beans: { $first: '$beans' },
                            totalIncome: { $sum: '$agencies.contributedBeans' },
                        },
                    },
                ]).exec();
            } else {
                console.error('Both id and userId are undefined.');
                throw "Both id and userId are undefined.";
            }

            if (bdData.length == 0) {
                throw `No BD found with id ${id || userId}`;
            }

            console.log("bdData[0]", bdData[0]);

            const ownerData = await User.findOne({ userId: bdData[0].owner }).exec();
            const result = {
                ownerData: ownerData,
                ...bdData[0],
            };
            return result;
        } catch (error) {
            console.error('Error fetching BdData by id:', error);
            throw error;
        }
    }

    async getParticipantAgencies(bdId, start = 0, limit = 10) {
        try {
            const participantAgenciesList = await ParticipantAgencies.find({ bdId: bdId, exists: true })
                .skip(start)
                .limit(limit)
                .exec();
            const agencyIds = participantAgenciesList.map((participantAgencies) => participantAgencies.agencyId);
            const agencies = await AgencyData.find({ agencyId: { $in: agencyIds } }).exec();
            const result = agencies.map((agencyData) => {
                const participant = participantAgenciesList.find((p) => p.agencyId === agencyData.agencyId);
                return {
                    contributedBeans: participant.contributedBeans,
                    ownerId: agencyData.ownerId,
                    agencyId: agencyData.agencyId,
                    name: agencyData.name,
                    totalBeansRecieved: agencyData.totalBeansRecieved,
                    beansCount: agencyData.beansCount,
                };
            });
            return result;
        } catch (error) {
            console.error('Error fetching ParticipantAgencies:', error.message);
            throw error;
        }
    }

    async createBD(owner) {
        try {
            let isUnique = false;
            let newBdData;
            while (!isUnique) {
                const newId = generateUserId();
                const existingBdData = await BdData.findOne({ id: newId }).exec();
                if (!existingBdData) {
                    newBdData = new BdData({
                        id: newId,
                        beans: 0,
                        owner: owner,
                    });
                    await newBdData.save();
                    isUnique = true;
                }
            }
            return newBdData;
        } catch (error) {
            console.error('Error creating BdData:', error.message);
            throw error;
        }
    }

    async updateBD(id, data) {
        try {
            const bdData = await BdData.findOne({ id: id }).exec();
            if (!bdData) {
                console.log('BdData not found for id:', id);
                return null;
            }
            if (data.beans !== undefined) {
                bdData.beans = data.beans;
            }
            if (data.owner !== undefined) {
                bdData.owner = data.owner;
            }
            const updatedBdData = await bdData.save();
            return updatedBdData;
        } catch (error) {
            console.error('Error updating BdData:', error.message);
            throw error;
        }
    }

    async addBeans(id, beans) {
        try {
            const bdData = await BdData.findOne({ id: id }).exec();
            if (!bdData) {
                console.log('BdData not found for id:', id);
                return null;
            }
            bdData.beans += beans;
            const updatedBdData = await bdData.save();

            return updatedBdData;
        } catch (error) {
            console.error('Error adding beans to BdData:', error.message);
            throw error;
        }
    }

    async addAgency(bdId, agencyId) {
        try {
            const existingDocument = await ParticipantAgencies.findOne({ bdId: bdId, agencyId: agencyId }).exec();

            if (existingDocument) {
                console.log('ParticipantAgencies document already exists for bdId and agencyId:', bdId, agencyId);
                existingDocument.exists = true;
                const updatedDocument = await existingDocument.save();
                return updatedDocument;
            }
            const newDocument = new ParticipantAgencies({
                bdId: bdId,
                agencyId: agencyId,
                contributedBeans: 0,
                exists: true,
            });
            await newDocument.save();
            return newDocument;
        } catch (error) {
            console.error('Error adding agency to ParticipantAgencies:', error.message);
            throw error;
        }
    }

    async removeAgency(bdId, agencyId) {
        try {
            const participantAgenciesDocument = await ParticipantAgencies.findOne({ bdId: bdId, agencyId: agencyId }).exec();
            if (!participantAgenciesDocument) {
                console.log('ParticipantAgencies document not found for bdId and agencyId:', bdId, agencyId);
                throw `No Agency Found with agencyId: ${agencyId} in BD with id: ${bdId}.`;
            }
            participantAgenciesDocument.exists = false;
            const updatedDocument = await participantAgenciesDocument.save();
            return updatedDocument;
        } catch (error) {
            console.error('Error removing agency from ParticipantAgencies:', error.message);
            throw error;
        }
    }
}

module.exports = new bdController();