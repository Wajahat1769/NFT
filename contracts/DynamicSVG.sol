//SPDX-License-Identifier:MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
//priceFeed:0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
error DynamicSVG__NoMoreToMint();
error DynamicSVG__NotTokenFound();

contract DynamicSVG is ERC721 {
    //creating On-Chain NFT
    //will be changed on trigger
    //will be storing our svg information somewhere

    //events

    event NFTMinted(uint256 indexed tokenID, address minter);

    //storage vars
    uint256 private s_tokenID;

    //constants
    uint256 public constant TOTAL_SVG = 10;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    string private i_lowSvg;
    string private i_highSvg;
    AggregatorV3Interface private priceFeed;
    uint256 public constant CONDITION_PRICE = 2000e18;

    constructor(
        string memory _lowSvg,
        string memory _highSvg,
        address _priceFeed
    ) ERC721("Dynamic SVG NFT", "DSN") {
        i_lowSvg = svgToImageURI(_lowSvg);
        i_highSvg = svgToImageURI(_highSvg);
        s_tokenID = 0;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function mintNFT() public {
        if (s_tokenID > TOTAL_SVG) {
            revert DynamicSVG__NoMoreToMint();
        }
        _safeMint(msg.sender, s_tokenID);
        emit NFTMinted(s_tokenID, msg.sender);
        s_tokenID++;
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory base64SvgEncoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, base64SvgEncoded));
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenID;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenID) public view override returns (string memory) {
        if (!_exists(tokenID)) {
            revert DynamicSVG__NotTokenFound();
        }
        int256 price;
        string memory imageURI = i_lowSvg;
        (, price, , , ) = priceFeed.latestRoundData();
        if (uint256(price) > CONDITION_PRICE) {
            imageURI = i_highSvg;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
