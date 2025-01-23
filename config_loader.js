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


function showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => {
        section.style.display = "none";
    });

    const section = document.getElementById(sectionId);
    section.style.display = "block";

    if (sectionId === "hero") {
        startNFTShowcaseAnimation();
    }
}

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
        const response = await fetch('https://miniappservcc.com');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const nftData = await response.json();
        console.log("NFT data received:", nftData);

        if (!nftData.trending || !Array.isArray(nftData.trending.items)) {
            throw new TypeError("Invalid data format: expected 'trending.items' to be an array.");
        }

        const cardsContainer = document.querySelector('.cards');
        cardsContainer.innerHTML = '';

        nftData.trending.items.forEach(nft => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.category = nft.collection;

            card.innerHTML = `
                <img src="${nft.image}" alt="${nft.title}">
                <h3>${nft.title}</h3>
                <p>Price: ${nft.price} XML</p>
                
                <button class="details-button" id="details-${nft.id}">Details 
                    <img class="touch-icon" src="content/touch.png" alt="click"> 
                </button>
            `;

            cardsContainer.appendChild(card);

            const detailsButton = card.querySelector('.details-button');
            detailsButton.addEventListener('click', () => {
                console.log(`Button clicked for NFT ID: ${nft.id}`);
                showNFTDetails(nft.id);
            });
        });

        console.log("NFTs successfully loaded and rendered.");
    } catch (error) {
        console.error('Error loading NFTs:', error);
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
        const response = await fetch("https://miniappservcc.com/");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const trendingData = await response.json();
        console.log("Trending data received from server:", trendingData);

        if (!trendingData.trending || !Array.isArray(trendingData.trending.items)) {
            throw new TypeError("Invalid data format: expected 'trending.items' to be an array.");
        }

        const items = trendingData.trending.items;

        sliderTrack.innerHTML = "";

        items.forEach((nft) => {
            const slide = document.createElement("div");
            slide.classList.add("slider-item");

            slide.innerHTML = `
                <div class="slider-card">
                    <img src="${nft.image}" alt="${nft.title}">
                    <div class="slider-card-overlay">
                        <h3>${nft.title}</h3>
                        <p>Price: ${nft.price} XML</p>
                        <p>Collection: ${nft.collection}</p>
                    </div>
                </div>
            `;

            slide.addEventListener("click", () => {
                console.log(`Card clicked for NFT ID: ${nft.id}`);
                showNFTDetails(nft.id);
            });

            sliderTrack.appendChild(slide);
        });

        console.log("Trending NFTs successfully loaded and rendered.");
    } catch (error) {
        console.error("Error loading trending NFTs from the server:", error);
    }
}

async function showNFTDetails(id) {
    try {
        const response = await fetch('https://miniappservcc.com/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const trendingData = await response.json();

        if (!trendingData.trending || !Array.isArray(trendingData.trending.items)) {
            throw new TypeError("Invalid data format: expected 'trending.items' to be an array.");
        }

        const nft = trendingData.trending.items.find(item => item.id === Number(id));

        if (nft) {
            document.getElementById('nft-title').textContent = nft.title;
            document.getElementById('nft-image').src = nft.image;
            document.getElementById('nft-description').textContent = `Collection: ${nft.collection}`;
            document.getElementById('nft-price').textContent = `Price: ${nft.price} XML`;

            const panelContent = document.querySelector('.panel-content');
            let buyButton = document.querySelector('.buy-nft-button');

            if (buyButton) {
                buyButton.remove();
            }

            buyButton = document.createElement('button');
            buyButton.classList.add('buy-nft-button');
            buyButton.innerHTML = `Buy <img class="touch-icon" src="content/touch.png" alt="click">`;

            buyButton.addEventListener('click', () => {
                sendDataToTelegram(nft.id);
            });

            panelContent.appendChild(buyButton);

            const closeButton = document.querySelector('.close-panel');
            closeButton.addEventListener('click', closeNFTDetails);

            document.getElementById('nftDetailsPanel').classList.add('show');
        } else {
            console.error(`NFT id=${id} not found!`);
        }
    } catch (error) {
        console.error('Error loading NFT details:', error);
    }
}

function sendDataToTelegram(nftId) {
    if (Telegram.WebApp) {
        const wallet = localConfig.wallet;

        const data = JSON.stringify({
            wallet: wallet,
            nft_id: nftId
        });

        Telegram.WebApp.sendData(data);

        console.log('Data sent to Telegram:', data);
    } else {
        console.error('Telegram WebApp is not available.');
    }
}

function closeNFTDetails() {
    const panel = document.getElementById("nftDetailsPanel");
    panel.classList.remove("show");
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
    try {
        const pathSegments = window.location.pathname.split("/");
        const userId = pathSegments[pathSegments.length - 1];

        if (!userId) {
            console.error("User ID not found in the URL.");
            return;
        }

        const userData = await getUserData(userId);

        if (userData) {
            updateWalletInfo(userData.wallet, userData.balance);
        } else {
            console.error("Failed to load user data.");
        }

        const config = await getConfig(false);

        if (config) {
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

            // Загрузка дополнительных данных
            await loadNFTs();
            await loadTrendingNFTs();
            await createCategories();
        }
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}


async function createCategories() {
    const sliderList = document.querySelector(".slider-category-list");

    if (sliderList) {
        categories.forEach(category => {
            const button = document.createElement("button");
            button.classList.add("slider-category-item");
            button.textContent = category;
            sliderList.appendChild(button);
        });

        initializeSlider();
        await loadCategories();
    } else {
        console.error("Element with class 'slider-category-list' not found in DOM.");
    }
}

const cardsContainer = document.getElementById("category-list");

async function loadCategories() {

    try {
        const response = await fetch('categories_nft_config.json');
        if (!response.ok) {
            console.error("Failed to load JSON file:", response.status, response.statusText);
            return;
        }

        const nftItems = await response.json();

        nftItems.forEach((nft) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.dataset.category = nft.category;

            card.innerHTML = `
                <div class="image-container">
                    <div class="loading-spinner"></div>
                    <img data-src="${nft.image}" alt="${nft.name}" class="lazy-img">
                </div>
                <h3>${nft.name}</h3>
                <p>Price: ${nft.price}</p>
                <button class="details-button" id="details-${nft.id}">
                    Details 
                    <img class="touch-icon" src="content/touch.png" alt="click">
                </button>
            `;

            cardsContainer.appendChild(card);
        });

        lazyLoadImages();
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".lazy-img");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                // if (entry.isIntersecting) {
                    const img = entry.target;
                    console.log("Loading image:", img.dataset.src);
                    img.src = img.dataset.src;
                    img.onload = () => {
                        img.previousElementSibling.style.display = "none";
                        img.style.display = "block";
                    };
                    img.onerror = () => {
                        console.error("Failed to load image:", img.dataset.src);
                        img.previousElementSibling.style.display = "none";
                        img.src = "https://placehold.co/200x200?text=Error";
                    };
                    observer.unobserve(img);
                // }
            });
        },
        { threshold: 0.1 }
    );

    lazyImages.forEach((img) => observer.observe(img));
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
