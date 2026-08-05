<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Upload — Quiet Archive</title>
  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body class="bg-dark text-white p-4">

  <div class="container my-5" style="max-width: 500px;">
    <h3 class="mb-4 text-center">Upload Kenangan Baru ✨</h3>
    
    <form id="uploadForm">
      <!-- KATEGORI -->
      <div class="mb-3">
        <label for="category" class="form-label">Kategori</label>
        <select id="category" class="form-select bg-dark text-white" required>
          <option value="filter-app">Photos</option>
          <option value="filter-product">Flowers</option>
          <option value="filter-branding">Videos</option>
        </select>
      </div>

      <!-- TANGGAL KENANGAN -->
      <div class="mb-3">
        <label for="datePicker" class="form-label">Tanggal Kenangan</label>
        <input type="date" id="datePicker" class="form-control bg-dark text-white" style="color-scheme: dark;" required>
      </div>

      <!-- INPUT FOTO / BUNGA -->
      <div class="mb-3" id="photoInputGroup">
        <label for="fileInput" class="form-label">Pilih Foto (Bisa pilih sekaligus banyak)</label>
        <input type="file" id="fileInput" class="form-control bg-dark text-white" accept="image/*" multiple required>
        <small class="text-secondary d-block mt-1">* Foto pertama akan jadi Thumbnail depan. Maks 5MB/file.</small>
      </div>

      <!-- INPUT VIDEO (YOUTUBE) -->
      <div class="mb-3 d-none" id="videoInputGroup">
        <label for="youtubeInput" class="form-label">Link / ID Video YouTube</label>
        <input type="text" id="youtubeInput" class="form-control bg-dark text-white" placeholder="https://www.youtube.com/watch?v=j4WCU8UFEas">
        <small class="text-secondary d-block mt-1">* Masukkan URL lengkap YouTube atau 11 digit ID Video.</small>
      </div>

      <button type="submit" id="btnSubmit" class="btn btn-light w-100 mt-3">Simpan ke Web</button>
    </form>
    
    <div id="statusMsg" class="mt-3 text-center fw-bold"></div>
  </div>

<script>
  const SUPABASE_URL = 'https://mklvshshxlqnawdqgumu.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_9DLq4FnuySUEgje8y9Ba9w_PWV7Lnsy';
  
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const categorySelect = document.getElementById('category');
  const photoGroup = document.getElementById('photoInputGroup');
  const videoGroup = document.getElementById('videoInputGroup');
  const fileInput = document.getElementById('fileInput');
  const youtubeInput = document.getElementById('youtubeInput');

  // Toggle Input & Validasi Required Dinamis
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'filter-branding') {
      photoGroup.classList.add('d-none');
      videoGroup.classList.remove('d-none');
      
      fileInput.removeAttribute('required');
      youtubeInput.setAttribute('required', 'true');
    } else {
      photoGroup.classList.remove('d-none');
      videoGroup.classList.add('d-none');
      
      fileInput.setAttribute('required', 'true');
      youtubeInput.removeAttribute('required');
    }
  });

  // Format Tanggal ke Bahasa Indonesia
  function formatDateToIndonesian(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Ekstrak ID YouTube yang Lebih Valid & Aman
  function extractYoutubeId(url) {
    if (!url) return null;
    const cleanUrl = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = cleanUrl.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
    return cleanUrl.length === 11 ? cleanUrl : null;
  }

  // Handle Submit Form
  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    const statusMsg = document.getElementById('statusMsg');
    
    btn.disabled = true;
    statusMsg.className = 'mt-3 text-center text-warning';
    statusMsg.textContent = 'Sedang memproses... ⏳';

    try {
      const category = categorySelect.value;
      const rawDate = document.getElementById('datePicker').value;
      const titleDate = formatDateToIndonesian(rawDate);

      if (category === 'filter-branding') {
        // PROSES UNTUK VIDEO
        const ytInputVal = youtubeInput.value;
        const youtubeId = extractYoutubeId(ytInputVal);

        if (!youtubeId) {
          throw new Error('URL atau ID YouTube tidak valid!');
        }

        const { error } = await supabaseClient.from('gallery').insert([{
          type: category,
          title_date: titleDate,
          youtube_id: youtubeId,
          images: []
        }]);

        if (error) throw error;

      } else {
        // PROSES UNTUK FOTO / BUNGA
        const files = Array.from(fileInput.files);
        if (files.length === 0) throw new Error('Pilih minimal 1 foto!');

        const imageUrls = [];

        for (let file of files) {
          // Validasi Ukuran File (Maksimal 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File ${file.name} terlalu besar (maksimal 5MB)!`);
          }

          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: storageError } = await supabaseClient.storage
            .from('photos')
            .upload(fileName, file);

          if (storageError) throw storageError;

          const { data: urlData } = supabaseClient.storage
            .from('photos')
            .getPublicUrl(fileName);

          imageUrls.push(urlData.publicUrl);
        }

        const { error } = await supabaseClient.from('gallery').insert([{
          type: category,
          title_date: titleDate,
          images: imageUrls,
          youtube_id: null
        }]);

        if (error) throw error;
      }

      statusMsg.className = 'mt-3 text-center text-success';
      statusMsg.textContent = 'Berhasil diupload ke database! 🎉';
      document.getElementById('uploadForm').reset();
      
      // Reset state input required
      fileInput.setAttribute('required', 'true');
      youtubeInput.removeAttribute('required');
      photoGroup.classList.remove('d-none');
      videoGroup.classList.add('d-none');

    } catch (err) {
      console.error(err);
      statusMsg.className = 'mt-3 text-center text-danger';
      statusMsg.textContent = 'Gagal: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });
</script>
</body>
</html>
