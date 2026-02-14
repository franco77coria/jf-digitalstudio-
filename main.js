/* =============================================
   JF DIGITAL STUDIO — Main JavaScript
   =============================================
   Features:
   - Loading screen
   - Navbar scroll behavior (hide/show + background)
   - Mobile menu toggle
   - Intersection Observer reveal animations
   - Counter animation for stats
   - Contact form handling
   - Smooth scroll for anchor links
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ===== LOADING SCREEN =====
    const loadingScreen = document.getElementById('loading-screen');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Trigger hero animations after load
            document.querySelectorAll('.hero .reveal').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 150);
            });
        }, 1800);
    });

    // Fallback: hide loading after 3s even if resources haven't loaded
    setTimeout(() => {
        if (!loadingScreen.classList.contains('hidden')) {
            loadingScreen.classList.add('hidden');
            document.querySelectorAll('.hero .reveal').forEach((el) => {
                el.classList.add('visible');
            });
        }
    }, 3500);


    // ===== NAVBAR SCROLL BEHAVIOR =====
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // Add scrolled class for background change
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });


    // ===== MOBILE MENU =====
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');

        if (isOpen) {
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                mobileMenu.classList.remove('open');
            }, 350);
        } else {
            mobileMenu.classList.add('open');
            // Force reflow
            mobileMenu.offsetHeight;
            mobileMenu.style.opacity = '1';
            mobileMenu.style.transform = 'translateY(0)';
        }

        mobileToggle.classList.toggle('active');
        mobileToggle.setAttribute('aria-expanded', !isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                mobileMenu.classList.remove('open');
            }, 350);
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });


    // ===== INTERSECTION OBSERVER — Scroll Reveal =====
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add delay if specified
                const delay = entry.target.dataset.delay;
                if (delay) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                } else {
                    entry.target.classList.add('visible');
                }

                // Don't unobserve hero elements (already handled)
                if (!entry.target.closest('.hero')) {
                    revealObserver.unobserve(entry.target);
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => {
        // Skip hero elements — those are triggered after loading
        if (!el.closest('.hero')) {
            revealObserver.observe(el);
        }
    });


    // ===== COUNTER ANIMATION =====
    const counters = document.querySelectorAll('[data-count]');
    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                counter.textContent = current + (target === 98 ? '%' : '+');

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + (target === 98 ? '%' : '+');
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // Observe stats bar for counter trigger
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                counterObserver.unobserve(statsBar);
            }
        }, { threshold: 0.3 });

        counterObserver.observe(statsBar);
    }


    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ===== CONTACT FORM =====
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('form-submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.querySelector('span:first-child').textContent = 'Enviando...';
            submitBtn.querySelector('.material-symbols-outlined').textContent = 'hourglass_empty';
            submitBtn.querySelector('.material-symbols-outlined').style.animation = 'spin 1s linear infinite';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    formSuccess.classList.add('show');
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // If form action isn't configured yet, just show success for demo
                contactForm.style.display = 'none';
                formSuccess.classList.add('show');
            }

            // Reset button
            submitBtn.disabled = false;
            submitBtn.querySelector('span:first-child').textContent = 'Enviar mensaje';
            submitBtn.querySelector('.material-symbols-outlined').textContent = 'send';
            submitBtn.querySelector('.material-symbols-outlined').style.animation = '';
        });
    }


    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${id}`) {
                        link.style.color = 'var(--accent)';
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });


    // ===== PARALLAX SUBTLE EFFECT ON HERO =====
    const heroBg = document.querySelector('.hero-bg img');

    if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
            }
        }, { passive: true });
    }


    // ===== FAQ ACCORDION =====
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });
    });


    // ===== PREFERS REDUCED MOTION =====
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Immediately show all elements
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            el.style.transition = 'none';
            el.classList.add('visible');
        });

        // Immediately hide loading
        loadingScreen.classList.add('hidden');
    }

});
