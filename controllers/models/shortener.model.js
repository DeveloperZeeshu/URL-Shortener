import { urlSchema } from "../../config/db_client.js"
import mongoose from "mongoose"

const shortenerCollection = mongoose.model('shortener', urlSchema)

export const loadLinks = async () => {
    return shortenerCollection.find()
}

export const saveLinks = async (links) => {
    return shortenerCollection.insertOne(links)
}

export const getLinkByShortCode = async (shortCode) => {
    return await shortenerCollection.findOne({ shortCode: shortCode })
}
