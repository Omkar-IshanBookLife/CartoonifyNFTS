const mongoose = require("mongoose")

const Schema = mongoose.Schema

const NftSchema = new Schema({
    name: String,
    description: String,
    magicedenLink: String,
    openSeaLink: String,
    author: String
})

const Nft = mongoose.model("nft", NftSchema)

module.exports = Nft