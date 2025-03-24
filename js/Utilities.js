export function showSuccessPopup(message = "Success!") {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

export function disableScroll() {
    document.getElementById("container").classList.add('no-scroll');
}

export function enableScroll() {
    document.getElementById("container").classList.remove('no-scroll');
}

async function showLoader() {
    document.getElementById("loading-panel").classList.remove("hidden");
    disableScroll();
}

async function hideLoader() {
    document.getElementById("loading-panel").classList.add("hidden");
    enableScroll();
}

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