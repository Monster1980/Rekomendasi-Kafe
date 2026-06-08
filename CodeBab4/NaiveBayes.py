# 1. IMPORT LIBRARY
# =========================
import pandas as pd
import numpy as np
from scipy.sparse import load_npz
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (accuracy_score, precision_score,
                             recall_score, f1_score, confusion_matrix)
import pickle
import warnings
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
warnings.filterwarnings('ignore')

# =========================
# 2. BACA DATA
# =========================
print("=" * 65)
print("  PROSES KLASIFIKASI NAIVE BAYES - BINARY RELEVANCE")
print("=" * 65)

X_train = load_npz('tfidf_matrix_train.npz')
X_test  = load_npz('tfidf_matrix_test.npz')

y_train    = pd.read_excel('Label_Train.xlsx')
y_test     = pd.read_excel('Label_Test.xlsx')
df_test_info = pd.read_excel('Data_Test.xlsx')[
    ['Nama Cafe', 'Rating', 'Ulasan Preprocessed']
]

label_cols = ['Pelayanan', 'Suasana', 'Harga', 'Others']

print(f"\n[1] Data berhasil dimuat:")
print(f"    X_train  : {X_train.shape[0]} ulasan x {X_train.shape[1]} fitur")
print(f"    X_test   : {X_test.shape[0]} ulasan x {X_test.shape[1]} fitur")
print(f"    y_train  : {y_train.shape}")
print(f"    y_test   : {y_test.shape}")

print(f"\n    Distribusi kelas data TRAIN:")
print(f"    {'Aspek':<12} {'Positif':>8} {'Negatif':>8} {'Rasio':>8}")
print(f"    {'-'*42}")
for col in label_cols:
    n_pos = int(y_train[col].sum())                                    
    n_neg = len(y_train) - n_pos
    rasio = n_neg / max(n_pos, 1)
    flag  = ' ⚠ imbalance' if rasio > 3 else ''
    print(f"    {col:<12} {n_pos:>8} {n_neg:>8} {rasio:>7.1f}x{flag}")

# =========================
# 3. BINARY RELEVANCE
#
#    Pendekatan Binary Relevance (BAB II sub 2.2):
#    Masalah multi-label diubah menjadi L masalah biner
#    independen, satu model untuk setiap aspek.
#
#    Untuk setiap aspek c:
#      y_c = 1 jika ulasan mengandung aspek c, 0 jika tidak
#      Latih MultinomialNB tersendiri pada y_c
#      Prediksi secara independen
#
#    Algoritma: MultinomialNB
#      Cocok untuk data TF-IDF (nilai non-negatif)
#      Rumus: P(C|X) = P(X|C) x P(C) / P(X)
#      Laplace smoothing alpha=1.0 mencegah probabilitas nol
# =========================
print(f"\n[2] Membangun model Binary Relevance...")
print(f"    Algoritma         : Multinomial Naive Bayes")
print(f"    Laplace Smoothing : alpha = 1.0")
print(f"    Jumlah model      : {len(label_cols)} (satu per aspek)")

nb_models    = {}
y_pred_all   = {}
y_pred_proba = {}

for aspek in label_cols:
    print(f"\n    ── Aspek: {aspek} ──")

    y_tr = y_train[aspek].values
    y_te = y_test[aspek].values

    n_pos = int(y_tr.sum()) #menghitung jumlah data positif dg menjumlahkan semua nilai 1 di array label.
    n_neg = len(y_tr) - n_pos #jumlah negatif adlh total data dikurangi positif

    # Prior P(C) sesuai Persamaan (3) 
    prior_pos = n_pos / len(y_tr) #prir adalh peluang awal sebelum model membaca kata apapun
    prior_neg = 1 - prior_pos 
    print(f"    Data latih         : {n_pos} positif, {n_neg} negatif")
    print(f"    Prior P({aspek}=1) : {prior_pos:.4f}")
    print(f"    Prior P({aspek}=0) : {prior_neg:.4f}")

    # Latih model
    model = MultinomialNB(alpha=1.0)
    model.fit(X_train, y_tr) #matriks tfidf 4.597x5000 sbg input fitur. ytr array label 0/1 sbg target jwbn
    

    # Prediksi
    y_pred = model.predict(X_test) #menggunakan model yang sudah dilatih u/memprediksi 1.150 data test hasilnya array berisi 0 atau 1 untuk setiap ulasat test
    y_prob = model.predict_proba(X_test)[:, 1] #menghsilkan 2 kolom 0 adalah probabilitas kelas 0, kolom 1 adalah probabilitas kelas 1

    nb_models[aspek]    = model
    y_pred_all[aspek]   = y_pred
    y_pred_proba[aspek] = y_prob

    print(f"    Hasil prediksi     : {int(y_pred.sum())} ulasan positif")

