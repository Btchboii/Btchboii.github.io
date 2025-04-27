const listWrapper = document.querySelector(".list-wrapper");
const generationFilter = document.querySelector("#generation-filter");
const searchInput = document.querySelector("#search-input");
const closeIcon = document.querySelector("#search-close-icon");
const notFoundMessage = document.querySelector("#not-found-message");
const loadingScreen = document.querySelector("#loading-screen");

let allPokemons = [];

// Fetch Pokémon species based on generation
async function fetchPokemonsByGeneration(gen) {
  try {
    if (gen === "all") {
      const gens = await Promise.all([
        fetch("https://pokeapi.co/api/v2/generation/1").then(res => res.json()),
        fetch("https://pokeapi.co/api/v2/generation/2").then(res => res.json()),
        fetch("https://pokeapi.co/api/v2/generation/3").then(res => res.json())
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

// Show the loading screen
function showLoadingScreen() {
  loadingScreen.style.visibility = 'visible';
}

// Hide the loading screen
function hideLoadingScreen() {
  loadingScreen.style.visibility = 'hidden';
}

// Load and display Pokémon
async function loadPokemons() {
  showLoadingScreen(); // Show the loading screen

  const speciesList = await fetchPokemonsByGeneration(generationFilter.value);
  allPokemons = speciesList.map(pokemon => {
    const id = pokemon.url.split("/").filter(Boolean).pop(); // Extract the ID from the URL
    return { 
      name: pokemon.name, 
      id: id
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  displayPokemons(allPokemons);

  hideLoadingScreen(); // Hide the loading screen once the Pokémon data is loaded
}

// Render Pokémon cards
function displayPokemons(pokemons) {
  listWrapper.innerHTML = "";  // Clear the list before rendering new ones

  if (pokemons.length === 0) {
    notFoundMessage.style.display = "block";
    return;
  }

  notFoundMessage.style.display = "none";  // Hide the not found message

  pokemons.forEach(pokemon => {
    const card = document.createElement("div");
    card.className = "list-item";
    card.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts"></p>
      </div>
      <div class="img-wrap">
        <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" alt="${pokemon.name}">
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${pokemon.name}</p>
      </div>
    `;

    // Debugging: Check the ID and URL for correctness
    console.log(`Pokemon Name: ${pokemon.name}, ID: ${pokemon.id}`);
    
    // Add click event for redirection to the detail page
    card.addEventListener("click", () => {
      // Log the ID to ensure it’s correct
      console.log(`Redirecting to details page for Pokémon ID: ${pokemon.id}`);
      window.location.href = `./detail.html?id=${pokemon.id}`;
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

  displayPokemons(filtered);
  notFoundMessage.style.display = filtered.length === 0 ? "block" : "none"; // Show/hide "not found" message based on results
}

// Event listeners
generationFilter.addEventListener("change", async () => {
  searchInput.value = "";
  closeIcon.classList.remove("search-close-icon-visible");
  await loadPokemons();
});

searchInput.addEventListener("input", () => {
  filterByName();
  closeIcon.classList.toggle("search-close-icon-visible", searchInput.value !== "");
});

closeIcon.addEventListener("click", () => {
  searchInput.value = "";
  closeIcon.classList.remove("search-close-icon-visible");
  filterByName();
});

// Initial load
loadPokemons();
