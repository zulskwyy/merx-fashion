MERX COMMERCE / FULFILLMENT UPGRADE

Perubahan utama:
1. Halaman Pesanan & Penerimaan hanya berfokus pada status apakah paket sudah sampai ke customer atau belum.
   Admin tidak lagi diminta memasukkan kurir, resi, atau ongkir pada tahap fulfillment.
2. Ongkir dicatat sejak checkout berdasarkan pengaturan toko dan disimpan bersama order.
3. Pajak default produk adalah mode Otomatis. Tarif mengikuti pengaturan pajak toko.
   Setiap produk tetap bisa diubah ke Manual untuk memakai tarif khusus.
4. Ringkasan harga produk menampilkan pajak dan laba setelah pajak.
5. Tombol Duplikat ditambahkan pada daftar produk.
6. Gambar utama dipisahkan dari gallery tambahan. Upload/ganti gambar utama tidak lagi memasukkan file ke gallery.
7. Analytics membedakan omzet penjualan, pajak tercatat, modal, dan laba setelah pajak.
8. UI admin dibuat lebih kotak, lebih tenang, dan tetap memakai animasi transisi yang ringan.

MIGRASI DATABASE:
Jalankan sekali di Supabase SQL Editor:
supabase/commerce-ops-upgrade.sql

CATATAN PAJAK:
Kalkulasi pajak di aplikasi adalah kalkulasi internal untuk pricing/order. Tarif dan perlakuan pajak harus disesuaikan dengan status/kewajiban pajak usaha.

CATATAN GIT:
Folder ZIP ini tidak membawa .git. Untuk meneruskan repository yang sama, salin .git dari project MERX lama yang ingin dipertahankan setelah memastikan folder ini lengkap.
