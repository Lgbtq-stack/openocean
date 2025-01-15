// import {getAccountBalance} from "./backend/stellar_helper";
// import {get_config} from "./backend/datacontoller";


const check_token = "CZI:GAATAURKW525OLU4LE27QB5FSM4PQXDSTJ6YEG7E7E6GA2FCWORUSA6Y";

const categories = ["All", "Art", "Photography", "Gaming", "Music", "Collectibles"];

const localConfig = {
    wallet: {
        address: "0x123456789abcdef123456789abcdef123456789a",
        balance: "1000"
    },
    trendingNFTs: [1,2,3],
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
        }

        return remoteConfig;
    } catch (error) {
        console.error("Error loading config:", error);
        showPopup("Failed to load configuration. Using local config as fallback. ⚠️", false);
        return {...localConfig};
    }
}

function updateWalletInfo(walletAddress, balance) {
    document.getElementById("wallet-address").textContent = `Wallet: ${walletAddress}`;


    document.getElementById("wallet-balance").textContent = `Balance: ${balance} XML`;
}

async function loadNFTs() {
    try {
        const response = await fetch('nft_config.json');
        const nftData = await response.json();

        const cardsContainer = document.querySelector('.cards');
        cardsContainer.innerHTML = '';

        nftData.forEach(nft => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.category = nft.category;

            card.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}">
                <h3>${nft.name}</h3>
                <p>Price: ${nft.price}</p>
                
                <button class="details-button" id="details-${nft.id}">Details 
                    <img class="touch-icon" src="content/touch.png" alt="click"> 
                </button>
            `;

            cardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки данных NFT:', error);
    }
}

let currentIndex = 0;
let totalSlides = 0;

const sliderTrack = document.getElementById("sliderTrack");

function showNextSlide() {
    const slides = document.querySelectorAll(".slider-card img");
    totalSlides = slides.length;

    if (totalSlides === 0) {
        console.warn("No slides found!");
        return;
    }

    currentIndex = (currentIndex + 1) % totalSlides;
    sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
}

async function loadTrendingNFTs() {
    try {
        const response = await fetch("nft_config.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const nftData = await response.json();
        console.log("Loaded NFT data:", nftData);

        const trendingNFTs = nftData.filter((nft) =>
            localConfig.trendingNFTs.includes(Number(nft.id))
        );

        if (trendingNFTs.length === 0) {
            console.warn("No matching trending NFTs found!");
            return;
        }

        sliderTrack.innerHTML = "";

        trendingNFTs.forEach((nft) => {
            const slide = document.createElement("div");
            slide.classList.add("slider-item");
            slide.innerHTML = `
                <div class="slider-card" onclick="showNFTDetails(${nft.id})">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="slider-card-overlay">
                        <h3>${nft.name}</h3>
                        <p>Price: ${nft.price}</p>
                    </div>
                </div>
            `;
            sliderTrack.appendChild(slide);
        });

        console.log("Trending NFTs successfully loaded:", trendingNFTs);

    } catch (error) {
        console.error("Ошибка загрузки трендовых NFT:", error);
    }
}

function showNFTDetails(id) {
    const nft = localConfig.trendingNFTs.find(item => item.id === id.toString());

    if (nft) {
        document.getElementById("nft-title").textContent = nft.title;
        document.getElementById("nft-image").src = nft.image;
        document.getElementById("nft-description").textContent = nft.category;
        document.getElementById("nft-price").textContent = `Price: ${nft.price} ${nft.currency}`;
        document.getElementById("nftDetailsPanel").style.display = "flex";
    } else {
        console.error(`NFT с id=${id} не найдено.`);
    }
}

function closeNFTDetails() {
    document.getElementById("nftDetailsPanel").style.display = "none";
}

const popup = document.getElementById("popup-module");
const closePopupButton = document.getElementById("popup-close");

function showPopup(message, canClose = true) {
    if (popup) {
        const messageElement = popup.querySelector("p");
        if (messageElement) {
            messageElement.textContent = message;
        }

        popup.style.display = "flex";
        closePopupButton.style.display = canClose ? "block" : "none";

        if (canClose) {
            closePopupButton.onclick = () => {
                popup.style.display = "none";
            };
        }
    }
}

async function initializeApp() {
    const config = await getConfig(true);

    if (config) {
        updateWalletInfo(config.wallet.address, config.wallet.balance);

        const nftContainer = document.querySelector(".purchased-nfts");
        createCategories();
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

        await loadNFTs();
        await loadTrendingNFTs();
    }
}

function createCategories() {
    const sliderList = document.querySelector(".slider-category-list");

    if (sliderList) {
        categories.forEach(category => {
            const button = document.createElement("button");
            button.classList.add("slider-category-item");
            button.textContent = category;
            sliderList.appendChild(button);
        });

        // document.getElementById("categories").style.display = "block";
        initializeSlider();
    } else {
        console.error("Element with class 'slider-category-list' not found in DOM.");
    }
}

function initializeSlider() {
    const sliderWrapper = document.querySelector(".slider-wrapper");
    const prevArrow = document.querySelector(".slider-control.prev");
    const nextArrow = document.querySelector(".slider-control.next");

    function updateArrows() {
        const scrollLeft = sliderWrapper.scrollLeft;
        const maxScrollLeft = sliderWrapper.scrollWidth - sliderWrapper.clientWidth;

        prevArrow.style.visibility = scrollLeft <= 0 ? "hidden" : "visible";
        nextArrow.style.visibility = scrollLeft >= maxScrollLeft ? "hidden" : "visible";
    }

    function moveSlider(offset) {
        sliderWrapper.scrollBy({ left: offset, behavior: "smooth" });
        setTimeout(updateArrows, 300);
    }

    prevArrow.addEventListener("click", () => moveSlider(-1000));
    nextArrow.addEventListener("click", () => moveSlider(1000));

    let isDragging = false;
    let startX = 0;

    sliderWrapper.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        sliderWrapper.style.cursor = "grabbing";
    });

    sliderWrapper.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        sliderWrapper.scrollLeft += startX - e.clientX;
        startX = e.clientX;
        updateArrows();
    });

    sliderWrapper.addEventListener("mouseup", () => {
        isDragging = false;
        sliderWrapper.style.cursor = "grab";
    });

    sliderWrapper.addEventListener("mouseleave", () => {
        isDragging = false;
        sliderWrapper.style.cursor = "grab";
    });

    updateArrows();
}

setInterval(showNextSlide, 5000);

document.addEventListener("DOMContentLoaded", initializeApp);
