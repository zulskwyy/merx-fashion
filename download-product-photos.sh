#!/bin/bash
# Jalankan sekali dari root folder project (merx-ecommerce):
#   chmod +x download-product-photos.sh
#   ./download-product-photos.sh
# Semua foto akan otomatis masuk ke public/images/ dengan nama yang sudah
# cocok dengan data produk di src/app/page.tsx — tidak perlu rename manual.

set -e
OUT="public/images"
mkdir -p "$OUT"

declare -a URLS=(
  "https://images.pexels.com/photos/12039633/pexels-photo-12039633.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/6046231/pexels-photo-6046231.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/6046205/pexels-photo-6046205.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/12025472/pexels-photo-12025472.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/8532611/pexels-photo-8532611.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/8148577/pexels-photo-8148577.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/11671964/pexels-photo-11671964.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/20669538/pexels-photo-20669538.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/18256097/pexels-photo-18256097.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/18257675/pexels-photo-18257675.jpeg?auto=compress&cs=tinysrgb&w=1600"
  "https://images.pexels.com/photos/22441292/pexels-photo-22441292.jpeg?auto=compress&cs=tinysrgb&w=1600"
)

i=1
for url in "${URLS[@]}"; do
  filename=$(printf "product-%02d.jpg" "$i")
  echo "[$i/12] Downloading $filename ..."
  curl -L --fail --retry 3 --silent --show-error "$url" -o "$OUT/$filename" || echo "GAGAL: $filename"
  i=$((i+1))
done

echo ""
echo "Selesai. Cek folder: $OUT"
