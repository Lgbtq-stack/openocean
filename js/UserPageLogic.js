import {user_Id} from "./index.js";
import {levelsConfig} from "./user_level_bonus_config.js";

const avatars = [
    { id: 1, src: "content/Avatars/nft_1.png" },
    { id: 2, src: "content/Avatars/nft_2.png" },
    { id: 3, src: "content/Avatars/nft_3.png" },
    { id: 4, src: "content/Avatars/nft_4.png" },
    { id: 5, src: "content/Avatars/nft_5.png" },
];

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('see-all-levels').addEventListener('click', () => {
        const list = document.getElementById('level-list');
        list.classList.toggle('open');
        list.classList.toggle('closed');
        const toggle = document.getElementById('see-all-levels');
        toggle.textContent = list.classList.contains('open') ? '🔼 Hide Levels' : '🔽 Show All Levels';
    });
});

export async function loadUserData() {
    const response = await fetch(`https://miniappservcc.com/api/user?uid=${user_Id}`);
    if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);

    const user = await response.json();

    document.querySelector(".profile-card h3").textContent = user.nickname;
    // document.querySelector(".bio").textContent = user.bio || "NFT Enthusiast & Collector";

    document.querySelectorAll(".balance-amount")[0].textContent = parseFloat(user.balance).toLocaleString();
    document.querySelectorAll(".balance-amount")[1].textContent = parseFloat(user.balance_bonus).toLocaleString();

    renderUserProgressLevel(user);
    renderLevelButtons(user.level);

    const avatar = avatars.find(a => a.id === user.icon_id);
    if (avatar) {
        document.querySelector(".user-photo").src = avatar.src;
    }
}

function renderUserProgressLevel(user) {
    const progressEl = document.getElementById("progress-level");
    const levelData = levelsConfig.find(l => {
        const levelNum = parseInt(l.level.toString().replace(/\D/g, ''));
        return levelNum === parseInt(user.level.toString().replace(/\D/g, ''));
    });

    if (!levelData) {
        progressEl.innerHTML = "Level data not found.";
        return;
    }

    const maxRangeStr = levelData.range.split("–")[1].trim().replace(/,/g, "");
    const maxRange = parseInt(maxRangeStr, 10);

    const totalDeposit = user.total_deposit || 0;
    const progress = Math.min((totalDeposit / maxRange) * 100, 100);

    progressEl.innerHTML = "";

    const levelSpan = document.createElement("span");
    levelSpan.textContent = `Current Level: ${user.level}`;

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress";
    progressFill.style.width = `${progress}%`;

    progressBar.appendChild(progressFill);

    const benefitsWrapper = document.createElement("div");
    benefitsWrapper.className = "level-benefits collapsible closed";
    benefitsWrapper.id = "level-benefits";

    const toggle = document.createElement("div");
    toggle.id = "benefits-toggle";
    toggle.className = "toggle-arrow";

    const toggleText = document.createElement("span");
    toggleText.textContent = "Current Level Benefits ";

    const arrow = document.createElement("span");
    arrow.className = "arrow-icon";
    arrow.textContent = " 🔽";

    toggle.appendChild(toggleText);
    toggle.appendChild(arrow);

    const desc = document.createElement("div");
    desc.id = "benefits-text";
    desc.innerHTML = levelData?.description?.map(line => `<div>${line}</div>`).join('') || 'No benefits available.';

    benefitsWrapper.appendChild(toggle);
    benefitsWrapper.appendChild(desc);

    progressEl.appendChild(levelSpan);
    progressEl.appendChild(progressBar);
    progressEl.appendChild(benefitsWrapper);

    toggle.addEventListener('click', () => {
        benefitsWrapper.classList.toggle('open');
        benefitsWrapper.classList.toggle('closed');
        arrow.style.transform = benefitsWrapper.classList.contains('open') ? "rotate(180deg)" : "rotate(0deg)";
    });
    document.getElementById("add-funds-btn").addEventListener("click", () => {
        showRechargePopup();
    });
}

function renderLevelButtons(currentLevel) {
    const levelList = document.getElementById("level-list");
    levelList.innerHTML = "";

    levelsConfig.forEach(({ level, title, description }) => {
        const levelNum = parseInt(level.replace("Level ", ""));

        const btn = document.createElement("div");
        btn.classList.add("level-btn", "collapsable");

        if (levelNum < currentLevel) {
            btn.classList.add("completed");
        } else if (levelNum === currentLevel) {
            btn.classList.add("current", "completed");
        } else {
            btn.classList.add("locked");
        }

        btn.innerHTML = `
            <div class="level-title">
                ${level}: ${title}
                <span class="arrow">🔽</span>
            </div>
            <div class="collapsable-content">
                ${description.map(line => `<div>${line}</div>`).join("")}
            </div>
        `;

        if (levelNum <= currentLevel) {
            btn.addEventListener("click", () => {
                btn.classList.toggle("open");
            });
        }

        levelList.appendChild(btn);
    });
}

function showRechargePopup() {
    const overlay = document.getElementById("popup-overlay");
    const content = document.getElementById("recharge-content");
    const memoField = document.getElementById("memo-value");

    memoField.textContent = user_Id;

    overlay.style.display = "flex";
    content.style.display = "block";
}

function closePopup() {
    document.getElementById("popup-overlay").style.display = "none";
    document.getElementById("recharge-content").style.display = "none";
}

async function selectIcon(iconId) {
    const res = await fetch(`https://miniappservcc.com/api/user/icon?uid=${user_Id}&icon_id=${iconId}`);
    if (res.ok) {
        const avatar = avatars.find(a => a.id === iconId);
        if (avatar) {
            document.querySelector(".user-photo").src = avatar.src;
        }
        closeIconPanel();
    } else {
        alert("Failed to update avatar");
    }
}

function renderIconPanel() {
    const grid = document.querySelector(".icon-grid");
    grid.innerHTML = "";

    avatars.forEach(({ id, src }) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Avatar ${id}`;
        img.title = `Select avatar #${id}`;
        img.addEventListener("click", () => selectIcon(id));
        grid.appendChild(img);
    });
}

function closeIconPanel() {
    document.getElementById("icon-panel-overlay").style.display = "none";
}

document.getElementById("user-photo-button").addEventListener("click", () => {
    document.getElementById("icon-panel-overlay").style.display = "block";
    renderIconPanel();
});


window.closePopup = closePopup;
window.closeIconPanel = closeIconPanel;
window.selectIcon = selectIcon;
