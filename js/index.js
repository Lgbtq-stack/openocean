import {loadTrendingNFTs} from "./TrendingSectionLogic.js"
import {hideCartUserHeader, renderCart, showCartUserHeader} from "./CartLogic.js";
import {closeNFTDetails} from "./ProductDetailsLogic.js";
import {showErrorPopup} from "./PopupLogic.js";

export let user_Id = null;

export let tg = null;
let currentTab = 'main-menu';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.footer').classList.add('visible');
    }, 100);
    Telegram.WebApp.expand();
    tg = Telegram.WebApp;
});

window.setActiveTab = async function (selectedTab) {
    // await showLoader();

    try {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        selectedTab.classList.add('active');

        let newTab = selectedTab.classList.contains('home') ? 'main-menu' :
            selectedTab.classList.contains('trending') ? 'trending-nfts' :
                selectedTab.classList.contains('categories') ? 'categories' :
                    selectedTab.classList.contains('cart') ? 'cart-section' :
                        selectedTab.classList.contains('myProfile') ? 'user-profile' : null;

        if (newTab === currentTab || newTab === null) {
            // await hideLoader();
            return;
        }

        currentTab = newTab;
        document.querySelectorAll('#main-menu, #trending-nfts, #cart-section, #categories, #user-profile')
            .forEach(section => {
                section.style.display = "none";
            });

        let activeSection = document.getElementById(currentTab);
        if (activeSection) {
            activeSection.style.display = "block";
        }

        await hideCartUserHeader();

        if (currentTab === 'main-menu') {
            // здесь можно выполнить функции, специфичные для главного меню
        } else if (currentTab === 'trending-nfts') {
            await loadTrendingNFTs();
        } else if (currentTab === 'cart-section') {
            await showCartUserHeader();
            renderCart();
        } else if (currentTab === 'categories') {
            // загрузка данных для категорий
        } else if (currentTab === 'user-profile') {
            // загрузка профиля
        }
    } catch (error) {
        console.error("Error when changing tabs:", error);
    } finally {
        // await hideLoader();
        closeNFTDetails();
    }
};

async function initializeApp() {
    // user_Id = getUserIdFromURL();
    user_Id = 488916773;

    if (!user_Id) {
        showErrorPopup("error", "User ID is missing in the URL.");
        return;
    }

    // await fetchUserData(user_Id);
    // await fetchUserNFTs(user_Id);

    await loadTrendingNFTs();
    // await createCategories();
    // await createMyNFTCategories();
}

document.addEventListener("DOMContentLoaded", initializeApp);