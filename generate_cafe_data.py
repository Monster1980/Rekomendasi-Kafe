"""
generate_cafe_data.py
=====================
Menghasilkan cafe_data.json untuk website CAFENIX berdasarkan:
1. Ranking_Kafe.xlsx (CodeBab4) — ranking per aspek dari hasil Naive Bayes
2. database_cafe_lengkap.json — ulasan asli, alamat (via address_map)

Rating per aspek dihitung dari:
  - % Ulasan Positif (dari prediksi NB) → diskala ke 1.0-5.0
  - Prob Rata-rata (confidence model NB) sebagai faktor koreksi
  - Rating Google Maps sebagai baseline

Ini menggantikan metode lama yang hanya mengalikan label biner × 5.0
"""
import json
import re
import pandas as pd
import random

# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────
FILE_RANKING   = 'CodeBab4/Ranking_Kafe.xlsx'
FILE_JSON      = 'database_cafe_lengkap.json'
FILE_OUTPUT    = 'public/cafe_data.json'

# List of Unsplash Cafe Images (reuse dari sebelumnya)
images = [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1521017432531-fbd92028d8ed?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600"
]

# Pemetaan alamat kafe (dari versi sebelumnya + tambahan untuk kafe baru dari ranking)
address_map = {
    "Afterwork Caffeine": "G-Walk, Jl. Niaga Gapura No. 150, Sambikerep, Surabaya Barat",
    "Alecta": "Jl. Raya Gubeng No. 12, Gubeng, Kec. Gubeng, Surabaya",
    "Andzero": "Jl. Nginden Intan Timur II No. A1-20, Nginden Jangkungan, Kec. Sukolilo, Surabaya Timur",
    "Arah Coffee Kertajaya": "Jl. Kertajaya No. 120, Kertajaya, Kec. Gubeng, Surabaya",
    "Artap Café": "Jl. Dr. Ir. H. Soekarno No. 424, Kedung Baruk, Kec. Rungkut, Surabaya Timur (MERR)",
    "Arung Senja": "Jl. Jemursari No. 78, Jemur Wonosari, Kec. Wonocolo, Surabaya",
    "At Koffie Graha": "Graha Famili, Wiyung, Surabaya Barat",
    "Au Café": "Jl. Manyar Kertoarjo III No. 75, Manyar Sabrangan, Kec. Mulyorejo, Surabaya Timur",
    "Avere": "Jl. Darmo Indah Timur No. 18, Tandes, Surabaya Barat",
    "Bangi Café": "Jl. Rungkut Madya No. 99, Rungkut Kidul, Kec. Rungkut, Surabaya Timur",
    "Bara Cafe": "Jl. Ketintang No. 156, Ketintang, Kec. Gayungan, Surabaya",
    "Brown Bear Baker and Café": "Jl. Raya Kupang Indah No. 5, Sonokwijenan, Kec. Sukomanunggal, Surabaya Barat",
    "Bunbee Korean Bakery and Café": "Jl. Raya Gubeng No. 33, Gubeng, Kec. Gubeng, Surabaya",
    "Café Prajurit": "Jl. Prajurit No. 12, Adityawarman, Kec. Sawahan, Surabaya",
    "Carpentier Kitchen": "Jl. Untung Suropati No. 83, Dr. Soetomo, Kec. Tegalsari, Surabaya",
    "Coffee Breng and Lounge": "Jl. Tunjungan No. 55, Genteng, Surabaya",
    "Coffee Café Surabaya": "Jl. Basuki Rahmat No. 100, Genteng, Surabaya",
    "Coffee Toffee": "Jl. Taman Apsari No. 7, Embong Kaliasin, Kec. Genteng, Surabaya",
    "Coffe Toffe": "Jl. Taman Apsari No. 7, Embong Kaliasin, Kec. Genteng, Surabaya",
    "De Mandailing Café Kertajaya": "Jl. Kertajaya Indah No. 75, Manyar Sabrangan, Kec. Mulyorejo, Surabaya Timur",
    "Deckside Lounge Café": "Jl. Manyar Kertoarjo No. 22, Manyar Sabrangan, Kec. Mulyorejo, Surabaya Timur",
    "Dejavu": "Jl. Ngagel Jaya Selatan No. 33, Pucang Sewu, Kec. Gubeng, Surabaya",
    "Dukee Café and Eatery": "Jl. Dukuh Kupang Barat No. 25, Dukuh Pakis, Surabaya Barat",
    "Eicy Café": "Jl. Dharmahusada No. 122, Mojo, Kec. Gubeng, Surabaya",
    "Fifteenth Café": "Jl. Raya Kupang Indah No. 15, Dukuh Kupang, Kec. Dukuhpakis, Surabaya Barat",
    "Fork Surabaya": "Jl. Tegalsari No. 12, Kedungdoro, Kec. Tegalsari, Surabaya",
    "Gatherinc": "Jl. Citraland No. 44, Sambikerep, Surabaya Barat",
    "Gibran's Cafe and Eatery": "Jl. Ahmad Yani No. 88, Gayungan, Surabaya",
    "Greenstones Coffee": "Jl. Merr Kalijudan No. 40, Kalijudan, Kec. Mulyorejo, Surabaya Timur",
    "Griffon Café and Lounge": "Jl. Raya Darmo No. 45, Darmo, Kec. Wonokromo, Surabaya",
    "Halaman 78 Café": "Jl. Sumatra No. 78, Gubeng, Kec. Gubeng, Surabaya",
    "Historica": "Jl. Sumatra No. 40, Gubeng, Kec. Gubeng, Surabaya",
    "JJ Lake Café": "Jl. CitraLand Raya Utama, Sambikerep, Surabaya Barat",
    "JJ Lake Café ": "Jl. CitraLand Raya Utama, Sambikerep, Surabaya Barat",
    "Karmenseve Coffee Shop": "Jl. Manyar Kertoarjo No. 17, Manyar Sabrangan, Kec. Mulyorejo, Surabaya Timur",
    "Kateko Surabaya": "Jl. Ketintang No. 182, Ketintang, Kec. Gayungan, Surabaya",
    "Kirribilli Taman Asri": "Jl. Taman Asri No. 40, Rungkut, Surabaya Timur",
    "Kudos Café": "Pakuwon Square AK 2 No. 3, Jl. Mayjen Yono Suwoyo, Wiyung, Surabaya Barat",
    "Kwasong Café": "Jl. Raya Citraland No. 10, Sambikerep, Surabaya Barat",
    # Kafe baru dari ranking (tidak ada di database_cafe_lengkap.json)
    "BnD Café": "Jl. Ngagel Jaya Selatan, Kec. Gubeng, Surabaya",
    "Café Anon and Eatery": "Jl. Gubeng Kertajaya, Kec. Gubeng, Surabaya",
    "Djournal Coffee": "Jl. Tunjungan No. 17, Genteng, Surabaya",
    "Feel Matcha Tunjungan": "Jl. Tunjungan No. 88, Genteng, Surabaya",
    "Fore Coffee Gwalk": "G-Walk, Jl. Niaga Gapura, Sambikerep, Surabaya Barat",
    "HOHO Coffee Tunjungan": "Jl. Tunjungan No. 53, Genteng, Surabaya",
    "JOKOPI Tunjungan": "Jl. Tunjungan No. 22, Genteng, Surabaya",
    "Kogu Space": "Jl. Raya Darmo, Kec. Wonokromo, Surabaya",
    "Kopi Ruah": "Jl. Ketintang Baru, Kec. Gayungan, Surabaya",
    "Liberia Eatery": "Jl. Manyar Kertoarjo, Kec. Mulyorejo, Surabaya Timur",
    "Liberia Eatery ": "Jl. Manyar Kertoarjo, Kec. Mulyorejo, Surabaya Timur",
    "LOT Coffee": "Jl. Raya Kupang Indah, Kec. Sukomanunggal, Surabaya Barat",
    "LOUVE": "Jl. Raya Darmo Permai, Kec. Sukomanunggal, Surabaya Barat",
    "Mawu Café": "Jl. Manyar Kertoarjo, Kec. Mulyorejo, Surabaya Timur",
    "Mawu Café ": "Jl. Manyar Kertoarjo, Kec. Mulyorejo, Surabaya Timur",
    "Mojako Semampir Tengah": "Jl. Semampir Tengah, Kec. Krembangan, Surabaya",
    "Monopole Coffee Lab": "Jl. Embong Kenongo, Kec. Genteng, Surabaya",
    "N Coffee & Eatery": "Jl. Ngagel Jaya Selatan, Kec. Gubeng, Surabaya",
    "Oh Dear Donkey": "Jl. Raya Darmo, Kec. Wonokromo, Surabaya",
    "Oh Gelato Café": "Jl. Manyar Kertoarjo, Kec. Mulyorejo, Surabaya Timur",
    "Oi Kafe": "Jl. Ketintang, Kec. Gayungan, Surabaya",
    "OL and NU Café Eatery": "Jl. Rungkut Industri, Kec. Rungkut, Surabaya Timur",
    "One Pose Café": "Jl. Kertajaya Indah, Kec. Mulyorejo, Surabaya Timur",
    "Onetwothree Café": "Jl. Embong Malang, Kec. Genteng, Surabaya",
    "Patdua Coffee": "Jl. Embong Cerme, Kec. Genteng, Surabaya",
    "Picaroll Café Bakery": "Jl. Mayjen Sungkono, Kec. Dukuhpakis, Surabaya Barat",
    "Rasa Baru Café": "Jl. Raya Gubeng, Kec. Gubeng, Surabaya",
    "Riverside Café": "Jl. Dr. Ir. H. Soekarno (MERR), Kec. Rungkut, Surabaya Timur",
    "Rooftop": "Jl. Tunjungan, Kec. Genteng, Surabaya",
    "Ruf Coffee & Eatery": "Jl. Raya Gubeng, Kec. Gubeng, Surabaya",
    "Rumah Keena": "Jl. Ketintang Baru, Kec. Gayungan, Surabaya",
    "Rustic Market": "Jl. Dharmahusada, Kec. Gubeng, Surabaya",
    "Sambang Café": "Jl. Embong Ploso, Kec. Genteng, Surabaya",
    "Shisha Boss Café": "Jl. Tunjungan, Kec. Genteng, Surabaya",
    "Space K": "Jl. Manyar Kertoarjo, Kec. Mulyorejo, Surabaya Timur",
    "Sult Café": "Jl. Rungkut Madya, Kec. Rungkut, Surabaya Timur",
    "The Good Press and Co": "Jl. Tunjungan, Kec. Genteng, Surabaya",
    "The Localist Coffee": "Jl. Darmo, Kec. Wonokromo, Surabaya",
    "The Vinyk Chick Café": "Jl. Mayjen Sungkono, Kec. Dukuhpakis, Surabaya Barat",
    "Titik Tengah Surabaya": "Jl. Dr. Soetomo, Kec. Tegalsari, Surabaya",
    "TOMORO Coffee Mer": "Jl. Dr. Ir. H. Soekarno (MERR), Kec. Rungkut, Surabaya Timur",
    "Tunjungan 39 Locahands": "Jl. Tunjungan No. 39, Genteng, Surabaya",
    "VERTE Café": "Jl. Raya Kupang Indah, Kec. Sukomanunggal, Surabaya Barat",
    "Villos Café": "Jl. Ngagel Jaya, Kec. Gubeng, Surabaya",
    "Loske Coffe Service Tunjungan": "Jl. Tunjungan, Kec. Genteng, Surabaya",
    "Loske Coffe Service Tunjungan ": "Jl. Tunjungan, Kec. Genteng, Surabaya",
}