# =========================
# 4. EVALUASI PER ASPEK
# =========================
print(f"\n\n[3] EVALUASI MODEL PER ASPEK")
print("=" * 65)

hasil_evaluasi = []

for aspek in label_cols: #looping evaluasi peraspek
    y_true = y_test[aspek].values #label bnr dari data test
    y_pred = y_pred_all[aspek] #prediksi model yg disimpan sebelumnya

    acc  = accuracy_score(y_true, y_pred) #TP+ TN/ Total
    prec = precision_score(y_true, y_pred, zero_division=0) #TP/TP+FP
    rec  = recall_score(y_true, y_pred, zero_division=0) #TP/TP+FN Mengukur brp persen ulasan positif yg berhasil ditangkpn model
    f1   = f1_score(y_true, y_pred, zero_division=0) #2x(presisixrecall)/ (presisi+recall)
    cm   = confusion_matrix(y_true, y_pred, labels=[0, 1]) #Membuat confusion matrix lalu memecahnya menjadi 4 angka. labels=[0,1] memastikan urutan kelas selalu 0 dulu baru 1, penting agar Others yang TP=0 tidak menyebabkan error
    tn, fp, fn, tp = cm.ravel() # mengubah matriks 2×2 menjadi array 4 elemen berurutan TN, FP, FN, TP.
    #zero_division=0 klau penyebutny 0 (tidak ada prediksi positif sm sekali seperti others) hasilnya 0 bukan eror

    hasil_evaluasi.append({
        'Aspek'    : aspek,
        'TP'       : int(tp),
        'TN'       : int(tn),
        'FP'       : int(fp),
        'FN'       : int(fn),
        'Akurasi'  : round(acc,  4),
        'Presisi'  : round(prec, 4),
        'Recall'   : round(rec,  4),
        'F1-Score' : round(f1,   4),
    })

    print(f"\n  ┌─ Aspek: {aspek} {'─'*(50-len(aspek))}┐")
    print(f"  │  Akurasi  : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  │  Presisi  : {prec:.4f}")
    print(f"  │  Recall   : {rec:.4f}")
    print(f"  │  F1-Score : {f1:.4f}")
    print(f"  │  Confusion Matrix:")
    print(f"  │               Prediksi 0   Prediksi 1")
    print(f"  │  Aktual 0  :    {tn:>6}       {fp:>6}")
    print(f"  │  Aktual 1  :    {fn:>6}       {tp:>6}")
    print(f"  └{'─'*57}┘")

# =========================
# 5. RATA-RATA MACRO AVERAGE
# =========================
df_eval = pd.DataFrame(hasil_evaluasi)

avg_acc  = df_eval['Akurasi'].mean()
avg_prec = df_eval['Presisi'].mean()
avg_rec  = df_eval['Recall'].mean()
avg_f1   = df_eval['F1-Score'].mean()

print(f"\n{'='*65}")
print(f"  RATA-RATA MACRO AVERAGE (semua aspek):")
print(f"  Akurasi  : {avg_acc:.4f}  ({avg_acc*100:.2f}%)")
print(f"  Presisi  : {avg_prec:.4f}")
print(f"  Recall   : {avg_rec:.4f}")
print(f"  F1-Score : {avg_f1:.4f}")
print(f"{'='*65}")

df_eval.loc[len(df_eval)] = { #len(df_eval) indeks baris baru yg ditambhkn diposisi paling bawah
    'Aspek'    : 'RATA-RATA (Macro)',
    'TP': '', 'TN': '', 'FP': '', 'FN': '',
    'Akurasi'  : round(avg_acc,  4),
    'Presisi'  : round(avg_prec, 4),
    'Recall'   : round(avg_rec,  4),
    'F1-Score' : round(avg_f1,   4),
}

# =========================
# 6. SUSUN HASIL PREDIKSI
# =========================
print(f"\n[4] Menyusun tabel hasil prediksi...")

df_hasil = df_test_info.copy().reset_index(drop=True)

for col in label_cols:
    df_hasil[col] = y_test[col].values

for aspek in label_cols:
    df_hasil[f'Pred_{aspek}'] = y_pred_all[aspek]
    df_hasil[f'Prob_{aspek}'] = np.round(y_pred_proba[aspek], 4)

label_actual = y_test[label_cols].values
label_pred   = np.column_stack([y_pred_all[a] for a in label_cols])
df_hasil['Semua_Label_Benar'] = (
    (label_actual == label_pred).all(axis=1).astype(int)
)

benar_semua = df_hasil['Semua_Label_Benar'].sum()
print(f"    Total data test          : {len(df_hasil)}")
print(f"    Semua label benar        : {benar_semua} ({benar_semua/len(df_hasil)*100:.1f}%)")
print(f"    Ada label salah          : {len(df_hasil)-benar_semua} ({(len(df_hasil)-benar_semua)/len(df_hasil)*100:.1f}%)")
