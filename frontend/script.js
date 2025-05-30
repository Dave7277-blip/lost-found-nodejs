document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('itemForm');
  const foundItems = document.getElementById('foundItems');
  const search = document.getElementById('search');
  const toggle = document.getElementById('darkModeToggle');

  // USE YOUR ACTUAL RENDER BACKEND URL HERE ▼
  const apiBaseUrl = 'https://your-render-backend-url.onrender.com/api';

  // Load items on page load
  loadItems();

  async function loadItems() {
    try {
      const response = await fetch(`${apiBaseUrl}/items`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const items = await response.json();
      foundItems.innerHTML = '';
      items.forEach(displayItem);
    } catch (err) {
      console.error('Error loading items:', err);
      foundItems.innerHTML = `
        <div class="error">
          Failed to load items: ${err.message}
          <button onclick="loadItems()">Retry</button>
        </div>
      `;
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
      const formData = new FormData(form);
      
      // For debugging: log form data
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const newItem = await response.json();
      displayItem(newItem);
      form.reset();
      alert("Item posted successfully!");
      loadItems(); // Refresh the list
    } catch (err) {
      console.error('Submission error:', err);
      alert(`Error: ${err.message}`);
    }
  });

  // Search functionality
  search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    document.querySelectorAll('.item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });

  // Dark mode toggle
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  });

  // Initialize dark mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
});
