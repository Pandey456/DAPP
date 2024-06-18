// SPDX-License-Identifier: MIT pragma solidity ^0.8.0; contract twitter { struct twt{ uint256 id; address author; string content; uint256 timestamp; uint256 likes; } mapping (address => twt[])public tweets; address public owner; constructor(){ owner=msg.sender; } modifier onlyOwner(){ require(msg.sender== owner,"you arent the ownr"); _; } function getTweet(string memory _content)public onlyOwner { require(bytes(_content).length<=20,"long tweet"); twt memory newTwt = twt({ id:tweets[msg.sender].length, author:msg.sender, content: _content, timestamp:block.timestamp, likes:0 }); tweets[msg.sender].push(newTwt); } function likeTweet(address author, uint256 id) external { require(tweets[author][id].id==id,"Not exist"); tweets[author][id].likes++; } function dislikeTweet(address author, uint256 id) external { require(tweets[author][id].id==id,"Not exist"); require(tweets[author][id].likes>0,"Likes dont exist"); tweets[author][id].likes--; } function getAllTweet(address _author) public view returns(twt[] memory){ return tweets[_author]; } }
