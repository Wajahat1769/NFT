const { network } = require("hardhat");
const { developmentChains, DECIMAl, ANSWER } = require("../helper");
module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();


    if (developmentChains.includes(network.name)) {
        log("deploying mock contract-----------------------")

        await deploy("MockV3Aggregator", {
            from: deployer,
            contract: "MockV3Aggregator",
            log: true,
            //waitConfirmations: network.config.blockConfirmations,
            args: [1, 2]
        })

        log("----------Mocks Deployed---------------")
        log("--------------------------------------------")
    }
}
module.exports.tags = ["all", "dynamic"]