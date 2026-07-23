// Validate repository object has required fields
function isValidRepository(repo) {
  return (
    repo &&
    typeof repo === 'object' &&
    typeof repo.name === 'string' &&
    typeof repo.owner === 'string' &&
    typeof repo.description === 'string' &&
    typeof repo.url === 'string' &&
    typeof repo.language === 'string' &&
    typeof repo.stars === 'number' &&
    repo.name.trim().length > 0 &&
    repo.owner.trim().length > 0 &&
    isValidUrl(repo.url)
  );
}

// Validate URL format
function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

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

    let repositories;
    try {
      repositories = await response.json();
    } catch (parseError) {
      throw new Error('Invalid JSON format in events.json');
    }

    // Clear loading message
    loadingEl.textContent = '';

    // Check if we have repositories
    if (!Array.isArray(repositories)) {
      throw new Error('Repository data must be an array');
    }

    if (repositories.length === 0) {
      errorEl.textContent = 'No repositories found.';
      return;
    }

    // Validate and render each repository
    let validCount = 0;
    repositories.forEach((repo, index) => {
      if (!isValidRepository(repo)) {
        console.warn(`Repository at index ${index} is missing required fields or has invalid data`, repo);
        return;
      }
      validCount++;
      const listItem = createRepositoryCard(repo);
      listEl.appendChild(listItem);
    });

    if (validCount === 0) {
      throw new Error('No valid repositories found in events.json');
    }

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
  // Escape text content to prevent XSS
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

  const starsWrapper = document.createElement('span');
  starsWrapper.className = 'repo-stars';
  // Create accessible star count with screen reader text
  const starEmoji = document.createElement('span');
  starEmoji.setAttribute('aria-hidden', 'true');
  starEmoji.textContent = '⭐ ';
  const starCount = document.createElement('span');
  starCount.textContent = repo.stars.toLocaleString();
  starsWrapper.appendChild(starEmoji);
  starsWrapper.appendChild(starCount);
  starsWrapper.setAttribute('title', `${repo.stars.toLocaleString()} stars`);

  metaDiv.appendChild(language);
  metaDiv.appendChild(starsWrapper);

  const link = document.createElement('a');
  link.className = 'repo-link';
  link.href = repo.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View on GitHub';
  // Add accessible title for external link
  link.setAttribute('title', `View ${repo.name} on GitHub (opens in new window)`);

  const date = document.createElement('p');
  date.className = 'repo-date';
  // Safely parse the date with error handling
  try {
    const parsedDate = new Date(repo.starredAt);
    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }
    date.textContent = `Starred on ${parsedDate.toLocaleDateString()}`;
  } catch {
    date.textContent = `Starred on ${repo.starredAt || 'Unknown date'}`;
  }

  li.appendChild(headerDiv);
  li.appendChild(description);
  li.appendChild(metaDiv);
  li.appendChild(link);
  li.appendChild(date);

  return li;
}

// Load repositories when the page is ready
document.addEventListener('DOMContentLoaded', loadRepositories);
