# I Gave ERC-721 DAPP

This DAPP enables the tokenization of charitable donations.
### Contracts
##### IGVCampaign
Contains the internal functions for creating campaigns and donation tokens.

Tracks the following mappings:
```
campaignIndexToOwner
campaignOwnerToIndexes
campaignOwnerTotalCampaigns
campaignEscrowBalance
campaignBalance
campaignTokens
campaignTokenCount
```
##### IGVBase
Contains the internal functions to create and issue campaign certificates.

```
    struct Certificate {
        address purchaser;
        uint256 timestamp;
        uint128 campaignId;
        uint64 unitNumber;
        uint16 tokenIdx;
    }
```

##### IGVAsset
Contains the ERC-721 logic.
