import mongoose from "mongoose"

const uri = `${process.env.MONGODB_URI}/${process.env.MONGODB_DATABASE_NAME}`

try {
    await mongoose.connect(uri)
    mongoose.set('debug', true)
} catch (err) {
    console.log(err)
    process.exit()
}

export const urlSchema = new mongoose.Schema({
    url: { type: String, required: true },
    shortCode: { type: String, required: true }
})

