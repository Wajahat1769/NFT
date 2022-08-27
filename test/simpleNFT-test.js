const { assert } = require("chai")
const { ethers, deployments } = require("hardhat")
describe("Testing simple NFT", async () => {

    let accounts, deployer, NFTContract
    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        NFTContract = await ethers.getContract("SimpleNFT", deployer)
    })

    it("check if people can mint", async () => {
        const response = await NFTContract.mintNFT()
        await response.wait(1)
        const tokenCount = await NFTContract.getTokenCount()
        const tokenURI = await NFTContract.tokenURI(0)
        const asliVar = await NFTContract.TOKEN_URI()
        assert.equal(tokenCount.toString(), "1")
        assert.equal(tokenURI, asliVar)
    })
})