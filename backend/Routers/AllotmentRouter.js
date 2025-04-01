const Express = require("express");
const AllotmentController = require("../controller/AllotmentController");
const router = Express.Router()

router.route("/")
    .get(AllotmentController.getAllAllotments)
    .post(AllotmentController.createAllotment)

router.route("/:_id")
    .get(AllotmentController.getSingleAllotment)

module.exports = router