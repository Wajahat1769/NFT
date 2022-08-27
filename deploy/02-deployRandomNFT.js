const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper")
const { verify } = require("../utils/verify");
require("dotenv").config()
const imagesLocation = "./images/RandomNFTS"
const { uploadImages, storeURImetadata } = require("../utils/uploadFilesToPinata.js")

const metadataTemplate = {
    name: " ",
    description: " ",
    image: " ",
    attributes: [
        {
            trait_type: "cuteness",
            value: "100"
        }
    ]

}
const SUBSCRIPTION_AMOUNT = ethers.utils.parseEther("10")
let tokenURIs = [
    'ipfs://QmVEN1xuWj4YQ5JzJ1dtpJ1cB3qWpseqp3XjJvgFUdGAY3',
    'ipfs://QmU1YCRjgP2jGYTDo5aAPCeCWvRsiuaMtpTD9HpCDV6Vgx',
    'ipfs://QmS6usNU8uzUq1gTFA9Ub4XTstrvYpLQZGd2RAr9sJuY23'
]

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await network.config.chainId;
    let address, subscriptionId
    const SUB_ID = 0

    if (developmentChains.includes(network.name)) {
        const VRFCooordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        address = VRFCooordinatorV2Mock.address
        const transactionResponse = await VRFCooordinatorV2Mock.createSubscription()
        const transactionReciept = await transactionResponse.wait()
        subscriptionId = transactionReciept.events[0].args.subId
        await VRFCooordinatorV2Mock.fundSubscription(subscriptionId, SUBSCRIPTION_AMOUNT)
    } else {
        address = networkConfig[chainId]["VRFCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"]
    //const interval = networkConfig[chainId]["interval"]
    //will be uploading images to pinata to point at IPFS


    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenURIs = await handleTokenURIs();
    }



    const args = [address, entranceFee, gasLane, subscriptionId, callBackGasLimit, tokenURIs]
    const RandomIPFS = await deploy("RandomIPFS", {
        contract: "RandomIPFS",
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 5
    })
    log("_______________________Deployed_________________")
    if (!developmentChains.includes(network.name)) {
        verify(RandomIPFS.address, args)
        log("________________________________________________")
    }
}


async function handleTokenURIs() {
    let tokenURIs = []
    //store image in IPFS
    //store metadata in IPFS
    const { responses: hash, files } = await uploadImages(imagesLocation)// upload image function will return image hashes and files
    for (hashIndex in hash) {
        let tokenURIMetadata = { ...metadataTemplate }
        tokenURIMetadata.name = files[hashIndex].replace(".png", "")
        tokenURIMetadata.description = `An adorable ${tokenURIMetadata.name} pup!`
        tokenURIMetadata.image = `ipfs://${hash[hashIndex].IpfsHash}`
        console.log(`uploading ${tokenURIMetadata.name}---`)
        //uploasing to json
        const responceFromPinata = await storeURImetadata(tokenURIMetadata)
        tokenURIs.push(`ipfs://${responceFromPinata.IpfsHash}`)
    }
    console.log("uploaded.....")
    console.log(tokenURIs)
    return tokenURIs
}

module.exports.tags = ["all", "Random", "main"]