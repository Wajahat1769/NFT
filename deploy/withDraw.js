const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper")

module.exports = async (hre) => {

    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    //withDrawing from random ipfs


}