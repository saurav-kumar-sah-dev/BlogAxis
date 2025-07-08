const API_URL = '/api/posts';

document.getElementById('post-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const body = document.getElementById('body').value.trim();

  if (title && body) {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    e.target.reset();
    loadPosts();
  }
});

async function loadPosts() {
  const res = await fetch(API_URL);
  const posts = await res.json();
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <button onclick="editPost('${post._id}', '${post.title}', \`${post.body.replace(/`/g, '\\`')}\`)">✏️</button>
      <button onclick="deletePost('${post._id}')">🗑️</button>
    `;
    postsContainer.appendChild(div);
  });
}

async function deletePost(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadPosts();
}

function editPost(id, title, body) {
  document.getElementById('title').value = title;
  document.getElementById('body').value = body;

  document.getElementById('post-form').onsubmit = async e => {
    e.preventDefault();
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: document.getElementById('title').value,
        body: document.getElementById('body').value
      })
    });
    e.target.reset();
    document.getElementById('post-form').onsubmit = originalSubmit;
    loadPosts();
  };
}

const originalSubmit = document.getElementById('post-form').onsubmit;
loadPosts();
