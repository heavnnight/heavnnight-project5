async function run() {
  let text = document.getElementById("input").value.toLowerCase().trim();
  let resultDiv = document.getElementById("result");

  if (text === "") {
    resultDiv.innerHTML = "Write something first.";
    return;
  }

  // 🌿 worlds + كلمات
  let worlds = [
    {
      title: "My Neighbor Totoro",
      words: ["calm", "quiet", "nature", "peace", "soft", "forest", "home"]
    },
    {
      title: "Spirited Away",
      words: ["magic", "dream", "lost", "strange", "mystery", "spirit"]
    },
    {
      title: "Princess Mononoke",
      words: ["strong", "wild", "angry", "war", "fight", "power"]
    },
    {
      title: "Kiki's Delivery Service",
      words: ["city", "busy", "work", "independent", "creative", "young"]
    },
    {
      title: "Ponyo",
      words: ["ocean", "sea", "love", "child", "fun", "water"]
    }
  ];

  // 🧠 نحسب أفضل تطابق
  let bestMatch = worlds[0];
  let highestScore = 0;

  worlds.forEach(world => {
    let score = 0;

    world.words.forEach(word => {
      if (text.includes(word)) {
        score++;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = world;
    }
  });

  let filmName = bestMatch.title;

  resultDiv.innerHTML = "Loading...";

  try {
    let res = await fetch("https://ghibliapi.vercel.app/films");
    let films = await res.json();

    let film = films.find(f => f.title === filmName);

    if (!film) {
      resultDiv.innerHTML = "Film not found.";
      return;
    }

    // 🎬 عرض النتيجة + الصورة
    resultDiv.innerHTML = `
      <h2>You belong in: ${film.title}</h2>

      <img class="film-img" src="${film.image}" alt="${film.title} poster">

      <p>${film.description}</p>

      <p><strong>Director:</strong> ${film.director}</p>
      <p><strong>Year:</strong> ${film.release_date}</p>
      <p><strong>Score:</strong> ${film.rt_score}</p>
    `;

  } catch (error) {
    console.log(error);
    resultDiv.innerHTML = "Error loading data.";
  }
}