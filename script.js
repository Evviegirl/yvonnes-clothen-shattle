
document.addEventListener('DOMContentLoaded', function() {
  // Process template inheritance (simplified client-side template system)
  const extendMatch = document.body.innerHTML.match(/{%\s*extends\s*"([^"]+)"\s*%}/);
  if (extendMatch) {
    fetch(extendMatch[1])
      .then(response => response.text())
      .then(baseTemplate => {
        // Very simple block replacement (this is just for demo, not production-ready)
        const blocks = {};
        document.body.innerHTML.replace(/{%\s*block\s*(\w+)\s*%}([\s\S]*?){%\s*endblock\s*%}/g, (match, blockName, content) => {
          blocks[blockName] = content.trim();
          return '';
        });
        
        let newContent = baseTemplate;
        for (const [blockName, content] of Object.entries(blocks)) {
          newContent = newContent.replace(new RegExp(`{%\\s*block\\s*${blockName}\\s*%}[\\s\\S]*?{%\\s*endblock\\s*%}`), `{% block ${blockName} %}${content}{% endblock %}`);
        }
        
        document.documentElement.innerHTML = newContent;
        
        // Re-initialize event handlers and other functionality
        initializeSite();
      });
  } else {
    initializeSite();
  }
  
  function initializeSite() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
      });
    }
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add animation to cards when they come into view
    const cards = document.querySelectorAll('.card, .product-card');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    cards.forEach(card => {
      card.style.opacity = 0;
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(card);
    });

    // Shopping Cart Functionality
    class ShoppingCart {
      constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.count = 0;
        this.updateCartCount();
        this.bindEvents();
        this.updateCartDisplay();
      }

      bindEvents() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
          button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const img = button.closest('.card, .product-card').querySelector('img').src;
            
            this.addItem(id, name, price, img);
            this.showAddedToCartMessage(name);
          });
        });

        // Update shipping cost when option changes
        const shippingOptions = document.querySelectorAll('input[name="shipping"]');
        shippingOptions.forEach(option => {
          option.addEventListener('change', () => {
            this.updateCartSummary();
          });
        });
      }

      addItem(id, name, price, img) {
        const existingItem = this.items.find(item => item.id === id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          this.items.push({
            id,
            name,
            price,
            img,
            quantity: 1
          });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
      }

      removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
      }

      updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
          item.quantity = quantity;
          if (item.quantity <= 0) {
            this.removeItem(id);
            return;
          }
        }
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
      }

      saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
      }

      updateCartCount() {
        this.count = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
          element.textContent = this.count;
        });
      }

      updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartEmptyMessage = document.querySelector('.cart-empty');
        const cartSummary = document.querySelector('.cart-summary');
        
        if (!cartItemsContainer) return; // Not on cart page
        
        if (this.items.length === 0) {
          if (cartEmptyMessage) cartEmptyMessage.style.display = 'flex';
          if (cartItemsContainer) cartItemsContainer.style.display = 'none';
          if (cartSummary) cartSummary.style.display = 'none';
          return;
        }
        
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
        if (cartItemsContainer) cartItemsContainer.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'block';
        
        // Generate cart items HTML
        if (cartItemsContainer) {
          cartItemsContainer.innerHTML = '';
          
          this.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
              <div class="item-image">
                <img src="${item.img}" alt="${item.name}">
              </div>
              <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">$${item.price.toFixed(2)}</p>
              </div>
              <div class="item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
              </div>
              <div class="item-total">
                $${(item.price * item.quantity).toFixed(2)}
              </div>
              <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-times"></i>
              </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
          });
          
          // Add event listeners to the new buttons
          document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', () => {
              const id = btn.getAttribute('data-id');
              const item = this.items.find(item => item.id === id);
              if (item) {
                this.updateQuantity(id, item.quantity - 1);
              }
            });
          });
          
          document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', () => {
              const id = btn.getAttribute('data-id');
              const item = this.items.find(item => item.id === id);
              if (item) {
                this.updateQuantity(id, item.quantity + 1);
              }
            });
          });
          
          document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
              const id = btn.getAttribute('data-id');
              this.removeItem(id);
            });
          });
        }
        
        this.updateCartSummary();
      }
      
      updateCartSummary() {
        const subtotalElement = document.querySelector('.cart-subtotal');
        const shippingElement = document.querySelector('.shipping-cost');
        const totalElement = document.querySelector('.cart-total');
        
        if (!subtotalElement) return; // Not on cart page
        
        // Calculate subtotal
        const subtotal = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
        
        // Determine shipping cost based on selected option
        let shippingCost = 4.99; // Default to standard shipping
        const selectedShipping = document.querySelector('input[name="shipping"]:checked');
        
        if (selectedShipping) {
          if (selectedShipping.value === 'express') {
            shippingCost = 9.99;
          } else if (selectedShipping.value === 'free' || subtotal >= 100) {
            shippingCost = 0;
          }
        }
        
        // Update displayed values
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
        totalElement.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
      }

      showAddedToCartMessage(productName) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.cart-notification');
        
        if (!notification) {
          notification = document.createElement('div');
          notification.className = 'cart-notification';
          document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = `${productName} added to cart!`;
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }
    }

    // Initialize cart
    const cart = new ShoppingCart();

    // Checkout button functionality
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        alert('Thank you for your order! This would proceed to payment in a real store.');
      });
    }
  }
});
