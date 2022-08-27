const { assert } = require("chai")
const { ethers, deployments } = require("hardhat")
describe("Testing simple NFT", async () => {

    let accounts, deployer, NFTContract, VRFCoordinator
    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["Random"])
        NFTContract = await ethers.getContract("RandomIPFSNFT", deployer)
        VRFCoordinator = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    })


})