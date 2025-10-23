// AI Sage Consulting - Interactive Website Functionality

class AIConsultingWebsite {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.isAnimating = false;
        this.animationObserver = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.cacheElements();
        this.setupSlider();
        this.setupNavigation();
        this.setupAnimations();
        this.setupCounters();
        this.setupAccessibility();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
        
        // Initialize Calendly if available
        this.initializeCalendly();
        
        console.log('AI Consulting Website initialized successfully');
    }

    cacheElements() {
        // Slider elements
        this.slider = document.querySelector('.slider-container');
        this.slides = Array.from(document.querySelectorAll('.slide'));
        this.slideIndicators = Array.from(document.querySelectorAll('.slide-indicators .indicator'));
        
        // Navigation elements
        this.navButtons = Array.from(document.querySelectorAll('.nav-btn'));
        this.prevButton = document.querySelector('.prev-slide');
        this.nextButton = document.querySelector('.next-slide');
        this.nextSlideButtons = Array.from(document.querySelectorAll('.next-slide'));
        
        // Animation elements
        this.animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
        
        // Counter elements
        this.counters = Array.from(document.querySelectorAll('[data-target]'));
    }

    setupSlider() {
        if (this.slides.length === 0) return;

        // Set initial slide
        this.slides[0].classList.add('active');
        this.updateIndicators();
        this.updateNavigation();

        // Setup slide indicators
        this.slideIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Setup navigation buttons
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextSlide());
        }

        // Setup next slide buttons throughout the slides
        this.nextSlideButtons.forEach(button => {
            button.addEventListener('click', () => this.nextSlide());
        });

        // Auto-advance slides (optional)
        this.setupAutoAdvance();
    }

    setupNavigation() {
        this.navButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.goToSlide(index);
                this.updateNavButtons();
            });
        });

        // Update nav on slide change
        this.updateNavButtons();
    }

    setupAnimations() {
        // Create intersection observer for scroll animations
        this.animationObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all animated elements
        this.animatedElements.forEach(element => {
            this.animationObserver.observe(element);
        });

        // Trigger animations for current slide
        this.triggerSlideAnimations();
    }

    setupCounters() {
        this.counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const isFloat = target % 1 !== 0;
            
            this.animateCounter(counter, target, isFloat);
        });
    }

    setupAccessibility() {
        // Add ARIA labels and roles
        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-labelledby', `nav-btn-${index}`);
            slide.setAttribute('aria-hidden', index !== this.currentSlide);
        });

        this.navButtons.forEach((button, index) => {
            button.setAttribute('id', `nav-btn-${index}`);
            button.setAttribute('aria-controls', `slide-${index}`);
        });

        // Announce slide changes to screen readers
        this.createAriaLiveRegion();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
                case 'Escape':
                    // Focus management
                    document.activeElement.blur();
                    break;
            }
        });
    }

    setupTouchGestures() {
        let startX = 0;
        let endX = 0;
        const minSwipeDistance = 50;

        this.slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.slider.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.slider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const swipeDistance = Math.abs(endX - startX);
            
            if (swipeDistance > minSwipeDistance) {
                if (endX < startX) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        }, { passive: true });
    }

    setupAutoAdvance() {
        // Optional: Auto-advance slides every 10 seconds on hero slide
        let autoAdvanceTimer;
        
        const startAutoAdvance = () => {
            clearTimeout(autoAdvanceTimer);
            if (this.currentSlide === 0) {
                autoAdvanceTimer = setTimeout(() => {
                    this.nextSlide();
                }, 10000);
            }
        };

        const stopAutoAdvance = () => {
            clearTimeout(autoAdvanceTimer);
        };

        // Start auto-advance
        startAutoAdvance();

        // Stop auto-advance on user interaction
        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, stopAutoAdvance, { once: true });
        });
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide || index < 0 || index >= this.slides.length) {
            return;
        }

        this.isAnimating = true;
        
        // Update ARIA attributes
        this.slides[this.currentSlide].setAttribute('aria-hidden', 'true');
        this.slides[index].setAttribute('aria-hidden', 'false');

        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
        
        // Add prev class for animation
        if (index < this.currentSlide) {
            this.slides[this.currentSlide].classList.add('prev');
        }

        // Update current slide
        this.currentSlide = index;

        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');

        // Update UI
        this.updateIndicators();
        this.updateNavigation();
        
        // Trigger animations for new slide
        setTimeout(() => {
            this.triggerSlideAnimations();
        }, 100);

        // Clean up classes after animation
        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('prev');
            });
            this.isAnimating = false;
        }, 600);

        // Announce slide change
        this.announceSlideChange();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    updateIndicators() {
        this.slideIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
            indicator.setAttribute('aria-selected', index === this.currentSlide);
        });
    }

    updateNavigation() {
        this.updateNavButtons();
    }

    updateNavButtons() {
        this.navButtons.forEach((button, index) => {
            button.classList.toggle('active', index === this.currentSlide);
            button.setAttribute('aria-selected', index === this.currentSlide);
        });
    }

    triggerSlideAnimations() {
        const currentSlideElement = this.slides[this.currentSlide];
        const animatedElements = currentSlideElement.querySelectorAll('[data-animate]');
        
        // Reset animations
        animatedElements.forEach(element => {
            element.classList.remove('animate');
        });

        // Trigger animations with staggered delay
        animatedElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate');
            }, index * 100);
        });

        // Trigger counters if they're in the current slide
        const counters = currentSlideElement.querySelectorAll('[data-target]');
        counters.forEach(counter => {
            if (!counter.dataset.animated) {
                const target = parseFloat(counter.dataset.target);
                const isFloat = target % 1 !== 0;
                this.animateCounter(counter, target, isFloat);
                counter.dataset.animated = 'true';
            }
        });
    }

    animateCounter(element, target, isFloat = false) {
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;
        const increment = target / steps;
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current >= target) {
                current = target;
                element.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
                return;
            }
            
            element.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
            setTimeout(updateCounter, stepTime);
        };

        updateCounter();
    }

    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }

    announceSlideChange() {
        if (this.liveRegion) {
            const slideTitle = this.slides[this.currentSlide].querySelector('h1, h2');
            const title = slideTitle ? slideTitle.textContent : `Slide ${this.currentSlide + 1}`;
            this.liveRegion.textContent = `Now viewing: ${title}`;
        }
    }

    initializeCalendly() {
        // Initialize Calendly widget if the script is loaded
        if (typeof Calendly !== 'undefined') {
            const calendlyElement = document.querySelector('.calendly-inline-widget');
            if (calendlyElement) {
                const url = calendlyElement.dataset.url;
                if (url) {
                    Calendly.initInlineWidget({
                        url: url,
                        parentElement: calendlyElement,
                        prefill: {},
                        utm: {}
                    });
                }
            }
        } else {
            // Fallback: Add placeholder or link to Calendly
            const calendlyContainer = document.querySelector('.calendly-container');
            if (calendlyContainer) {
                const fallbackContent = document.createElement('div');
                fallbackContent.className = 'calendly-fallback';
                fallbackContent.innerHTML = `
                    <div style="text-align: center; padding: 3rem; background: var(--soft-gray); border-radius: 15px;">
                        <h3 style="margin-bottom: 1rem; color: var(--deep-navy);">Schedule Your Consultation</h3>
                        <p style="margin-bottom: 2rem; color: var(--text-dark);">Click the button below to book your free 30-minute AI strategy session.</p>
                        <a href="https://calendly.com/your-calendly-link" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="btn-primary"
                           style="display: inline-block; text-decoration: none;">
                            Book Your Free Consultation
                        </a>
                    </div>
                `;
                calendlyContainer.appendChild(fallbackContent);
            }
        }
    }

    // Public methods for external use
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.slides.length;
    }

    // Performance optimization: Lazy load images
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Smooth scroll enhancement
    smoothScrollTo(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Error handling
    handleError(error, context = 'general') {
        console.error(`AI Consulting Website Error [${context}]:`, error);
        
        // Graceful degradation
        if (context === 'slider' && this.slides.length > 0) {
            // Ensure at least basic navigation works
            this.slides[0].classList.add('active');
            this.slides[0].style.opacity = '1';
            this.slides[0].style.transform = 'translateX(0)';
        }
    }

    // Cleanup method
    destroy() {
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        
        console.log('AI Consulting Website destroyed');
    }
}

