pragma solidity 0.4.18;

import "./IGVCampaign.sol";
// Based on KittyBase.sol
// https://github.com/axiomzen/cryptokitties-bounty/blob/e0d9c2c90964b1bbb242d8e3e0d9a7786cf21182/contracts/KittyBase.sol
contract IGVAssetBase is IGVCampaign{

    event Issue(address indexed purchaser, uint256 certificateId);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenIdx);

    struct Certificate {
        address purchaser;
        uint128 campaignId;
        uint64 unitNumber;
        uint16 tokenIdx;
    }

    Certificate[] certificates;

    mapping (uint256 => address) public certificateIndexToOwner;
    mapping (address => uint256) public ownershipTokenCount;
    mapping (uint256 => address) public certificateIndexToApproved;

    function _transfer(address _from, address _to, uint256 _tokenIdx) internal {
        ownershipTokenCount[_to]++;

        certificateIndexToOwner[_tokenIdx] = _to;
        // New cert _from is 0x0
        if (_from != address(0)) {
            ownershipTokenCount[_from]--;
            // clear any previously approved ownership exchange
            delete certificateIndexToApproved[_tokenIdx];
        }
        // Emit the transfer event.
        Transfer(_from, _to, _tokenIdx);
    }

    function _createCertificate(
        uint128 _campaignId,
        uint16 _tokenIdx,
        uint64 _unitNumber,
        address _purchaser
    )
        internal
        returns (uint)
    {

        Certificate memory _certificate = Certificate({
          campaignId: _campaignId,
          tokenIdx: _tokenIdx,
          unitNumber: _unitNumber,
          purchaser: _purchaser
        });

        campaignTokens[_campaignId][_tokenIdx].remaining--;
        uint256 newCertificateId = certificates.push(_certificate) - 1;

        Issue(
            _purchaser,
            newCertificateId
        );

        _transfer(0, _purchaser, newCertificateId);

        return newCertificateId;
    }
}