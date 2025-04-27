const listWrapper      = document.querySelector(".list-wrapper");
const generationFilter = document.querySelector("#generation-filter");
const searchInput      = document.querySelector("#search-input");
const closeIcon        = document.querySelector("#search-close-icon");
const notFoundMessage  = document.querySelector("#not-found-message");

let allPokemons = [];

// Fetch Pokémon species based on generation
async function fetchPokemonsByGeneration(gen) {
  try {
    if (gen === "all") {
      const gens = await Promise.all([
        fetch("https://pokeapi.co/api/v2/generation/1").then(res => res.json()),
        fetch("https://pokeapi.co/api/v2/generation/2").then(res => res.json()),
        fetch("https://pokeapi.co/api/v2/generation/3").then(res => res.json()),
      ]);
      return [...gens[0].pokemon_species, ...gens[1].pokemon_species, ...gens[2].pokemon_species];
    } else {
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
      const data = await res.json();
      return data.pokemon_species;
    }
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    return [];
  }
}

// Load and display Pokémon
async function loadPokemons() {
  const speciesList = await fetchPokemonsByGeneration(generationFilter.value);
  allPokemons = speciesList.map(pokemon => {
    const id = pokemon.url.split("/").filter(Boolean).pop();
    return { 
      name: pokemon.name, 
      url: `https://pokeapi.co/api/v2/pokemon/${id}/`
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  
  displayPokemons(allPokemons);
}

// Render Pokémon cards
function displayPokemons(pokemons) {
  listWrapper.innerHTML = "";

  pokemons.forEach(pokemon => {
    const id = pokemon.url.split("/").filter(Boolean).pop();
    const card = document.createElement("div");
    card.className = "list-item";
    card.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts"></p>
      </div>
      <div class="img-wrap">
        <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${id}.svg" alt="${pokemon.name}">
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${pokemon.name}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `./detail.html?id=${id}`;
    });
    listWrapper.appendChild(card);
  });
}

// Search Pokémon by name
function filterByName() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = allPokemons.filter(pokemon =>
    pokemon.name.toLowerCase().startsWith(keyword)
  );

  if (filtered.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }

  displayPokemons(filtered);
}

// Event listeners
generationFilter.addEventListener("change", async () => {
  searchInput.value = "";
  closeIcon.classList.remove("search-close-icon-visible");
  notFoundMessage.style.display = "none";
  await loadPokemons();
});

searchInput.addEventListener("input", () => {
  filterByName();
  if (searchInput.value) {
    closeIcon.classList.add("search-close-icon-visible");
  } else {
    closeIcon.classList.remove("search-close-icon-visible");
  }
});

closeIcon.addEventListener("click", () => {
  searchInput.value = "";
  closeIcon.classList.remove("search-close-icon-visible");
  filterByName();
});

// Initial load
loadPokemons();