// Additional utility functions
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Get random number between min and max
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// Form handling for any contact forms
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            // Add loading state
            this.setFormLoading(form, true);
            
            // Here you would typically send the form data to your server
            // For now, we'll just simulate a successful submission
            await this.simulateSubmission();
            
            this.showSuccess(form);
        } catch (error) {
            this.showError(form, error.message);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    setFormLoading(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Sending...' : 'Send Message';
        }
    }

    showSuccess(form) {
        // Create success message
        const message = document.createElement('div');
        message.className = 'form-message success';
        message.textContent = 'Thank you! Your message has been sent successfully.';
        message.style.cssText = 'color: green; padding: 1rem; margin-top: 1rem; border-radius: 5px; background: #d4edda;';
        
        form.appendChild(message);
        form.reset();
        
        setTimeout(() => message.remove(), 5000);
    }

    showError(form, errorMessage) {
        const message = document.createElement('div');
        message.className = 'form-message error';
        message.textContent = `Error: ${errorMessage}`;
        message.style.cssText = 'color: red; padding: 1rem; margin-top: 1rem; border-radius: 5px; background: #f8d7da;';
        
        form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    async simulateSubmission() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }
}

// Enhanced scroll effects
class ScrollEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallax();
        this.setupScrollProgress();
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0 || Utils.prefersReducedMotion()) return;

        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = parseFloat(element.dataset.parallax) || 0.5;
                const yPos = -(scrolled * rate);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16);

        window.addEventListener('scroll', handleScroll);
    }

    setupScrollProgress() {
        // Create scroll progress indicator
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-gold), var(--sage-green));
            z-index: 1000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        const updateProgress = Utils.throttle(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.pageYOffset;
            const progress = (scrolled / scrollHeight) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }, 16);

        window.addEventListener('scroll', updateProgress);
    }
}

// Initialize everything when DOM is ready
let website, formHandler, scrollEffects;

document.addEventListener('DOMContentLoaded', () => {
    try {
        website = new AIConsultingWebsite();
        formHandler = new FormHandler();
        
        // Only initialize scroll effects if user doesn't prefer reduced motion
        if (!Utils.prefersReducedMotion()) {
            scrollEffects = new ScrollEffects();
        }
        
        // Initialize lazy loading
        website.lazyLoadImages();
        
    } catch (error) {
        console.error('Failed to initialize website:', error);
        
        // Fallback: Ensure basic functionality
        const slides = document.querySelectorAll('.slide');
        if (slides.length > 0) {
            slides[0].classList.add('active');
            slides[0].style.opacity = '1';
        }
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && website) {
        // Refresh animations when page becomes visible
        website.triggerSlideAnimations();
    }
});

// Handle resize events
window.addEventListener('resize', Utils.debounce(() => {
    if (website) {
        // Recalculate any responsive elements
        website.triggerSlideAnimations();
    }
}, 250));

// Export for external use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIConsultingWebsite, FormHandler, ScrollEffects, Utils };
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // Could send error reports to analytics service here
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});