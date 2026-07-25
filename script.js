/**
 * Pokédex Web Application
 * Modern Architecture & State Management
 */

// Application State
const appState = {
    allPokemon: [],
    filteredPokemon: [],
    favorites: new Set(JSON.parse(localStorage.getItem('pokedex_favorites') || '[]')),
    searchQuery: '',
    selectedType: '',
    sortBy: 'id',
    showFavoritesOnly: false,
    currentModalId: null,
    audioInstance: null
};

/**
 * Initialize Application
 */
async function init() {
    showLoading(true);
    setupEventListeners();
    await fetchPokemonData();
    populateTypeFilterOptions();
    updateFavoriteBadgeCount();
    applyFiltersAndRender();
    showLoading(false);
}

/**
 * Fetch Pokémon Data (Kanto Gen I: 151)
 */
async function fetchPokemonData() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        
        // Fetch detailed data for each Pokémon in parallel batch
        const detailPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
        const rawPokemonList = await Promise.all(detailPromises);
        
        // Process & structure required fields for fast rendering
        appState.allPokemon = rawPokemonList.map(p => {
            const attackStat = p.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
            const hpStat = p.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
            const defenseStat = p.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
            const totalStats = p.stats.reduce((acc, curr) => acc + curr.base_stat, 0);

            // High-resolution official artwork fallback to standard sprite
            const officialArtwork = p.sprites.other['official-artwork']?.front_default 
                || p.sprites.front_default;
                
            return {
                id: p.id,
                name: p.name,
                height: p.height / 10, // Convert to meters
                weight: p.weight / 10, // Convert to kg
                baseExperience: p.base_experience || 0,
                image: officialArtwork,
                cryUrl: p.cries?.latest || p.cries?.legacy || null,
                types: p.types.map(t => t.type.name),
                primaryType: p.types[0]?.type.name || 'normal',
                attack: attackStat,
                hp: hpStat,
                defense: defenseStat,
                totalStats: totalStats,
                stats: p.stats.map(s => ({
                    name: s.stat.name,
                    value: s.base_stat
                })),
                abilities: p.abilities.map(a => a.ability.name)
            };
        });

        document.getElementById('pokemonCount').textContent = appState.allPokemon.length;
    } catch (error) {
        console.error('Error fetching Pokémon dataset:', error);
        const grid = document.getElementById('pokemonGrid');
        grid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Connection Error</h3>
                <p>Failed to load Pokémon data from PokéAPI. Please check your internet connection and refresh.</p>
            </div>
        `;
    }
}

/**
 * Filter, Sort, and Render Pokémon Cards
 */
function applyFiltersAndRender() {
    const { allPokemon, searchQuery, selectedType, sortBy, showFavoritesOnly, favorites } = appState;

    // Filter Logic
    appState.filteredPokemon = allPokemon.filter(pokemon => {
        const matchesNameOrId = pokemon.name.toLowerCase().includes(searchQuery) ||
                                `#${String(pokemon.id).padStart(3, '0')}`.includes(searchQuery) ||
                                String(pokemon.id) === searchQuery;
                                
        const matchesType = !selectedType || pokemon.types.includes(selectedType);
        const matchesFav = !showFavoritesOnly || favorites.has(pokemon.id);

        return matchesNameOrId && matchesType && matchesFav;
    });

    // Sorting Logic
    appState.filteredPokemon.sort((a, b) => {
        switch (sortBy) {
            case 'id-desc':
                return b.id - a.id;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'attack':
                return b.attack - a.attack;
            case 'stats':
                return b.totalStats - a.totalStats;
            case 'height':
                return b.height - a.height;
            case 'weight':
                return b.weight - a.weight;
            case 'id':
            default:
                return a.id - b.id;
        }
    });

    renderGrid();
}

/**
 * Render Pokémon Cards into Grid DOM
 */
