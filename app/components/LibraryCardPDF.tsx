import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica', // Set font utama tingkat halaman
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  cardContainer: {
    width: 242.6,
    height: 153.0,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  // --- Header Lapisan Atas ---
  headerWrap: {
    flexDirection: 'row',
    position: 'absolute',
    top: 6,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  logoKabupaten: {
    width: 14,
    height: 18,
    marginRight: 5,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  titleUtama: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold', // Pengganti fontWeight: 'bold' bawaan PDF
    color: '#0f172a',
    letterSpacing: 0.1,
  },
  titleAlamat: {
    fontSize: 4.2,
    color: '#334155',
    marginTop: 1,
  },
  // --- Label "KARTU ANGGOTA PERPUSTAKAAN GRHA PUSTALOKA" di Tengah Bodi ---
  judulKartuTengah: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    fontSize: 6.2,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  // --- Kotak Hitam Kanan Atas (Jenis Anggota) ---
  badgeJenisWrap: {
    position: 'absolute',
    top: 33,
    right: 8,
    backgroundColor: '#1e293b',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 2,
  },
  badgeJenisText: {
    fontSize: 5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  // --- Tata Letak Meta Nomor Anggota & Masa Berlaku ---
  metaTopWrap: {
    position: 'absolute',
    top: 44,
    right: 8,
    alignItems: 'flex-end',
  },
  metaValueNo: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  berlakuHinggaLabel: {
    fontSize: 4.2,
    color: '#475569',
    marginTop: 18, // Menggeser label ke bawah agar duduk manis terpusat di atas foto
    textAlign: 'center',
    width: 36.8,
  },
  berlakuHinggaDate: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'center',
    width: 36.8,
  },
  // --- Nama Besar Pemilik Kartu (Kiri Tengah) ---
  namaBesarText: {
    position: 'absolute',
    top: 74,
    left: 8,
    width: 145,
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
  },
  // --- Barcode Terproteksi Kotak Kontras Putih ---
  barcodeContainer: {
    position: 'absolute',
    bottom: 13,
    left: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  barcodeImg: {
    width: 82,
    height: 16,
  },
  barcodeSubText: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  // --- Pas Foto Anggota ---
  photoFrame: {
    position: 'absolute',
    bottom: 13,
    right: 8,
    width: 36.8,
    height: 48.2,
    borderRadius: 1,
    overflow: 'hidden',
    borderWidth: 0.4,
    borderColor: '#94a3b8',
    backgroundColor: '#f1f5f9',
  },
  photoReal: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noPhotoText: {
    fontSize: 4.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
  },
  // --- Media Sosial Resmi ---
  footerSosmedWrap: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.3,
    borderTopColor: '#94a3b8',
    paddingTop: 1.5,
  },
  footerText: {
    fontSize: 3.5,
    color: '#475569',
  },
});

interface LibraryCardPDFProps {
  member: {
    fullname: string;
    memberNo: string;
    jenisAnggota: string;
    endDate: string;
  };
  barcodeUrl: string;
  pasFotoUrl: string;
  baseUrl: string;
}

export function LibraryCardPDF({ member, barcodeUrl, pasFotoUrl, baseUrl }: LibraryCardPDFProps) {
  const logoPath = `${baseUrl}/logo-batang.png`;
  const backgroundCardPath = `${baseUrl}/bg-kartu-v2.png`;

  return (
    <Document title={`KARTU ANGGOTA - ${member.memberNo}`}>
      <Page size={[242.6, 153.0]} style={styles.page}>
        <View style={styles.cardContainer}>

          <Image src={backgroundCardPath} style={styles.backgroundImage} />

          {/* Header Instansi Dua Baris */}
          <View style={styles.headerWrap}>
            <Image src={logoPath} style={styles.logoKabupaten} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.titleUtama}>DINAS PERPUSTAKAAN DAN KEARSIPAN</Text>
              <Text style={styles.titleUtama}>KABUPATEN BATANG</Text>
              <Text style={styles.titleAlamat}>Jl. Dr. Wahidin No. 54 Kauman, Batang, Jawa Tengah 51215</Text>
            </View>
          </View>

          {/* Judul Utama Kartu Mandiri Di Tengah sesuai Gambar Desain */}
          <Text style={styles.judulKartuTengah}>
            KARTU ANGGOTA PERPUSTAKAAN GRHA PUSTALOKA
          </Text>

          <View style={styles.badgeJenisWrap}>
            <Text style={styles.badgeJenisText}>{member.jenisAnggota}</Text>
          </View>

          <View style={styles.metaTopWrap}>
            <Text style={styles.metaValueNo}>{member.memberNo}</Text>
            <Text style={styles.berlakuHinggaLabel}>Berlaku Hingga</Text>
            <Text style={styles.berlakuHinggaDate}>{member.endDate}</Text>
          </View>

          <Text style={styles.namaBesarText}>
            {member.fullname.length > 45
              ? `${member.fullname.substring(0, 42).toUpperCase()}...`
              : member.fullname.toUpperCase()}
          </Text>

          <View style={styles.barcodeContainer}>
            {barcodeUrl ? (
              <Image src={barcodeUrl} style={styles.barcodeImg} />
            ) : null}
            <Text style={styles.barcodeSubText}>{member.memberNo}</Text>
          </View>

          <View style={styles.photoFrame}>
            {pasFotoUrl ? (
              <Image src={pasFotoUrl} style={styles.photoReal} />
            ) : (
              <Text style={styles.noPhotoText}>PAS FOTO</Text>
            )}
          </View>

          <View style={styles.footerSosmedWrap}>
            <Text style={styles.footerText}>IG: @disperpuska_kab.batang</Text>
            <Text style={styles.footerText}>FB: Dinas Perpustakaan dan Kearsipan Kab. Batang</Text>
            <Text style={styles.footerText}>YT: Disperpuska Chanel</Text>
            <Text style={styles.footerText}>Web: disperpuska.batangkab.go.id</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
}