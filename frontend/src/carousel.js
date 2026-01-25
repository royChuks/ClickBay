// scripts/carousel.js
document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.querySelector('.carousel-container');
    const arrows = document.querySelectorAll('.carousel-arrow');
    let hideTimeout;

    // Show arrows when hovering over the carousel
    const showArrows = () => {
        arrows.forEach(arrow => {
            arrow.classList.remove('hidden');
            arrow.classList.add('visible');
        });
        
        // Clear any existing timeout
        clearTimeout(hideTimeout);
        
        // Set timeout to hide arrows after 2 seconds of inactivity
        hideTimeout = setTimeout(() => {
            if (!carouselContainer.matches(':hover')) {
                hideArrows();
            }
        }, 2000);
    };

    // Hide arrows
    const hideArrows = () => {
        arrows.forEach(arrow => {
            arrow.classList.remove('visible');
            arrow.classList.add('hidden');
        });
    };

    // Initial show of arrows
    showArrows();
    
    // Set up event listeners
    carouselContainer.addEventListener('mouseenter', showArrows);
    carouselContainer.addEventListener('mousemove', showArrows);
    carouselContainer.addEventListener('mouseleave', hideArrows);
    
    // Also handle touch events for mobile
    carouselContainer.addEventListener('touchstart', showArrows);
    carouselContainer.addEventListener('touchmove', showArrows);
    
    // Keep arrows visible when focused for accessibility
    arrows.forEach(arrow => {
        arrow.addEventListener('focus', showArrows);
        arrow.addEventListener('blur', hideArrows);
    });
});