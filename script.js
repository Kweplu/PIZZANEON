// State Management
const state = {
    basePrice: 12, // 10" size default
    crustAddon: 0,
    toppings: [],
    toppingPrice: 1.50,
    cartItems: [],
    cartTotal: 0,
    cartCount: 0
};

// DOM Elements
const sizeBtns = document.querySelectorAll('.size-options .option-btn');
const crustBtns = document.querySelectorAll('.crust-options .option-btn');
const toppingToggles = document.querySelectorAll('.topping-toggle input');
const buildTotalEl = document.getElementById('build-total');
const addBuildBtn = document.getElementById('add-build-btn');
const cartTotalEls = document.querySelectorAll('.cart-total, .mobile-cart-total, .cart-total-display');
const cartCountEls = document.querySelectorAll('.cart-count');
const addBtns = document.querySelectorAll('.add-btn');

// Cart Drawer Elements
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartBtn = document.getElementById('cart-btn');
const mobileCartBtn = document.getElementById('mobile-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const drawerCheckoutBtn = document.getElementById('drawer-checkout-btn');
const mobileCheckoutBtn = document.getElementById('mobile-checkout-btn');

// Tracking Modal Elements
const trackingModal = document.getElementById('tracking-modal');
const closeTrackingBtn = document.getElementById('close-tracking-btn');
const trackingFill = document.getElementById('tracking-fill');
const trackingSteps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4')
];

// Calculate and update the UI for Builder
function updateBuilderPrice() {
    let total = state.basePrice + state.crustAddon + (state.toppings.length * state.toppingPrice);
    buildTotalEl.textContent = `$${total.toFixed(2)}`;
    return total;
}

// Size Selection
sizeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.basePrice = parseFloat(e.target.dataset.price);
        updateBuilderPrice();
        
        // Pop animation
        gsap.fromTo('.pizza-base img', { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    });
});

// Crust Selection
crustBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        crustBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.crustAddon = parseFloat(e.target.dataset.addon || 0);
        updateBuilderPrice();
    });
});

// Topping Selection
toppingToggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
        const val = e.target.value;
        if (e.target.checked) {
            state.toppings.push(val);
        } else {
            state.toppings = state.toppings.filter(t => t !== val);
        }
        updateBuilderPrice();
    });
});

// Add Item to Cart Array
function addToCart(item) {
    state.cartItems.push(item);
    state.cartCount++;
    state.cartTotal += item.price;
    
    // Update all cart totals
    cartTotalEls.forEach(el => {
        el.textContent = `$${state.cartTotal.toFixed(2)}`;
    });
    
    cartCountEls.forEach(el => {
        el.textContent = state.cartCount;
    });

    // Render drawer items
    renderCartDrawer();

    // Trigger cart bump animation
    gsap.fromTo(['.cart-trigger', '.mobile-cart-summary'], 
        { scale: 1.1, color: '#ff3b30' }, 
        { scale: 1, color: '#ffffff', duration: 0.4, ease: 'power2.out' }
    );
}

