const router = require("express").Router();
const dataRoutes = require("./data");

router.use("/data", dataRoutes);

module.exports = router;
