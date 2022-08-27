const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper")

module.exports = async (hre) => {

    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    //Minting basic nft
    const basicNft = await ethers.getContract("SimpleNFT", deployer)
    const mintBasicNft = await basicNft.mintNFT()
    await mintBasicNft.wait(1)
    console.log(`Basic Nft is minted with token URI : ${await basicNft.tokenURI(0)}`)

    //MintingOnChainSVG

    const dynamicSVG = await ethers.getContract("DynamicSVG", deployer)
    const mintDynamicSVG = await dynamicSVG.mintNFT()
    await mintDynamicSVG.wait(1)
    console.log(`Dynamic SVG Nft is minted with token URI : ${await dynamicSVG.tokenURI(0)}`)

    //minting randomIPFSNFT
    const randomIpfsNft = await ethers.getContract("RandomIPFS", deployer)
    const getMintFee = await randomIpfsNft.getMintFee()
    const mintNFT = await randomIpfsNft.requestNFT({ value: getMintFee.toString() })
    const randomIpfsNftMintTxReceipt = await mintNFT.wait(1)
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NFTMinted", async () => {
            resolve()
        })

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]