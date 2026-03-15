document.addEventListener('DOMContentLoaded', () => {
    
    // --- Stars Background Generation (Optimized for Performance) ---
    const starsContainer = document.getElementById('stars-container');
    const NUM_STARS = 25; // Drastically reduced for performance
    
    for (let i = 0; i < NUM_STARS; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random positions and sizes
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${posX}vw`;
        star.style.top = `${posY}vh`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
    }
    
    // --- 3D Hover Effect ---
    // Make sure we only apply 3D transform on desktop mapping
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    if (!isMobile) {
        const cards = document.querySelectorAll('.card-3d');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element.
                const y = e.clientY - rect.top;  // y position within the element.
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Adjust sensitivity here
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                // Return to normal
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
                setTimeout(() => {
                    // Small hack to ensure transition resets properly
                    card.style.transform = 'none';
                }, 100);
            });
        });
    }
    
    // --- Lightbox Modal ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');
    const galleryItems = document.querySelectorAll('.gallery-item img, .hero-img, .chara-img');
    
    galleryItems.forEach(item => {
        // Find the wrapper to attach event if it's a gallery item, otherwise attach to the image itself
        const triggerElement = item.closest('.gallery-item') || item;
        
        triggerElement.addEventListener('click', () => {
            lightbox.classList.add('show');
            lightboxImg.src = item.src;
            document.body.style.overflow = 'hidden'; // Prevent scrolling in background
        });

        // Ensure cursor pointer for the new images
        if (!item.closest('.gallery-item')) {
            item.style.cursor = 'pointer';
        }
    });
    
    const closeModal = () => {
        lightbox.classList.remove('show');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300); // clear after animation completes
        document.body.style.overflow = 'auto';
    };
    
    closeLightbox.addEventListener('click', closeModal);
    
    lightbox.addEventListener('click', (e) => {
        // If clicking on exactly the backdrop wrapper, close it
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('show')) {
            closeModal();
        }
    });

    // --- Member Modal (Auth & Supabase) ---
    const supabaseUrl = 'https://duwqszyygfwqzkgmivah.supabase.co';
    const supabaseKey = 'sb_publishable_chqwVl0d8g9_b8lHzlA9hQ_vYj4K1gM';
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    const memberLink = document.getElementById('member-link');
    const authModal = document.getElementById('auth-modal');
    if (authModal) { // Exists on index and testimonial pages
        const closeAuthModal = document.querySelector('#auth-modal .close-modal');
        
        // Auth Form Elements
        const authForm = document.getElementById('auth-form');
        const authTitle = document.getElementById('auth-title');
        const authDesc = document.getElementById('auth-desc');
        const authUsername = document.getElementById('auth-username');
        const authPassword = document.getElementById('auth-password');
        const authError = document.getElementById('auth-error');
        const authSubmitBtn = document.getElementById('auth-submit-btn');
        const authSwitchText = document.getElementById('auth-switch-text');
        const authSwitchBtn = document.getElementById('auth-switch-btn');
        
        let isLoginMode = true;
        const DUMMY_DOMAIN = '@member.kamisato.co'; // Hidden email domain for username-only login
        
        // Check Session on Load
        async function checkSession() {
            const { data, error } = await supabaseClient.auth.getSession();
            if (data && data.session) {
                return true;
            }
            return false;
        }

        const closeMemberModal = () => {
            authModal.classList.remove('show');
            document.body.style.overflow = 'auto'; // allow scrolling again
        };

        memberLink.addEventListener('click', async (e) => {
            e.preventDefault(); 
            
            // If logged in, go to dashboard
            const isLoggedIn = await checkSession();
            if (isLoggedIn) {
                window.location.href = 'dashboard.html';
                return;
            }
            
            // Else, show login modal
            authModal.classList.add('show');
            document.body.style.overflow = 'hidden'; 
        });

        closeAuthModal.addEventListener('click', closeMemberModal);
        
        // Close when clicking outside content
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeMemberModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authModal.classList.contains('show')) {
                closeMemberModal();
            }
        });
        
        // Toggle Login / Register
        authSwitchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                authTitle.innerHTML = 'Member <span class="highlight">Login</span>';
                authDesc.textContent = 'Masuk ke dashboard loyalty program Anda.';
                authSubmitBtn.textContent = 'Login';
                authSwitchText.textContent = 'Belum punya akun?';
                authSwitchBtn.textContent = 'Daftar Sekarang';
            } else {
                authTitle.innerHTML = 'Daftar <span class="highlight">Member</span>';
                authDesc.textContent = 'Buat akun untuk mendapatkan loyalty points.';
                authSubmitBtn.textContent = 'Register';
                authSwitchText.textContent = 'Sudah punya akun?';
                authSwitchBtn.textContent = 'Login di sini';
            }
            authError.style.display = 'none';
        });

        // Submit Handler
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = authUsername.value.trim().toLowerCase().replace(/\s+/g, '');
            const password = authPassword.value;
            
            // Supabase requires email. We create a fake email quietly to satisfy pure-username request.
            const email = `${username}${DUMMY_DOMAIN}`;
            
            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = 'Memproses...';
            authError.style.display = 'none';
            
            try {
                if (isLoginMode) {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
                    
                    if (error) throw error;
                    
                    window.location.href = 'dashboard.html';
                    
                } else {
                    const { data, error } = await supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                raw_username: authUsername.value.trim()
                            }
                        }
                    });
                    
                    if (error) throw error;
                    
                    // Show success and switch to login
                    alert('Pendaftaran berhasil! Silakan login sekarang.');
                    authSwitchBtn.click(); // switch back to login
                }
            } catch (error) {
                authError.textContent = error.message.includes('Invalid login') 
                    ? 'Username atau password salah!' 
                    : (error.message.includes('User already registered') ? 'Username sudah digunakan terdaftar!' : error.message);
                authError.style.display = 'block';
            } finally {
                authSubmitBtn.disabled = false;
                authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Register';
            }
        });
    }
    
    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // only animate once
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.fade-in-up');
    animateElements.forEach(el => observer.observe(el));

    // --- Daget.fun Style Custom Smooth Scroll (No CDN/Dependencies) ---
    // Only apply on non-touch devices for best performance
    if (!window.matchMedia("(max-width: 768px)").matches) {
        const body = document.body;
        const mainWrapper = document.createElement('div');
        mainWrapper.id = 'smooth-wrapper';
        
        // Wrap all scrollable content (excluding fixed elements like nav, modals, bg)
        const childrenToMove = Array.from(body.children).filter(el => {
            const tag = el.tagName.toLowerCase();
            const excludeTags = ['script', 'nav', 'style'];
            const excludeClasses = ['stars-bg', 'modal', 'lightbox'];
            
            if (excludeTags.includes(tag)) return false;
            if (excludeClasses.some(cls => el.classList.contains(cls))) return false;
            return true;
        });
        
        childrenToMove.forEach(child => mainWrapper.appendChild(child));
        body.insertBefore(mainWrapper, body.firstChild);
        
        mainWrapper.style.position = 'fixed';
        mainWrapper.style.top = '0';
        mainWrapper.style.left = '0';
        mainWrapper.style.width = '100%';
        mainWrapper.style.overflow = 'hidden';
        mainWrapper.style.willChange = 'transform';
        
        let currentY = 0;
        let targetY = 0;
        const ease = 0.06; // Buttery smooth daget.fun feel
        
        function updateScroll() {
            targetY = window.scrollY;
            // Native lerping
            currentY += (targetY - currentY) * ease;
            
            // Apply translation avoiding sub-pixel rendering blur
            mainWrapper.style.transform = `translate3d(0, ${-Math.round(currentY * 100) / 100}px, 0)`;
            requestAnimationFrame(updateScroll);
        }
        
        function setBodyHeight() {
            body.style.height = `${mainWrapper.getBoundingClientRect().height}px`;
        }
        
        window.addEventListener('resize', setBodyHeight);
        window.addEventListener('load', () => { setTimeout(setBodyHeight, 100); });
        
        // Auto update height if content changes (images loading etc)
        const resizeObserver = new ResizeObserver(setBodyHeight);
        resizeObserver.observe(mainWrapper);
        
        updateScroll();

        // --- Fix Anchor Links for Custom Scroll ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    // Calculate absolute position within the wrapper
                    const rect = targetElement.getBoundingClientRect();
                    const wrapperRect = mainWrapper.getBoundingClientRect();
                    const absoluteTop = rect.top - wrapperRect.top;
                    
                    window.scrollTo({
                        top: absoluteTop - 100, // 100px offset for fixed nav
                        behavior: 'smooth' 
                    });
                }
            });
        });

        // Handle page load with hash
        if (window.location.hash) {
            setTimeout(() => {
                const targetElement = document.querySelector(window.location.hash);
                if (targetElement) {
                    const rect = targetElement.getBoundingClientRect();
                    const wrapperRect = mainWrapper.getBoundingClientRect();
                    window.scrollTo({ top: (rect.top - wrapperRect.top) - 100, behavior: 'instant' });
                }
            }, 300);
        }

        // Pause scroll translate when modal is open to avoid double scrollbars/issues
        const observerConfig = { attributes: true, attributeFilter: ['class'] };
        const modalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const target = mutation.target;
                if (target.classList.contains('show')) {
                    mainWrapper.style.position = 'static';
                    mainWrapper.style.transform = 'none';
                } else {
                    mainWrapper.style.position = 'fixed';
                    currentY = window.scrollY; // Reset target to avoid jumping
                }
            });
        });

        if (lightbox) modalObserver.observe(lightbox, observerConfig);
        if (memberModal) modalObserver.observe(memberModal, observerConfig);
    }
});
