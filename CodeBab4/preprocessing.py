# =========================
# 1. IMPORT LIBRARY
# =========================
import pandas as pd
import numpy as np
import re
import os
from string import punctuation

from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

# =========================
# 2. BACA FILE EXCEL
# =========================
print("="*60)
print("MEMULAI PROSES PREPROCESSING")
print("="*60)

file_path = 'Majority Voting.xlsx'

if not os.path.exists(file_path):
    print(f"ERROR: File '{file_path}' tidak ditemukan!")
    print("Pastikan file berada di folder yang sama dengan script ini.")
    exit()

# Baca file — baris ke-0 adalah header utama, baris ke-1 adalah sub-header label
df_raw = pd.read_excel(file_path)

# Drop baris pertama (sub-header: 'Pelayanan', 'Suasana', 'Harga', 'Others')
df = df_raw.drop(index=0).reset_index(drop=True)

# Beri nama kolom yang benar
df.columns = ['Nama Cafe', 'Rating', 'Link Gmaps', 'Ulasan',
              'Pelayanan', 'Suasana', 'Harga', 'Others']

print(f"\n[1] Jumlah baris setelah baca file    : {len(df)}")

# =========================
# 3. HAPUS BARIS KOSONG & DUPLIKAT
# =========================
df = df.dropna(subset=['Ulasan'])
df = df[df['Ulasan'].astype(str).str.strip() != '']
df = df.drop_duplicates(subset=['Ulasan'])
df = df.reset_index(drop=True)

print(f"[2] Jumlah setelah hapus kosong/duplikat : {len(df)}")

# =========================
# 4. PERBAIKI KOLOM LABEL
#    Ada beberapa baris dengan nilai aneh ('s','S','H','SH','h','o', dll.)
#    Mapping berdasarkan arti huruf ke kolom yang benar:
#    's'/'S'  → Suasana = 1
#    'h'/'H'  → Harga   = 1
#    'SH'     → Suasana = 1 dan Harga = 1
#    'o'      → Others  = 1
#    '0+...'  → diperlakukan numerik (ambil angka pertama)
# =========================

label_cols = ['Pelayanan', 'Suasana', 'Harga', 'Others']

def fix_label_row(row):
    """
    Perbaiki baris yang kolom Pelayanan-nya berisi huruf/string aneh.
    Nilai normal: 0 atau 1. Jika string, petakan ke kolom yang sesuai.
    """
    pel = str(row['Pelayanan']).strip().lower()

    # Jika sudah angka normal, langsung return
    if pel in ['0', '1', '0.0', '1.0']:
        return row

    # Mapping nilai aneh
    mapping = {
        's': {'Suasana': 1, 'Pelayanan': 0},
        'h': {'Harga': 1, 'Pelayanan': 0},
        'sh': {'Suasana': 1, 'Harga': 1, 'Pelayanan': 0},
        'o': {'Others': 1, 'Pelayanan': 0},
    }

    if pel in mapping:
        for col, val in mapping[pel].items():
            row[col] = val
    else:
        # Coba ambil angka dari string (misal '0+E3101' → 0)
        nums = re.findall(r'^[01]', pel)
        row['Pelayanan'] = int(nums[0]) if nums else 0

    return row

df = df.apply(fix_label_row, axis=1)

# Konversi semua kolom label ke integer
for col in label_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    # Clip nilai di luar 0-1 (jika ada)
    df[col] = df[col].clip(0, 1)

print(f"[3] Label kolom sudah dibersihkan & dikonversi ke int")
print(f"    Distribusi label:")
for col in label_cols:
    print(f"    - {col}: 0={df[col].value_counts().get(0,0)}, 1={df[col].value_counts().get(1,0)}")

# =========================
# 5. SIMPAN KOLOM ASLI (untuk referensi output akhir)
# =========================
df['Ulasan_Asli'] = df['Ulasan'].copy()

# =========================
# 6. CASE FOLDING (huruf kecil semua)
# =========================
df['Ulasan'] = df['Ulasan'].astype(str).str.lower()
print(f"\n[4] Case folding selesai")

