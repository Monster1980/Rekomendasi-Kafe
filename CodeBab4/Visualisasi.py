# 1. IMPORT LIBRARY
# =========================
import pandas as pd
import numpy as np
from collections import Counter
import os
import warnings
warnings.filterwarnings('ignore')

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.ticker as mticker
from matplotlib.gridspec import GridSpec
from wordcloud import WordCloud

# =========================
# 2. BACA SEMUA FILE INPUT
# =========================
print("=" * 65)
print("  VISUALISASI DIAGRAM - HASIL NAIVE BAYES")
print("=" * 65)

files_needed = [
    'NB_Evaluasi.xlsx',
    'NB_HasilPrediksi.xlsx',
    'Label_Train.xlsx',
    'Label_Test.xlsx',
    'Data_Train.xlsx',
    'Data_Test.xlsx',
]
for f in files_needed:
    if not os.path.exists(f):
        print(f"\n[ERROR] File '{f}' tidak ditemukan!")
        print("        Pastikan NaiveBayes.py sudah dijalankan terlebih dahulu.")
        exit()

print("\n[1] Membaca file hasil...")

df_eval  = pd.read_excel('NB_Evaluasi.xlsx')
df_pred  = pd.read_excel('NB_HasilPrediksi.xlsx')
y_train  = pd.read_excel('Label_Train.xlsx')
y_test   = pd.read_excel('Label_Test.xlsx')
df_train = pd.read_excel('Data_Train.xlsx')
df_test  = pd.read_excel('Data_Test.xlsx')

print(f"    NB_Evaluasi.xlsx      : {len(df_eval)} baris")
print(f"    NB_HasilPrediksi.xlsx : {len(df_pred)} baris")
print(f"    Data Train            : {len(df_train)} ulasan")
print(f"    Data Test             : {len(df_test)} ulasan")

# =========================
# 3. SIAPKAN DATA RINGKASAN
# =========================
print("\n[2] Menyiapkan data untuk diagram...")

label_cols = ['Pelayanan', 'Suasana', 'Harga', 'Others']

algo_map = {
    'Pelayanan' : 'MultinomialNB',
    'Suasana'   : 'MultinomialNB',
    'Harga'     : 'MultinomialNB',
    'Others'    : 'ComplementNB',
}

# Pisahkan baris per aspek dan baris rata-rata
df_aspek = df_eval[df_eval['Aspek'].isin(label_cols)].set_index('Aspek')
df_macro = df_eval[df_eval['Aspek'] == 'RATA-RATA (Macro)'].iloc[0]

avg_acc  = float(df_macro['Akurasi'])
avg_prec = float(df_macro['Presisi'])
avg_rec  = float(df_macro['Recall'])
avg_f1   = float(df_macro['F1-Score'])

# Dict ringkasan per aspek
eval_data = {}
for a in label_cols:
    row = df_aspek.loc[a]
    eval_data[a] = {
        'Akurasi'  : float(row['Akurasi']),
        'Presisi'  : float(row['Presisi']),
        'Recall'   : float(row['Recall']),
        'F1-Score' : float(row['F1-Score']),
        'TP'       : int(row['TP']),
        'TN'       : int(row['TN']),
        'FP'       : int(row['FP']),
        'FN'       : int(row['FN']),
    }

# Distribusi data positif per aspek
dist_train_pos = [int(y_train[a].sum()) for a in label_cols]
dist_train_neg = [int(len(y_train) - y_train[a].sum()) for a in label_cols]
dist_test_pos  = [int(y_test[a].sum())  for a in label_cols]

# Jumlah prediksi positif vs aktual positif
# Deteksi otomatis nama kolom aktual:
#   Versi baru NaiveBayes.py  : kolom 'Aktual_Pelayanan', dst.
#   Versi lama NaiveBayes.py  : kolom langsung 'Pelayanan', dst.
def kolom_aktual(aspek):
    if f'Aktual_{aspek}' in df_pred.columns:
        return f'Aktual_{aspek}'
    return aspek

pred_pos_list   = [int(df_pred[f'Pred_{a}'].sum())     for a in label_cols]
aktual_pos_list = [int(df_pred[kolom_aktual(a)].sum()) for a in label_cols]
print(f"    Kolom aktual terdeteksi : {[kolom_aktual(a) for a in label_cols]}")

