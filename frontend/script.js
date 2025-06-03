document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('itemForm');
  const foundItems = document.getElementById('foundItems');
  const search = document.getElementById('search');
  const toggle = document.getElementById('darkModeToggle');

  // USE YOUR ACTUAL RENDER BACKEND URL ▼
  const apiBaseUrl = 'https://lost-found-nodejs-33gt.onrender.com';

  // Load items on startup
  loadItems();

  async function loadItems() {
    try {
      showLoading();
      const response = await fetch(`${apiBaseUrl}/items`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load items');
      }

      const items = await response.json();
      foundItems.innerHTML = '';
      items.forEach(displayItem);
    } catch (err) {
      console.error('Load Error:', err);
      showError(err.message);
    }
  }

  function displayItem(item) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <span class="tag ${item.type}">${item.type.toUpperCase()}</span>
      <p><strong>Description:</strong> ${item.description}</p>
      ${item.date ? `<p><strong>Date:</strong> ${item.date}</p>` : ''}
      ${item.location ? `<p><strong>Location:</strong> ${item.location}</p>` : ''}
      <div class="images">
        ${item.image1 ? `<img src="data:image/jpeg;base64,${item.image1}" alt="Item">` : ''}
        ${item.image2 ? `<img src="data:image/jpeg;base64,${item.image2}" alt="Additional photo">` : ''}
      </div>
      <p><strong>Reported by:</strong> ${item.name}</p>
      <p><strong>Contact:</strong> ${item.phone}</p>
    `;
    foundItems.appendChild(div);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';

      const formData = new FormData(form);
      
      // Log form data for debugging
      console.log('Submitting:', Object.fromEntries(formData.entries()));

      const response = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const newItem = await response.json();
      console.log('Posted:', newItem);
      
      form.reset();
      loadItems(); // Refresh list
      alert('Item posted successfully!');
    } catch (err) {
      console.error('Submit Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add My Report';
    }
  });

  // Helper functions
  function showLoading() {
    foundItems.innerHTML = '<div class="loading">Loading items...</div>';
  }

  function showError(message) {
    foundItems.innerHTML = `
      <div class="error">
        ${message}
        <button onclick="loadItems()">Retry</button>
      </div>
    `;
  }

  // Search and dark mode functionality remains same
  search.addEventListener('input', filterItems);
  toggle.addEventListener('click', toggleDarkMode);
});

// Additional helper functions
function filterItems() {
  const term = this.value.toLowerCase();
  document.querySelectorAll('.item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

// Initialize dark mode
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('itemForm');
  const foundItems = document.getElementById('foundItems');
  const searchInput = document.getElementById('search');
  const toggle = document.getElementById('darkModeToggle');

  // USE YOUR ACTUAL RENDER BACKEND URL ▼
  const apiBaseUrl = 'https://your-render-backend-url.onrender.com/api';

  // Store all items for search filtering
  let allItems = [];

  // Load items on page load
  loadItems();

  async function loadItems() {
    try {
      showLoading();
      const response = await fetch(`${apiBaseUrl}/items`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load items');
      }

      allItems = await response.json();
      displayItems(allItems);
    } catch (err) {
      console.error('Load Error:', err);
      showError(err.message);
    }
  }

  function displayItems(items) {
    foundItems.innerHTML = '';
    if (items.length === 0) {
      foundItems.innerHTML = '<div class="empty">No items found</div>';
      return;
    }
    
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <span class="tag ${item.type}">${item.type.toUpperCase()}</span>
        <p><strong>Description:</strong> ${item.description}</p>
        ${item.date ? `<p><strong>Date:</strong> ${item.date}</p>` : ''}
        ${item.location ? `<p><strong>Location:</strong> ${item.location}</p>` : ''}
        <div class="images">
          ${item.image1 ? `<img src="data:image/jpeg;base64,${item.image1}" alt="Item">` : ''}
          ${item.image2 ? `<img src="data:image/jpeg;base64,${item.image2}" alt="Additional photo">` : ''}
        </div>
        <p><strong>Reported by:</strong> ${item.name}</p>
        <p><strong>Contact:</strong> ${item.phone}</p>
      `;
      foundItems.appendChild(div);
    });
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';

      const formData = new FormData(form);
      const response = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const newItem = await response.json();
      
      // Update the UI immediately
      allItems.unshift(newItem); // Add to beginning of array
      displayItems(allItems);
      form.reset();
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success';
      successMsg.textContent = 'Item posted successfully!';
      foundItems.prepend(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (err) {
      console.error('Submit Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add My Report';
    }
  });

  // Enhanced Search Feature
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
      displayItems(allItems);
      return;
    }
    
    const filteredItems = allItems.filter(item => 
      item.description.toLowerCase().includes(searchTerm) ||
      (item.location && item.location.toLowerCase().includes(searchTerm)) ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.type.toLowerCase().includes(searchTerm)
    );
    
    displayItems(filteredItems);
  });

  // Helper functions
  function showLoading() {
    foundItems.innerHTML = '<div class="loading">Loading items...</div>';
  }

  function showError(message) {
    foundItems.innerHTML = `
      <div class="error">
        ${message}
        <button onclick="loadItems()">Retry</button>
      </div>
    `;
  }

  // Dark mode toggle (existing functionality)
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  });

  // Initialize dark mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
});
