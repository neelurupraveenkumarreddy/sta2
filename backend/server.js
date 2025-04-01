const app = require("./app")
require("dotenv").config()
const { connectDB } = require("./config/mongoDB")
connectDB()
app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Server is running port ${process.env.PORT}`)

    }
})