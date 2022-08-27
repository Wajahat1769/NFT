//SPDX-License-Identifier:MIT

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error SimpleNFT__notOwner();

contract SimpleNFT is ERC721 {
    string public TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCounter = 0;

    // address public i_owner;

    // modifier onlyOwner() {
    //     if (msg.sender != i_owner) {
    //         revert SimpleNFT__notOwner();
    //     }
    //     _;
    // }

    constructor() ERC721("MIT", "mt") {
        //i_owner = msg.sender;
    }

    // function transferContractOwnerShip(address newOner) public onlyOwner {
    //     i_owner = newOner;
    // }

    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCounter;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return TOKEN_URI;
    }
}
