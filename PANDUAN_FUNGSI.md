# Panduan Fungsi dan Komponen Aplikasi Rekomendasi Kafe

Dokumen ini berisi panduan lengkap dari semua fungsi dan komponen utama yang telah dibuat di dalam aplikasi ini. Aplikasi ini dibangun menggunakan Next.js (React) dan Tailwind CSS.

---

## 1. Halaman Utama (`src/app/page.tsx`)

Halaman utama berfungsi sebagai beranda yang menampilkan kafe unggulan (Spotlight) serta daftar kafe yang dikategorikan berdasarkan aspek (Suasana, Harga, Pelayanan, dan Others).

### Komponen: `HomePage`
Komponen utama untuk merender halaman beranda. 
- **State `searchTerm`**: Menyimpan teks dari input pencarian.
- **State `selectedCafe`**: Menyimpan data kafe yang sedang dipilih untuk ditampilkan di dalam `DetailModal`.
- **Fitur Pencarian**: Memfilter `cafeData` berdasarkan nama atau alamat kafe (case-insensitive).
- **Pengurutan (Sorting)**: Daftar kafe diurutkan berdasarkan parameter ranking (`rankSuasana`, `rankHarga`, dll.) yang merupakan hasil implementasi Naive Bayes.

### Fungsi Pembantu: `renderStarsSmall(rating)`
- **Fungsi**: Membuat elemen bintang (rating UI) berukuran kecil secara dinamis.
- **Cara Kerja**: Mendukung rendering bintang secara presisi (pecahan/desimal) seperti Google Maps. Jika nilai *rating* misalnya 4.8, maka akan merender 4 bintang penuh dan 1 bintang yang terisi 80%.

---

## 2. Halaman Analisis / Demo Uji Coba (`src/app/analisis/page.tsx`)

Halaman khusus yang memuat fitur "Uji Coba Klasifikasi Aspek", di mana pengguna dapat memasukkan teks ulasan dan melihat aspek apa saja yang terdeteksi dari kalimat tersebut.

### Komponen: `AnalisisPage`
Komponen ini merender antarmuka pengguna untuk pengujian teks.
- **State `demoText`**: Menyimpan teks yang diketik pengguna di dalam textarea.
- **State `demoResult`**: Menyimpan hasil klasifikasi setelah diproses oleh algoritma.
- **Fungsi Internal `handleClassify()`**: Dipanggil saat tombol "Klasifikasikan Ulasan" ditekan; menjalankan fungsi `classifyReview` dan memperbarui UI dengan hasilnya.
- **Fungsi Internal `handleDemoClear()`**: Menghapus isi textarea dan hasil klasifikasi.

### Fungsi Utama: `classifyReview(text: string)`
- **Fungsi**: Algoritma utama untuk mengklasifikasikan ulasan berbasis aturan (Rule-based Keyword Matching).
- **Cara Kerja**: Fungsi ini menerima string (teks ulasan), mengubahnya menjadi huruf kecil, lalu mencocokkannya dengan *array keyword* untuk masing-masing aspek:
  - **Suasana**: 'suasana', 'nyaman', 'estetik', dll.
  - **Harga**: 'harga', 'murah', 'mahal', 'terjangkau', dll.
  - **Pelayanan**: 'pelayanan', 'ramah', 'cepat', dll.
  - **Lainnya (Others)**: 'parkir', 'wifi', 'lokasi', 'kebersihan', dll.
- **Return**: Objek boolean `{ suasana, harga, pelayanan, others }` yang bernilai `true` jika *keyword* ditemukan.

---

## 3. Komponen Detail Modal (`src/components/DetailModal.tsx`)

Komponen _pop-up_ modal yang muncul saat sebuah kafe diklik dari halaman beranda. Menampilkan informasi lebih detail mengenai kafe, metrik rating spesifik aspek, serta daftar ulasan pelanggan.

### Komponen: `DetailModal(props: DetailModalProps)`
- **Props `cafe`**: Objek data kafe yang sedang diklik.
- **Props `onClose`**: Fungsi (callback) untuk menutup modal.
- **State `activeTab`**: Menyimpan tab aspek yang sedang aktif ('semua', 'suasana', 'harga', 'pelayanan', atau 'others').
- **Integrasi Google Maps**: URL navigasi dibuat secara dinamis menggunakan nama kafe dan alamatnya untuk membuka Google Maps (`googleMapsUrl`).

### Fungsi Pembantu dalam `DetailModal`:

1. **`getFilteredReviews()`**
   - **Fungsi**: Memfilter daftar ulasan berdasarkan tab aspek yang sedang aktif.
   - **Cara Kerja**: Jika tab 'suasana' aktif, fungsi hanya mengembalikan *array* ulasan di mana metrik `suasana === 1`. 

2. **`getAspectBadges(review)`**
   - **Fungsi**: Menentukan badge berwarna yang muncul di samping setiap ulasan.
   - **Cara Kerja**: Mengecek nilai boolean numerik (1 atau 0) pada setiap aspek di objek *review*. Jika 1, badge dengan warna spesifik (contoh: hijau untuk Suasana, biru untuk Harga) akan ditambahkan.

3. **`renderStars(rating, size)`**
   - **Fungsi**: Sama seperti `renderStarsSmall` di Halaman Utama, tetapi lebih dinamis karena menerima parameter ukuran (`'lg'` untuk rating utama, `'sm'` untuk metrik aspek). Mendukung pengisian bintang fraksional / pecahan.
