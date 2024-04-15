const Mongoose = require("mongoose")

const connectDB = async (uri) => {
    await Mongoose.connect(uri, {})
    console.log("MongoDB Connected")
}
module.exports = connectDB