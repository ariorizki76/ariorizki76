
const music = document.getElementById("bgMusic");
const titleEl = document.getElementById("songTitle");
const playBtn = document.getElementById("playBtn");
const progressBar = document.getElementById("progressBar");
const nowPlaying = document.getElementById("nowPlaying");
const npTitle = document.getElementById("npTitle");

const songs = [
    { title: "barasuara - terbuang dalam waktu", src: "assets/music/barasuara.mp3" },
    { title: "arash buana - april", src: "assets/music/april.mp3" },
    { title: "bernadya - kita buat menyenangkan", src: "assets/music/kitabuatmenyenangkan.mp3" },
    { title: "arash buana - anything 4 u", src: "assets/music/anything4u.mp3" },
];

let current = 0;
let isPlaying = false;
let started = false;

const playlistEl = document.getElementById("playlist");

// render playlist
songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerText = song.title;
    li.onclick = () => playSong(i);
    playlistEl.appendChild(li);
});

function playSong(index) {
    current = index;
    music.src = songs[index].src;
    music.play();

    isPlaying = true;

    // update UI
    titleEl.innerText = songs[index].title;
    npTitle.innerText = songs[index].title;
    nowPlaying.classList.add("active");

    playBtn.className = "bi bi-pause-fill";

    // highlight playlist
    document.querySelectorAll("#playlist li").forEach(li => li.classList.remove("active"));
    playlistEl.children[index].classList.add("active");
}

function togglePlay() {
    if (isPlaying) {
        music.pause();
        playBtn.className = "bi bi-play-fill";
        nowPlaying.classList.remove("active");
    } else {
        music.play();
        playBtn.className = "bi bi-pause-fill";
        nowPlaying.classList.add("active");
    }
    isPlaying = !isPlaying;
}

function toggleMusic() {
    const panel = document.getElementById("musicPanel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function closeMusic() {
    document.getElementById("musicPanel").style.display = "none";
}

// progress bar
music.addEventListener("timeupdate", () => {
    if (music.duration) {
        const percent = (music.currentTime / music.duration) * 100;
        progressBar.style.width = percent + "%";
    }
});

// autoplay dengan click pertama
function enableSound() {
    if (started) return;
    started = true;

    playSong(0);

    // fade in volume
    let vol = 0;
    music.volume = 0;

    const fade = setInterval(() => {
        if (vol < 0.3) {
            vol += 0.02;
            music.volume = vol;
        } else {
            clearInterval(fade);
        }
    }, 100);
}

document.addEventListener("click", enableSound);

// auto next lagu
music.addEventListener("ended", () => {
    current = (current + 1) % songs.length;
    playSong(current);
});

document.addEventListener("DOMContentLoaded", function () {
    const text = "A quiet archive.";
    const target = document.getElementById("typing-text");

    let i = 0;
    let isDeleting = false;

    function typeLoop() {
        if (!isDeleting) {
            // typing
            target.innerHTML = text.substring(0, i + 1);
            i++;

            if (i === text.length) {
                // pause sebelum delete
                isDeleting = true;
                setTimeout(typeLoop, 1200);
                return;
            }
        } else {
            // deleting (backspace effect)
            target.innerHTML = text.substring(0, i - 1);
            i--;

            if (i === 0) {
                isDeleting = false;
            }
        }

        const speed = isDeleting ? 60 : 120;
        setTimeout(typeLoop, speed);
    }

    typeLoop();
});

const startDate = new Date("2026-03-08");
const today = new Date();

const diffTime = today - startDate;
const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

document.getElementById("loveCounter").innerHTML =
    "it's been " + days + " days, since March 8, 2026.";


document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById('loadMoreBtn');
    const filters = document.querySelectorAll('.isotope-filters li');

    let currentFilter = '.filter-app';
    let visible = 3;

    function updateItems() {
        if (!window.iso) return;

        let count = 0;

        window.iso.arrange({
            filter: function (itemElem) {

                // filter kategori
                if (!itemElem.classList.contains(currentFilter.replace('.', ''))) {
                    return false;
                }

                // limit jumlah
                if (count < visible) {
                    count++;
                    return true;
                }

                return false;
            }
        });

        // hitung total kategori
        const total = document.querySelectorAll(currentFilter).length;

        // tombol
        if (visible >= total) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
        }
    }

    // INIT (nunggu isotope siap)
    setTimeout(updateItems, 200);

    // LOAD MORE
    btn.addEventListener('click', function () {
        visible += 3;
        updateItems();
    });

    // FILTER CLICK (override template)
    filters.forEach(filter => {
        filter.addEventListener('click', function () {

            currentFilter = this.getAttribute('data-filter');
            visible = 3;

            // delay dikit biar template selesai dulu
            setTimeout(updateItems, 50);
        });
    });

});

