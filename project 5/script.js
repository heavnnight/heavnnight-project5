const YOUTUBE_KEY = "AIzaSyBB5XEYzDfNOd6jcpQhnrRgKxxCZumIgqg";

function goToResult() {
  const input = document.getElementById("input");
  const userText = input.value.trim();

  if (!userText) {
    alert("Write something first.");
    return;
  }

  window.location.href = "result.html?mood=" + encodeURIComponent(userText);
}

async function run() {
  const params = new URLSearchParams(window.location.search);
  const savedMood = params.get("mood");

  const resultDiv = document.getElementById("result");

  if (!savedMood) {
    resultDiv.innerHTML = "No mood found. Go back and search first.";
    return;
  }

  const userText = savedMood.toLowerCase().trim();
  resultDiv.innerHTML = "Loading...";

  try {
    const res = await fetch("https://ghibliapi.vercel.app/films");
    const films = await res.json();

    const category = detectEmotionalCategory(userText);
    const match = pickFilmByCategory(films, category);
    const genre = getSimpleGenre(match);

    document.body.style.backgroundImage = `url(${match.movie_banner})`;

    const videoId = await getTrailer(match.title);

    resultDiv.innerHTML = `
      <div class="film-card">

        <div class="film-top">
          <img class="film-img" src="${match.image}" alt="${match.title}">

          <div class="film-trailer">
            ${
              videoId
                ? `<iframe class="trailer" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`
                : `<p>No trailer found.</p>`
            }
          </div>
        </div>

        <div class="film-info">

          <p class="reading">
            You got ${match.title} world! and it feels like it fits you!
          </p>

          <h2>${match.title}</h2>

          <p><strong>Genre:</strong> ${genre}</p>

          <p>${match.description}</p>

          <p><strong>Director:</strong> ${match.director}</p>
          <p><strong>Year:</strong> ${match.release_date}</p>
          <p><strong>Rotten Tomatoes:</strong> ${match.rt_score}%</p>

          <button class="another-btn" onclick="run()">
            Read me again
          </button>

        </div>

      </div>
    `;

  } catch (error) {
    console.log(error);
    resultDiv.innerHTML = "Error loading data.";
  }
}

function detectEmotionalCategory(text) {
  const categories = {
    Soft: ["calm", "peaceful", "soft", "quiet", "safe", "tired", "comfort", "cozy"],
    Lost: ["lost", "confused", "empty", "alone", "stuck", "numb"],
    Emotional: ["sad", "cry", "crying", "heartbroken", "hurt", "overwhelmed"],
    Magical: ["magic", "dream", "fantasy", "spirit", "wonder"],
    Adventurous: ["adventure", "explore", "journey", "escape", "free"],
    Intense: ["angry", "chaotic", "intense", "dark", "fight", "war"],
    Nostalgic: ["nostalgic", "memory", "childhood", "past", "miss"]
  };

  let bestCategory = "Surprise";
  let bestScore = 0;

  for (let category in categories) {
    let score = 0;

    categories[category].forEach(word => {
      if (text.includes(word)) score++;
    });

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function pickFilmByCategory(films, category) {
  const worlds = {
    Soft: ["family", "home", "young", "love"],
    Lost: ["world", "life", "strange"],
    Emotional: ["loss", "war", "death"],
    Magical: ["magic", "spirit", "witch"],
    Adventurous: ["journey", "travel", "world"],
    Intense: ["battle", "fight", "war"],
    Nostalgic: ["memory", "childhood", "family"],
    Surprise: ["world", "life"]
  };

  const keywords = worlds[category] || worlds.Surprise;

  let filtered = films.filter(film => {
    const text = `${film.title} ${film.description}`.toLowerCase();
    return keywords.some(word => text.includes(word));
  });

  if (filtered.length === 0) filtered = films;

  const lastFilmId = localStorage.getItem("lastFilmId");
  let choices = filtered.filter(film => film.id !== lastFilmId);

  if (choices.length === 0) choices = filtered;

  const picked = choices[Math.floor(Math.random() * choices.length)];

  localStorage.setItem("lastFilmId", picked.id);

  return picked;
}

function getSimpleGenre(film) {
  const text = `${film.title} ${film.description}`.toLowerCase();
  let genres = [];

  if (text.includes("war")) genres.push("War");
  if (text.includes("magic") || text.includes("spirit")) genres.push("Fantasy");
  if (text.includes("journey") || text.includes("world")) genres.push("Adventure");
  if (text.includes("family") || text.includes("child")) genres.push("Family");
  if (text.includes("love")) genres.push("Romance");
  if (text.includes("death") || text.includes("loss")) genres.push("Drama");

  if (genres.length === 0) genres.push("Animation");

  return genres.join(", ");
}

async function getTrailer(title) {
  try {
    const query = encodeURIComponent(`${title} Studio Ghibli trailer`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YOUTUBE_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    return data.items[0].id.videoId;

  } catch (error) {
    console.log(error);
    return null;
  }
}