function renderGrid() {
    const grid = document.getElementById('pokemonGrid');
    const { filteredPokemon, favorites } = appState;

    if (filteredPokemon.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-ghost"></i>
                <h3>No Pokémon Found</h3>
                <p>No Pokémon matched your current search filters or favorites selection.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredPokemon.map(pokemon => {
        const isFav = favorites.has(pokemon.id);
        const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;
        
        let attackRankClass = 'attack-low';
        let attackRankText = 'Balanced';
        if (pokemon.attack >= 100) {
            attackRankClass = 'attack-high';
            attackRankText = '⚡ High Atk';
        } else if (pokemon.attack >= 70) {
            attackRankClass = 'attack-medium';
            attackRankText = '⚔️ Mid Atk';
        }

        return `
            <article class="pokemon-card type-${pokemon.primaryType}" data-id="${pokemon.id}">
                <div class="card-top">
                    <span class="pokemon-id">${formattedId}</span>
                    <button type="button" class="favorite-btn ${isFav ? 'is-favorite' : ''}" 
                            data-action="favorite" data-id="${pokemon.id}" 
                            title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}">
                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>

                <div class="image-wrapper">
                    <div class="image-glow"></div>
                    <img class="pokemon-image" 
                         src="${pokemon.image}" 
                         alt="${pokemon.name}" 
                         loading="lazy">
                </div>

                <h2 class="pokemon-name">${pokemon.name}</h2>

                <div class="pokemon-types">
                    ${pokemon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
                </div>

                <div class="attack-badge ${attackRankClass}">
                    <span>${attackRankText} (${pokemon.attack})</span>
                </div>

                <button type="button" class="view-details-btn" data-action="details" data-id="${pokemon.id}">
                    <i class="fa-solid fa-circle-info"></i> View Details
                </button>
            </article>
        `;
    }).join('');
}

/**
 * Toggle Favorite Status
 */
function toggleFavorite(id) {
    if (appState.favorites.has(id)) {
        appState.favorites.delete(id);
    } else {
        appState.favorites.add(id);
    }
    
    // Save to LocalStorage
    localStorage.setItem('pokedex_favorites', JSON.stringify(Array.from(appState.favorites)));
    
    updateFavoriteBadgeCount();
    applyFiltersAndRender();
}

/**
 * Update Favorites Counter Badge in Header Controls
 */
function updateFavoriteBadgeCount() {
    const favCountBadge = document.getElementById('favCountBadge');
    favCountBadge.textContent = appState.favorites.size;
}

/**
 * Show Pokémon Details Modal
 */
function openModal(id) {
    const pokemon = appState.allPokemon.find(p => p.id === id);
    if (!pokemon) return;

    appState.currentModalId = id;
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('pokemonModal');
    const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

    modalBody.innerHTML = `
        <div class="modal-header-hero type-${pokemon.primaryType}">
            <div class="modal-hero-image-wrap">
                <div class="modal-hero-glow"></div>
                <img class="modal-hero-image" src="${pokemon.image}" alt="${pokemon.name}">
            </div>
            
            <div class="modal-hero-info">
                <div class="modal-title-row">
                    <h2>${pokemon.name}</h2>
                    <span class="modal-id-badge">${formattedId}</span>
                </div>
                
                <div class="modal-types-row">
                    ${pokemon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
                </div>

                ${pokemon.cryUrl ? `
                    <button type="button" class="cry-btn" onclick="playCry('${pokemon.cryUrl}')">
                        <i class="fa-solid fa-volume-high"></i> Play Cry
                    </button>
                ` : ''}
            </div>
        </div>

        <div class="modal-grid-details">
            <div class="detail-block">
                <h3><i class="fa-solid fa-ruler-combined"></i> Physical Metrics</h3>
                <div class="metrics-pills">
                    <div class="metric-card">
                        <div class="metric-value">${pokemon.height} m</div>
                        <div class="metric-label">Height</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${pokemon.weight} kg</div>
                        <div class="metric-label">Weight</div>
                    </div>
                </div>

                <h3><i class="fa-solid fa-wand-magic-sparkles"></i> Abilities</h3>
                <div class="abilities-list">
                    ${pokemon.abilities.map(a => `<span class="ability-tag">${a}</span>`).join('')}
                </div>
            </div>

            <div class="detail-block">
                <h3><i class="fa-solid fa-chart-simple"></i> Base Stats</h3>
                <div class="stats-container">
                    ${pokemon.stats.map(s => {
                        const percent = Math.min(100, Math.round((s.value / 255) * 100));
                        let barColor = '#38bdf8';
                        if (s.value >= 90) barColor = '#4ade80';
                        else if (s.value >= 60) barColor = '#60a5fa';
                        else if (s.value < 40) barColor = '#f87171';

                        return `
                            <div class="stat-row">
                                <div class="stat-info">
                                    <span class="stat-name">${formatStatName(s.name)}</span>
                                    <span class="stat-val">${s.value}</span>
                                </div>
                                <div class="stat-bar-bg">
                                    <div class="stat-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Format Stat Names for Display
 */
function formatStatName(name) {
    const nameMap = {
        'hp': 'HP',
        'attack': 'Attack',
        'defense': 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        'speed': 'Speed'
    };
    return nameMap[name] || name;
}

/**
 * Play Audio Cry
 */
function playCry(audioUrl) {
    if (!audioUrl) return;
    if (appState.audioInstance) {
        appState.audioInstance.pause();
    }
    appState.audioInstance = new Audio(audioUrl);
    appState.audioInstance.volume = 0.5;
    appState.audioInstance.play().catch(err => console.log('Audio playback error:', err));
}

/**
 * Close Modal
 */
function closeModal() {
    const modalOverlay = document.getElementById('pokemonModal');
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    appState.currentModalId = null;
}

/**
 * Navigate Modal Next/Previous
 */
function navigateModal(direction) {
    if (!appState.currentModalId || appState.filteredPokemon.length === 0) return;

    const currentIndex = appState.filteredPokemon.findIndex(p => p.id === appState.currentModalId);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex + direction;
    if (targetIndex < 0) targetIndex = appState.filteredPokemon.length - 1;
    if (targetIndex >= appState.filteredPokemon.length) targetIndex = 0;

    openModal(appState.filteredPokemon[targetIndex].id);
}

/**
 * Populate Type Filter Options
 */
function populateTypeFilterOptions() {
    const types = new Set();
    appState.allPokemon.forEach(p => p.types.forEach(t => types.add(t)));

    const typeFilterSelect = document.getElementById('typeFilter');
    Array.from(types).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeFilterSelect.appendChild(option);
    });
}