const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    keyboardNavigation: true,
    closeButton: true,
    slideEffect: 'slide',
    width: '90vw',
    height: '90vh'
});

// Koordinat Kota Kalian (Contoh: Subang / Jakarta)
// Bisa ganti latitude & longitude sesuai koordinat domisili kalian
const LATITUDE = -6.5683;  
const LONGITUDE = 107.7600; 

async function initWeatherAmbient() {
  const iconEl = document.getElementById("weatherIcon");
  const textEl = document.getElementById("weatherText");

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true`
    );
    const data = await response.json();
    const weather = data.current_weather;
    
    const code = weather.weathercode;
    const temp = Math.round(weather.temperature);
    const isNight = weather.is_day === 0;

    // Interpretasi Kode WMO Open-Meteo
    let condition = "Cerah";
    let iconClass = isNight ? "bi-moon-stars" : "bi-sun";

    if (code >= 1 && code <= 3) {
      condition = "Berawan";
      iconClass = isNight ? "bi-cloud-moon" : "bi-cloud-sun";
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      condition = "Gerimis Hujan";
      iconClass = "bi-cloud-drizzle";
      document.body.classList.add("rainy-mode"); // Aktifkan mood hujan
    } else if (code >= 95) {
      condition = "Hujan Badai";
      iconClass = "bi-cloud-lightning-rain";
      document.body.classList.add("rainy-mode");
    }

    if (isNight) {
      document.body.classList.add("night-mode");
    }

    // Tampilkan Text & Icon
    iconEl.className = `bi ${iconClass} me-1`;
    textEl.textContent = `Subang • ${temp}°C, ${condition}`;

  } catch (error) {
    console.error("Gagal memuat cuaca:", error);
    textEl.textContent = "Suasana hangat menyelimuti";
  }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", initWeatherAmbient);


document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".polaroid-card");
  let highestZIndex = 20;

  cards.forEach((card) => {
    let isDragging = false;
    let startX = 0, startY = 0;

    const onStart = (e) => {
      isDragging = true;
      highestZIndex++;
      card.style.zIndex = highestZIndex; // Buat foto yang diklik berada paling depan

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      startX = clientX - card.offsetLeft;
      startY = clientY - card.offsetTop;
    };

    const onMove = (e) => {
      if (!isDragging) return;
      
      // Cegah scroll saat di-drag di layar sentuh
      if (e.cancelable) e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      let newLeft = clientX - startX;
      let newTop = clientY - startY;

      // Batasi pergerakan agar tidak terlempar terlalu jauh dari meja
      const container = card.parentElement;
      const maxLeft = container.clientWidth - (card.offsetWidth / 2);
      const maxTop = container.clientHeight - (card.offsetHeight / 2);

      newLeft = Math.max(-card.offsetWidth / 2, Math.min(newLeft, maxLeft));
      newTop = Math.max(-card.offsetHeight / 2, Math.min(newTop, maxTop));

      card.style.left = `${newLeft}px`;
      card.style.top = `${newTop}px`;
    };

    const onEnd = () => {
      isDragging = false;
    };

    // Event Mouse Desktop
    card.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    // Event Touchscreen Mobile
    card.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  });
});
