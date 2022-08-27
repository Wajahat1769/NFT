const pinataSDK = require('@pinata/sdk');
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const PINATA_API_KEY = process.env.PINATA_API_KEY || "eb4c054ab3b756cdf9b1"
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || "3287ffa8879baf2f9abfaeb1fcb37c80fbab813742efee05fb0d68caddb1ca35"
const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)

async function uploadImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("uploading to ipfs----")
    for (eachFile in files) {
        const readAbleStream = fs.createReadStream(`${fullImagesPath}/${files[eachFile]}`)

        try {
            const responce = await pinata.pinFileToIPFS(readAbleStream)
            responses.push(responce)

        } catch (error) {
            console.log(error)
        }
    }

    return { responses, files }

}

async function storeURImetadata(metadata) {
    try {
        const responce = await pinata.pinJSONToIPFS(metadata)
        return responce
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { uploadImages, storeURImetadata }