# Benar semua label
if 'Semua_Label_Benar' in df_pred.columns:
    benar_semua = int(df_pred['Semua_Label_Benar'].sum())
else:
    benar_semua = 0
pct_benar = benar_semua / len(df_pred) * 100

print(f"    Macro avg F1     : {avg_f1:.4f}")
print(f"    Benar semua label: {benar_semua}/{len(df_pred)} ({pct_benar:.1f}%)")

# =========================
# 4. KONFIGURASI WARNA
# =========================
WARNA_METRIK = {
    'Akurasi'  : '#4A90D9',
    'Presisi'  : '#2BB07F',
    'Recall'   : '#F5A623',
    'F1-Score' : '#E05C38',
}
CM_BG   = {'TN': '#D5EDD9', 'TP': '#2BB07F',
            'FP': '#FDDBD7', 'FN': '#E05C38'}
CM_TEXT = {'TN': '#1A6B2A', 'TP': '#FFFFFF',
           'FP': '#8B1A0E', 'FN': '#FFFFFF'}

# Palet warna wordcloud per aspek
WC_COLORS = {
    'Pelayanan': ['#1a5f9e','#2878c8','#4a9de0','#6db4ee','#92caf4','#b8dcf8'],
    'Suasana'  : ['#0f6e56','#1a9e7a','#28c49c','#4dd4b0','#80e0c8','#aaeedd'],
    'Harga'    : ['#8a4500','#c45f05','#ef8c27','#f5a84d','#fac880','#fce0b0'],
    'Others'   : ['#8b1a0e','#bf2b1a','#e05030','#ee7055','#f49c88','#f9c4ba'],
}

plt.rcParams.update({
    'font.family'       : 'DejaVu Sans',
    'axes.spines.top'   : False,
    'axes.spines.right' : False,
    'axes.facecolor'    : '#FAFAFA',
    'figure.facecolor'  : 'white',
    'axes.grid'         : True,
    'grid.color'        : '#E8E8E8',
    'grid.linewidth'    : 0.5,
    'axes.titlesize'    : 10,
    'axes.titleweight'  : 'bold',
    'axes.labelsize'    : 9,
    'xtick.labelsize'   : 8,
    'ytick.labelsize'   : 8,
})

# ============================================================
# GAMBAR 1: NB_Diagram_Evaluasi.png
# ============================================================
print("\n[3] Membuat NB_Diagram_Evaluasi.png...")

fig1 = plt.figure(figsize=(20, 17), facecolor='white')
fig1.suptitle(
    'Hasil Akhir Klasifikasi Naive Bayes  -  Binary Relevance\n'
    'Analisis Sentimen Aspek Ulasan Cafe',
    fontsize=15, fontweight='bold', y=0.98, color='#222222'
)
gs1 = GridSpec(3, 4, figure=fig1,
               hspace=0.55, wspace=0.40,
               top=0.94, bottom=0.04, left=0.07, right=0.97)

# ── (A) Bar 4 metrik ────────────────────────────────────────
ax_a = fig1.add_subplot(gs1[0, :2])
x      = np.arange(len(label_cols))
n_met  = 4
lebar  = 0.18
offset = np.linspace(-(n_met-1)/2*lebar, (n_met-1)/2*lebar, n_met)
metrik_keys = ['Akurasi', 'Presisi', 'Recall', 'F1-Score']

for i, metrik in enumerate(metrik_keys):
    nilai = [eval_data[a][metrik]*100 for a in label_cols]
    bars  = ax_a.bar(x+offset[i], nilai, width=lebar,
                     label=metrik, color=WARNA_METRIK[metrik],
                     edgecolor='white', linewidth=0.4)
    for bar, val in zip(bars, nilai):
        ax_a.text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.8,
                  f'{val:.1f}', ha='center', va='bottom',
                  fontsize=6.5, color='#444')

