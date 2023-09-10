// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract HashedTimeLock {
    struct Swap {
        address sender;             // 发起者的地址
        address receiver;           // 接收者的地址
        uint256 amount;             // 代币数量
        address tokenAddress;       // 代币地址，0x0 表示以太币，其他为 ERC20 或 ERC721 代币地址
        bytes32 hashedSecret;       // 加密后的密钥
        uint256 lockTime;           // 锁定的时间戳
        bool executed;              // 交换是否已执行
        bool secretRevealed;        // 密钥是否已揭示
    }

    mapping(bytes32 => Swap) public swaps;  // 用于存储交换信息的映射

    event NewSwap(
        bytes32 indexed swapId,
        address indexed sender,
        address indexed receiver,
        address tokenAddress,
        uint256 amount,
        uint256 lockTime
    );
    event ExecuteSwap(bytes32 indexed swapId);
    event RevealSecret(bytes32 indexed swapId);

    // 创建交换
    function createSwap(
        bytes32 swapId,
        address receiver,
        address tokenAddress,
        uint256 amount,
        bytes32 hashedSecret,
        uint256 lockTime
    ) external payable {
        require(swaps[swapId].sender == address(0), "Swap already exists");

        if (tokenAddress == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20 token = IERC20(tokenAddress);
            
            require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        }
        
        swaps[swapId] = Swap({
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            tokenAddress: tokenAddress,
            hashedSecret: hashedSecret,
            lockTime: lockTime,
            executed: false,
            secretRevealed: false
        });

        emit NewSwap(swapId, msg.sender, receiver, tokenAddress, amount, lockTime);
    }

    // 执行交换
    function executeSwap(bytes32 swapId, bytes32 secret) external {
        Swap storage swap = swaps[swapId];
        require(!swap.executed, "Swap already executed");
        require(block.timestamp >= swap.lockTime, "Lock time not reached");
        require(keccak256(abi.encodePacked(secret)) == swap.hashedSecret, "Invalid secret");

        swap.executed = true;

        if (swap.tokenAddress == address(0)) {
            payable(swap.receiver).transfer(swap.amount);
        } else {
            IERC20 token = IERC20(swap.tokenAddress);
            require(token.transfer(swap.receiver, swap.amount), "Token transfer failed");
        }

        emit ExecuteSwap(swapId);
    }

    // 获取余额
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        if (tokenAddress == address(0)) {
            // 查询ETH余额
            return address(this).balance;
        } else {
            IERC20 token = IERC20(tokenAddress);
            return token.balanceOf(address(this));
        }
    }

    // 揭示密钥
    function revealSecret(bytes32 swapId, bytes32 secret) external {
        Swap storage swap = swaps[swapId];
        require(!swap.secretRevealed, "Secret already revealed");
        require(keccak256(abi.encodePacked(secret)) == swap.hashedSecret, "Invalid secret");

        swap.secretRevealed = true;

        emit RevealSecret(swapId);
    }
}
