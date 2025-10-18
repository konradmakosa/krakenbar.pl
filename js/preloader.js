// Preloader functionality
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preloader');
    const kraken = document.querySelector('.kraken');
    const loadingText = document.querySelector('.loading-text');
    
    // Simulate loading time (you can replace this with actual loading logic)
    setTimeout(() => {
        // Animate kraken leaving
        kraken.style.animation = 'float 1s ease-out forwards';
        kraken.style.transform = 'translateY(-100vh)';
        loadingText.style.opacity = '0';
        
        // Hide preloader after animation
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            
            // Show menu items with staggered animation
            const menuCategories = document.querySelectorAll('.menu-category');
            menuCategories.forEach((category, index) => {
                setTimeout(() => {
                    category.style.opacity = '1';
                    category.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        }, 1000);
    }, 2500); // Adjust this time based on your actual content loading
});
