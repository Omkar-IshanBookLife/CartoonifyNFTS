const mongoose = require("mongoose")

const Schema = mongoose.Schema

const FeedbackSchema = new Schema({
    name: String,
    mobile_no: String,
    email_addr: String,
    country: String,
    description: String,
    checked: String
})

const Feedback = mongoose.model("feedback", FeedbackSchema)

module.exports = Feedback