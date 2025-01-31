// import {getAccountBalance} from "./backend/stellar_helper";
// import {get_config} from "./backend/datacontoller";

const userId = "350104566";

let userDataCache = {
    data: null,
    timestamp: 0,
    ttl: 300000
};

let categoriesCache = [];

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

    if (sectionId === "my-nfts") {
        fetchUserNFTs(userId);
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

function updateWalletInfo(nickname, balance) {
    document.getElementById("wallet-address").textContent = `User: ${nickname}`;
    document.getElementById("wallet-balance").textContent = `Balance: ${balance} XML`;
}

async function loadCategoriesOnce() {
    if (categoriesCache.length > 0) {
        console.log("Using cached categories.");
        return categoriesCache;
    }

    try {
        const response = await fetch("https://miniappservcc.com/api/collections");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const collectionsData = await response.json();
        if (!Array.isArray(collectionsData.collections)) {
            throw new TypeError("Invalid data format: expected 'collections' to be an array.");
        }

        categoriesCache = [{ id: "", name: "All" }, ...collectionsData.collections.map(c => ({
            id: c.meta.id,
            name: c.meta.name,
        }))];

        console.log("Categories loaded and cached:", categoriesCache);
        return categoriesCache;
    } catch (error) {
        console.error("Error loading categories:", error);
        return [];
    }
}

async function loadNFTs() {
    try {
        const response = await fetch("https://miniappservcc.com/api/trends");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const trendingData = await response.json();
        console.log("Trending data received from server:", trendingData);

        if (!Array.isArray(trendingData.trending)) {
            throw new TypeError("Invalid data format: expected 'trending' to be an array.");
        }

        const items = trendingData.trending;

        const cardsContainer = document.querySelector('.cards');
        if (!cardsContainer) {
            throw new Error("Element with class 'cards' not found in DOM.");
        }

        cardsContainer.innerHTML = "";

        items.forEach((nft) => {
            const card = document.createElement("div");
            card.classList.add("card");
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
                showNFTDetails(nft.id, items);
            });
        });

        console.log("NFTs successfully loaded and rendered.");
    } catch (error) {
        console.error("Error loading NFTs:", error);
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
        const response = await fetch("https://miniappservcc.com/api/trends");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const trendingData = await response.json();
        console.log("Trending data received from server:", trendingData);

        if (!Array.isArray(trendingData.trending)) {
            throw new TypeError("Invalid data format: expected 'trending' to be an array.");
        }

        const items = trendingData.trending.slice(0, 4);

        const sliderTrack = document.getElementById("sliderTrack");
        if (!sliderTrack) {
            throw new Error("Element with ID 'sliderTrack' not found in DOM.");
        }

        sliderTrack.innerHTML = "";

        items.forEach((nft) => {
            const slide = document.createElement("div");
            slide.classList.add("slider-item");

            slide.innerHTML = `
                <div class="slider-card">
                    <img src="${nft.image}" alt="${nft.title}">
                    <div class="slider-card-overlay">
                        <h3>${nft.title}</h3>
                        <p>Price: ${nft.price}</p>
                        <p>Collection: ${nft.collection}</p>
                    </div>
                </div>
            `;

            slide.addEventListener("click", () => {
                console.log(`Card clicked for NFT ID: ${nft.id}`);
                showNFTDetails(nft.id, items);
            });

            sliderTrack.appendChild(slide);
        });

        console.log("Trending NFTs successfully loaded and rendered.");
    } catch (error) {
        console.error("Error loading trending NFTs from the server:", error);
    }
}

