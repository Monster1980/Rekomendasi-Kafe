# 1. IMPORT LIBRARY
# =========================
import pandas as pd
import numpy as np
from scipy.sparse import load_npz
from sklearn.naive_bayes import MultinomialNB, ComplementNB
import pickle
import warnings
warnings.filterwarnings('ignore')

# =========================
# 2. BACA DATA
# =========================
print("=" * 65)
print("  PROSES RANKING KAFE PER ASPEK")
print("=" * 65)

X_train  = load_npz('tfidf_matrix_train.npz')
X_test   = load_npz('tfidf_matrix_test.npz')
y_train  = pd.read_excel('Label_Train.xlsx')
df_train = pd.read_excel('Data_Train.xlsx')
df_test  = pd.read_excel('Data_Test.xlsx')

label_cols  = ['Pelayanan', 'Suasana', 'Harga', 'Others']

# ── PERUBAHAN: aspek_utama sekarang mencakup Others ──────────
aspek_utama = ['Pelayanan', 'Suasana', 'Harga', 'Others']

# Algoritma per aspek:
# Others pakai ComplementNB karena datanya sangat tidak seimbang
# (hanya 5.6% positif) → MultinomialNB selalu prediksi negatif
algo_map = {
    'Pelayanan' : 'MultinomialNB',
    'Suasana'   : 'MultinomialNB',
    'Harga'     : 'MultinomialNB',
    'Others'    : 'ComplementNB',
}

print(f"\n[1] Data berhasil dimuat:")
print(f"    Data train : {len(df_train)} ulasan")
print(f"    Data test  : {len(df_test)} ulasan")
print(f"    Kafe unik  : {df_test['Nama Cafe'].nunique()} kafe di data test")

# =========================
# 3. LATIH MODEL NAIVE BAYES
# =========================
print(f"\n[2] Melatih model Naive Bayes...")
print(f"    Pelayanan, Suasana, Harga : MultinomialNB (alpha=1.0)")
print(f"    Others                    : ComplementNB  (alpha=1.0)")
print(f"                                (dipilih karena data Others")
print(f"                                 hanya 5.6% positif / sangat imbalanced)")

nb_models = {}
for aspek in label_cols:
    # Pilih algoritma sesuai karakteristik aspek
    if algo_map[aspek] == 'MultinomialNB':
        model = MultinomialNB(alpha=1.0)
    else:
        model = ComplementNB(alpha=1.0)

    y_tr  = y_train[aspek].values
    n_pos = y_tr.sum()
    n_neg = len(y_tr) - n_pos
    model.fit(X_train, y_tr)
    nb_models[aspek] = model
    print(f"    Model {aspek:<12} [{algo_map[aspek]:<14}] : "
          f"selesai  ({n_pos} positif / {n_neg} negatif)")

# Simpan model
with open('nb_models.pkl', 'wb') as f:
    pickle.dump(nb_models, f)
print(f"\n    nb_models.pkl tersimpan")

# =========================
# 4. PREDIKSI DATA TEST
# =========================
print(f"\n[3] Memprediksi data test...")

df_pred = df_test[['Nama Cafe', 'Rating',
                   'Ulasan Preprocessed']].copy().reset_index(drop=True)

for aspek in label_cols:
    df_pred[f'Pred_{aspek}'] = nb_models[aspek].predict(X_test)
    df_pred[f'Prob_{aspek}'] = np.round(
        nb_models[aspek].predict_proba(X_test)[:, 1], 4
    )

# Info ringkas hasil prediksi per aspek
print(f"    Prediksi selesai untuk {len(df_pred)} ulasan")
print(f"\n    Jumlah prediksi POSITIF per aspek:")
for aspek in label_cols:
    n_pos_pred = int(df_pred[f'Pred_{aspek}'].sum())
    pct        = n_pos_pred / len(df_pred) * 100
    print(f"    {aspek:<12} : {n_pos_pred:>4} ulasan ({pct:.1f}%)")

# =========================
# 5. BUAT RANKING PER ASPEK
#
#    Logika ranking:
#    - Hitung jumlah ulasan per kafe yang diprediksi positif
#      untuk setiap aspek (Ulasan_Positif)
#    - Hitung persentase ulasan positif per kafe
#    - Urutkan dari jumlah positif terbanyak ke tersedikit
#    - Seri (jumlah sama) diputuskan oleh persen positif tertinggi
#
#    Catatan khusus Others:
#    Karena Others sangat sedikit (5.6%), wajar jika banyak kafe
#    memiliki 0 ulasan positif Others. Kafe tetap ditampilkan
#    semua agar ranking lengkap.
# =========================
print(f"\n[4] Menghitung ranking per aspek...")

ranking_dict = {}

