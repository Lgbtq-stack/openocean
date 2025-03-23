import {loadTrendingNFTs} from "./TrendingSectionLogic.js"

export let tg = null;
let currentTab = 'main-menu';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.footer').classList.add('visible');
    }, 100);
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
                    selectedTab.classList.contains('myProfile') ? 'user-profile' : null;

        if (newTab === currentTab || newTab === null) {
            // await hideLoader();
            return;
        }

        currentTab = newTab;

        document.querySelectorAll('#main-menu, #trending-nfts, #categories, #user-profile')
            .forEach(section => {
                section.style.display = "none";
            });

        let activeSection = document.getElementById(currentTab);
        if (activeSection) {
            activeSection.style.display = "block";
        }

        if (currentTab === 'main-menu') {
            // здесь можно выполнить функции, специфичные для главного меню
        } else if (currentTab === 'trending-nfts') {
            await loadTrendingNFTs();
        } else if (currentTab === 'categories') {
            // загрузка данных для категорий
        } else if (currentTab === 'user-profile') {
            // загрузка профиля
        }
    } catch (error) {
        console.error("Error when changing tabs:", error);
    } finally {
        // await hideLoader();
    }
};


const scrollToTopButton = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'flex';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
});

export function disableScroll() {
    document.body.classList.add('no-scroll');
}

export function enableScroll() {
    document.body.classList.remove('no-scroll');
}

async function showLoader() {
    document.getElementById("loading-panel").classList.remove("hidden");
}

async function hideLoader() {
    document.getElementById("loading-panel").classList.add("hidden");
}