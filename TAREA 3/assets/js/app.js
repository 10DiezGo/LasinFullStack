const API_BASE = 'https://jsonplaceholder.typicode.com';
const POKE_API = 'https://pokeapi.co/api/v2';
const COUNTRY_API = 'https://restcountries.com/v3.1';

let currentFilter = 'all';
let pokemonPage = 1;

// ======================
// CLASE PROJECT
// ======================
class Project {
  #id;
  constructor({ id, title, description, techs, emoji, category }) {
    this.#id = id;
    this.title = title;
    this.description = description;
    this.techs = techs;
    this.emoji = emoji;
    this.category = category;
  }

  get id() {
    return this.#id;
  }

  toHTML() {
    return `
      <article class="project-card" data-category="${this.category}">
        <div class="project-img">${this.emoji}</div>
        <div class="project-info">
          <h3>${this.title}</h3>
          <p>${this.description}</p>
          <footer class="project-tags">
            ${this.techs.map(t => `<span class="tech-badge">${t}</span>`).join('')}
          </footer>
        </div>
      </article>
    `;
  }
}

// ======================
// PROYECTOS (5 como pide)
// ======================
const projects = [
  new Project({
    id: 1,
    category: 'backend',
    emoji: '📚',
    title: 'Sistema Académico',
    description: 'Gestión de estudiantes y notas',
    techs: ['Node.js', 'PostgreSQL']
  }),
  new Project({
    id: 2,
    category: 'frontend',
    emoji: '🔎',
    title: 'Buscador de Leyes',
    description: 'Consulta de leyes ambientales',
    techs: ['JavaScript', 'HTML']
  }),
  new Project({
    id: 3,
    category: 'fullstack',
    emoji: '📊',
    title: 'Dashboard',
    description: 'Panel administrativo',
    techs: ['React', 'Node']
  }),

  // 🔥 NUEVOS
  new Project({
    id: 4,
    category: 'frontend',
    emoji: '🌦️',
    title: 'Clima App',
    description: 'Consulta clima con API',
    techs: ['JS', 'Fetch']
  }),
  new Project({
    id: 5,
    category: 'backend',
    emoji: '⚙️',
    title: 'API Usuarios',
    description: 'CRUD con Express',
    techs: ['Node', 'Express']
  }),
];

// ======================
// FILTRO
// ======================
const filterProjects = (category) =>
  category === 'all'
    ? projects
    : projects.filter(p => p.category === category);

// ======================
// DOM
// ======================
const projectsGrid = document.getElementById('projects-grid');
const filterButtons = document.querySelectorAll('.filter-btn');

// ======================
// RENDER
// ======================
function renderProjects(category = 'all') {
  const filtered = filterProjects(category);

  projectsGrid.innerHTML = filtered.map(p => p.toHTML()).join('');

  document.getElementById('project-count').textContent =
    `${filtered.length} proyectos`;

  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
}

renderProjects();

// ======================
// EVENTOS FILTRO
// ======================
filterButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    currentFilter = e.target.dataset.filter;
    renderProjects(currentFilter);
  });
});

// ======================
// FETCH BASE
// ======================
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error');
  return await res.json();
}

// ======================
// POKEMON
// ======================
async function fetchPokemons(offset = 0) {
  const pokeGrid = document.getElementById('poke-grid');
  pokeGrid.innerHTML = 'Cargando...';

  const data = await fetchJSON(`${POKE_API}/pokemon?limit=6&offset=${offset}`);

  const details = await Promise.all(
    data.results.map(p => fetchJSON(p.url))
  );

pokeGrid.innerHTML = details.map(p => {
  const type = p.types[0].type.name;

  return `
    <div class="poke-card poke--${type}">
      <img src="${p.sprites.front_default}">
      <div class="poke-name">${p.name}</div>
      <div class="poke-type">${type}</div>
    </div>
  `;
}).join('');
}

document.getElementById('poke-next').addEventListener('click', () => {
  pokemonPage++;
  fetchPokemons((pokemonPage - 1) * 6);
});

fetchPokemons(0);

// ======================
// COUNTRIES
// ======================
let timer;
document.getElementById('country-search').addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => fetchCountry(e.target.value), 600);
});

async function fetchCountry(name) {
  const result = document.getElementById('country-result');
  if (!name) return;

  result.innerHTML = 'Buscando...';

  try {
    const [c] = await fetchJSON(`${COUNTRY_API}/name/${name}`);

result.innerHTML = `
  <div class="country-card">
    <img class="country-flag" src="${c.flags.svg}">
    <div class="country-info">
      <h4>${c.name.common}</h4>
      <p>Capital: ${c.capital}</p>
    </div>
  </div>
`;
  } catch {
    result.innerHTML = 'No encontrado';
  }
}