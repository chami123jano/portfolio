// ============================================
// FIX: PREVENT SCROLL ON PAGE LOAD
// ============================================

// Immediately prevent scrolling
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// Force scroll to top on page load/refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Remove any hash from URL that might cause scrolling
if (window.location.hash) {
    history.replaceState(null, null, ' ');
}

// Prevent scroll on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

// Prevent scroll before page fully loads
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// ============================================
// NAVIGATION BAR FUNCTIONALITY
// ============================================

// Get DOM elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger icon
    const spans = hamburger.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking on a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        
        // Reset hamburger icon
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ============================================
// SMOOTH SCROLLING FOR NAVIGATION LINKS
// ============================================

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Update URL without scrolling
            history.pushState(null, null, targetId);
        }
    });
});

// ============================================
// ACTIVE NAVIGATION LINK HIGHLIGHTING
// ============================================

window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

// Create intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections for animations
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    observer.observe(section);
});

// Observe skill items
const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.05}s`;
    observer.observe(item);
});

// Observe project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// ============================================
// TYPING EFFECT FOR HERO TAGLINE (Optional)
// ============================================

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Uncomment to enable typing effect
// const heroTagline = document.querySelector('.hero-tagline');
// if (heroTagline) {
//     const originalText = heroTagline.textContent;
//     window.addEventListener('load', () => {
//         typeWriter(heroTagline, originalText);
//     });
// }

// ============================================
// SCROLL TO TOP BUTTON
// ============================================

// Create scroll to top button dynamically
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '↑';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollToTopBtn);

// Add styles for scroll to top button
const style = document.createElement('style');
style.textContent = `
    .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);
    }
    
    .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
    }
    
    .scroll-to-top:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 20px rgba(0, 217, 255, 0.4);
    }
    
    @media (max-width: 768px) {
        .scroll-to-top {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            font-size: 1.3rem;
        }
    }
`;
document.head.appendChild(style);

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Scroll to top when button is clicked
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// PROJECT CARDS HOVER EFFECT
// ============================================

projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// ============================================
// LAZY LOADING IMAGES
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// CONTACT FORM VALIDATION (If you add a form later)
// ============================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Example usage:
// const contactForm = document.querySelector('.contact-form');
// if (contactForm) {
//     contactForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const email = document.querySelector('#email').value;
//         if (validateEmail(email)) {
//             // Submit form
//             console.log('Form submitted successfully');
//         } else {
//             alert('Please enter a valid email address');
//         }
//     });
// }

// ============================================
// PERFORMANCE: Debounce scroll events
// ============================================

function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

// Use debounce for scroll events
const debouncedScroll = debounce(() => {
    // Any additional scroll-based functionality can go here
});

window.addEventListener('scroll', debouncedScroll);

// ============================================
// CONSOLE MESSAGE
// ============================================

console.log('%c👋 Welcome to C. J. Ambawatta\'s Portfolio!', 'color: #00d9ff; font-size: 20px; font-weight: bold;');
console.log('%cInterested in the code? Check out the repository on GitHub!', 'color: #7b2ff7; font-size: 14px;');
console.log('%cBuilt with ❤️ using HTML, CSS, and JavaScript', 'color: #ff6b6b; font-size: 12px;');

// ============================================
// PAGE LOAD ANIMATION
// ============================================

window.addEventListener('load', () => {
    // CRITICAL: Force scroll to top position
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 0);
    
    // Remove loading class
    document.documentElement.classList.remove('loading');
    document.body.classList.add('loaded');
    
    // Fade in hero elements with staggered delay
    const heroElements = document.querySelectorAll('.hero .fade-in');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 150);
    });
});
