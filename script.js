// Fetch and render starred repositories
async function loadRepositories() {
  const loadingEl = document.getElementById('loading');
  const listEl = document.getElementById('repositories-list');
  const errorEl = document.getElementById('error');

  try {
    // Show loading state
    loadingEl.textContent = 'Loading repositories...';

    // Fetch events.json
    const response = await fetch('./events.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load repositories: ${response.statusText}`);
    }

    const repositories = await response.json();

    // Clear loading message
    loadingEl.textContent = '';

    // Check if we have repositories
    if (!Array.isArray(repositories) || repositories.length === 0) {
      errorEl.textContent = 'No repositories found.';
      return;
    }

    // Render each repository
    repositories.forEach(repo => {
      const listItem = createRepositoryCard(repo);
      listEl.appendChild(listItem);
    });

  } catch (error) {
    console.error('Error loading repositories:', error);
    loadingEl.textContent = '';
    errorEl.textContent = `Error: ${error.message}`;
  }
}

// Create a repository card element
function createRepositoryCard(repo) {
  const li = document.createElement('li');
  li.className = 'repo-card';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'repo-header';

  const title = document.createElement('h2');
  title.className = 'repo-title';
  title.textContent = repo.name;

  const owner = document.createElement('p');
  owner.className = 'repo-owner';
  owner.textContent = `by ${repo.owner}`;

  headerDiv.appendChild(title);
  headerDiv.appendChild(owner);

  const description = document.createElement('p');
  description.className = 'repo-description';
  description.textContent = repo.description;

  const metaDiv = document.createElement('div');
  metaDiv.className = 'repo-meta';

  const language = document.createElement('span');
  language.className = 'repo-language';
  language.textContent = repo.language;

  const stars = document.createElement('span');
  stars.className = 'repo-stars';
  stars.textContent = `⭐ ${repo.stars.toLocaleString()}`;

  metaDiv.appendChild(language);
  metaDiv.appendChild(stars);

  const link = document.createElement('a');
  link.className = 'repo-link';
  link.href = repo.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View on GitHub';

  const date = document.createElement('p');
  date.className = 'repo-date';
  date.textContent = `Starred on ${new Date(repo.starredAt).toLocaleDateString()}`;

  li.appendChild(headerDiv);
  li.appendChild(description);
  li.appendChild(metaDiv);
  li.appendChild(link);
  li.appendChild(date);

  return li;
}

// Load repositories when the page is ready
document.addEventListener('DOMContentLoaded', loadRepositories);