async function showNFTDetails(id, dataSource) {
    try {
        if (!dataSource || !Array.isArray(dataSource)) {
            throw new TypeError("Invalid dataSource: expected an array of objects.");
        }

        const nft = dataSource.find((item) => item.id === Number(id));

        if (nft) {
            document.getElementById('nft-title').textContent = nft.title;
            document.getElementById('nft-image').src = nft.image;
            document.getElementById('nft-holders').textContent = `Holders: ${nft.userCount}`;
            document.getElementById('nft-total-bought').textContent = `Total Bought: ${nft.totalBought}`;

            const categoryElement = document.getElementById('nft-category');
            if (nft.collection) {
                categoryElement.textContent = `Collection: ${nft.collection}`;
                categoryElement.style.display = "block";
            } else {
                categoryElement.style.display = "none";
            }

            const collectionElement = document.getElementById('nft-description');
            if (nft.description) {
                collectionElement.textContent = `Description: ${nft.description}`;
                collectionElement.style.display = "block";
            } else {
                collectionElement.style.display = "none";
            }
            document.getElementById('nft-price').textContent = `Price: ${nft.price} XML`;

            const panelContent = document.querySelector('.panel-content');
            let buyButton = document.querySelector('.buy-nft-button');

            if (buyButton) {
                buyButton.remove();
            }

            let nftCount = 1;

            document.getElementById('increase-count').addEventListener('click', () => {
                nftCount++;
                document.getElementById('nft-count-display').textContent = nftCount;
            });

            document.getElementById('decrease-count').addEventListener('click', () => {
                if (nftCount > 1) {
                    nftCount--;
                    document.getElementById('nft-count-display').textContent = nftCount;
                }
            });

            buyButton = document.createElement('button');
            buyButton.classList.add('buy-nft-button');
            buyButton.innerHTML = `Buy`;

            buyButton.addEventListener('click', () => {

                // sendDataToTelegram("350104566", nftId, nftCount);
                sendDataToTelegramTest(userId, nft.id, nftCount);

            });

            panelContent.appendChild(buyButton);

            const closeButton = document.querySelector('.close-panel');
            closeButton.addEventListener('click', closeNFTDetails);

            document.getElementById('nftDetailsPanel').classList.add('show');
        } else {
            console.error(`NFT with id=${id} not found in the provided data source.`);
        }
    } catch (error) {
        console.error('Error loading NFT details:', error);
    }
}

function sendDataToTelegram(user_id, nft_id, count) {
    if (Telegram.WebApp) {

        const data = JSON.stringify({
            user_id: user_id,
            nft_id: nft_id,
            count: count,
        });

        Telegram.WebApp.sendData(data);

        console.log('Data sent to Telegram:', data);
    } else {
        console.error('Telegram WebApp is not available.');
    }
}

