document.addEventListener('DOMContentLoaded', () => {
    
    // --- Stars Background Generation ---
    const starsContainer = document.getElementById('stars-container');
    const NUM_STARS = 100;
    
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

    // --- Member Modal (Under Construction) ---
    const memberLink = document.getElementById('member-link');
    const memberModal = document.getElementById('construction-modal');
    const closeMemberModal = document.querySelector('.close-modal');
    const modalBtnClose = document.querySelector('.modal-btn');

    const closeConstructionModal = () => {
        memberModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // allow scrolling again
    };

    memberLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent scrolling to top
        memberModal.classList.add('show');
        document.body.style.overflow = 'hidden'; 
    });

    closeMemberModal.addEventListener('click', closeConstructionModal);
    modalBtnClose.addEventListener('click', closeConstructionModal);
    
    // Close when clicking outside content
    memberModal.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            closeConstructionModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && memberModal.classList.contains('show')) {
            closeConstructionModal();
        }
    });
    
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
});
