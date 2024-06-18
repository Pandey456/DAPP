import contractABI from "./abi.json";
import tokenABI from "./tokenABI.json"; // Import token ABI

// Smart contract addresses
const contractAddress = "0x092966dd8BFc8B51C3684456a6a415f6809Ba840";
const tokenContractAddress = "0x15Bbd854fF3203B8B6f7b72058f9DBf2c6707987"; // Token contract address

let web3 = new Web3(window.ethereum);

// Connect to the contracts using web3
let contract = new web3.eth.Contract(contractABI, contractAddress);
let tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress);

async function connectWallet() {
  if (window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      // Check token balance
      const balance = await tokenContract.methods.balanceOf(address).call();

      if (balance <= 0) {
        throw new error(
          "You do not hold the required token to connect to this DApp."
        );
      }

      setConnected(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        console.log("User rejected the connection request.");
      } else {
        console.log("Error message:", error.message);
      }
    }
  } else {
    console.error("No web3 provider detected");
    document.getElementById("connectMessage").innerText =
      "No web3 provider detected. Please install MetaMask.";
  }
}

async function createTweet(content) {
  const accounts = await web3.eth.getAccounts();
  try {
    await contract.methods.createTweet(content).send({ from: accounts[0] });
    displayTweets(accounts[0]);
  } catch (error) {
    console.error("Error creating tweet:", error);
  }
}

async function displayTweets(userAddress) {
  const tweetsContainer = document.getElementById("tweetsContainer");
  let tempTweets = [];
  tweetsContainer.innerHTML = "";
  tempTweets = await contract.methods.getAllTweets(userAddress).call();
  const tweets = [...tempTweets];
  tweets.sort((a, b) => b.timestamp - a.timestamp);
  for (let i = 0; i < tweets.length; i++) {
    const tweetElement = document.createElement("div");
    tweetElement.className = "tweet";

    const userIcon = document.createElement("img");
    userIcon.className = "user-icon";
    userIcon.src = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${tweets[i].author}`;
    userIcon.alt = "User Icon";

    tweetElement.appendChild(userIcon);

    const tweetInner = document.createElement("div");
    tweetInner.className = "tweet-inner";

    tweetInner.innerHTML += `
      <div class="author">${shortAddress(tweets[i].author)}</div>
      <div class="content">${tweets[i].content}</div>
    `;

    const likeButton = document.createElement("button");
    likeButton.className = "like-button";
    likeButton.innerHTML = `
      <i class="far fa-heart"></i>
      <span class="likes-count">${tweets[i].likes}</span>
    `;
    likeButton.setAttribute("data-id", tweets[i].id);
    likeButton.setAttribute("data-author", tweets[i].author);

    addLikeButtonListener(
      likeButton,
      userAddress,
      tweets[i].id,
      tweets[i].author
    );
    tweetInner.appendChild(likeButton);
    tweetElement.appendChild(tweetInner);

    tweetsContainer.appendChild(tweetElement);
  }
}

function addLikeButtonListener(likeButton, address, id, author) {
  likeButton.addEventListener("click", async (e) => {
    e.preventDefault();

    e.currentTarget.innerHTML = '<div class="spinner"></div>';
    e.currentTarget.disabled = true;
    try {
      await likeTweet(author, id);
      displayTweets(address);
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  });
}

function shortAddress(address, startLength = 6, endLength = 4) {
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

async function likeTweet(author, id) {
  const accounts = await web3.eth.getAccounts();
  try {
    await contract.methods.likeTweet(author, id).send({ from: accounts[0] });
  } catch (error) {
    console.error("Error liking tweet:", error);
  }
}

function setConnected(address) {
  document.getElementById("userAddress").innerText =
    "Connected: " + shortAddress(address);
  document.getElementById("connectMessage").style.display = "none";
  document.getElementById("tweetForm").style.display = "block";
  displayTweets(address);
}

document
  .getElementById("connectWalletBtn")
  .addEventListener("click", connectWallet);

document.getElementById("tweetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("tweetContent").value;
  const tweetSubmitButton = document.getElementById("tweetSubmitBtn");
  tweetSubmitButton.innerHTML = '<div class="spinner"></div>';
  tweetSubmitButton.disabled = true;
  try {
    await createTweet(content);
  } catch (error) {
    console.error("Error sending tweet:", error);
  } finally {
    tweetSubmitButton.innerHTML = "Tweet";
    tweetSubmitButton.disabled = false;
  }
});
