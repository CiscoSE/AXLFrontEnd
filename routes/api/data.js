const router = require("express").Router();
const dataController = require("../../controllers/dataController");

router.route("/setSearchString")
    .post(dataController.setSearchString);

router.route("/startSearch")
    .post(dataController.startSearch);

router.route("/checkResult")
    .post(dataController.checkResult);

module.exports = router;
