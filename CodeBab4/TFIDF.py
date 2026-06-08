# 1. IMPORT LIBRARY
# =========================
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import save_npz
import pickle

# =========================
# 2. BACA DATA TRAIN & TEST
# =========================
print("=" * 60)
print("PROSES TF-IDF")
print("=" * 60)

df_train = pd.read_excel('Data_Train.xlsx')
df_test  = pd.read_excel('Data_Test.xlsx')

print(f"\n[1] Data Train dibaca : {len(df_train)} baris")
print(f"    Data Test dibaca  : {len(df_test)} baris")

# =========================
# 3. AMBIL KOLOM YANG DIBUTUHKAN
# =========================
label_cols = ['Pelayanan', 'Suasana', 'Harga', 'Others'] #menentukan nama kolom label klasifikasi

# Ambil fitur teks dan label
X_train = df_train['Ulasan Preprocessed'] #mengambil kolom teks hasil preprocessing untuk data train
X_test  = df_test['Ulasan Preprocessed'] #mengambil kolom teks hasil preprocessing untuk data test

y_train = df_train[label_cols] #mengambil seluruh kolom label dari data train
y_test  = df_test[label_cols] #mengambil seluruh kolom label dari dtaa test

print(y_test) #menampilkan isi label test
print(y_train) #menampilkan isi label train

print(f"\n[2] Kolom fitur : 'Ulasan Preprocessed'")
print(f"    Kolom label : {label_cols}")

# =========================
# 4. TF-IDF VECTORIZER
#
#    Sesuai proposal (BAB II, sub 2.7):
#    - TF(t,d) = jumlah kemunculan term t dalam dokumen d
#    - IDF(t)  = log(N / df_t)
#    - TF-IDF  = TF x IDF
#
#    Parameter yang digunakan:
#    - sublinear_tf=False  TF = jumlah kemunculan kata secara mentah
#    - min_df=2            abaikan kata yang hanya muncul di 1 dokumen
#    - max_df=0.95         abaikan kata yang muncul di >95% dokumen
#    - ngram_range=(1,2)   unigram + bigram
#    - max_features=5000   batasi 5000 fitur terbaik
# =========================
print(f"\n[3] Membangun model TF-IDF...")

tfidf = TfidfVectorizer(
    sublinear_tf  = False, #menggunakan frekuensi asli kata (tidak di-log)
    min_df        = 2, #kata yang muncul di lebih dari 1 kali akan dihapus
    max_df        = 0.95, #kata yang muncul di lebih dari 95% dokumen akan dihapus
    ngram_range   = (1, 2), #menggunakan unigram (1 kata) dan bigram (2 kata)
    max_features  = 5000 #membatasi maksimal 5000 fitur terbaik
)

# FIT hanya pada data TRAIN (bukan test!)
X_train_tfidf = tfidf.fit_transform(X_train) #vocabulary + mengubah data train menjadi matrix tfidf
X_test_tfidf  = tfidf.transform(X_test) #mengubah data test menggunakan vocab dari train

print(f"    Vocabulary size      : {len(tfidf.vocabulary_)} kata/frasa unik") #menampilkan jumlah kata unik dalam vocab
print(f"    Fitur yang digunakan : {X_train_tfidf.shape[1]} fitur") #menampilkan jumlah fitur tf idf
print(f"    Shape matrix Train   : {X_train_tfidf.shape}  (baris x fitur)") #menampilkan ukuran matrix tfidf train
print(f"    Shape matrix Test    : {X_test_tfidf.shape}  (baris x fitur)") #menampilkan ukuran matrix tfidf test

# =========================
# 5. SIMPAN MODEL TF-IDF
# =========================
with open('tfidf_model.pkl', 'wb') as f:
    pickle.dump(tfidf, f)
print(f"\n[4] Model TF-IDF disimpan sebagai 'tfidf_model.pkl'")

# =========================
# 6. KONVERSI KE DATAFRAME
# =========================
print(f"\n[5] Menyusun output Excel...")

feature_names = tfidf.get_feature_names_out()

df_tfidf_train = pd.DataFrame(
    X_train_tfidf.toarray(), #mengubah matrix sparse menjadi array biasa
    columns=feature_names #nama kolom diisi dengan nama fitur
)
df_tfidf_test = pd.DataFrame(
    X_test_tfidf.toarray(),
    columns=feature_names
)