for aspek in aspek_utama:
    print(f"\n    ── Aspek: {aspek} [{algo_map[aspek]}] ──")

    # Agregasi per kafe
    ranking = df_pred.groupby('Nama Cafe').agg(
        Total_Ulasan   = ('Ulasan Preprocessed', 'count'),
        Rating         = ('Rating', 'mean'),
        Ulasan_Positif = (f'Pred_{aspek}', 'sum'),
        Prob_Rata2     = (f'Prob_{aspek}', 'mean')
    ).reset_index()

    # Hitung persentase positif
    ranking['Persen_Positif'] = (
        ranking['Ulasan_Positif'] / ranking['Total_Ulasan'] * 100
    ).round(1)

    # Bulatkan rating dan prob
    ranking['Rating']     = ranking['Rating'].round(2)
    ranking['Prob_Rata2'] = ranking['Prob_Rata2'].round(4)

    # Urutkan: utama = jumlah positif, seri = persen positif
    ranking = ranking.sort_values(
        ['Ulasan_Positif', 'Persen_Positif'],
        ascending=[False, False]
    ).reset_index(drop=True)

    # Tambah kolom ranking mulai dari 1
    ranking.insert(0, 'Ranking', range(1, len(ranking) + 1))

    # Susun ulang kolom
    ranking = ranking[[
        'Ranking', 'Nama Cafe', 'Total_Ulasan',
        'Ulasan_Positif', 'Persen_Positif',
        'Rating', 'Prob_Rata2'
    ]]

    ranking.columns = [
        'Ranking', 'Nama Cafe', 'Total Ulasan',
        f'Ulasan {aspek}', f'% Ulasan {aspek}',
        'Rating Google Maps', f'Prob Rata-rata {aspek}'
    ]

    ranking_dict[aspek] = ranking

    # Tampilkan top 10 di terminal
    n_nol = int((ranking[f'Ulasan {aspek}'] == 0).sum())
    print(f"    {'Rank':<6} {'Nama Cafe':<35} {'Ulasan+':>8} {'%':>7} {'Rating':>7}")
    print(f"    {'-'*65}")
    for _, row in ranking.head(10).iterrows():
        cafe  = str(row['Nama Cafe'])[:33]
        rank  = int(row['Ranking'])
        ulpos = int(row[f'Ulasan {aspek}'])
        pct   = float(row[f'% Ulasan {aspek}'])
        rat   = row['Rating Google Maps']
        rat_s = f"{rat:.1f}" if pd.notna(rat) else "N/A"
        print(f"    {rank:<6} {cafe:<35} {ulpos:>8} {pct:>6.1f}% {rat_s:>7}")

    print(f"\n    ... dan {len(ranking)-10} kafe lainnya")
    if n_nol > 0:
        print(f"    Catatan: {n_nol} kafe memiliki 0 ulasan positif aspek {aspek}")

# =========================
# 6. SIMPAN KE EXCEL
# =========================
print(f"\n\n[5] Menyimpan file Excel...")

# File gabungan (4 sheet dalam 1 file, termasuk Others)
with pd.ExcelWriter('Ranking_Kafe.xlsx', engine='openpyxl') as writer:
    for aspek in aspek_utama:
        ranking_dict[aspek].to_excel(
            writer,
            sheet_name=f'Ranking {aspek}',
            index=False
        )
        # Format lebar kolom
        worksheet = writer.sheets[f'Ranking {aspek}']
        worksheet.column_dimensions['A'].width = 8
        worksheet.column_dimensions['B'].width = 35
        worksheet.column_dimensions['C'].width = 14
        worksheet.column_dimensions['D'].width = 18
        worksheet.column_dimensions['E'].width = 18
        worksheet.column_dimensions['F'].width = 18
        worksheet.column_dimensions['G'].width = 22

print(f"    Ranking_Kafe.xlsx tersimpan (4 sheet: Pelayanan, Suasana, Harga, Others)")

# File terpisah per aspek (termasuk Others)
for aspek in aspek_utama:
    filename = f'Ranking_Kafe_{aspek}.xlsx'
    ranking_dict[aspek].to_excel(filename, index=False)
    print(f"    {filename} tersimpan ({len(ranking_dict[aspek])} kafe)")

# =========================
# 7. RINGKASAN AKHIR
# =========================
print("\n" + "=" * 65)
print("  RANKING KAFE SELESAI!")
print("=" * 65)

EMOJI = {'Pelayanan': 'Pelayanan', 'Suasana': 'Suasana',
         'Harga': 'Harga', 'Others': 'Others'}

for aspek in aspek_utama:
    r    = ranking_dict[aspek]
    top1 = r.iloc[0]
    n_nol = int((r[f'Ulasan {aspek}'] == 0).sum())
    print(f"\n  RANKING {aspek.upper()} [{algo_map[aspek]}]:")
    print(f"     No. 1 : {top1['Nama Cafe']}")
    print(f"             {int(top1[f'Ulasan {aspek}'])} ulasan positif "
          f"({top1[f'% Ulasan {aspek}']}%) "
          f"dari {int(top1['Total Ulasan'])} ulasan")
    if n_nol > 0:
        print(f"     Catatan: {n_nol} kafe dengan 0 ulasan positif")

print(f"""
  File yang dihasilkan:
  +------------------------------------------------------------+
  | Ranking_Kafe.xlsx              4 sheet (semua aspek)       |
  | Ranking_Kafe_Pelayanan.xlsx    ranking aspek Pelayanan     |
  | Ranking_Kafe_Suasana.xlsx      ranking aspek Suasana       |
  | Ranking_Kafe_Harga.xlsx        ranking aspek Harga         |
  | Ranking_Kafe_Others.xlsx       ranking aspek Others (baru) |
  +------------------------------------------------------------+

  Cara baca kolom:
  - Ranking            urutan kafe dari terbaik ke terendah
  - Total Ulasan       total ulasan kafe ini di data test
  - Ulasan [Aspek]     jumlah ulasan yang diprediksi positif
  - % Ulasan [Aspek]   persentase ulasan positif per kafe
  - Rating             rating Google Maps kafe tersebut
  - Prob Rata-rata     rata-rata keyakinan model (0.0 - 1.0)

  Catatan Others:
  - Data Others sangat sedikit (5.6% positif dari total)
  - Menggunakan ComplementNB agar kelas minoritas terdeteksi
  - Wajar jika banyak kafe memiliki sedikit/nol ulasan Others
""")
print("=" * 65)