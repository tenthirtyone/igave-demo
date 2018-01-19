pragma solidity 0.4.18;

import "./IGVAsset.sol";

// Based on:
// https://raw.githubusercontent.com/axiomzen/cryptokitties-bounty/e0d9c2c90964b1bbb242d8e3e0d9a7786cf21182/contracts/KittyCore.sol
contract IGVCore is IGVAsset {
    address public founderAddress;
    address public ownerAddress;

    uint public campaignEscrowAmount = 100000000000000000; // .1 ether
    uint64 public campaignBlockDelay = 1000;
    uint256 public totalRaised = 0;

    modifier onlyBy(address _account)
    {
        require(msg.sender == _account);
        _;
    }

    function IGVCore() public {

        founderAddress = msg.sender;
        ownerAddress = msg.sender;

        // Genesis is unspendable/invalid =)
        _createCampaign(0, 0, 0, address(0), "Genesis Campaign", "");
        _createToken(0, 1, "Genesis Token", 0);
        _createCertificate(0, 0, 0, address(0));
    }


    function createCampaign(
        uint256 _startBlock,
        uint256 _endBlock,
        string _campaignName,
        string _taxid
    )
      public
      payable
      returns (uint)
    {
      require(campaigns.length < 6);
      require(msg.value == campaignEscrowAmount);
      //require((block.number + campaignBlockDelay) <= _startBlock);
      require(_startBlock <= _endBlock);


      return _createCampaign(_startBlock, _endBlock, campaignEscrowAmount, msg.sender, _campaignName, _taxid);
    }

    function createToken(
        uint256 _campaignId,
        uint64 _supply,
        string _name,
        uint256 _price
    ) public
      returns (uint)
    {
      require(campaignIndexToOwner[_campaignId] == msg.sender);
      require(_supply > 0);
      require(_supply < 10000);
      require(_campaignId > 0);

      Campaign storage campaign = campaigns[_campaignId];

      require(campaign.veto == false);
      //require(block.number < uint256(campaign.startBlock));

      return _createToken(_campaignId, _supply, _name, _price);
    }

    function createCertificate(
        uint128 _campaignId,
        uint16 _tokenIdx
    )
      public
      payable
      returns (uint)
    {
      // Ensure campaign is valid & active
      // require(_campaignId > 0);

      Campaign storage campaign = campaigns[_campaignId];

      // Campaign is valid & active
      require(campaign.veto == false);
      // require(uint256(campaign.startBlock) >= block.number);
      //require(uint256(campaign.endBlock) <= block.number);

      // Ensure Token is still for sale
      Token storage token = campaignTokens[_campaignId][_tokenIdx];

      require(token.remaining > 0);
      //require(msg.value == uint256(token.price));

      uint64 unitNumber = token.supply - token.remaining + 1;

      campaignBalance[_campaignId] += msg.value;

      totalRaised += msg.value;

      return _createCertificate(_campaignId, _tokenIdx, unitNumber, msg.sender);
    }

    function vetoCampaign(uint256 _campaignId) public onlyBy(ownerAddress)  {
      delete campaigns[_campaignId];
      campaigns[_campaignId].veto = true;
      campaigns[_campaignId].owner = ownerAddress;

      Token[] storage tokens = campaignTokens[_campaignId];
      for (uint i = 0; i < tokens.length; i++) {
        delete tokens[i];
      }
    }

    // Escrow
    function claimEscrow(uint256 _campaignId) public onlyBy(campaignIndexToOwner[_campaignId]) {
      require(campaignEscrowBalance[_campaignId] > 0);

      Campaign storage campaign = campaigns[_campaignId];
      uint256 endBlock = uint256(campaign.endBlock);

      require(block.number > endBlock);

      uint256 amount = campaignEscrowBalance[_campaignId];
      campaignEscrowBalance[_campaignId] = 0;

      msg.sender.transfer(amount);
    }

    function getEscrowBalance(uint256 _campaignId)
      public
      view
      returns (uint){
      return campaignEscrowBalance[_campaignId];
    }

    // Views
    function getCampaign(uint256 _id)
        public
        view
        returns (
        uint256 startBlock,
        uint256 endBlock,
        address owner,
        string campaignName,
        string taxId,
        bool veto
    ) {
        Campaign storage campaign = campaigns[_id];

        startBlock = uint256(campaign.startBlock);
        endBlock = uint256(campaign.endBlock);
        owner = campaign.owner;
        campaignName = campaign.campaignName;
        taxId = campaign.taxId;
        veto = campaign.veto;
    }

    function getToken(uint256 _campaignId, uint64 _tokenIdx)
        public
        view
        returns(
        uint256 campaignId,
        uint64 supply,
        uint64 remaining,
        string name,
        uint256 price
        ){

        Token storage token = campaignTokens[_campaignId][_tokenIdx];

        campaignId = uint256(token.campaignId);
        supply = uint64(token.supply);
        remaining = uint64(token.remaining);
        name = token.name;
        price = uint256(token.price);
        }




    function getCertificate(uint256 _id)
        public
        view
        returns (
        uint128 campaignId,
        uint16 tokenIdx,
        uint64 unitNumber,
        address purchaser
    ) {
        Certificate storage cert = certificates[_id];

        campaignId = uint128(cert.campaignId);
        tokenIdx = uint16(cert.tokenIdx);
        unitNumber = uint16(cert.unitNumber);
        purchaser = cert.purchaser;
    }

    function getTotalCampaignsForOwner(address _owner)
      public
      view
      returns (
      uint256 total
    ){
      total = campaignOwnerTotalCampaigns[_owner];
    }

    function getCampaignIdByOwnerIndex(address _owner, uint256 _index)
      public
      view
      returns (
        uint256 id
      ) {
        id = campaignOwnerToIndexes[_owner][_index];
      }

    // Contract Management
    function changeEscrowAmount(
      uint64 _campaignEscrowAmount
    )
      public
      onlyBy(ownerAddress)
    {
      campaignEscrowAmount = _campaignEscrowAmount;
    }

    function changeBlockDelay(
      uint64 _campaignBlockDelay
    )
      public
      onlyBy(ownerAddress)
    {
      campaignBlockDelay = _campaignBlockDelay;
    }

    function changeOwner(
        address _newOwner
    )
      public
      onlyBy(ownerAddress) {
       ownerAddress = _newOwner;
    }

}