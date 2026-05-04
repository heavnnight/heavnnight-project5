const YOUTUBE_KEY = "AIzaSyBB5XEYzDfNOd6jcpQhnrRgKxxCZumIgqg";

async function run() {
  const userText = document.getElementById("input").value.toLowerCase().trim();
  const resultDiv = document.getElementById("result");

  if (!userText) {
    resultDiv.innerHTML = "Write something first.";
    return;
  }

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

        <div class="film-info">
          <img class="film-img" src="${match.image}" alt="${match.title}">
          <h2>${match.title}</h2>

          <p><strong>Emotional Category:</strong> ${category}</p>
          <p><strong>Genre:</strong> ${genre}</p>

          <p>${match.description}</p>

          <p><strong>Director:</strong> ${match.director}</p>
          <p><strong>Year:</strong> ${match.release_date}</p>
          <p><strong>Rotten Tomatoes:</strong> ${match.rt_score}%</p>
        </div>

        <div class="film-trailer">
          ${
            videoId
              ? `<iframe class="trailer" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`
              : `<p>Trailer not found</p>`
          }
        </div>

      </div>
    `;

  } catch (error) {
    console.log(error);
    resultDiv.innerHTML = "Error loading data.";
  }
}


// 🧠 يفهم المستخدم
function detectEmotionalCategory(text) {
  if (text.includes("make me cry") || text.includes("sad movie")) return "Heartbreaking";
  if (text.includes("happy") || text.includes("cheer") || text.includes("fun")) return "Comforting";
  if (text.includes("scared") || text.includes("anxious")) return "Calming";
  if (text.includes("nostalgic") || text.includes("memory")) return "Nostalgic";
  if (text.includes("magic") || text.includes("dream")) return "Magical";
  if (text.includes("adventure") || text.includes("explore")) return "Adventurous";
  if (text.includes("dark") || text.includes("intense")) return "Intense";

  return "Surprise";
}


// 🎬 يختار فيلم
function pickFilmByCategory(films, category) {
  const rules = {
    Heartbreaking: ["war", "death", "loss", "struggle"],
    Comforting: ["family", "love", "friend", "young"],
    Calming: ["quiet", "home", "country"],
    Nostalgic: ["childhood", "memory"],
    Magical: ["spirit", "magic", "strange"],
    Adventurous: ["journey", "world", "travel"],
    Intense: ["war", "battle", "fight"]
  };

  const keywords = rules[category] || ["world"];

  const filtered = films.filter(film => {
    const text = `${film.title} ${film.description}`.toLowerCase();
    return keywords.some(k => text.includes(k));
  });

  if (filtered.length === 0) {
    return films[Math.floor(Math.random() * films.length)];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}


// 🎭 Genre بسيط من الوصف
function getSimpleGenre(film) {
  const text = (film.title + " " + film.description).toLowerCase();

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


// 🎥 التريلر
async function getTrailer(title) {
  try {
    const query = encodeURIComponent(`${title} Studio Ghibli trailer`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YOUTUBE_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    return data.items[0].id.videoId;

  } catch (e) {
    console.log(e);
    return null;
  }
}