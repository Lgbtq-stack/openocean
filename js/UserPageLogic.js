document.addEventListener('DOMContentLoaded', () => {
    const benefits = document.getElementById('level-benefits');
    const toggle = document.getElementById('benefits-toggle');
    const seeAll = document.getElementById('see-all-levels');
    const levelList = document.getElementById('level-list');
    const collapsables = document.querySelectorAll('.level-btn.collapsable');

    toggle.addEventListener('click', () => {
        benefits.classList.toggle('open');
        benefits.classList.toggle('closed');
    });

    seeAll.addEventListener('click', () => {
        levelList.classList.toggle('open');
        levelList.classList.toggle('closed');
        seeAll.textContent = levelList.classList.contains('open')
            ? '🔼 Hide Levels'
            : '🔽 See All Levels';
    });

    collapsables.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('open');
        });
    });
});