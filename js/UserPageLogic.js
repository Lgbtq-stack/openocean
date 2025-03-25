import {user_Id} from "./index.js";
import {levelsConfig} from "./user_level_bonus_config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const benefits = document.getElementById('level-benefits');
    const toggle = document.getElementById('benefits-toggle');

    toggle.addEventListener('click', () => {
        benefits.classList.toggle('open');
        benefits.classList.toggle('closed');
    });

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

    document.querySelector('.profile-card h3').textContent = user.nickname;
    document.querySelector('.bio').textContent = user.bio || 'NFT Enthusiast & Collector';
    document.getElementById('balance-amount').textContent = `$${parseFloat(user.balance).toLocaleString()}`;
    document.querySelector('.progress-level span:first-child').textContent = `Level ${user.level}`;
    const progress = user.progress || 0;
    document.querySelector('.progress').style.width = `${progress}%`;
    document.querySelector('.progress-level span:last-child').textContent = `${progress}%`;
    document.getElementById('benefits-text').textContent = user.level_benefits || `As a Level ${user.level} member, you enjoy exclusive benefits.`;

    const levelList = document.getElementById("level-list");
    levelList.innerHTML = "";

    renderLevelButtons(user.level);

}

function renderLevelButtons(currentLevel) {
    const levelList = document.getElementById("level-list");
    levelList.innerHTML = "";

    levelsConfig.forEach(({ level, title, description }) => {
        const btn = document.createElement("div");
        btn.classList.add("level-btn", "collapsable");

        if (level < currentLevel) {
            btn.classList.add("completed");
        } else if (level === currentLevel) {
            btn.classList.add("current");
        } else {
            btn.classList.add("locked");
        }

        btn.innerHTML = `
            <div class="level-title">${title}</div>
            <div class="collapsable-content">${description.join("<br>")}</div>
        `;

        if (level <= currentLevel) {
            btn.addEventListener("click", () => {
                btn.classList.toggle("open");
            });
        }

        levelList.appendChild(btn);
    });
}