ax_a.set_title('(A)  Perbandingan Metrik Evaluasi per Aspek')
ax_a.set_xticks(x)
ax_a.set_xticklabels(label_cols)
ax_a.set_ylabel('Nilai (%)')
ax_a.set_ylim(0, 112)
ax_a.yaxis.set_major_formatter(mticker.FormatStrFormatter('%g%%'))
ax_a.legend(loc='upper right', fontsize=7.5, framealpha=0.8)
ax_a.axhline(avg_f1*100, color='#888', linestyle='--', linewidth=0.9, alpha=0.7)
ax_a.text(3.55, avg_f1*100+1.5, f'Avg F1\n{avg_f1*100:.1f}%',
          fontsize=6.5, color='#888', va='bottom', ha='center')

# ── (B) Distribusi data ──────────────────────────────────────
ax_b = fig1.add_subplot(gs1[0, 2:])
x2 = np.arange(len(label_cols))
lb = 0.28

bars_tr = ax_b.bar(x2-lb,  dist_train_pos, width=lb,
                   label='Train positif (+)', color='#534AB7',
                   edgecolor='white', linewidth=0.4)
bars_te = ax_b.bar(x2,     dist_test_pos,  width=lb,
                   label='Test positif (+)',  color='#AFA9EC',
                   edgecolor='white', linewidth=0.4)
ax_b.bar(x2+lb, dist_train_neg, width=lb,
         label='Train negatif (-)', color='#E8E6F7',
         edgecolor='#AFA9EC', linewidth=0.4)

for bar in bars_tr:
    ax_b.text(bar.get_x()+bar.get_width()/2, bar.get_height()+15,
              str(int(bar.get_height())), ha='center', va='bottom',
              fontsize=7, color='#333')
for bar in bars_te:
    ax_b.text(bar.get_x()+bar.get_width()/2, bar.get_height()+15,
              str(int(bar.get_height())), ha='center', va='bottom',
              fontsize=7, color='#333')

ax_b.set_title('(B)  Distribusi Data per Aspek (Train vs Test)')
ax_b.set_xticks(x2)
ax_b.set_xticklabels(label_cols)
ax_b.set_ylabel('Jumlah ulasan')
ax_b.legend(fontsize=7.5, framealpha=0.8)

for i, a in enumerate(label_cols):
    pct = dist_train_pos[i]/len(y_train)*100
    ax_b.text(i-lb, -260, f'{pct:.1f}%\npositif',
              ha='center', fontsize=6.5, color='#534AB7', fontweight='bold')

# ── (C-F) Confusion Matrix ───────────────────────────────────
for idx, aspek in enumerate(label_cols):
    ax_cm = fig1.add_subplot(gs1[1, idx])
    d = eval_data[aspek]
    tn,fp,fn,tp = d['TN'],d['FP'],d['FN'],d['TP']
    total = tn+fp+fn+tp
    cm_vals   = np.array([[tn,fp],[fn,tp]])
    cm_labels = [['TN','FP'],['FN','TP']]

    ax_cm.set_xlim(0,2); ax_cm.set_ylim(0,2)
    ax_cm.set_aspect('equal'); ax_cm.axis('off')

    for r in range(2):
        for c in range(2):
            lbl = cm_labels[r][c]
            val = cm_vals[r,c]
            pct = val/total*100
            rect = mpatches.FancyBboxPatch(
                (c+0.05,1-r+0.05), 0.90, 0.90,
                boxstyle='round,pad=0.03',
                facecolor=CM_BG[lbl], edgecolor='white', linewidth=1.5)
            ax_cm.add_patch(rect)
            ax_cm.text(c+0.50,1-r+0.65,lbl, ha='center', va='center',
                       fontsize=9, fontweight='bold', color=CM_TEXT[lbl])
            ax_cm.text(c+0.50,1-r+0.38,str(val), ha='center', va='center',
                       fontsize=14, fontweight='bold', color=CM_TEXT[lbl])
            ax_cm.text(c+0.50,1-r+0.16,f'{pct:.1f}%', ha='center', va='center',
                       fontsize=7.5, color=CM_TEXT[lbl], alpha=0.85)

    ax_cm.text(0.50,2.12,'Pred 0', ha='center', fontsize=7.5, color='#555', fontweight='bold')
    ax_cm.text(1.50,2.12,'Pred 1', ha='center', fontsize=7.5, color='#555', fontweight='bold')
    ax_cm.text(-0.14,1.50,'Aktual\n0', ha='center', va='center',
               fontsize=7.5, color='#555', fontweight='bold', rotation=90)
    ax_cm.text(-0.14,0.50,'Aktual\n1', ha='center', va='center',
               fontsize=7.5, color='#555', fontweight='bold', rotation=90)

    ax_cm.set_title(f'({"CDEF"[idx]})  Confusion Matrix - {aspek}\n[{algo_map[aspek]}]',
                    fontsize=9, fontweight='bold', pad=8)
    ax_cm.text(1.0,-0.15,
               f'Akurasi {d["Akurasi"]*100:.1f}%  |  F1 {d["F1-Score"]*100:.1f}%  |  '
               f'Presisi {d["Presisi"]*100:.1f}%  |  Recall {d["Recall"]*100:.1f}%',
               ha='center', va='top', fontsize=6.8, color='#555',
               transform=ax_cm.transData)

