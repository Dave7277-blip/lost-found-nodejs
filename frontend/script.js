document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('itemForm');
  const foundItems = document.getElementById('foundItems');
  const search = document.getElementById('search');
  const toggle = document.getElementById('darkModeToggle');
  const apiBaseUrl = 'https://lost-found-nodejs-2.onrender.com';

  async function loadItems() {
    try {
      const res = await fetch(`${apiBaseUrl}/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const items = await res.json();
      foundItems.innerHTML = '';
      items.forEach(displayItem);
    } catch (err) {
      console.error('Error loading items:', err);
      alert('Failed to load items. Please try again later.');
    }
  }

  function displayItem(item) {
    if (!item.type) return;

    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <span class="tag ${item.type}">${item.type.toUpperCase()}</span>
      <p><strong>Description:</strong> ${item.description}</p>
      <p><strong>Date:</strong> ${item.date}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <div class="images">
        ${item.image1 ? `<img src="data:image/jpeg;base64,${item.image1}" alt="Item image">` : ''}
        ${item.image2 ? `<img src="data:image/jpeg;base64,${item.image2}" alt="Additional image">` : ''}
      </div>
      <p><strong>Reported by:</strong> ${item.name}</p>
      <p><strong>Contact:</strong> ${item.phone}</p>
    `;
    foundItems.appendChild(div);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    try {
      const res = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit item');
      }
      
      const newItem = await res.json();
      displayItem(newItem);
      form.reset();
      alert("Item posted successfully!");
    } catch (err) {
      console.error('Submission error:', err);
      alert(`Failed to post item: ${err.message}`);
    }
  });

  search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    Array.from(foundItems.children).forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(term) ? '' : 'none';
    });
  });

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  });

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  loadItems();
});
