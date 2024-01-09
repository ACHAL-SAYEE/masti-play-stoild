const bdController = require("../controller/bd_controller");

class bdRoutes {
    async getAllBD(req, res) {
        try {
            const bdDataList = await bdController.getAllBD(req.query.start, req.query.limit);
            res.status(200).send(bdDataList);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async getBD(req, res) {
        try {
            const bdData = await bdController.getBD(req.params.id, req.params.userId);
            res.status(200).send(bdData);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async getParticipantAgencies(req, res) {
        try {
            const participantAgenciesList = await bdController.getParticipantAgencies(req.params.bdId, req.query.start, req.query.limit);
            res.status(200).send(participantAgenciesList);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async createBD(req, res) {
        try {
            const newBdData = await bdController.createBD(req.body.ownerId);
            res.status(200).send(newBdData);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async updateBD(req, res) {
        try {
            const updatedBdData = await bdController.updateBD(req.params.id, req.body);
            res.status(200).send(updatedBdData);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async addBeans(req, res) {
        try {
            const updatedBdData = await bdController.addBeans(req.params.bdId, req.body.beans);
            res.status(200).send(updatedBdData);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async addAgency(req, res) {
        try {
            const newParticipantAgency = await bdController.addAgency(req.params.bdId, req.body.agencyId);
            res.status(200).send(newParticipantAgency);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async removeAgency(req, res) {
        try {
            const updatedParticipantAgency = await bdController.removeAgency(req.params.bdId, req.params.agencyId);
            res.status(200).send(updatedParticipantAgency);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }
}

module.exports = new bdRoutes();