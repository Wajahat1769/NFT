//SPDX-License-Identifier:MIT
/**  Project Information
 *   name : Random apes
 *  will be deploying a limited collection
 *
 */

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
error RandomApes__notEnoughEth();
error RandomApes__noMoreApesToMint();
error RandomApes__notOwner();
error RandomApes__TransactionUnsuccessful();
error RandomApes__tokenIdNotExist();

contract RandomApes is ERC721URIStorage {
    //storage variables
    uint256 public constant TOTAL_SUPPLY = 3;
    uint256 private s_tokenId;
    address private immutable i_owner;
    uint256 public constant MINT_FEE = 0.01 ether;
    string[] private tokenURIs;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert RandomApes__notOwner();
        }
        _;
    }

    constructor(string[] memory jsonFiles) ERC721("RandomApes", "RA") {
        i_owner = msg.sender;
        tokenURIs = jsonFiles;
    }

    function mintNFT() public payable {
        if (s_tokenId >= TOTAL_SUPPLY) {
            revert RandomApes__noMoreApesToMint();
        }
        if (msg.value < MINT_FEE) {
            revert RandomApes__notEnoughEth();
        }
        _mint(msg.sender, s_tokenId);
        _setTokenURI(s_tokenId, tokenURIs[s_tokenId]);
        s_tokenId++;
    }

    function withDrawFunds() public onlyOwner {
        uint256 amount = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomApes__TransactionUnsuccessful();
        }
    }

    receive() external payable {}

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert RandomApes__tokenIdNotExist();
        }
        return tokenURIs[tokenId];
    }
}