async function sendDataToTelegramTest(user_id, nft_id, count) {
    try {
        const apiUrl = `https://miniappservcc.com/api/nft/buy?uid=${user_id}&nft_id=${nft_id}&count=${count}`;
        const response = await fetch(apiUrl, {
            method: "GET"
        });

        if (!response.ok) throw new Error(`Failed to buy NFT: ${response.status}`);
        const result = await response.json();
        console.log("NFT purchase successful:", result);
        alert("Purchase successful!");
    } catch (error) {
        console.error("Error during NFT purchase:", error);
        alert("Purchase failed. Please try again.");
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

async function fetchUserData(userId) {
    try {
        const currentTime = new Date().getTime();

        if (userDataCache.data && (currentTime - userDataCache.timestamp) < userDataCache.ttl) {
            console.log("Using cached data");
            displayUserInfo(userDataCache.data);
            return userDataCache.data;
        }

        const apiUrl = `https://miniappservcc.com/api/user?uid=${userId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);

        const data = await response.json();

        userDataCache = {
            data: data,
            timestamp: currentTime,
            ttl: userDataCache.ttl
        };

        displayUserInfo(data);

        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

function displayUserInfo(userData) {
    updateWalletInfo(userData.nickname, userData.balance);

    const nftValueElement = document.getElementById("nft-total-value");
    if (nftValueElement) {
        nftValueElement.textContent = `NFT Total Value: ${userData.nft_total_value.toFixed(2)} XML`;
    }
}

async function fetchUserNFTs(userId, collectionId = "", page = 1, limit = 5) {
    try {
        const apiUrl = `https://miniappservcc.com/api/collections?page=${page}&limit=${limit}&collection_id=${collectionId}&user_id=${userId}`;
        console.log(`Fetching NFTs for category: ${collectionId || "All"}`);

        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch user NFTs: ${response.status}`);

        const data = await response.json();
        renderPurchasedNFTs(data.data);
    } catch (error) {
        console.error("Error fetching user NFTs:", error);
    }
}


function renderPurchasedNFTs(nfts) {
    const nftContainer = document.querySelector(".purchased-nfts");
    if (!nftContainer) return;
    nftContainer.innerHTML = "";

    if (nfts.length > 0) {
        nfts.forEach((nft) => {
            const nftCard = document.createElement("div");
            nftCard.classList.add("card");
            nftCard.innerHTML = `
            <img src="${nft.image}" alt="${nft.name}">
            <h3>${nft.name}</h3>
            <p>Price: ${nft.price} XML</p>
            <p>Count: ${nft.count}</p>
            <p>Holders: ${nft.userCount}</p>
            <p>Total Bought : ${nft.totalBought}</p>
            <button class="details-button" id="details-${nft.id}">Details 
                <img class="touch-icon" src="content/touch.png" alt="click"> 
            </button>
        `;

            const detailsButton = nftCard.querySelector('.details-button');
            detailsButton.addEventListener('click', () => {
                console.log(`Button clicked for NFT ID: ${nft.id}`);
                showNFTDetails(nft.id, nfts);
            });

            nftContainer.appendChild(nftCard);
        });
    } else {
        nftContainer.innerHTML = `
            <div class="no-nfts">
                <p>You don't have any NFTs in this collection.</p>
                <button class="cta" onclick="showSection('trending')">Explore NFTs</button>
            </div>
        `;
    }
}

async function createMyNFTCategories() {
    const sliderTrack = document.getElementById("my-nft-slider-track");
    if (!sliderTrack) {
        console.error("Slider track not found.");
        return;
    }

    sliderTrack.innerHTML = "";

    const categories = await loadCategoriesOnce();

    categories.forEach(category => {
        const button = document.createElement("button");
        button.classList.add("my-nft-category-item");
        button.textContent = category.name;

        button.addEventListener("click", () => {
            document.querySelectorAll(".my-nft-category-item").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const collectionId = category.id === "" ? "" : category.id;
            console.log(`Selected category ID: ${collectionId}`);

            fetchUserNFTs(userId, collectionId);
        });

        sliderTrack.appendChild(button);
    });

    setupSliderControls();
}

function setupSliderControls() {
    const sliderWrapper = document.querySelector(".slider-wrapper");
    const prevArrow = document.querySelector(".slider-control.prev");
    const nextArrow = document.querySelector(".slider-control.next");

    if (!sliderWrapper || !prevArrow || !nextArrow) {
        console.error("Slider elements not found.");
        return;
    }

    function updateSliderArrows() {
        const scrollLeft = sliderWrapper.scrollLeft;
        const maxScrollLeft = sliderWrapper.scrollWidth - sliderWrapper.clientWidth;

        prevArrow.style.visibility = scrollLeft <= 0 ? "hidden" : "visible";
        nextArrow.style.visibility = scrollLeft >= maxScrollLeft ? "hidden" : "visible";
    }

    function moveSlider(offset) {
        sliderWrapper.scrollBy({ left: offset, behavior: "smooth" });
        setTimeout(updateSliderArrows, 300);
    }

    prevArrow.addEventListener("click", () => moveSlider(-300));
    nextArrow.addEventListener("click", () => moveSlider(300));

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    sliderWrapper.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        scrollLeft = sliderWrapper.scrollLeft;
        sliderWrapper.style.cursor = "grabbing";
    });

    sliderWrapper.addEventListener("mouseleave", () => {
        isDragging = false;
        sliderWrapper.style.cursor = "grab";
    });

    sliderWrapper.addEventListener("mouseup", () => {
        isDragging = false;
        sliderWrapper.style.cursor = "grab";
    });

    sliderWrapper.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX;
        const walk = (x - startX) * 2;
        sliderWrapper.scrollLeft = scrollLeft - walk;
    });

    updateSliderArrows();
}

async function createCategories() {
    const sliderList = document.querySelector(".slider-category-list");
    if (!sliderList) {
        console.error("Element with class 'slider-category-list' not found in DOM.");
        return;
    }

    sliderList.innerHTML = "";

    const categories = await loadCategoriesOnce();

    categories.forEach(category => {
        const button = document.createElement("button");
        button.classList.add("slider-category-item");
        button.textContent = category.name;

        button.addEventListener("click", () => {
            currentCategory = category.id;
            currentPage = 1;
            document.getElementById("category-list").innerHTML = "";
            loadCategories(currentPage, currentCategory);
        });

        sliderList.appendChild(button);
    });

    currentPage = 1;
    await loadCategories(currentPage, currentCategory);
    initializeSlider();
}

let currentPage = 1;
let currentCategory = 1;

function generatePagination(paging, onPageChange) {
    const { page, totalPages } = paging;
    const paginationContainer = document.getElementById("pagination-container");

    if (!paginationContainer) {
        return;
    }

    paginationContainer.innerHTML = "";

    if (page > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.className = "pagination-btn";
        prevButton.addEventListener("click", () => onPageChange(page - 1));
        paginationContainer.appendChild(prevButton);
    }

    const firstPage = createPageButton(1, page, onPageChange);
    paginationContainer.appendChild(firstPage);

    if (page > 3) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "dots";
        paginationContainer.appendChild(dots);
    }

    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        const pageButton = createPageButton(i, page, onPageChange);
        paginationContainer.appendChild(pageButton);
    }

    if (page < totalPages - 2) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "dots";
        paginationContainer.appendChild(dots);
    }

    if (totalPages > 1) {
        const lastPage = createPageButton(totalPages, page, onPageChange);
        paginationContainer.appendChild(lastPage);
    }

    if (page < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = ">";
        nextButton.className = "pagination-btn";
        nextButton.addEventListener("click", () => onPageChange(page + 1));
        paginationContainer.appendChild(nextButton);
    }
}

function createPageButton(pageNumber, currentPage, onPageChange) {
    const button = document.createElement("button");
    button.textContent = pageNumber;
    button.className = "pagination-btn";

    if (pageNumber === currentPage) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => onPageChange(pageNumber));
    return button;
}

async function onPageChange(newPage) {
    currentPage = newPage;
    await loadCategories(currentPage, currentCategory);
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".lazy-img");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                // if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => {
                        const spinner = img.previousElementSibling;
                        if (spinner) spinner.style.display = "none";
                        img.style.display = "block";
                    };
                    img.onerror = () => {
                        const spinner = img.previousElementSibling;
                        if (spinner) spinner.style.display = "none";
                        img.src = "https://placehold.co/200x200?text=Error";
                    };
                    observer.unobserve(img);
                // }
            });
        },
        // { threshold: 0.1 }
    );

    lazyImages.forEach((img) => {
        observer.observe(img);
    });
}

async function loadCategories(page, category) {
    try {
        if (!category) {
            console.error("Invalid category ID:", category);
            return;
        }

        const response = await fetch(`https://miniappservcc.com/api/collections?id=${category}&page=${page}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data.data) ? data.data : [];
        const paging = data.paging || { page: 1, totalPages: 1 };

        const cardsContainer = document.getElementById("category-list");
        if (!cardsContainer) {
            throw new Error("Element with ID 'category-list' not found in DOM.");
        }

        cardsContainer.innerHTML = "";
        items.forEach((item) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>Price: ${item.price}</p>
                <p>Holders: ${item.userCount}</p>
                <p>Total Bought : ${item.totalBought}</p>
                <button class="details-button" id="details-${item.id}">
                    Details 
                    <img class="touch-icon" src="content/touch.png" alt="click">
                </button>
            `;

            const detailsButton = card.querySelector(".details-button");
            detailsButton.addEventListener("click", () => {
                showNFTDetails(item.id, items);
            });
            cardsContainer.appendChild(card);
        });

        lazyLoadImages();
        generatePagination(paging, onPageChange);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCategories(currentPage, currentCategory);
});


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

const popupOverlay = document.getElementById("popup-overlay");
const countdownPopup = document.getElementById("countdown-popup");
const popupTitle = document.getElementById("popup-title");
const popupDescription = document.getElementById("popup-description");
const amountInput = document.getElementById("amount-input");
const confirmButton = document.getElementById("confirm-button");
const closeButton = document.getElementById("close-popup-button");
const countdownTimer = document.getElementById("countdown-timer");

const userBalance = 500;
let currentAction = "";

function openPopup(action) {
    currentAction = action;

    if (action === "recharge") {
        popupTitle.textContent = "Recharge";
        popupDescription.textContent = "Enter the amount you want to recharge:";
        amountInput.placeholder = "Min 10 XML";
    } else if (action === "withdraw") {
        popupTitle.textContent = "Withdraw";
        popupDescription.textContent = "Enter the amount you want to withdraw:";
        amountInput.placeholder = `Max ${userBalance} XML`;
    }

    amountInput.value = "";
    popupOverlay.style.display = "flex";
}

function closePopup() {
    popupOverlay.style.display = "none";
}

function handleConfirm() {
    console.log("handleConfirm called");

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        console.log("Invalid amount");
        showErrorPopup("error", "Please enter a valid amount.");
        return;
    }

    if (currentAction === "recharge" && amount < 10) {
        console.log("Recharge amount too low");
        showErrorPopup("error", "Minimum amount for recharge is 10 XML.");
        return;
    }

    if (currentAction === "withdraw" && amount > userBalance) {
        console.log("Withdraw amount exceeds balance");
        showErrorPopup("warning", `Maximum withdraw amount is ${userBalance} XML.`);
        return;
    }

    const data = {
        action: currentAction,
        amount: amount
    };

    console.log("Sending data to Telegram:", data);
    if(currentAction === "recharge") {
        popupDescription.textContent = "Pososi Recharge"
    }

    if(currentAction === "withdraw") {
        popupDescription.textContent = "withdraw otsosi"
    }

    sendBalanceDataToTelegram(data);
    showCountdownPopup();
}


function showCountdownPopup() {
    popupOverlay.style.display = "none";
    countdownPopup.style.display = "flex";

    let secondsLeft = 5;
    countdownTimer.textContent = `Closing in ${secondsLeft} seconds...`;

    const timer = setInterval(() => {
        secondsLeft--;
        countdownTimer.textContent = `Closing in ${secondsLeft} seconds...`;

        if (secondsLeft <= 0) {
            clearInterval(timer);
            Telegram.WebApp.close();

        }
    }, 1000);
}

function sendBalanceDataToTelegram(data) {
    const jsonData = JSON.stringify(data);

    tg.ready();
    tg.sendData(jsonData);
}

document.querySelector(".recharge-button").addEventListener("click", () => openPopup("recharge"));
document.querySelector(".withdraw-button").addEventListener("click", () => openPopup("withdraw"));

closeButton.addEventListener("click", closePopup);
confirmButton.addEventListener("click", handleConfirm);

const errorPopup = document.getElementById("error-popup");
const errorTitle = document.getElementById("error-title");
const errorMessage = document.getElementById("error-message");
const closeErrorPopupButton = document.getElementById("close-error-popup-button");

function showErrorPopup(type, message) {
    if (type === "error") {
        errorTitle.textContent = "Error";
        errorTitle.style.color = "#ff0000";
    } else if (type === "warning") {
        errorTitle.textContent = "Warning";
        errorTitle.style.color = "#ffa500";
    }

    errorMessage.textContent = message;
    errorPopup.style.display = "flex";
}

function closeErrorPopup() {
    errorPopup.style.display = "none";
}

closeErrorPopupButton.addEventListener("click", closeErrorPopup);

async function initializeApp() {

    const tg = Telegram.WebApp;

    const config = await getConfig(true);

    if (config) {
        await fetchUserData(userId);
        await fetchUserNFTs(userId);

        await loadNFTs();
        await loadTrendingNFTs();
        await createCategories();
        await createMyNFTCategories();
    }
}

document.addEventListener("DOMContentLoaded", initializeApp);
