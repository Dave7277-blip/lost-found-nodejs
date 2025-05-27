window.onload = () => {
    const form = document.getElementById('itemForm');
    const foundItems = document.getElementById('foundItems');
    const search = document.getElementById('search');
    const toggle = document.getElementById('darkModeToggle');
  
    async function loadItems() {
      const res = await fetch('/api/items');
      const items = await res.json();
      foundItems.innerHTML = '';
      items.forEach(displayItem);
    }
  
    function displayItem(item) {
      if (!item.type) return;
  
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <span class="tag ${item.type}">${item.type.toUpperCase()}</span>
        <p><strong>Description:</strong> ${item.description}</p>
        <div class="images">
          <img src="data:image/jpeg;base64,${item.image1}" alt="Image 1">
          ${item.image2 ? `<img src="data:image/jpeg;base64,${item.image2}" alt="Image 2">` : ''}
        </div>
        <p><strong>By:</strong> ${item.name}</p>
        <p><strong>Phone:</strong> ${item.phone}</p>
      `;
      foundItems.appendChild(div);
    }
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const res = await fetch('/api/items', { method: 'POST', body: formData });
      const newItem = await res.json();
      if (newItem.error) return alert('Failed: ' + newItem.error);
      displayItem(newItem);
      form.reset();
      alert("Item posted successfully!");
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
    });
  
    loadItems();
  };
  