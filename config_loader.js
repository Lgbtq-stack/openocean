// import {getAccountBalance} from "./backend/stellar_helper";
// import {get_config} from "./backend/datacontoller";

const check_token = "CZI:GAATAURKW525OLU4LE27QB5FSM4PQXDSTJ6YEG7E7E6GA2FCWORUSA6Y";

const localConfig = {
    wallet: {
        address: "0x123456789abcdef123456789abcdef123456789a",
        balance: "1000"
    },
    purchasedNFTs: [
        {
            id: "1",
            title: "Abstract Waves",
            category: "Art",
            price: "0.02",
            currency: "ETH",
            image: "content/nft_1.png"
        },
        {
            id: "2",
            title: "Urban House",
            category: "Gaming",
            price: "0.25",
            currency: "ETH",
            image: "content/nft_5.png"
        },
        {
            id: "3",
            title: "Winter Serenity",
            category: "Photography",
            price: "0.4",
            currency: "ETH",
            image: "content/nft_3.png"
        }
    ]
};

function getConfigFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedConfig = urlParams.get("config");

    if (encodedConfig) {
        try {
            const decodedConfig = decodeURIComponent(encodedConfig);
            return JSON.parse(decodedConfig);
        } catch (error) {
            console.error("Error decoding config:", error);
            return null;
        }
    }

    console.warn("No config parameter found in URL. Using local config.");
    return localConfig;
}

async function getConfig(useLocalConfig = true) {
    let remoteConfig = null;

    try {
        if (useLocalConfig) {
            console.warn("Using local configuration.");
            remoteConfig = {...localConfig};
        } else {
            const configFromURL = getConfigFromURL();
            console.log("Config from URL:", configFromURL);

            if (configFromURL) {
                remoteConfig = await get_config(configFromURL);
            } else {
                console.warn("No config found in URL, falling back to localConfig.");
                remoteConfig = {...localConfig};
            }
        }

        if (!remoteConfig.wallet || !remoteConfig.wallet.address) {
            showPopup("You don't have an active wallet. ⚠️", false);
            return null;
        }

        if (useLocalConfig) {
            console.log("Using local balance:", remoteConfig.wallet.balance);
        } else {
            console.log("Fetching balances for wallet:", remoteConfig.wallet.address);
            const all_balances = await getAccountBalance(remoteConfig.wallet.address);
            const balance = all_balances[check_token];

            if (balance === undefined) {
                console.error("No balance found for check_token");
                showPopup("Please add trustline to your wallet for the CZI token. 🛠", false);
                return null;
            }

            remoteConfig.wallet.balance = 10000;
        }

        return remoteConfig;
    } catch (error) {
        console.error("Error loading config:", error);
        showPopup("Failed to load configuration. Using local config as fallback. ⚠️", false);
        return {...localConfig}; // Используем локальный конфиг как fallback
    }
}

function updateWalletInfo(walletAddress, balance) {
    document.getElementById("wallet-address").textContent = `Wallet: ${walletAddress}`;


    document.getElementById("wallet-balance").textContent = `Balance: ${balance} XML`;
}

async function initializeApp() {
    const config = await getConfig(true);

    if (config) {
        updateWalletInfo(config.wallet.address, config.wallet.balance);

        const nftContainer = document.querySelector(".purchased-nfts");

        if (nftContainer) {
            nftContainer.innerHTML = "";

            if (config.purchasedNFTs.length > 0) {
                config.purchasedNFTs.forEach((nft, index) => {
                    const nftCard = document.createElement("div");
                    nftCard.classList.add("card", `nft-card-${nft.id || index}`);
                    nftCard.id = `nft-${nft.id || index}`;
                    nftCard.innerHTML = `
                                            <img src="${nft.image}" alt="${nft.title}">
                                            <h3>${nft.title}</h3>
                                            <p>Category: ${nft.category}</p>
                                            <p>Price: ${nft.price} ${nft.currency}</p>
                                        `;
                    nftContainer.appendChild(nftCard);
                });

            } else {
                nftContainer.innerHTML = `
                    <div class="no-nfts">
                        <p>NFTs you own will be displayed here, for now you dont have any.</p>
                        <button class="cta" onclick="showSection('trending')">Explore NFTs</button>
                    </div>
                `;
            }
        } else {
            console.error("Element with class 'purchased-nfts' not found in DOM.");
        }
    }
}

document.addEventListener("DOMContentLoaded", initializeApp);

function showPopup(message, isSuccess) {
    alert(message);
}
