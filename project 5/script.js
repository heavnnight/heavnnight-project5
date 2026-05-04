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

    // 🧠 AI يفهم المستخدم
    const keywords = await analyzeWithAI(userText);

    // 🎬 اختيار الفيلم
    const match = pickFilmSmart(films, keywords);

    document.body.style.backgroundImage = `url(${match.movie_banner})`;

    const videoId = await getTrailer(match.title);

    resultDiv.innerHTML = `
      <div class="film-card">

        <div class="film-info">
          <img class="film-img" src="${match.image}">
          <h2>${match.title}</h2>

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


// 🔥 AI
async function analyzeWithAI(userText) {
  const res = await fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: userText })
  });

  const data = await res.json();

  return data.keywords;
}


// 🎬 اختيار الفيلم (بدون score)
function pickFilmSmart(films, keywords) {
  const words = keywords.split(",").map(w => w.trim());

  const filtered = films.filter(film => {
    const text = (film.title + " " + film.description).toLowerCase();

    return words.some(word => text.includes(word));
  });

  if (filtered.length === 0) {
    return films[Math.floor(Math.random() * films.length)];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
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