const { hre } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper");
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
module.exports = async (hre) => {

    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()


    const chainID = network.config.chainId

    const name = networkConfig[chainID]["name"]
    const symbol = networkConfig[chainID]["symbol"]
    //const args = [name, symbol]

    const simpleNFT = await deploy("SimpleNFT", {
        contract: "SimpleNFT",
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: network.config.blockConfirmations
    }
    )
    log("-----------deployed----------")

    if (!developmentChains.includes(network.name) && process.env.CMC_API_KEY) {
        await verify(simpleNFT.address, [])
        log("--------------------------------------")
    }

}

module.exports.tags = ["all", "main"]