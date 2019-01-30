const db = require("../models");
const path = require("path");

module.exports = {

    setSearchString: function(req, res) {
        db.models.Result
            .create(req.body)
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(422).json(err));
    },  

    startSearch: function(req, res) {
        console.log("req.body in startSearch", req.body.searchId)
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',[path.join(__dirname, "../scripts/python/ccmdbsearch.py"), req.body.searchId, req.body.searchString, req.body.clusterIp, req.body.clusterVersion, req.body.axlUser, req.body.axlPassword])
        res.status(202).send()

        pythonProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        
        });
    },

    checkResult: function(req, res) {
        console.log("req.body in checkResult", req.body.searchId)
        db.models.Result
            .findById(req.body.searchId)
            .then(dbModel => res.send(dbModel))
            .catch(err => res.status(422).json(err));
    },

    removeDbEntry: function(req, res) {
        console.log('req.body in removeDbEntry', req.body.searchId)
        db.models.Result
            .findOneAndDelete({ _id: req.body.searchId})
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(422).json(err));
    }
}
