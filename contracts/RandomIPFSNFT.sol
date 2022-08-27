//SPDX-License-Identifier:MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//errors
error RandomIPFS__notEnoughEth();
error RandomIPFS__outOfBound();
error RandomIPFS__NotOwner();
error RandomIPFS__withDrawUnsuccessfull();

contract RandomIPFS is VRFConsumerBaseV2, ERC721URIStorage {
    /**
     * when we mint an nft we will be triggering a chainlink vrf to get a random number
     * using that number will get a random NFT
     * we have
     * PUG  highly rare,
     * Shiba Inu somewhat rare,
     * ST.Bernard common
     */
    // people have to pay the mintFee for minting the NFT
    //contract owner can withdraw the funds

    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNANRD
    }
    string[] tokenURIs;

    uint256 public immutable i_mintFee;
    VRFCoordinatorV2Interface private immutable i_VRFCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callBackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    address public immutable i_owner;

    //mapping
    mapping(uint256 => address) requestIdToAddress;

    //NFT variables
    uint256 public s_tokenCounter = 0;
    uint256 private constant MAX_CHANCES = 100;

    //events
    event NFTRequested(uint256 indexed requestId, address);
    event NFTMinted(Breed, address);

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert RandomIPFS__NotOwner();
        }
        _;
    }

    constructor(
        address _VRFConsumerBaseV2,
        uint256 _i_mintFee,
        bytes32 _gaslane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string[] memory _tokenURIs
    ) VRFConsumerBaseV2(_VRFConsumerBaseV2) ERC721("RandomDogs", "RIN") {
        i_mintFee = _i_mintFee;
        i_VRFCoordinator = VRFCoordinatorV2Interface(_VRFConsumerBaseV2);
        i_gasLane = _gaslane;
        i_subscriptionId = subscriptionId;
        i_callBackGasLimit = callbackGasLimit;
        i_owner = msg.sender;
        tokenURIs = _tokenURIs;
    }

    /** this function will request for a random number, whenever soemone submit a mint request
     */
    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIPFS__notEnoughEth();
        }
        requestId = i_VRFCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callBackGasLimit,
            NUM_WORDS
        );
        requestIdToAddress[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address NFTOwner = requestIdToAddress[requestId];
        uint256 tokenId = s_tokenCounter;
        uint256 randomNum = randomWords[0] % MAX_CHANCES;
        Breed dogBreed = getBreedFromRandomNum(randomNum);
        _safeMint(NFTOwner, tokenId);
        _setTokenURI(tokenId, tokenURIs[uint256(dogBreed)]);
        s_tokenCounter++;
        emit NFTMinted(dogBreed, NFTOwner);
    }

    function getBreedFromRandomNum(uint256 randomNum) public pure returns (Breed) {
        //random num 72
        uint256 sum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (randomNum > sum && randomNum < chanceArray[i]) {
                return Breed(i);
            }
            sum = sum + chanceArray[i];
        }
        revert RandomIPFS__outOfBound();
    }

    function getChanceArray() public pure returns (uint256[3] memory arr) {
        arr[0] = 10;
        arr[1] = 30;
        arr[2] = MAX_CHANCES;
        return arr;
    }

    function withDraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIPFS__withDrawUnsuccessfull();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return tokenURIs[tokenId];
    }
}