// Render Cart Drawer
function renderCartDrawer() {
    cartItemsContainer.innerHTML = '';
    
    if (state.cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 2rem 0;">No items in your loadout yet.</p>';
        return;
    }

    state.cartItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-details">
                <h5>${item.name}</h5>
                ${item.desc ? `<p>${item.desc}</p>` : ''}
            </div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        `;
        cartItemsContainer.appendChild(div);
    });
}

// Builder Add Button
addBuildBtn.addEventListener('click', () => {
    const finalPrice = updateBuilderPrice();
    const sizeName = document.querySelector('.size-options .active').textContent;
    const crustName = document.querySelector('.crust-options .active').textContent;
    
    const desc = `${sizeName}, ${crustName}` + (state.toppings.length > 0 ? ` + ${state.toppings.length} toppings` : '');
    
    addToCart({
        name: 'Custom Cyber Construct',
        desc: desc,
        price: finalPrice
    });
    
    // Button feedback
    const originalText = addBuildBtn.textContent;
    addBuildBtn.textContent = 'ADDED!';
    addBuildBtn.style.background = '#ff9500';
    addBuildBtn.style.color = 'white';
    
    setTimeout(() => {
        addBuildBtn.textContent = originalText;
        addBuildBtn.style.background = 'white';
        addBuildBtn.style.color = 'black';
        openDrawer(); // Open drawer to show the new item
    }, 800);
});

// Menu/Upsell Add Buttons
addBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const name = e.target.dataset.name;
        const price = parseFloat(e.target.dataset.price);
        
        addToCart({
            name: name,
            desc: '',
            price: price
        });
        
        // Button feedback
        const originalText = e.target.textContent;
        e.target.textContent = 'Added';
        setTimeout(() => {
            e.target.textContent = originalText;
            if(e.target.classList.contains('upsell-add')) {
                // hide upsell after adding
                e.target.parentElement.style.display = 'none';
            }
        }, 1000);
    });
});

// Drawer Toggles
function openDrawer() {
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeDrawer() {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

cartBtn.addEventListener('click', openDrawer);
mobileCartBtn.addEventListener('click', openDrawer);
closeCartBtn.addEventListener('click', closeDrawer);
cartOverlay.addEventListener('click', closeDrawer);

// Checkout Logic -> Triggers Tracking Modal
function initializeCheckout() {
    if(state.cartItems.length === 0) return alert('Your cart is empty.');
    
    closeDrawer();
    
    // Show tracking modal
    trackingModal.classList.add('active');
    
    // Reset progress
    trackingFill.style.width = '0%';
    trackingSteps.forEach((s, idx) => {
        if(idx === 0) s.classList.add('active');
        else s.classList.remove('active');
    });

    // Simulate Order Progress
    setTimeout(() => {
        trackingFill.style.width = '33%';
        trackingSteps[1].classList.add('active');
    }, 2000);
    
    setTimeout(() => {
        trackingFill.style.width = '66%';
        trackingSteps[2].classList.add('active');
    }, 4500);
    
    setTimeout(() => {
        trackingFill.style.width = '100%';
        trackingSteps[3].classList.add('active');
    }, 7000);
}

drawerCheckoutBtn.addEventListener('click', initializeCheckout);
mobileCheckoutBtn.addEventListener('click', initializeCheckout);

closeTrackingBtn.addEventListener('click', () => {
    trackingModal.classList.remove('active');
    // Clear cart
    state.cartItems = [];
    state.cartCount = 0;
    state.cartTotal = 0;
    renderCartDrawer();
    cartTotalEls.forEach(el => el.textContent = '$0.00');
    cartCountEls.forEach(el => el.textContent = '0');
});

// Verify Address
document.querySelector('.verify-btn')?.addEventListener('click', (e) => {
    e.target.textContent = 'Verified ✓';
    e.target.style.color = '#fff';
    e.target.style.background = '#4cd964';
});

// Navbar Scroll Animation
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// GSAP Animations
document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger);

    // Initial render
    renderCartDrawer();

    // Hero Text Stagger
    gsap.from('.stagger-text', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2
    });

    // Hero Pizza Float Animation
    gsap.to('.hero-pizza-img', {
        y: -15,
        rotation: 2,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    // Scroll Reveals for Sections
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play reverse play reverse'
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // Menu Cards Stagger Reveal
    gsap.from('.scroll-reveal', {
        scrollTrigger: {
            trigger: '.menu-grid',
            start: 'top 75%',
            toggleActions: 'play reverse play reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.2)'
    });
    
    // Builder Slide In
    gsap.from('.builder-visual', {
        scrollTrigger: {
            trigger: '.builder-section',
            start: 'top 70%',
            toggleActions: 'play reverse play reverse'
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
    
    gsap.from('.control-group', {
        scrollTrigger: {
            trigger: '.builder-controls',
            start: 'top 70%',
            toggleActions: 'play reverse play reverse'
        },
        x: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
const navLinksAnchors = navLinks.querySelectorAll('a');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
});

// Close menu when a link is clicked
navLinksAnchors.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