print("    (A-F) Selesai")

# ── (G) Radar F1 ─────────────────────────────────────────────
ax_g = fig1.add_subplot(gs1[2, :2], polar=True)
n_cat  = len(label_cols)
angles = np.linspace(0,2*np.pi,n_cat,endpoint=False).tolist()
angles_c = angles + angles[:1]
f1_vals  = [eval_data[a]['F1-Score']*100 for a in label_cols]
f1_c     = f1_vals + f1_vals[:1]

ax_g.plot(angles_c, f1_c, 'o-', linewidth=2, color='#534AB7', markersize=6)
ax_g.fill(angles_c, f1_c, alpha=0.18, color='#534AB7')
ax_g.set_thetagrids(np.degrees(angles), label_cols, fontsize=9)
ax_g.set_ylim(0,100)
ax_g.set_yticks([20,40,60,80,100])
ax_g.set_yticklabels(['20%','40%','60%','80%','100%'], fontsize=6.5, color='#999')
ax_g.yaxis.grid(True, color='#CCCCCC', linewidth=0.5)
ax_g.xaxis.grid(True, color='#CCCCCC', linewidth=0.5)
ax_g.spines['polar'].set_visible(False)
for angle, val in zip(angles, f1_vals):
    ax_g.text(angle, val+10, f'{val:.1f}%', ha='center', va='center',
              fontsize=8.5, fontweight='bold', color='#3A2FAA')
ax_g.set_title('(G)  Radar Chart F1-Score per Aspek',
               fontsize=10, fontweight='bold', pad=20)

# ── (H) Aktual vs Prediksi positif ──────────────────────────
ax_h = fig1.add_subplot(gs1[2, 2:])
x4 = np.arange(len(label_cols))
lb2 = 0.30

b_akt = ax_h.bar(x4-lb2/2, aktual_pos_list, width=lb2,
                 label='Aktual positif', color='#3266AD',
                 edgecolor='white', linewidth=0.4)
b_prd = ax_h.bar(x4+lb2/2, pred_pos_list, width=lb2,
                 label='Diprediksi positif', color='#A8C4E0',
                 edgecolor='white', linewidth=0.4)

for bar in b_akt:
    ax_h.text(bar.get_x()+bar.get_width()/2, bar.get_height()+3,
              str(int(bar.get_height())), ha='center', va='bottom',
              fontsize=8, color='#222')
for bar in b_prd:
    ax_h.text(bar.get_x()+bar.get_width()/2, bar.get_height()+3,
              str(int(bar.get_height())), ha='center', va='bottom',
              fontsize=8, color='#222')

for i,(akt,pred) in enumerate(zip(aktual_pos_list, pred_pos_list)):
    selisih = akt - pred
    warna_s = '#E05C38' if selisih > 0 else '#1D9E75'
    ax_h.text(i, max(akt,pred)+20, f'selisih\n{selisih:+d}',
              ha='center', fontsize=7, color=warna_s, fontweight='bold')

ax_h.set_title('(H)  Jumlah Aktual vs Prediksi Positif per Aspek')
ax_h.set_xticks(x4)
ax_h.set_xticklabels(label_cols)
ax_h.set_ylabel('Jumlah ulasan')
ax_h.legend(fontsize=8, framealpha=0.8)

