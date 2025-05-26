// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMastersItems} from "./interfaces/IMastersItems.sol";

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    struct Role {
        mapping(address => bool) bearer;
    }

    /**
     * @dev Give an account access to this role.
     */
    function add(Role storage role, address account) internal {
        require(!has(role, account), "Roles: account already has role");
        role.bearer[account] = true;
    }

    /**
     * @dev Remove an account's access to this role.
     */
    function remove(Role storage role, address account) internal {
        require(has(role, account), "Roles: account does not have role");
        role.bearer[account] = false;
    }

    /**
     * @dev Check if an account has this role.
     * @return bool
     */
    function has(
        Role storage role,
        address account
    ) internal view returns (bool) {
        require(account != address(0), "Roles: account is the zero address");
        return role.bearer[account];
    }
}

interface IHatchyEgg {
    enum Egg {
        SOLAR,
        LUNAR
    }

    function mintAirdropEgg(Egg egg, uint256 amount, address receiver) external;
}

contract HatchyRewardDealer is
    ReentrancyGuardUpgradeable,
    ContextUpgradeable,
    ERC721HolderUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    using Roles for Roles.Role;

    event SignerAdded(address indexed account);
    event SignerRemoved(address indexed account);

    Roles.Role private _signers;
    address public HatchyEggsGen2;

    mapping(bytes => bool) public UsedSignatures;
    mapping(uint => bool) public UsedVoucherIds;

    modifier onlySigner() {
        require(
            isSigner(_msgSender()),
            "SignerRole: caller does not have the Signer role"
        );
        _;
    }

    modifier sigIsValid(bytes memory sig) {
        require(!UsedSignatures[sig], "blocked signature");
        _;
    }

    function setVoucherUsed(
        uint[] memory voucherIds,
        bool value
    ) external onlySigner {
        for (uint i = 0; i < voucherIds.length; i++) {
            UsedVoucherIds[voucherIds[i]] = value;
        }
    }

    function banSignature(bytes memory sig) external onlyOwner {
        UsedSignatures[sig] = true;
    }

    function isSigner(address account) public view returns (bool) {
        return _signers.has(account);
    }

    function addSigner(address account) public onlySigner {
        _addSigner(account);
    }

    function renounceSigner() public {
        _removeSigner(_msgSender());
    }

    function _addSigner(address account) internal {
        _signers.add(account);
        emit SignerAdded(account);
    }

    function _removeSigner(address account) internal {
        _signers.remove(account);
        emit SignerRemoved(account);
    }

    enum RewardContractType {
        ERC721,
        ERC1155,
        ERC20
    }

    struct Payload {
        RewardContractType rewardContractType;
        address rewardHolderAddress; // which of our accounts hold the reward token right now
        address rewardContract;
        address receiver;
        uint256 tokenId; // only in erc1155 and erc721
        uint256 amount; // only in erc20 and erc1155
        uint256 clabimableUntil; // 0 if any time
        uint256 voucherId;
        bytes signature;
    }
    struct BatchVouchersPayload {
        RewardContractType rewardContractType;
        address rewardHolderAddress; // which of our accounts hold the reward token right now
        address rewardContract;
        address receiver;
        uint256[] tokenIds; // only in erc1155 and erc721
        uint256[] amounts; // only in erc20 and erc1155
        uint256 clabimableUntil; // 0 if any time
        uint256[] voucherIds;
        bytes signature;
    }

    struct HatchyAirdropPayload {
        address receiver;
        uint256 eggType; // 0 or 1 , solar or lunar
        uint256 amount; // how many eggs
        uint256 clabimableUntil; // 0 if any time
        uint256 voucherId;
        bytes signature;
    }

    event Claim(
        address indexed account,
        RewardContractType rewardType,
        address indexed contractAddress,
        uint256 indexed tokenId,
        uint256 amount
    );

    event BatchClaim(
        address indexed account,
        RewardContractType rewardType,
        address indexed contractAddress,
        uint256[] indexed tokenIds,
        uint256[] amounts
    );

    uint256 private constant MAX = ~uint256(0);

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function initialize(address _signer, address gen2Eggs) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __ERC721Holder_init();
        _addSigner(_signer);
        HatchyEggsGen2 = gen2Eggs;
    }

    function mintMastersItems(
        BatchVouchersPayload memory payload
    ) external nonReentrant whenNotPaused {
        require(msg.sender == payload.receiver, "wrong user");
        require(!UsedSignatures[payload.signature], "used signature");
        UsedSignatures[payload.signature] = true;
        for (uint i = 0; i < payload.voucherIds.length; i++) {
            require(!UsedVoucherIds[payload.voucherIds[i]], "used voucher");
            UsedVoucherIds[payload.voucherIds[i]] = true;
        }

        (uint8 v, bytes32 r, bytes32 s) = splitSignature(payload.signature);

        bool signerCheck = isSigner(
            ecrecover(
                toEthSignedMessageHash(encodePackedDataBatch(payload)),
                v,
                r,
                s
            )
        );

        if (signerCheck) {
            if (payload.clabimableUntil > 0) {
                require(block.timestamp < payload.clabimableUntil, "expired!");
            }
            IMastersItems(payload.rewardContract).mintVoucherItems(
                payload.tokenIds,
                payload.amounts,
                payload.receiver
            );
            emit BatchClaim(
                _msgSender(),
                payload.rewardContractType,
                payload.rewardContract,
                payload.tokenIds,
                payload.amounts
            );
        } else {
            revert("bad signer");
        }
    }

    function mintAirdropEgg(
        HatchyAirdropPayload memory payload
    ) external nonReentrant whenNotPaused {
        require(msg.sender == payload.receiver, "wrong user");
        require(!UsedSignatures[payload.signature], "used signature");
        UsedSignatures[payload.signature] = true;
        require(!UsedVoucherIds[payload.voucherId], "used voucher");
        UsedVoucherIds[payload.voucherId] = true;
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(payload.signature);
        if (payload.clabimableUntil > 0) {
            require(block.timestamp < payload.clabimableUntil, "expired!");
        }
        // airdrop signature format is different
        bool signerCheck = isSigner(
            ecrecover(
                toEthSignedMessageHash(
                    keccak256(
                        abi.encodePacked(
                            payload.receiver,
                            payload.eggType,
                            payload.amount,
                            payload.clabimableUntil,
                            payload.voucherId
                        )
                    )
                ),
                v,
                r,
                s
            )
        );
        if (signerCheck) {
            IHatchyEgg(HatchyEggsGen2).mintAirdropEgg(
                payload.eggType == 0
                    ? IHatchyEgg.Egg.SOLAR
                    : IHatchyEgg.Egg.LUNAR,
                payload.amount,
                payload.receiver
            );
        } else {
            revert("bad signer");
        }
    }

    function claimReward(
        Payload memory payload
    ) external nonReentrant whenNotPaused {
        require(msg.sender == payload.receiver, "wrong user");
        require(!UsedSignatures[payload.signature], "used signature");
        UsedSignatures[payload.signature] = true;
        require(!UsedVoucherIds[payload.voucherId], "used voucher");
        UsedVoucherIds[payload.voucherId] = true;

        (uint8 v, bytes32 r, bytes32 s) = splitSignature(payload.signature);

        bool signerCheck = isSigner(
            ecrecover(
                toEthSignedMessageHash(encodePackedData(payload)),
                v,
                r,
                s
            )
        );

        if (signerCheck) {
            if (payload.clabimableUntil > 0) {
                require(block.timestamp < payload.clabimableUntil, "expired!");
            }

            if (payload.rewardContractType == RewardContractType.ERC721) {
                IERC721(payload.rewardContract).safeTransferFrom(
                    payload.rewardHolderAddress,
                    payload.receiver,
                    payload.tokenId
                );
            } else if (
                payload.rewardContractType == RewardContractType.ERC1155
            ) {
                IERC1155(payload.rewardContract).safeTransferFrom(
                    payload.rewardHolderAddress,
                    payload.receiver,
                    payload.tokenId,
                    payload.amount,
                    new bytes(0)
                );
            } else if (payload.rewardContractType == RewardContractType.ERC20) {
                require(
                    IERC20(payload.rewardContract).transferFrom(
                        payload.rewardHolderAddress,
                        payload.receiver,
                        payload.amount
                    ),
                    "transfer err"
                );
            }
        } else {
            revert("bad signer");
        }

        emit Claim(
            _msgSender(),
            payload.rewardContractType,
            payload.rewardContract,
            payload.tokenId,
            payload.amount
        );
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function encodePackedDataBatch(
        BatchVouchersPayload memory payload
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    payload.rewardHolderAddress,
                    payload.rewardContractType,
                    payload.rewardContract,
                    payload.receiver,
                    payload.tokenIds,
                    payload.amounts,
                    payload.clabimableUntil,
                    payload.voucherIds
                )
            );
    }

    function encodePackedData(
        Payload memory payload
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    payload.rewardHolderAddress,
                    payload.rewardContractType,
                    payload.rewardContract,
                    payload.receiver,
                    payload.tokenId,
                    payload.amount,
                    payload.clabimableUntil,
                    payload.voucherId
                )
            );
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function addSignerRole(address account) external onlyOwner {
        _addSigner(account);
    }

    function removeSignerRole(address account) external onlyOwner {
        _removeSigner(account);
    }

    function setGen2Eggs(address gen2Eggs) external onlyOwner {
        HatchyEggsGen2 = gen2Eggs;
    }

    function toEthSignedMessageHash(
        bytes32 hash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
    }
}
