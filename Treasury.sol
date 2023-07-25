// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Define interface for ERC20 tokens
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

// Define interface for each protocol
interface IProtocol {
    function deposit(IERC20 token, uint256 amount) external;
    function withdraw(IERC20 token, uint256 amount) external;
    function yield() external view returns (uint256);
}

// Define the treasury contract
contract Treasury {
    address public owner;
    IProtocol[] public protocols;
    mapping(address => uint256) public allocations;

    constructor(IProtocol[] memory _protocols) {
        owner = msg.sender;
        protocols = _protocols;
    }

    function deposit(IERC20 token, uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        distribute(token, amount);
    }

    function distribute(IERC20 token, uint256 amount) public {
        for (uint i = 0; i < protocols.length; i++) {
            uint256 protocolAmount = amount * allocations[address(protocols[i])] / 100;
            token.approve(address(protocols[i]), protocolAmount);
            protocols[i].deposit(token, protocolAmount);
        }
    }

    function setAllocation(IProtocol protocol, uint256 percentage) external {
        require(msg.sender == owner, "Only owner can set allocation");
        allocations[address(protocol)] = percentage;
    }

    function withdraw(IProtocol protocol, IERC20 token, uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw");
        protocol.withdraw(token, amount);
    }

    function calculateYield() public view returns (uint256 totalYield) {
        for (uint i = 0; i < protocols.length; i++) {
            totalYield += protocols[i].yield();
        }
    }
}