# =========================
# 7. NORMALISASI TEKS
#    - Hapus karakter escape (\n, \t, dst.)
#    - Hapus URL / link
#    - Hapus mention (@user) dan hashtag (#tag)
#    - Hapus emoji & karakter non-ASCII
# =========================
def normalize_text(text):
    # Hapus newline dan tab
    text = text.replace('\\n', ' ').replace('\n', ' ').replace('\t', ' ')
    # Hapus URL
    text = re.sub(r'http\S+|www\S+', '', text)
    # Hapus mention dan hashtag
    text = re.sub(r'@\w+|#\w+', '', text)
    # Hapus emoji dan karakter non-ASCII
    text = text.encode('ascii', 'ignore').decode('ascii')
    # Hapus karakter elipsis dan unicode sisa
    text = re.sub(r'\.{2,}', ' ', text)
    return text

df['Ulasan'] = df['Ulasan'].apply(normalize_text)
print(f"[5] Normalisasi teks (URL, emoji, escape) selesai")

# =========================
# 8. NORMALISASI KATA TIDAK BAKU → BAKU
#    (singkatan, kata gaul, typo umum dalam Bahasa Indonesia)
# =========================
slang_dict = {
    # Negasi
    "gak": "tidak", "ga": "tidak", "g": "tidak", "nggak": "tidak",
    "ngga": "tidak", "enggak": "tidak", "kagak": "tidak", "ndak": "tidak",
    "nda": "tidak",

    # Sudah/belum/pernah
    "udah": "sudah", "uda": "sudah", "dah": "sudah", "blm": "belum",
    "blum": "belum", "prnah": "pernah",

    # Kata ganti & partikel
    "yg": "yang", "jg": "juga", "yaa": "ya", "aja": "saja",
    "doang": "saja", "sih": "", "deh": "", "dong": "", "lah": "",
    "nih": "ini", "tuh": "itu",

    # Kata bantu
    "utk": "untuk", "tuk": "untuk", "buat": "untuk",
    "dgn": "dengan", "sm": "sama", "sama": "dengan",
    "dr": "dari", "ke": "ke", "di": "di",

    # Kata sifat / keterangan
    "bgt": "banget", "bgtt": "banget", "bngt": "banget",
    "banget": "sekali", "poll": "sekali", "pol": "sekali",
    "bener": "benar", "emang": "memang", "emng": "memang",
    "memng": "memang", "sgt": "sangat", "sangatt": "sangat",
    "bnyk": "banyak", "byk": "banyak", "dikit": "sedikit",
    "cukup": "cukup", "lumayan": "cukup",

    # Kata benda / objek umum
    "tmpt": "tempat", "tmpat": "tempat",
    "mnm": "minuman", "mkn": "makanan", "makan2": "makan",
    "kopii": "kopi", "cofee": "kopi", "coffe": "kopi", "coffee": "kopi",
    "kafe": "kafe", "cafe": "kafe",

    # Kata kerja
    "dateng": "datang", "pergi": "pergi", "beli": "beli",
    "pake": "pakai", "pk": "pakai", "make": "memakai",
    "nyobain": "mencoba", "cobain": "mencoba", "coba": "mencoba",
    "mesen": "memesan", "pesen": "memesan",
    "nunggu": "menunggu", "nungguin": "menunggu",
    "bayar": "bayar", "ngebayar": "membayar",
    "kesini": "ke sini", "kesana": "ke sana",
    "kesitu": "ke situ",

    # Kata sifat pelayanan
    "ramah": "ramah", "cepet": "cepat", "lambat": "lambat",
    "lelet": "lambat", "mantap": "bagus", "mantul": "bagus",
    "kece": "bagus", "okee": "oke", "ok": "oke",
    "oke": "oke", "okey": "oke",

    # Harga
    "murce": "murah", "murah": "murah", "mahal": "mahal",
    "terjangkau": "terjangkau", "worthit": "sepadan",
    "worth it": "sepadan", "worth": "sepadan",

    # Suasana
    "rame": "ramai", "sepi": "sepi", "nyaman": "nyaman",
    "cozy": "nyaman", "cozzy": "nyaman", "cosy": "nyaman",
    "asik": "menyenangkan", "asikk": "menyenangkan",
    "seru": "menyenangkan", "seruu": "menyenangkan",
    "keren": "bagus", "kerennn": "bagus", "kereenn": "bagus",
    "estetik": "estetis", "instagramable": "estetis",
    "aesthetic": "estetis",

    # Singkatan umum lain
    "sbgai": "sebagai", "sbg": "sebagai",
    "krn": "karena", "karna": "karena",
    "tp": "tapi", "tpi": "tapi",
    "klo": "kalau", "kalo": "kalau", "klw": "kalau",
    "bs": "bisa", "bsa": "bisa",
    "hrs": "harus",
    "jd": "jadi", "jdi": "jadi",
    "sdh": "sudah", "udh": "sudah",
    "lbh": "lebih", "lbih": "lebih",
    "nongkrong": "nongkrong", "nongki": "nongkrong",
    "ngopi": "minum kopi",
    "kopag": "kumpul", "nongky": "nongkrong",
    "rekomen": "rekomendasi", "recommended": "rekomendasi",
    "rekomended": "rekomendasi", "rekomendd": "rekomendasi",
    "topp": "bagus", "topppp": "bagus", "toppp": "bagus",
    "top": "bagus", "mantap": "bagus",
    "enak": "enak", "enakk": "enak", "enakkk": "enak",
    "enak2": "enak", "enaknya": "enak",
    "gampang": "mudah", "susah": "sulit",
    "lg": "lagi", "lgi": "lagi",
    "msh": "masih", "masi": "masih",
    "pgn": "ingin", "pengen": "ingin", "pengin": "ingin",
    "mo": "mau", "mao": "mau",
    "tgl": "tanggal", "bln": "bulan", "thn": "tahun",
    "no": "nomor", "nomer": "nomor",
    "dll": "dan lain lain", "dsb": "dan sebagainya",
    "dll.": "dan lain lain",
}