out1 = 'NB_Diagram_Evaluasi.png'
plt.savefig(out1, dpi=150, bbox_inches='tight', facecolor='white', edgecolor='none')
plt.close(fig1)
print(f"    (G-H) Selesai  ->  disimpan ke '{out1}'")

# ============================================================
# GAMBAR 2: NB_Diagram_Wordcloud.png
# 4 baris (per aspek) x 3 kolom:
#   Kolom 1 : WordCloud kata dominan
#   Kolom 2 : Bar chart top 12 kata
#   Kolom 3 : Histogram distribusi probabilitas
# ============================================================
print("\n[4] Membuat NB_Diagram_Wordcloud.png...")

# Siapkan Counter kata per aspek dari data train (ulasan label=1)
kata_per_aspek = {}
for a in label_cols:
    mask = y_train[a] == 1
    teks = df_train.loc[mask, 'Ulasan Preprocessed'].dropna().astype(str)
    kata_per_aspek[a] = Counter(' '.join(teks).split())

def buat_color_func(warna_list):
    """Membuat fungsi warna acak dari daftar warna untuk WordCloud."""
    import random
    def color_func(word, font_size, position, orientation,
                   random_state=None, **kwargs):
        return random.choice(warna_list)
    return color_func

fig2, axes = plt.subplots(
    4, 3, figsize=(20, 22), facecolor='white',
    gridspec_kw={'wspace':0.35, 'hspace':0.50,
                 'top':0.94, 'bottom':0.04,
                 'left':0.05, 'right':0.97}
)
fig2.suptitle(
    'Visualisasi Kata & Distribusi Probabilitas per Aspek\n'
    'Analisis Sentimen Ulasan Cafe',
    fontsize=15, fontweight='bold', y=0.98, color='#222222'
)

HURUF = 'ABCDEFGHIJKL'  # 4 x 3 = 12 subplot

for idx, aspek in enumerate(label_cols):
    warna_list  = WC_COLORS[aspek]
    warna_utama = warna_list[0]   # paling gelap
    warna_muda  = warna_list[2]   # tengah

    counter  = kata_per_aspek[aspek]
    top_15   = counter.most_common(15)
    top_12   = counter.most_common(12)
    prob_col = f'Prob_{aspek}'
    prob_vals = df_pred[prob_col].values
    huruf     = HURUF[idx*3: idx*3+3]

    # ── Kolom 1: WordCloud ────────────────────────────────
    ax_wc = axes[idx][0]
    ax_wc.axis('off')

    wc = WordCloud(
        width=700, height=380,
        background_color='white',
        max_words=60,
        prefer_horizontal=0.85,
        min_font_size=10, max_font_size=80,
        color_func=buat_color_func(warna_list),
        collocations=False,
        random_state=42,
    ).generate_from_frequencies(dict(top_15))

    ax_wc.imshow(wc, interpolation='bilinear')
    ax_wc.set_title(
        f'({huruf[0]})  WordCloud - Aspek {aspek}\n'
        f'Dari {int(y_train[aspek].sum())} ulasan berlabel 1 (data train)',
        fontsize=9, fontweight='bold', pad=8, color='#222'
    )

    # ── Kolom 2: Bar chart top 12 kata ────────────────────
    ax_bar = axes[idx][1]
    ax_bar.set_facecolor('#FAFAFA')

    kata_list = [k for k,_ in reversed(top_12)]
    frek_list = [v for _,v in reversed(top_12)]
    maks      = max(frek_list)

    bars = ax_bar.barh(kata_list, frek_list,
                       color=warna_muda, edgecolor='white',
                       linewidth=0.4, height=0.65)
    bars[-1].set_facecolor(warna_utama)  # bar tertinggi lebih gelap

    for bar, val in zip(bars, frek_list):
        ax_bar.text(bar.get_width() + maks*0.01,
                    bar.get_y()+bar.get_height()/2,
                    str(val), va='center', fontsize=7.5, color='#444')

    ax_bar.set_title(f'({huruf[1]})  Top 12 Kata - Aspek {aspek}',
                     fontsize=9, fontweight='bold', pad=8)
    ax_bar.set_xlabel('Frekuensi kemunculan', fontsize=8)
    ax_bar.set_xlim(0, maks*1.18)
    ax_bar.grid(axis='x', color='#E8E8E8', linewidth=0.5)
    ax_bar.grid(axis='y', visible=False)
    ax_bar.tick_params(axis='y', labelsize=8)
    ax_bar.spines['top'].set_visible(False)
    ax_bar.spines['right'].set_visible(False)

    # ── Kolom 3: Histogram distribusi probabilitas ─────────
    ax_prob = axes[idx][2]
    ax_prob.set_facecolor('#FAFAFA')

    bins = np.linspace(0, 1, 21)
    n, _, patches = ax_prob.hist(prob_vals, bins=bins,
                                  color=warna_muda, edgecolor='white',
                                  linewidth=0.4)

    for patch in patches:         # bin >= 0.5 warna lebih gelap
        if patch.get_x() >= 0.5:
            patch.set_facecolor(warna_utama)

    ymax = ax_prob.get_ylim()[1]
    ax_prob.axvline(x=0.5, color='#E05C38', linestyle='--',
                    linewidth=1.5, label='Threshold = 0.5')

    n_atas   = (prob_vals >= 0.5).sum()
    n_bawah  = (prob_vals  < 0.5).sum()
    ax_prob.text(0.52, ymax*0.90,
                 f'Pred positif\n{n_atas} ulasan',
                 fontsize=7.5, color=warna_utama, fontweight='bold')
    ax_prob.text(0.01, ymax*0.90,
                 f'Pred negatif\n{n_bawah} ulasan',
                 fontsize=7.5, color='#888', fontweight='bold')

    ax_prob.set_title(f'({huruf[2]})  Distribusi Probabilitas - Aspek {aspek}',
                      fontsize=9, fontweight='bold', pad=8)
    ax_prob.set_xlabel('Nilai probabilitas', fontsize=8)
    ax_prob.set_ylabel('Jumlah ulasan', fontsize=8)
    ax_prob.set_xlim(0, 1)
    ax_prob.xaxis.set_major_formatter(mticker.FormatStrFormatter('%.1f'))
    ax_prob.legend(fontsize=7.5, framealpha=0.8, loc='upper right')
    ax_prob.spines['top'].set_visible(False)
    ax_prob.spines['right'].set_visible(False)

    print(f"    Aspek {aspek}: wordcloud + bar + histogram -> OK")

