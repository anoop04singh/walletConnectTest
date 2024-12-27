import { createAppKit } from '@reown/appkit';
import { sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ethers } from 'ethers';

// Replace with your contract details
const contractAddress = "0xDb90f9280fC9c5E3849832766c4F96E9B294E084";
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ERC721EnumerableForbiddenBatchMint","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"ERC721OutOfBoundsIndex","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"BalanceAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"GiftCardMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"balanceRedeemed","type":"uint256"}],"name":"GiftCardRedeemed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"string","name":"proof","type":"string"}],"name":"addBalance","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"string","name":"proof","type":"string"}],"name":"viewBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"},{"internalType":"string","name":"proof","type":"string"}],"name":"redeemGiftCard","outputs":[],"stateMutability":"nonpayable","type":"function"}];

let contract;
let signer;
let currentTokenId;
let currentProof;

// Replace with your Project ID from Reown Cloud
const projectId = '1e15a9d15c5cc0995daf2ccacab63326';

// Initialize Wagmi Adapter for Sepolia
const networks = [sepolia];
const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
});

const metadata = {
    name: 'HashCards',
    description: 'Integration of HashCards with Reown AppKit',
    url: 'http://localhost:5173',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Create AppKit Modal
const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    metadata,
    projectId,
    features: {
        analytics: true,
    },
});

// DOM Elements
const walletConnectScreen = document.getElementById('wallet-connect');
const initialScreen = document.getElementById('initial-screen');
const manualEntryScreen = document.getElementById('manual-entry');
const dashboardScreen = document.getElementById('dashboard');
const addBalanceScreen = document.getElementById('add-balance');

// Event Listeners for Wallet Connection
document.getElementById('open-connect-modal').addEventListener('click', async () => {
    try {
        console.log("Opening Reown wallet connection modal...");
        await modal.open(); // Open Reown wallet connection modal
        console.log("Wallet connection successful. Initializing contract...");
        await initializeContract(); // Initialize the contract after wallet connection
        console.log("Contract initialized successfully. Transitioning to initial screen...");
        transitionTo(initialScreen); // Show the next step (scan or manual entry options)
    } catch (error) {
        console.error("Error during wallet connection or contract initialization:", error);
        alert("Failed to connect wallet or initialize contract. Check the console for more details.");
    }
});

document.getElementById('open-network-modal').addEventListener('click', () => modal.open({ view: 'Networks' }));

// Initialize Contract
async function initializeContract() {
    console.log("Checking Ethereum provider...");
    if (!window.ethereum) {
        console.error("Ethereum provider (e.g., MetaMask) not found.");
        alert("Please install MetaMask or another Ethereum wallet provider.");
        return;
    }

    try {
        console.log("Requesting wallet access...");
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Wallet access granted. Setting up provider and signer...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Contract instance created successfully.");
    } catch (error) {
        console.error("Error during contract initialization:", error);
        throw error; // Re-throw to handle in parent function
    }
}

// Attach functions to the window object for global access
window.scanNFC = async function () {
    if ('NDEFReader' in window) {
        try {
            console.log("Starting NFC scan...");
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.addEventListener("reading", ({ message }) => {
                console.log("NFC data received. Parsing...");
                const decoder = new TextDecoder();
                const data = JSON.parse(decoder.decode(message.records[0].data));
                currentTokenId = data.tokenId;
                currentProof = data.proof;
                console.log("NFC data parsed successfully. Token ID:", currentTokenId, "Proof:", currentProof);
                loadCardDetails();
            });
        } catch (error) {
            console.error("Error during NFC scan:", error);
            alert("NFC scanning failed: " + error);
        }
    } else {
        console.warn("NFC not supported on this device or browser.");
        alert("NFC not supported. Please enter details manually.");
        window.showManualEntry(); // Use window.showManualEntry for consistency
    }
};

window.showManualEntry = function () {
    console.log("Transitioning to manual entry screen...");
    transitionTo(manualEntryScreen);
};

window.loadCardDetails = async function () {
    try {
        console.log("Fetching card balance from contract...");
        const balance = await contract.viewBalance(currentTokenId, currentProof);
        document.getElementById('cardBalance').textContent = ethers.formatEther(balance);
        console.log("Card balance fetched successfully:", balance);
        transitionTo(dashboardScreen); // Show dashboard
    } catch (error) {
        console.error("Error loading card details:", error);
        alert("Error loading card: " + error.message);
    }
};

// Update window.loadCard to call window.loadCardDetails correctly
window.loadCard = async function () {
    currentTokenId = document.getElementById('tokenId').value;
    currentProof = document.getElementById('proof').value;
    console.log("Loading card details. Token ID:", currentTokenId, "Proof:", currentProof);
    await window.loadCardDetails(); // Ensure this calls the globally accessible function
};


// Attach showAddBalance to the global scope
window.showAddBalance = function () {
    console.log("Transitioning to add balance screen...");
    transitionTo(addBalanceScreen);
};

// Attach addBalance to the global scope
window.addBalance = async function () {
    const amount = document.getElementById('amount').value;
    try {
        console.log("Adding balance to card. Amount:", amount);
        const tx = await contract.addBalance(
            currentTokenId,
            currentProof,
            { value: ethers.parseEther(amount) }
        );
        await tx.wait();
        console.log("Balance added successfully. Reloading card details...");
        alert("Balance added successfully!");
        await window.loadCardDetails(); // Reload the card details after adding balance
        transitionTo(dashboardScreen); // Return to dashboard
    } catch (error) {
        console.error("Error adding balance:", error);
        alert("Error adding balance: " + error.message);
    }
};


window.redeemCard = async function () {
    try {
        console.log("Redeeming card. Token ID:", currentTokenId, "Proof:", currentProof);
        const tx = await contract.redeemGiftCard(currentTokenId, currentProof);
        await tx.wait();
        console.log("Card redeemed successfully.");
        alert("Card redeemed successfully!");
        window.location.reload();
    } catch (error) {
        console.error("Error redeeming card:", error);
        alert("Error redeeming card: " + error.message);
    }
};




// Helper: Transition Between Screens
function transitionTo(targetScreen) {
    console.log("Transitioning to new screen...");
    walletConnectScreen.classList.add('hidden');
    initialScreen.classList.add('hidden');
    manualEntryScreen.classList.add('hidden');
    dashboardScreen.classList.add('hidden');
    addBalanceScreen.classList.add('hidden');

    // Show the target screen
    targetScreen.classList.remove('hidden');
    console.log("Transitioned to:", targetScreen.id);
}
