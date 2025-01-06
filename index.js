function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.textContent.trim().toLowerCase();
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

let currentIndex = 0;
const sliderTrack = document.getElementById("sliderTrack");
const slides = document.querySelectorAll(".slider img");
const totalSlides = slides.length;

function showNextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
}

setInterval(showNextSlide, 5000);

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

const popup = document.getElementById("popup-module");

function showPopup(message, canClose = true) {
    if (popup) {
        popup.querySelector(".popup-content").textContent = message;
        popup.style.display = "flex";
        closePopupButton.style.display = canClose ? "block" : "none";

        if (canClose) {
            closePopupButton.addEventListener("click", () => {
                popup.style.display = "none";
            });
        }
    }
}