import { user_Id } from './index.js';
import { levelsConfig } from './user_level_bonus_config.js';

export async function loadHomepageLevelSummary() {
    const progressFill = document.getElementById("summary-progress-fill");
    const bonusesEl = document.getElementById("summary-bonuses");

    try {
        const res = await fetch(`https://miniappservcc.com/api/user?uid=${user_Id}`);
        if (!res.ok) throw new Error("User fetch failed");

        const user = await res.json();

        const levelData = levelsConfig.find(l => {
            const levelNum = parseInt(l.level.toString().replace(/\D/g, ''));
            return levelNum === parseInt(user.level.toString().replace(/\D/g, ''));
        });

        if (!levelData) {
            bonusesEl.innerHTML = "No level data.";
            return;
        }

        const maxRange = parseInt(levelData.range.split(/[-–—]/)[1].trim().replace(/,/g, ""));
        const totalDeposit = user.total_deposit || 0;
        const progress = Math.min((totalDeposit / maxRange) * 100, 100);

        progressFill.style.width = `${progress}%`;
        bonusesEl.innerHTML = levelData.description?.map(line => `<div>${line}</div>`).join("") || "No bonuses.";

    } catch (err) {
        console.error("Homepage level summary error:", err);
        if (bonusesEl) bonusesEl.textContent = "Error loading data.";
    }
}