/**
 * Attach Event Listeners
 */
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const typeFilterSelect = document.getElementById('typeFilter');
    const sortOrderSelect = document.getElementById('sortOrder');
    const favFilterBtn = document.getElementById('favFilterBtn');
    const pokemonGrid = document.getElementById('pokemonGrid');
    const modalOverlay = document.getElementById('pokemonModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const prevBtn = document.getElementById('prevPokemonBtn');
    const nextBtn = document.getElementById('nextPokemonBtn');

    // Search Input
    searchInput.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value.toLowerCase().trim();
        clearSearchBtn.style.display = appState.searchQuery ? 'block' : 'none';
        applyFiltersAndRender();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        appState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        applyFiltersAndRender();
    });

    // Type & Sort Filters
    typeFilterSelect.addEventListener('change', (e) => {
        appState.selectedType = e.target.value;
        applyFiltersAndRender();
    });

    sortOrderSelect.addEventListener('change', (e) => {
        appState.sortBy = e.target.value;
        applyFiltersAndRender();
    });

    // Favorites Filter Toggle Button
    favFilterBtn.addEventListener('click', () => {
        appState.showFavoritesOnly = !appState.showFavoritesOnly;
        favFilterBtn.classList.toggle('active', appState.showFavoritesOnly);
        applyFiltersAndRender();
    });

    // Event Delegation for Grid Action Clicks (Favorite or Open Details)
    pokemonGrid.addEventListener('click', (e) => {
        const favBtn = e.target.closest('[data-action="favorite"]');
        if (favBtn) {
            e.stopPropagation();
            const id = parseInt(favBtn.dataset.id, 10);
            toggleFavorite(id);
            return;
        }

        const card = e.target.closest('.pokemon-card');
        if (card) {
            const id = parseInt(card.dataset.id, 10);
            openModal(id);
        }
    });

    // Modal Controls
    closeModalBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', () => navigateModal(-1));
    nextBtn.addEventListener('click', () => navigateModal(1));

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (modalOverlay.classList.contains('active')) {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') navigateModal(-1);
            if (e.key === 'ArrowRight') navigateModal(1);
        } else if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

/**
 * Toggle Loading Skeleton State
 */
function showLoading(isLoading) {
    const loadingElem = document.getElementById('loading');
    const gridElem = document.getElementById('pokemonGrid');
    
    loadingElem.style.display = isLoading ? 'block' : 'none';
    gridElem.style.display = isLoading ? 'none' : 'grid';
}

// Global scope binding for inline cry button
window.playCry = playCry;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', init);