out2 = 'NB_Diagram_Wordcloud.png'
plt.savefig(out2, dpi=150, bbox_inches='tight', facecolor='white', edgecolor='none')
plt.close(fig2)
print(f"    Disimpan ke '{out2}'")

# =========================
# 5. RINGKASAN AKHIR
# =========================
print("\n" + "=" * 65)
print("  VISUALISASI SELESAI!")
print("=" * 65)
print(f"""
  File yang dihasilkan:
  +------------------------------------------------------+
  | NB_Diagram_Evaluasi.png                              |
  |   (A) Bar chart 4 metrik per aspek                  |
  |   (B) Distribusi data train vs test per aspek       |
  |   (C-F) Confusion matrix 4 aspek                   |
  |   (G) Radar chart F1-Score                          |
  |   (H) Jumlah aktual vs prediksi positif             |
  +------------------------------------------------------+
  | NB_Diagram_Wordcloud.png                             |
  |   Kolom 1 : WordCloud kata dominan tiap aspek       |
  |   Kolom 2 : Bar chart top 12 kata tiap aspek        |
  |   Kolom 3 : Histogram distribusi probabilitas       |
  +------------------------------------------------------+""")

print(f"\n  {'Aspek':<12} {'Akurasi':>9} {'Presisi':>9} {'Recall':>9} {'F1':>9}")
print(f"  {'-'*52}")
for a in label_cols:
    d = eval_data[a]
    print(f"  {a:<12} {d['Akurasi']*100:>8.2f}% "
          f"{d['Presisi']*100:>8.2f}% "
          f"{d['Recall']*100:>8.2f}% "
          f"{d['F1-Score']*100:>8.2f}%")
print(f"  {'Rata-rata':<12} {avg_acc*100:>8.2f}% "
      f"{avg_prec*100:>8.2f}% "
      f"{avg_rec*100:>8.2f}% "
      f"{avg_f1*100:>8.2f}%")
print("=" * 65)