# Tambahkan kolom identitas di awal
# Nama Cafe dan Rating ikut disertakan agar bisa dipakai untuk ranking di Flask
df_tfidf_train.insert(0, 'Nama Cafe',            df_train['Nama Cafe'].values)
df_tfidf_train.insert(1, 'Rating',               df_train['Rating'].values)
df_tfidf_train.insert(2, 'Ulasan Preprocessed',  X_train.values)

df_tfidf_test.insert(0, 'Nama Cafe',             df_test['Nama Cafe'].values)
df_tfidf_test.insert(1, 'Rating',                df_test['Rating'].values)
df_tfidf_test.insert(2, 'Ulasan Preprocessed',   X_test.values)

for i, col in enumerate(label_cols): #melakukan perulangan untuk setiap label
    df_tfidf_train.insert(i + 3, col, y_train[col].values) #menambahkan label train ke dataframe
    df_tfidf_test.insert(i + 3, col, y_test[col].values)

# =========================
# 7. BUAT TABEL TOP FITUR
# =========================
mean_tfidf = np.array(X_train_tfidf.mean(axis=0)).flatten() #menghitung rata rata bobot tfidf setiap fitur

df_top_fitur = pd.DataFrame({
    'Fitur (Kata/Bigram)' : feature_names,
    'Rata-rata TF-IDF'    : mean_tfidf
}).sort_values('Rata-rata TF-IDF', ascending=False).reset_index(drop=True) #mengurutkan fitur dari bobot terbesar ke terkecil

df_top_fitur.index += 1
df_top_fitur.index.name = 'Peringkat'

df_top_100 = df_top_fitur.head(100)

# =========================
# 8. TAMPILKAN CONTOH
# =========================
print(f"\n[6] Top 10 Fitur TF-IDF Tertinggi:")
print(f"    {'Peringkat':<10} {'Kata/Bigram':<25} {'Rata-rata TF-IDF'}")
print(f"    {'-'*50}") #garis pemisah
for i, row in df_top_fitur.head(10).iterrows():
    print(f"    {i:<10} {row['Fitur (Kata/Bigram)']:<25} {row['Rata-rata TF-IDF']:.6f}")

# =========================
# 9. SIMPAN KE EXCEL (ringkas: 50 fitur pertama)
# =========================
print(f"\n[7] Menyimpan file Excel...")

top_50_cols = list(feature_names[:50])

df_tfidf_train_ringkas = df_tfidf_train[
    ['Nama Cafe', 'Rating', 'Ulasan Preprocessed'] + label_cols + top_50_cols
]
df_tfidf_test_ringkas = df_tfidf_test[
    ['Nama Cafe', 'Rating', 'Ulasan Preprocessed'] + label_cols + top_50_cols
]

# Simpan versi ringkas ke Excel
df_tfidf_train_ringkas.to_excel('TFIDF_Train.xlsx', index=False)
df_tfidf_test_ringkas.to_excel('TFIDF_Test.xlsx',   index=False)
df_top_100.to_excel('TFIDF_TopFitur.xlsx')

# Simpan matrix penuh ke format numpy (untuk modeling)
save_npz('tfidf_matrix_train.npz', X_train_tfidf)
save_npz('tfidf_matrix_test.npz',  X_test_tfidf)

# =========================
# 10. RINGKASAN AKHIR
# =========================
print("\n" + "=" * 60)
print("TF-IDF SELESAI!")
print("=" * 60)
print(f"""
  File yang dihasilkan:
  Kolom TFIDF_Train & Test: Nama Cafe, Rating, Ulasan, Label, 50 Fitur
  ┌─────────────────────────────────────────────────────┐
  │ TFIDF_Train.xlsx       Matrix TF-IDF data train     │
  │ TFIDF_Test.xlsx        Matrix TF-IDF data test      │
  │ TFIDF_TopFitur.xlsx    100 fitur bobot tertinggi    │
  │ tfidf_model.pkl        Model untuk Flask            │
  │ tfidf_matrix_train.npz Matrix sparse train penuh    │
  │ tfidf_matrix_test.npz  Matrix sparse test penuh     │
  └─────────────────────────────────────────────────────┘

  Statistik TF-IDF:
  - Total data train  : {X_train_tfidf.shape[0]} ulasan
  - Total data test   : {X_test_tfidf.shape[0]} ulasan
  - Jumlah fitur      : {X_train_tfidf.shape[1]} kata/bigram
  - Vocabulary        : {len(tfidf.vocabulary_)} kata unik
""")
print("=" * 60)