def normalize_slang(text):
    words = text.split()
    result = []
    for word in words:
        clean_word = word.strip(punctuation)
        replacement = slang_dict.get(clean_word, clean_word)
        if replacement:  # skip jika hasil mapping adalah string kosong (partikel)
            result.append(replacement)
    return ' '.join(result)

df['Ulasan'] = df['Ulasan'].apply(normalize_slang)
print(f"[6] Normalisasi kata slang/tidak baku selesai ({len(slang_dict)} entri kamus)")

# =========================
# 9. CLEANING TEXT
#    - Hapus angka
#    - Hapus tanda baca / simbol
#    - Normalisasi spasi
# =========================
def clean_text(text):
    # Hapus angka
    text = re.sub(r'\d+', '', text)
    # Hapus tanda baca & simbol, hanya pertahankan huruf & spasi
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Normalisasi spasi ganda
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

df['Ulasan'] = df['Ulasan'].apply(clean_text)
print(f"[7] Cleaning (hapus angka & tanda baca) selesai")

# =========================
# 10. HAPUS BARIS YANG JADI KOSONG SETELAH CLEANING
# =========================
df = df[df['Ulasan'].str.strip() != '']
df = df.reset_index(drop=True)
print(f"[8] Jumlah data setelah hapus baris kosong post-cleaning : {len(df)}")

# =========================
# 11. STOPWORD REMOVAL (Bahasa Indonesia - Sastrawi)
#     + Tambahkan custom stopwords yang tidak relevan
# =========================
factory_sw = StopWordRemoverFactory()
sastrawi_stopwords = set(factory_sw.get_stop_words())

