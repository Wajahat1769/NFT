const { hre, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper");
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const fs = require("fs")
module.exports = async (hre) => {

    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId
    let priceFeedAddress
    const low_svg = fs.readFileSync("./images/RandomNFTS/dynamicSVG/frown.svg", { encoding: "utf8" })
    const high_svg = fs.readFileSync("./images/RandomNFTS/dynamicSVG/happy.svg", { encoding: "utf8" })
    if (developmentChains.includes(network.name)) {
        const Mock = await ethers.getContract("MockV3Aggregator")
        priceFeedAddress = Mock.address
    } else {
        priceFeedAddress = networkConfig[chainID]["priceFeedAddress"]
    }
    args = [low_svg, high_svg, priceFeedAddress]

    log("---------------------------Deploying-----------------------------")
    const svgContract = await deploy("DynamicSVG", {
        from: deployer,
        contract: "DynamicSVG",
        log: true,
        args: args,
        waitConfirmations: 5
    })
    log("-----------deployed---------------")

    if (!developmentChains.includes(network.name) && process.env.CMC_API_KEY) {
        await verify(svgContract.address, args)
    }
}

module.exports.tags = ["all", "dynamicSVG", "main"]