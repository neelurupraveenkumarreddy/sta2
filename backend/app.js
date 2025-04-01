const Express = require("express")

const app = Express()

const AllotmentRouter=require("./Routers/AllotmentRouter")
const RoomRouter = require("./Routers/RoomRouter")
const AdminRouter=require("./Routers/AdminRouter")
const { Admin } = require("mongodb")
app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))

app.use("/api/rooms", RoomRouter)
app.use("/api/allotments",AllotmentRouter)
app.use("/api/admin",AdminRouter)
module.exports = app