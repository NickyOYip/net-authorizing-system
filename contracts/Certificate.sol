// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Certificate 合約
 * @notice 此合約代表去中心化身份系統中的證書，負責管理證書的啟用、加密數據、狀態與失效時間。
 */
contract Certificate is Ownable {
    // 用戶地址，證書啟用後會綁定到此地址
    address public userAddress;

    // 加密後的證書數據，使用機構私鑰與用戶的檢視碼進行加密
    string private data;

    // 證書文件的雜湊值，用於驗證數據完整性
    bytes32 public hash;

    // 啟用證書所需的啟用碼
    string private activationCode;

    // 證書的啟用時間限制（預設為 1 天）
    uint256 public activeTimeLimit;

    // 證書狀態：0 = 未啟用，1 = 已啟用，2 = 已停用
    enum State {Inactive, Active, Disabled}
    State public state;

    // 證書的失效時間戳
    uint256 public disableTime;

    // 事件：用於追蹤證書的變化
    event CertificateActivated(address indexed user);
    event StateUpdated(State newState);
    event DataUpdated();

    /**
     * @notice 證書合約建構函數
     * @param _hash 證書文件的雜湊值
     * @param _activationCode 啟用證書所需的啟用碼
     */
    constructor(bytes32 _hash, string memory _activationCode) {
        hash = _hash;
        activationCode = _activationCode;
        activeTimeLimit = block.timestamp + 1 days; // 預設啟用期限：1 天
        state = State.Inactive;
    }

    /**
     * @notice 啟用證書
     * @dev 僅限擁有者呼叫，證書啟用後會綁定到用戶地址
     * @param _userAddress 用戶錢包地址
     * @param _activationCode 啟用碼，用於驗證啟用權限
     */
    function activateCertificate(address _userAddress, string memory _activationCode) external onlyOwner {
        require(state == State.Inactive, "證書已啟用或已停用");
        require(keccak256(abi.encodePacked(_activationCode)) == keccak256(abi.encodePacked(activationCode)), "啟用碼錯誤");
        require(block.timestamp <= activeTimeLimit, "已超過啟用時限");

        userAddress = _userAddress;
        state = State.Active;
        emit CertificateActivated(_userAddress);
    }

    /**
     * @notice 更新證書狀態
     * @dev 可將證書設為已停用
     * @param _newState 新的證書狀態（0 = 未啟用，1 = 已啟用，2 = 已停用）
     * @param _disableTime 設定證書失效的時間戳
     */
    function updateState(State _newState, uint256 _disableTime) external onlyOwner {
        state = _newState;
        disableTime = _disableTime;
        emit StateUpdated(_newState);
    }

    /**
     * @notice 取得加密後的證書數據
     * @return 返回加密的證書數據，僅在證書啟用後可查看
     */
    function getCertificate() external view returns (string memory) {
        require(state == State.Active, "證書尚未啟用");
        return data;
    }

    /**
     * @notice 更新證書數據
     * @dev 只有證書持有人可以更新加密數據（例如：更新檢視碼後需重新加密）
     * @param _newData 新的加密證書數據
     */
    function updateData(string memory _newData) external {
        require(msg.sender == userAddress, "僅證書持有人可更新數據");
        data = _newData;
        emit DataUpdated();
    }
}
