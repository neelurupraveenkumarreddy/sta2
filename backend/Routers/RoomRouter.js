const Express = require("express");
const RoomController = require("../controller/RoomController");
const router = Express.Router()

router.route("/")
    .get(RoomController.getAllRooms)
    .post(RoomController.createRoom)

router.route("/:_id")
    .get(RoomController.getSingleRoom)

module.exports = router