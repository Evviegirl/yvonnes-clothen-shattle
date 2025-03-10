
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        nav.classList.remove('active');
        
        // Scroll to target
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Adjust for header height
          behavior: 'smooth'
        });
        
        // Update active nav link
        document.querySelectorAll('nav a').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });
  
  // Update active nav link on scroll
  window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100; // Adjust for header height
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('nav a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Price range slider
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  
  if (priceRange && priceValue) {
    priceRange.addEventListener('input', function() {
      priceValue.textContent = this.value;
    });
  }
  
  // Shopping Cart functionality
  class ShoppingCart {
    constructor() {
      this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
      this.total = 0;
      this.count = 0;
      
      this.initCart();
      this.updateCartUI();
      
      // Add event listeners
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.dataset.id;
          const productName = e.target.dataset.name;
          const productPrice = parseFloat(e.target.dataset.price);
          
          this.addItem(productId, productName, productPrice);
          this.showAddedToCartMessage(productName);
        });
      });
    }
    
    initCart() {
      // Calculate total and count
      this.items.forEach(item => {
        this.total += item.price * item.quantity;
        this.count += item.quantity;
      });
      
      // Setup cart display
      const cartItems = document.querySelector('.cart-items');
      const cartEmpty = document.querySelector('.cart-empty');
      const cartSummary = document.querySelector('.cart-summary');
      
      if (cartItems && cartEmpty && cartSummary) {
        if (this.items.length === 0) {
          cartItems.style.display = 'none';
          cartSummary.style.display = 'none';
          cartEmpty.style.display = 'flex';
        } else {
          cartItems.style.display = 'grid';
          cartSummary.style.display = 'block';
          cartEmpty.style.display = 'none';
          
          // Render cart items
          this.renderCartItems();
        }
      }
    }
    
    renderCartItems() {
      const cartItems = document.querySelector('.cart-items');
      if (!cartItems) return;
      
      cartItems.innerHTML = '';
      
      this.items.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <div class="item-image">
            <img src="https://images.unsplash.com/photo-${item.id.length > 1 ? item.id : '1541099649105-f69ad21f3246'}?q=80&w=100" alt="${item.name}">
          </div>
          <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-price">$${item.price.toFixed(2)}</p>
          </div>
          <div class="item-quantity">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
          <div class="item-total">
            $${(item.price * item.quantity).toFixed(2)}
          </div>
          <button class="remove-item" data-id="${item.id}">×</button>
        `;
        
        cartItems.appendChild(cartItem);
      });
      
      // Add event listeners to buttons
      document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          this.decreaseQuantity(id);
        });
      });
      
      document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          this.increaseQuantity(id);
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          this.removeItem(id);
        });
      });
    }
    
    addItem(id, name, price) {
      const existingItem = this.items.find(item => item.id === id);
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({
          id: id,
          name: name,
          price: price,
          quantity: 1
        });
      }
      
      this.saveCart();
      this.updateCartUI();
    }
    
    increaseQuantity(id) {
      const item = this.items.find(item => item.id === id);
      if (item) {
        item.quantity++;
        this.saveCart();
        this.updateCartUI();
      }
    }
    
    decreaseQuantity(id) {
      const item = this.items.find(item => item.id === id);
      if (item) {
        item.quantity--;
        
        if (item.quantity <= 0) {
          this.removeItem(id);
        } else {
          this.saveCart();
          this.updateCartUI();
        }
      }
    }
    
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.saveCart();
      this.updateCartUI();
    }
    
    saveCart() {
      localStorage.setItem('cartItems', JSON.stringify(this.items));
    }
    
    updateCartUI() {
      // Update cart count
      this.count = this.items.reduce((total, item) => total + item.quantity, 0);
      const cartCountElement = document.querySelector('.cart-count');
      if (cartCountElement) {
        cartCountElement.textContent = this.count;
      }
      
      // Update cart totals
      this.total = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      const subtotalElement = document.querySelector('.cart-subtotal');
      const totalElement = document.querySelector('.cart-total');
      const shippingElement = document.querySelector('.shipping-cost');
      
      if (subtotalElement && totalElement && shippingElement) {
        subtotalElement.textContent = `$${this.total.toFixed(2)}`;
        
        // Calculate shipping (free over $100)
        const shipping = this.total > 100 ? 0 : 10;
        shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        
        // Update total
        totalElement.textContent = `$${(this.total + shipping).toFixed(2)}`;
      }
      
      // Check if cart is empty
      const cartItems = document.querySelector('.cart-items');
      const cartEmpty = document.querySelector('.cart-empty');
      const cartSummary = document.querySelector('.cart-summary');
      
      if (cartItems && cartEmpty && cartSummary) {
        if (this.items.length === 0) {
          cartItems.style.display = 'none';
          cartSummary.style.display = 'none';
          cartEmpty.style.display = 'flex';
        } else {
          cartItems.style.display = 'grid';
          cartSummary.style.display = 'block';
          cartEmpty.style.display = 'none';
          
          // Re-render cart items
          this.renderCartItems();
        }
      }
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
  
  // Gallery filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(filterBtn => {
          filterBtn.classList.remove('active');
        });
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        // Filter gallery items
        galleryItems.forEach(item => {
          if (filterValue === 'all' || item.classList.contains(filterValue)) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 10);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
});
