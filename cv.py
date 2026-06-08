import pandas as pd
import json

# 1. Tentukan nama file input (pilih salah satu file Anda)
# Jika file Anda masih .csv, gunakan pd.read_csv
# Jika file Anda .xlsx, gunakan pd.read_excel
file_input = 'AaGabungan.xlsx' 
file_output = 'database_cafe_lengkap.json'

try:
    # 2. Membaca file
    # Jika menggunakan CSV dari WhatsApp/Excel Indonesia, terkadang delimiter-nya ';'
    # Jika error, ganti sep=',' menjadi sep=';'
    df = pd.read_excel(file_input)

    # 3. Konversi ke JSON
    # 'records' memastikan formatnya menjadi [{kolom1: nilai, kolom2: nilai}, ...]
    # indent=4 agar file JSON rapi dan mudah dibaca manusia
    json_data = df.to_json(orient='records', indent=4)

    # 4. Simpan ke file
    with open(file_output, 'w', encoding='utf-8') as f:
        f.write(json_data)

    print(f"✅ Berhasil! File '{file_output}' telah dibuat dengan {len(df)} baris data.")

except Exception as e:
    print(f"❌ Terjadi kesalahan: {e}")