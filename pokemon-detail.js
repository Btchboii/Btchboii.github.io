let currentPokemonId = null;
let allPokemonIds = [];

document.addEventListener("DOMContentLoaded", async () => {
  const pokemonID = new URLSearchParams(window.location.search).get("id");
  const id = parseInt(pokemonID, 10);

  allPokemonIds = await fetchAllPokemonIds(); // Get all ids first

  if (!allPokemonIds.includes(id)) {
    return (window.location.href = "./pokedex.html");
  }

  currentPokemonId = id;
  loadPokemon(id);
});

async function fetchAllPokemonIds() {
  const generations = [1, 2, 3];
  let ids = [];

  try {
    const promises = generations.map(gen =>
      fetch(`https://pokeapi.co/api/v2/generation/${gen}`).then(res => res.json())
    );
    const results = await Promise.all(promises);

    results.forEach(data => {
      data.pokemon_species.forEach(pokemon => {
        const id = parseInt(pokemon.url.split("/").filter(Boolean).pop());
        ids.push(id);
      });
    });

    ids.sort((a, b) => a - b);
    return ids;
  } catch (error) {
    console.error("Error fetching all Pokémon ids:", error);
    return [];
  }
}

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json()),
    ]);

    const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
    abilitiesWrapper.innerHTML = "";

    if (currentPokemonId === id) {
      displayPokemonDetails(pokemon);
      const flavorText = getEnglishFlavorText(pokemonSpecies);
      document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText;

      setupNavigation(id);

      if (pokemon.name.toLowerCase() === "blastoise") {
        playBlastoiseMusic();
      } else {
        stopBlastoiseMusic();
      }

      window.history.pushState({}, "", `./detail.html?id=${id}`);
    }

    return true;
  } catch (error) {
    console.error("An error occurred while fetching Pokémon data:", error);
    return false;
  }
}

function setupNavigation(id) {
  const leftArrow = document.querySelector("#leftArrow");
  const rightArrow = document.querySelector("#rightArrow");

  leftArrow.onclick = null;
  rightArrow.onclick = null;

  const currentIndex = allPokemonIds.indexOf(id);

  if (currentIndex > 0) {
    leftArrow.addEventListener("click", (e) => {
      e.preventDefault();
      navigatePokemon(allPokemonIds[currentIndex - 1]);
    });
  }

  if (currentIndex < allPokemonIds.length - 1) {
    rightArrow.addEventListener("click", (e) => {
      e.preventDefault();
      navigatePokemon(allPokemonIds[currentIndex + 1]);
    });
  }
}

async function navigatePokemon(id) {
  currentPokemonId = id;
  await loadPokemon(id);
}

function playBlastoiseMusic() {
  let existingAudio = document.getElementById("blastoise-audio");
  if (existingAudio) {
    existingAudio.play();
    return;
  }

  const audio = document.createElement("audio");
  audio.src = "./assets/Blastoise.MP3";
  audio.id = "blastoise-audio";
  audio.loop = true;
  document.body.appendChild(audio);

  const tryPlay = () => {
    audio.play().catch(() => {
      console.warn("User interaction needed to play audio.");
    });
    document.removeEventListener("click", tryPlay);
    document.removeEventListener("touchstart", tryPlay);
  };

  document.addEventListener("click", tryPlay);
  document.addEventListener("touchstart", tryPlay);
}

function stopBlastoiseMusic() {
  const existingAudio = document.getElementById("blastoise-audio");
  if (existingAudio) {
    existingAudio.pause();
    existingAudio.remove();
  }
}

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

function setElementStyles(elements, cssProperty, value) {
  elements.forEach((element) => {
    element.style[cssProperty] = value;
  });
}

function rgbaFromHex(hexColor) {
  return [
    parseInt(hexColor.slice(1, 3), 16),
    parseInt(hexColor.slice(3, 5), 16),
    parseInt(hexColor.slice(5, 7), 16),
  ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const color = typeColors[mainType];

  if (!color) {
    console.warn(`Color not defined for type: ${mainType}`);
    return;
  }

  const detailMainElement = document.querySelector(".detail-main");
  setElementStyles([detailMainElement], "backgroundColor", color);
  setElementStyles([detailMainElement], "borderColor", color);

  setElementStyles(
    document.querySelectorAll(".power-wrapper > p"),
    "backgroundColor",
    color
  );

  setElementStyles(
    document.querySelectorAll(".stats-wrap p.stats"),
    "color",
    color
  );

  setElementStyles(
    document.querySelectorAll(".stats-wrap .progress-bar"),
    "color",
    color
  );

  const rgbaColor = rgbaFromHex(color);
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: ${color};
    }
  `;
  document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
  const element = document.createElement(tag);
  Object.keys(options).forEach((key) => {
    element[key] = options[key];
  });
  parent.appendChild(element);
  return element;
}

function displayPokemonDetails(pokemon) {
  const { name, id, types, weight, height, abilities, stats } = pokemon;
  const capitalizePokemonName = capitalizeFirstLetter(name);

  document.querySelector("title").textContent = capitalizePokemonName;

  const detailMainElement = document.querySelector(".detail-main");
  detailMainElement.className = "detail-main main"; // reset classes
  detailMainElement.classList.add(name.toLowerCase());

  document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;

  document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

  const imageElement = document.querySelector(".detail-img-wrapper img");
  imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  imageElement.alt = name;

  const typeWrapper = document.querySelector(".power-wrapper");
  typeWrapper.innerHTML = "";
  types.forEach(({ type }) => {
    createAndAppendElement(typeWrapper, "p", {
      className: `body3-fonts type ${type.name}`,
      textContent: type.name,
    });
  });

  document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${weight / 10}kg`;
  document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${height / 10}m`;

  const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
  abilities.forEach(({ ability }) => {
    createAndAppendElement(abilitiesWrapper, "p", {
      className: "body3-fonts",
      textContent: ability.name,
    });
  });

  const statsWrapper = document.querySelector(".stats-wrapper");
  statsWrapper.innerHTML = "";

  const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: "SPD",
  };

  stats.forEach(({ stat, base_stat }) => {
    const statDiv = document.createElement("div");
    statDiv.className = "stats-wrap";
    statsWrapper.appendChild(statDiv);

    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts stats",
      textContent: statNameMapping[stat.name],
    });

    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts",
      textContent: String(base_stat).padStart(3, "0"),
    });

    createAndAppendElement(statDiv, "progress", {
      className: "progress-bar",
      value: base_stat,
      max: 100,
    });
  });

  setTypeBackgroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
  for (let entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "en") {
      return entry.flavor_text.replace(/\f/g, " ");
    }
  }
  return "";
}
