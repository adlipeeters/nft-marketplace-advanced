// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;

    struct NftItem {
        uint tokenId;
        uint price;
        address creator;
        bool isListed;
    }

    struct AuctionStruct {
        uint tokenId;
        address seller;
        address winner;
        uint price;
        bool sold;
        bool live;
        uint bids;
        uint duration;
    }

    struct BidderStruct {
        address bidder;
        uint price;
        uint timestamp;
    }

    uint listingPrice = 0.025 ether;
    uint marketplaceFee = 2; // 2% fee

    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;
    Counters.Counter private _totalAuctions;

    mapping(string => bool) private _usedTokenURIs;
    mapping(uint256 => NftItem) private _idToNftItem;

    mapping(uint => AuctionStruct) auctionedItem;
    mapping(uint => bool) auctionedItemExist;
    mapping(uint => BidderStruct[]) biddersOf;
    mapping(uint => mapping(address => bool)) hasBid;

    event NftItemCreated(
        uint tokenId,
        uint price,
        address indexed creator,
        bool isListed
    );
    event NFTSold(
        uint tokenId,
        address indexed buyer,
        address indexed seller,
        uint price,
        uint fee
    );
    event NFTListed(uint tokenId, bool isListed);

    event AuctionItemCreated(
        uint indexed tokenId,
        address seller,
        uint price,
        bool sold
    );

    event AuctionWinnerPicked(uint tokenId, address winner, uint price);

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    // Override the following functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        if (bytes(tokenURI(tokenId)).length != 0) {
            delete _idToNftItem[tokenId];
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getOwnedNfts() public view returns (NftItem[] memory) {
        uint ownedItemsCount = balanceOf(msg.sender);
        NftItem[] memory items = new NftItem[](ownedItemsCount);
        for (uint i = 0; i < ownedItemsCount; i++) {
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            items[i] = _idToNftItem[tokenId];
        }
        return items;
    }

    function getNftsOnSale() public view returns (NftItem[] memory) {
        NftItem[] memory items = new NftItem[](_listedItems.current());
        uint index = 0;
        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (_idToNftItem[i].isListed) {
                items[index] = _idToNftItem[i];
                index++;
            }
        }
        return items;
    }

    function tokenOfOwnerByIndex(
        address owner,
        uint index
    ) public view override returns (uint) {
        return super.tokenOfOwnerByIndex(owner, index); // Call the inherited method
    }

    function mintToken(
        string memory newTokenURI, // changed from tokenURI to newTokenURI
        uint price
    ) public payable returns (uint) {
        require(!tokenURIExists(newTokenURI), "Token URI already exists"); // update here too
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _tokenIds.increment();
        uint newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, newTokenURI); // update here too
        _createNftItem(newTokenId, price);
        _usedTokenURIs[newTokenURI] = true; // and here

        return newTokenId;
    }

    function _createNftItem(uint tokenId, uint price) private {
        require(price > 0, "Price must be at least 1 wei");
        _idToNftItem[tokenId] = NftItem(tokenId, price, msg.sender, false);
        emit NftItemCreated(tokenId, price, msg.sender, false);
    }

    function buyNFT(uint tokenId) public payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own token");
        NftItem storage item = _idToNftItem[tokenId];
        require(item.isListed, "Token is not listed for sale");

        uint totalPrice = item.price + ((item.price * marketplaceFee) / 100);
        require(msg.value == totalPrice, "Price must be equal to total price");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);

        // Using call to send Ether and handle possible failure
        (bool sellerSent, ) = payable(seller).call{value: item.price}("");
        require(sellerSent, "Failed to send Ether to seller");

        uint feeAmount = (item.price * marketplaceFee) / 100;
        (bool feeSent, ) = payable(owner()).call{value: feeAmount}("");
        require(feeSent, "Failed to send marketplace fee");

        item.isListed = false;
        _listedItems.decrement();

        emit NFTSold(tokenId, msg.sender, seller, item.price, feeAmount);
    }

    function tokenURIExists(
        string memory _tokenURI
    ) public view returns (bool) {
        return _usedTokenURIs[_tokenURI];
    }

    function changeNFTPrice(uint tokenId, uint price) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        require(!_idToNftItem[tokenId].isListed, "Token is listed for sale");
        _idToNftItem[tokenId].price = price;
    }

    function toggleNFTListing(uint tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");

        NftItem storage item = _idToNftItem[tokenId];
        item.isListed = !item.isListed;

        if (item.isListed) {
            _listedItems.increment();
        } else {
            _listedItems.decrement();
        }

        emit NFTListed(tokenId, item.isListed);
    }

    function offerAuction(
        uint tokenId,
        uint sec,
        uint min,
        uint hour,
        uint day
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Unauthorized entity");
        require(
            auctionedItem[tokenId].bids == 0,
            "Winner should claim prize first"
        );
        require(auctionedItem[tokenId].live == false, "Auction already live");
        // Approve and transfer the token to the contract
        setApprovalForAll(address(this), true);
        IERC721(address(this)).transferFrom(msg.sender, address(this), tokenId);

        // Set the auction item details
        auctionedItem[tokenId] = AuctionStruct(
            tokenId,
            msg.sender,
            address(0),
            _idToNftItem[tokenId].price,
            false,
            true,
            0,
            getTimestamp(sec, min, hour, day)
        );

        // Mark the item as being auctioned
        auctionedItemExist[tokenId] = true;
        // activeAuctions.push(tokenId); // Add to active auctions
        _totalAuctions.increment();
    }

    function placeBid(uint tokenId) public payable {
        require(
            msg.value >= auctionedItem[tokenId].price,
            "Insufficient Amount"
        );
        require(
            auctionedItem[tokenId].duration > getTimestamp(0, 0, 0, 0),
            "Auction not available"
        );
        require(
            auctionedItem[tokenId].seller != msg.sender,
            "Seller can't bid"
        );

        require(!hasBid[tokenId][msg.sender], "You have already placed a bid");

        BidderStruct memory bidder;
        bidder.bidder = msg.sender;
        bidder.price = msg.value;
        bidder.timestamp = getTimestamp(0, 0, 0, 0);
        biddersOf[tokenId].push(bidder);
        auctionedItem[tokenId].bids++;
        auctionedItem[tokenId].price = msg.value;
        auctionedItem[tokenId].winner = msg.sender;

        hasBid[tokenId][msg.sender] = true; // Mark that the user has placed a bid
    }

    function getAuctions() public view returns (AuctionStruct[] memory) {
        // AuctionStruct[] memory items = new AuctionStruct[](_tokenIds.current());
        AuctionStruct[] memory items = new AuctionStruct[](
            _totalAuctions.current()
        );
        uint index = 0;
        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (auctionedItemExist[i] && auctionedItem[i].live) {
                items[index] = auctionedItem[i];
                index++;
            }
        }
        return items;
    }

    function getBidders(
        uint tokenId
    ) public view returns (BidderStruct[] memory) {
        return biddersOf[tokenId];
    }

    function pickWinner(uint tokenId) public {
        require(
            // seller or smart contract can pick the winner
            auctionedItem[tokenId].seller == msg.sender ||
                owner() == msg.sender,
            "Unauthorized entity"
        );
        require(
            auctionedItem[tokenId].duration < block.timestamp,
            "Auction still running"
        );

        if (auctionedItem[tokenId].bids == 0) {
            // No bids, return NFT to the seller
            IERC721(address(this)).transferFrom(
                address(this),
                auctionedItem[tokenId].seller,
                tokenId
            );
        } else {
            // Generate a pseudo-random number
            uint randomIndex = uint(
                keccak256(
                    abi.encodePacked(
                        block.difficulty,
                        block.timestamp,
                        biddersOf[tokenId].length
                    )
                )
            ) % biddersOf[tokenId].length;

            // Select the winner based on the random number
            BidderStruct memory winner = biddersOf[tokenId][randomIndex];

            // Transfer the token to the winner
            IERC721(address(this)).transferFrom(
                address(this),
                winner.bidder,
                tokenId
            );

            // Transfer the bid amount to the seller minus the marketplace fee
            uint feeAmount = (winner.price * marketplaceFee) / 100;
            (bool feeSent, ) = payable(owner()).call{value: feeAmount}("");
            require(feeSent, "Failed to send marketplace fee");

            uint sellerAmount = winner.price - feeAmount;
            (bool sellerSent, ) = payable(auctionedItem[tokenId].seller).call{
                value: sellerAmount
            }("");
            require(sellerSent, "Failed to send Ether to seller");

            // Mark the auction as sold and the winner
            auctionedItem[tokenId].sold = true;
            auctionedItem[tokenId].winner = winner.bidder;
            // auctionedItemExist[tokenId] = false;

            // Emit the event
            emit NFTSold(
                tokenId,
                winner.bidder,
                auctionedItem[tokenId].seller,
                winner.price,
                feeAmount
            );
        }

        auctionedItemExist[tokenId] = false;

        // Clear the hasBid mapping for the token
        address[] memory bidders = new address[](biddersOf[tokenId].length);
        for (uint i = 0; i < biddersOf[tokenId].length; i++) {
            bidders[i] = biddersOf[tokenId][i].bidder;
        }
        // Clear the bidders array
        delete biddersOf[tokenId];
        for (uint i = 0; i < bidders.length; i++) {
            delete hasBid[tokenId][bidders[i]];
        }

        // Clear the auctioned item
        delete auctionedItem[tokenId];
        _totalAuctions.decrement();
    }

    function closeAuctionsFromCronjob() public {
        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (
                auctionedItemExist[i] &&
                auctionedItem[i].duration < block.timestamp
            ) {
                pickWinner(i);
            }
        }
    }

    function getTimestamp(
        uint sec,
        uint min,
        uint hour,
        uint day
    ) internal view returns (uint) {
        return
            block.timestamp +
            (1 seconds * sec) +
            (1 minutes * min) +
            (1 hours * hour) +
            (1 days * day);
    }
}
