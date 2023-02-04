// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.0;

contract ToDoList {
    uint256 public taskCount; // state variable
    address public owner;

    struct Task {
        uint256 id;
        string content;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;

    constructor() public {
        owner = msg.sender;
        createTask("Check out https://www.web3securitydao.xyz/");
    }

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
    }

    function getTaskCount() public view returns (uint256) {
        return taskCount;
    }
}
