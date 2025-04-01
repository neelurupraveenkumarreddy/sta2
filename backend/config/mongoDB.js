const mongoose = require("mongoose")
require("dotenv").config()
async function connectDb(params) {
    mongoose.connect(process.env.DB_URL)
        .then(() => {
            console.log("Connected to mongo Successfully")
        })
        .catch((e) => {
            console.log(e)
        })
}
module.exports.connectDB = connectDb