def normalize_name(name):
    """Normalisasi nama kafe agar konsisten"""
    name = name.strip()
    # Fix encoding issues with Café
    name = re.sub(r'Caf[^\s]*', 'Café', name)
    name = name.replace('Caféé', 'Café')
    name = name.replace('coffe', 'Coffee')
    name = name.replace('Coffe', 'Coffee')
    if "Mandailing" in name or "Maindiling" in name:
        return "De Mandailing Café Kertajaya"
    if "Greenstones" in name:
        return "Greenstones Coffee"
    return name


def compute_aspect_rating(persen_positif, prob_rata2, ranking_pos, total_cafes=79):
    """
    Hitung rating aspek (1.0-5.0) berdasarkan data dari ranking NB.
    
    Formula:
    - 50% dari % ulasan positif (diskala ke 1.0-5.0)
    - 25% dari prob rata-rata (confidence model, diskala ke 1.0-5.0)  
    - 25% dari posisi ranking (dinormalisasi, rank 1 = 5.0, rank terakhir = 1.0)
    """
    # Komponen 1: % ulasan positif → skala 1.0-5.0
    # 0% → 1.0, 100% → 5.0
    score_from_pct = 1.0 + (persen_positif / 100.0) * 4.0
    
    # Komponen 2: Prob rata-rata (0-1) → skala 1.0-5.0
    score_from_prob = 1.0 + prob_rata2 * 4.0
    
    # Komponen 3: Ranking position → skala 1.0-5.0 (rank 1 = tertinggi)
    if ranking_pos <= total_cafes:
        score_from_rank = 5.0 - ((ranking_pos - 1) / max(total_cafes - 1, 1)) * 4.0
    else:
        score_from_rank = 1.0
    
    # Gabungkan: 50% % positif, 25% prob, 25% ranking
    combined = 0.50 * score_from_pct + 0.25 * score_from_prob + 0.25 * score_from_rank
    
    return round(max(1.0, min(5.0, combined)), 1)


