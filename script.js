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


let updateGalleryItems; // Buat variabel global agar bisa dipanggil dari Supabase loader
let ensureEnoughItems; // Dipanggil sebelum reveal, buat fetch data Supabase bertahap kalau kurang
let initIsotopeGallery; // Init Isotope lebih awal (gak nunggu Supabase), dipanggil dari loader juga

document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById('loadMoreBtn');
    const filters = document.querySelectorAll('.isotope-filters li');
    const container = document.querySelector('.isotope-container');

    let currentFilter = '.filter-app';
    let visible = 3;

    // Init Isotope begitu DOM siap, pakai item yang sudah ada dulu (hardcoded)
    // — jadi filter & load more udah jalan walau data Supabase belum/belum semua ke-fetch.
    initIsotopeGallery = function () {
        if (!container || typeof Isotope === 'undefined') return;

        imagesLoaded(container, function () {
            if (!window.iso) {
                window.iso = new Isotope(container, {
                    itemSelector: '.portfolio-item',
                    layoutMode: 'masonry'
                });
            } else {
                window.iso.reloadItems();
                window.iso.layout();
            }

            if (typeof GLightbox !== 'undefined') {
                GLightbox({ selector: '.glightbox' });
            }

            updateGalleryItems();
        });
    };

    updateGalleryItems = function() {
        if (!window.iso) return;

        let count = 0;

        window.iso.arrange({
            filter: function (itemElem) {
                if (!itemElem.classList.contains(currentFilter.replace('.', ''))) {
                    return false;
                }
                if (count < visible) {
                    count++;
                    return true;
                }
                return false;
            }
        });

        const filterClass = currentFilter.replace('.', '');
        const domTotal = document.querySelectorAll(currentFilter).length;
        const state = window.gallerySupaState && window.gallerySupaState[filterClass];
        const stillHasMoreFromSupabase = state ? state.hasMore : false;

        if (visible >= domTotal && !stillHasMoreFromSupabase) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
        }
    };

    btn.addEventListener('click', async function () {
        visible += 3;
        btn.disabled = true;
        await ensureEnoughItems(currentFilter, visible);
        btn.disabled = false;
        updateGalleryItems();
    });

    filters.forEach(filter => {
        filter.addEventListener('click', async function () {
            currentFilter = this.getAttribute('data-filter');
            visible = 3;
            await ensureEnoughItems(currentFilter, visible);
            setTimeout(updateGalleryItems, 50);
        });
    });

    // Isotope-nya diinit begitu ada di sini, gak perlu nunggu Supabase
    initIsotopeGallery();
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

// ==========================================
// SUPABASE CONFIG & GALLERY LOAD
// ==========================================
const SUPABASE_URL = 'https://mklvshshxlqnawdqgumu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9DLq4FnuySUEgje8y9Ba9w_PWV7Lnsy';

// ✅ Ganti nama variabel penampung menjadi 'supabaseClient' (agar tidak bentrok dengan library 'supabase')
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// PAGINATION: fetch data Supabase bertahap per kategori,
// bukan sekaligus semua baris. Hardcoded items yang udah ada di
// index.html dipakai duluan buat isi 3 slot pertama tiap kategori,
// jadi kalau item hardcoded-nya masih cukup, gak ada fetch sama sekali.
// ==========================================
const GALLERY_PAGE_SIZE = 6;
const gallerySupaState = {
  'filter-app':      { offset: 0, hasMore: true, loading: false },
  'filter-product':  { offset: 0, hasMore: true, loading: false },
  'filter-branding': { offset: 0, hasMore: true, loading: false },
};
window.gallerySupaState = gallerySupaState; // dibaca updateGalleryItems buat nentuin tombol Load More

