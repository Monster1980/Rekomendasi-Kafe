# Ringkasan Dokumentasi File Website Rekomendasi Kafe

## 1. File Acuan Data Utama Website (Source of Truth)
* **[`public/cafe_data.json`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/public/cafe_data.json)**: Database utama frontend yang berisi daftar kafe, alamat, rating per aspek, dan ulasan pelanggan. Dibuat otomatis oleh script python `generate_cafe_data.py`.
* **[`CodeBab4/NB_Evaluasi.xlsx`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/CodeBab4/NB_Evaluasi.xlsx)**: Data metrik performa model Naive Bayes (TP, TN, FP, FN, Akurasi, Presisi, Recall, F1) yang ditampilkan langsung pada halaman `/evaluasi`.

## 2. File Antarmuka (Frontend Web)
* **[`src/app/page.tsx`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/src/app/page.tsx)**: Halaman utama yang menampilkan daftar rekomendasi kafe per aspek, slider, dan navigasi utama.
* **[`src/app/evaluasi/page.tsx`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/src/app/evaluasi/page.tsx)**: Halaman evaluasi metrik model Naive Bayes sekaligus form interaktif uji coba klasifikasi ulasan.
* **[`src/components/DetailModal.tsx`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/src/components/DetailModal.tsx)**: Pop-up modal detail ulasan dan rating aspek setiap kafe.

## 3. File Pemrosesan Data & Machine Learning (Python/Backend)
* **[`generate_cafe_data.py`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/generate_cafe_data.py)**: Generator data yang merangkum ulasan dari `database_cafe_lengkap.json` dan hasil ranking aspek dari `CodeBab4/Ranking_Kafe.xlsx` menjadi file `public/cafe_data.json`.
* **[`CodeBab4/NaiveBayes.py`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/CodeBab4/NaiveBayes.py)**: Proses latih-uji algoritma Multinomial Naive Bayes (Binary Relevance) dan menghitung nilai evaluasi model.
* **[`CodeBab4/RankingCafe.py`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/CodeBab4/RankingCafe.py)**: Melakukan perangkingan kafe berdasarkan persentase ulasan positif per aspek.
* **[`CodeBab4/preprocessing.py`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/CodeBab4/preprocessing.py) & [`CodeBab4/TFIDF.py`](file:///d:/Yongki/Joki/Yiyi/Final/Rekomendasi_Kafe/CodeBab4/TFIDF.py)**: Preprocessing teks ulasan (cleaning, stopword, stemming) dan pembobotan nilai fitur kata (TF-IDF).