def main():
    print("=" * 65)
    print("  GENERATE CAFE DATA DARI RANKING BAB 4")
    print("=" * 65)
    
    # ── 1. Baca ranking per aspek ──
    print("\n[1] Membaca Ranking_Kafe.xlsx...")
    
    df_suasana = pd.read_excel(FILE_RANKING, sheet_name='Ranking Suasana')
    df_harga = pd.read_excel(FILE_RANKING, sheet_name='Ranking Harga')
    df_pelayanan = pd.read_excel(FILE_RANKING, sheet_name='Ranking Pelayanan')
    df_others = pd.read_excel(FILE_RANKING, sheet_name='Ranking Others')
    
    print(f"    Suasana   : {len(df_suasana)} kafe")
    print(f"    Harga     : {len(df_harga)} kafe")
    print(f"    Pelayanan : {len(df_pelayanan)} kafe")
    print(f"    Others    : {len(df_others)} kafe")
    
    # ── 2. Baca ulasan asli dari JSON ──
    print("\n[2] Membaca database_cafe_lengkap.json...")
    
    with open(FILE_JSON, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    # Kumpulkan ulasan per kafe (dengan normalisasi nama) + label aspek
    reviews_map = {}
    for entry in raw_data:
        raw_name = entry.get("Nama Café ", "").strip()
        if not raw_name:
            continue
        name = normalize_name(raw_name)
        review = entry.get("Ulasan", "")
        if not review or review == "null" or review is None:
            continue
        review = review.strip().replace('…', '')
        
        # Ambil label aspek dari data
        try:
            aspek_suasana = int(entry.get("Suasana", 0) or 0)
        except (ValueError, TypeError):
            aspek_suasana = 0
        try:
            aspek_harga = int(entry.get("Harga", 0) or 0)
        except (ValueError, TypeError):
            aspek_harga = 0
        try:
            aspek_pelayanan = int(entry.get("Pelayanan", 0) or 0)
        except (ValueError, TypeError):
            aspek_pelayanan = 0
            
        try:
            aspek_others = int(entry.get("others", 0) or 0)
            if entry.get("others") is None and aspek_suasana == 0 and aspek_harga == 0 and aspek_pelayanan == 0:
                aspek_others = 1
        except (ValueError, TypeError):
            aspek_others = 0
        
        review_obj = {
            "text": review,
            "suasana": aspek_suasana,
            "harga": aspek_harga,
            "pelayanan": aspek_pelayanan,
            "others": aspek_others
        }
        
        if name not in reviews_map:
            reviews_map[name] = []
        # Cek duplikat berdasarkan teks
        existing_texts = [r["text"] for r in reviews_map[name]]
        if review not in existing_texts:
            reviews_map[name].append(review_obj)
    
    print(f"    {len(reviews_map)} kafe dengan ulasan asli")
    
    # ── 3. Gabungkan semua nama kafe dari ketiga ranking ──
    all_cafes = set()
    for df in [df_suasana, df_harga, df_pelayanan, df_others]:
        all_cafes.update(df['Nama Cafe'].str.strip().tolist())
    
    print(f"\n[3] Total kafe unik dari ranking: {len(all_cafes)}")
    
    # ── 4. Bangun data kafe ──
    print("\n[4] Membangun database kafe...")
    
    cafe_list = []
    
    for idx, cafe_name in enumerate(sorted(all_cafes), 1):
        cafe_name_clean = cafe_name.strip()
        
        # Ambil data ranking per aspek
        row_s = df_suasana[df_suasana['Nama Cafe'].str.strip() == cafe_name_clean]
        row_h = df_harga[df_harga['Nama Cafe'].str.strip() == cafe_name_clean]
        row_p = df_pelayanan[df_pelayanan['Nama Cafe'].str.strip() == cafe_name_clean]
        row_o = df_others[df_others['Nama Cafe'].str.strip() == cafe_name_clean]
        
        # Ranking position (lebih rendah = lebih baik)
        rank_s = int(row_s['Ranking'].values[0]) if len(row_s) > 0 else 99
        rank_h = int(row_h['Ranking'].values[0]) if len(row_h) > 0 else 99
        rank_p = int(row_p['Ranking'].values[0]) if len(row_p) > 0 else 99
        rank_o = int(row_o['Ranking'].values[0]) if len(row_o) > 0 else 99
        
        # % Ulasan Positif
        pct_s = float(row_s['% Ulasan Suasana'].values[0]) if len(row_s) > 0 else 0
        pct_h = float(row_h['% Ulasan Harga'].values[0]) if len(row_h) > 0 else 0
        pct_p = float(row_p['% Ulasan Pelayanan'].values[0]) if len(row_p) > 0 else 0
        pct_o = float(row_o['% Ulasan Others'].values[0]) if len(row_o) > 0 else 0
        
        # Prob Rata-rata (confidence)
        prob_s = float(row_s['Prob Rata-rata Suasana'].values[0]) if len(row_s) > 0 else 0.3
        prob_h = float(row_h['Prob Rata-rata Harga'].values[0]) if len(row_h) > 0 else 0.3
        prob_p = float(row_p['Prob Rata-rata Pelayanan'].values[0]) if len(row_p) > 0 else 0.3
        prob_o = float(row_o['Prob Rata-rata Others'].values[0]) if len(row_o) > 0 else 0.3
        
        # Rating Google Maps (ambil dari aspek manapun yang tersedia)
        rating_gmaps = None
        for row in [row_s, row_h, row_p, row_o]:
            if len(row) > 0:
                val = row['Rating Google Maps'].values[0]
                if pd.notna(val):
                    rating_gmaps = float(val)
                    break
        
        # Total ulasan (ambil dari aspek manapun)
        total_ulasan = 0
        for row, col in [(row_s, 'Total Ulasan'), (row_h, 'Total Ulasan'), (row_p, 'Total Ulasan'), (row_o, 'Total Ulasan')]:
            if len(row) > 0:
                total_ulasan = int(row[col].values[0])
                break
        
        # Hitung rating per aspek menggunakan data NB
        total_cafes = len(all_cafes)
        suasana_rating = compute_aspect_rating(pct_s, prob_s, rank_s, total_cafes)
        harga_rating = compute_aspect_rating(pct_h, prob_h, rank_h, total_cafes)
        pelayanan_rating = compute_aspect_rating(pct_p, prob_p, rank_p, total_cafes)
        others_rating = compute_aspect_rating(pct_o, prob_o, rank_o, total_cafes)
        
        # Overall rating = rata-rata terbobot (lebih berat ke aspek terbaik)
        overall = round((suasana_rating + harga_rating + pelayanan_rating + others_rating) / 4, 1)
        
        # Jika ada rating Google Maps, lebih berat ke sana
        if rating_gmaps is not None:
            overall = round(0.6 * overall + 0.4 * rating_gmaps, 1)
        
        # Cari alamat
        address = address_map.get(cafe_name_clean, "")
        if not address:
            # Coba normalisasi nama untuk address lookup
            norm_name = normalize_name(cafe_name_clean)
            address = address_map.get(norm_name, "")
        if not address:
            address = "Surabaya, Jawa Timur"
        
        # Cari ulasan asli
        reviews = reviews_map.get(cafe_name_clean, [])
        if not reviews:
            # Coba normalisasi nama
            norm_name = normalize_name(cafe_name_clean)
            reviews = reviews_map.get(norm_name, [])
        
        # Jika masih tidak ada ulasan, coba fuzzy match
        if not reviews:
            for key in reviews_map:
                if cafe_name_clean.lower() in key.lower() or key.lower() in cafe_name_clean.lower():
                    reviews = reviews_map[key]
                    break
        
        cafe_item = {
            "id": str(idx),
            "name": cafe_name_clean,
            "address": address,
            "imageUrl": random.choice(images),
            "overallRating": overall,
            "suasanaRating": suasana_rating,
            "hargaRating": harga_rating,
            "pelayananRating": pelayanan_rating,
            "othersRating": others_rating,
            "totalUlasan": total_ulasan,
            "rankSuasana": rank_s,
            "rankHarga": rank_h,
            "rankPelayanan": rank_p,
            "rankOthers": rank_o,
            "reviews": reviews[:10]  # Max 10 reviews per kafe
        }
        
        cafe_list.append(cafe_item)
    
    # ── 5. Simpan ke JSON ──
    print(f"\n[5] Menyimpan ke {FILE_OUTPUT}...")
    
    with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(cafe_list, f, indent=4, ensure_ascii=False)
    
    # ── 6. Ringkasan ──
    print(f"\n{'=' * 65}")
    print(f"  DATABASE BERHASIL DI-GENERATE!")
    print(f"{'=' * 65}")
    print(f"  Total kafe         : {len(cafe_list)}")
    print(f"  File output        : {FILE_OUTPUT}")
    
    # Kafe dengan review
    with_reviews = sum(1 for c in cafe_list if len(c['reviews']) > 0)
    without_reviews = sum(1 for c in cafe_list if len(c['reviews']) == 0)
    print(f"  Dengan ulasan      : {with_reviews} kafe")
    print(f"  Tanpa ulasan       : {without_reviews} kafe")
    
    # Top 5 per aspek
    for aspek, key in [("Suasana", "suasanaRating"), ("Harga", "hargaRating"), ("Pelayanan", "pelayananRating"), ("Others", "othersRating")]:
        sorted_cafes = sorted(cafe_list, key=lambda x: x[key], reverse=True)
        print(f"\n  TOP 5 {aspek.upper()}:")
        for i, c in enumerate(sorted_cafes[:5], 1):
            print(f"    {i}. {c['name']:<35} {c[key]}/5.0  (rank #{c[f'rank{aspek}']})")
    
    print(f"\n{'=' * 65}")
    
    if without_reviews > 0:
        print(f"\n  [!] {without_reviews} kafe tanpa ulasan asli (dari ranking test data, tidak ada di database_cafe_lengkap.json):")
        for c in cafe_list:
            if len(c['reviews']) == 0:
                print(f"    - {c['name']}")


if __name__ == '__main__':
    random.seed(42)  # Reproducible random images
    main()