function renderGalleryItemHtml(item) {
  let itemHtml = '';

  if (item.type === 'filter-branding') {
      itemHtml = `
        <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-branding gallery-item">
          <div class="portfolio-content h-100 position-relative">
            <img src="https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg" class="img-fluid" loading="lazy"
              decoding="async" style="border-radius:10px; width:100%; height:300px; object-fit:cover;" alt="">
            <a href="https://www.youtube.com/embed/${item.youtube_id}" class="glightbox" data-type="video"
              style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:5;">
            </a>
            <div class="position-absolute top-50 start-50 translate-middle" style="pointer-events:none;">
              <i class="bi bi-play-circle-fill"
                style="font-size:50px; color:white; text-shadow:0 0 10px rgba(0,0,0,0.6);">
              </i>
            </div>
            <div class="template-video">
              ${item.title_date}
            </div>
          </div>
        </div>
      `;
    } else {
      const galleryGroup = `db_gallery_${item.id}`;
      const photoCount = item.images.length;
      const templateClass = item.type === 'filter-app' ? 'template-foto' : 'template-bunga';
      const captionText = `${item.title_date} • ${photoCount} Photos`;

      let hiddenLinksHtml = '';
      for (let i = 1; i < item.images.length; i++) {
        hiddenLinksHtml += `
          <a href="${item.images[i]}" data-glightbox="title: ${captionText}"
            class="glightbox d-none" data-gallery="${galleryGroup}"></a>
        `;
      }

      itemHtml = `
        <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${item.type} gallery-item">
          <div class="portfolio-content h-100">
            <img src="${item.images[0]}" class="img-fluid" loading="lazy" decoding="async"
              style="border-radius:10px; width:100%; height:300px; object-fit:cover;" alt="">
            <div class="portfolio-info">
              <a href="${item.images[0]}" data-glightbox="title: ${captionText}"
                data-gallery="${galleryGroup}" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
              ${hiddenLinksHtml}
            </div>
            <div class="${templateClass}">
              ${item.title_date}&nbsp;&nbsp;•&nbsp;&nbsp;${photoCount} Photos
            </div>
          </div>
        </div>
      `;
  }

  return itemHtml;
}

// Ambil satu halaman (GALLERY_PAGE_SIZE baris) dari Supabase untuk satu
// kategori, lalu sisipkan ke DOM. Return true kalau ada data baru yang
// disisipkan, false kalau tidak ada (habis / gagal / lagi loading).
async function fetchNextSupabasePage(filterClass) {
  const container = document.querySelector('.isotope-container');
  const state = gallerySupaState[filterClass];
  if (!container || !state || state.loading || !state.hasMore) return false;

  state.loading = true;

  const { data, error } = await supabaseClient
    .from('gallery')
    .select('*')
    .eq('type', filterClass)
    .order('id', { ascending: false })
    .range(state.offset, state.offset + GALLERY_PAGE_SIZE - 1);

  state.loading = false;

  if (error) {
    console.error('Gagal memuat galeri dari Supabase:', error);
    return false;
  }

  if (!data || data.length === 0) {
    state.hasMore = false;
    return false;
  }

  state.offset += data.length;
  if (data.length < GALLERY_PAGE_SIZE) {
    state.hasMore = false;
  }

  const combinedHtml = data.map(renderGalleryItemHtml).join('');
  container.insertAdjacentHTML('beforeend', combinedHtml);

  // Tunggu gambar-gambar baru selesai load sebelum Isotope hitung ulang layout,
  // baru re-init/reload lewat initIsotopeGallery (dipasang di block DOMContentLoaded).
  await new Promise((resolve) => {
    imagesLoaded(container, resolve);
  });

  if (typeof initIsotopeGallery === 'function') {
    initIsotopeGallery();
  }

  return true;
}

// Dipanggil sebelum reveal (klik Load More / ganti filter): fetch dari
// Supabase bertahap, halaman demi halaman, sampai jumlah item kategori itu
// di DOM cukup buat menampilkan `neededCount`, atau sampai datanya habis.
ensureEnoughItems = async function (filterSelector, neededCount) {
  const filterClass = filterSelector.replace('.', '');
  const state = gallerySupaState[filterClass];
  if (!state) return;

  let count = document.querySelectorAll(filterSelector).length;

  while (count < neededCount && state.hasMore && !state.loading) {
    const fetched = await fetchNextSupabasePage(filterClass);
    if (!fetched) break;
    count = document.querySelectorAll(filterSelector).length;
  }
};