# Tambahan stopwords kontekstual (tidak bermakna untuk analisis aspek)
custom_stopwords = {
    'ya', 'yaa', 'iya', 'ih', 'ah', 'oh', 'eh', 'wah',
    'kak', 'mas', 'mbak', 'bapak', 'ibu', 'pak',
    'nih', 'tuh', 'deh', 'dong', 'sih',
    'banget', 'sekali', 'aja', 'juga',
    'udah', 'sudah', 'lagi', 'masih',
    'bisa', 'mau', 'mau',
    'bgt', 'yg', 'tapi',
}

all_stopwords = sastrawi_stopwords.union(custom_stopwords)

def remove_stopwords(text):
    words = text.split()
    filtered = [w for w in words if w not in all_stopwords and len(w) > 1]
    return ' '.join(filtered)

df['Ulasan'] = df['Ulasan'].apply(remove_stopwords)
print(f"[9] Stopword removal selesai")

# =========================
# 12. HAPUS BARIS KOSONG LAGI (setelah stopword removal)
# =========================
df = df[df['Ulasan'].str.strip() != '']
df = df.reset_index(drop=True)
print(f"[10] Jumlah data setelah stopword removal : {len(df)}")

# =========================
# 13. STEMMING (Sastrawi — proses paling lama)
# =========================
print(f"\n[11] Memulai stemming... (harap tunggu, proses ini memakan waktu)")

factory_stemmer = StemmerFactory()
stemmer = factory_stemmer.create_stemmer()

df['Ulasan'] = df['Ulasan'].apply(lambda x: stemmer.stem(x))

print(f"     Stemming selesai!")

# =========================
# 14. HAPUS BARIS KOSONG FINAL
# =========================
df = df[df['Ulasan'].str.strip() != '']
df = df.reset_index(drop=True)
print(f"[12] Jumlah data final : {len(df)}")

# =========================
# 15. SUSUN KOLOM OUTPUT AKHIR
# =========================
# Urutkan kolom: info asli + teks ter-preprocessing + label
df_output = df[[
    'Nama Cafe',
    'Rating',
    'Ulasan_Asli',       # teks ulasan sebelum preprocessing (untuk referensi)
    'Ulasan',            # teks ulasan setelah preprocessing (siap model)
    'Pelayanan',
    'Suasana',
    'Harga',
    'Others'
]].copy()

df_output.rename(columns={
    'Ulasan_Asli': 'Ulasan Asli',
    'Ulasan': 'Ulasan Preprocessed'
}, inplace=True)

# =========================
# 16. SIMPAN KE EXCEL
# =========================
output_file = 'Hasil_Preprocessing.xlsx'

df_output.to_excel(output_file, index=False)

# =========================
# 17. RINGKASAN AKHIR
# =========================
print("\n" + "="*60)
print("PREPROCESSING SELESAI!")
print("="*60)
print(f"  Total data final        : {len(df_output)} baris")
print(f"  Kolom output            : {df_output.columns.tolist()}")
print(f"\n  Distribusi Label:")
for col in ['Pelayanan', 'Suasana', 'Harga', 'Others']:
    jumlah_1 = df_output[col].sum()
    jumlah_0 = len(df_output) - jumlah_1
    print(f"    {col:12s}: label 1 = {jumlah_1:4d}, label 0 = {jumlah_0:4d}")

print(f"\n  File tersimpan sebagai  : '{output_file}'")
print("="*60)

# Menampilkan 3 contoh hasil preprocessing
print("\n[CONTOH HASIL PREPROCESSING]")
for i in range(min(3, len(df_output))):
    print(f"\n  Baris {i+1}:")
    print(f"    Asli       : {str(df_output['Ulasan Asli'].iloc[i])[:100]}")
    print(f"    Preprocessed: {str(df_output['Ulasan Preprocessed'].iloc[i])[:100]}")
    print(f"    Label      : Pelayanan={df_output['Pelayanan'].iloc[i]}, "
          f"Suasana={df_output['Suasana'].iloc[i]}, "
          f"Harga={df_output['Harga'].iloc[i]}, "
          f"Others={df_output['Others'].iloc[i]}")