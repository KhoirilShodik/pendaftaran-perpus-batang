import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
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

  // --- Badge Jenis Anggota (kotak hitam, pojok kanan atas) ---
  badgeJenisWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1e293b',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  badgeJenisText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },

  // --- Nomor Anggota (kanan, di bawah badge) ---
  nomorAnggotaText: {
    position: 'absolute',
    top: 26,
    right: 8,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  // --- Berlaku Hingga (kanan, di bawah nomor) ---
  berlakuHinggaWrap: {
    position: 'absolute',
    top: 42,
    right: 8,
    alignItems: 'center',
    width: 50,
  },
  berlakuHinggaLabel: {
    fontSize: 5,
    color: '#334155',
    textAlign: 'center',
  },
  berlakuHinggaDate: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'center',
  },

  // --- Nama Besar Pemilik Kartu ---
  namaBesarText: {
    position: 'absolute',
    top: 82,
    left: 8,
    width: 155,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
  },

  // --- Barcode Linear (Code128) ---
  barcodeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  barcodeImg: {
    width: 140,
    height: 22,
  },
  barcodeSubText: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginTop: 1,
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  // --- Foto Anggota ---
  photoFrame: {
    position: 'absolute',
    top: 55,
    right: 8,
    width: 44,
    height: 58,
    borderRadius: 1,
    overflow: 'hidden',
    borderWidth: 0.5,
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
    marginTop: 22,
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
  const backgroundCardPath = `${baseUrl}/bg-kartu-v3.png`;

  return (
    <Document title={`KARTU ANGGOTA - ${member.memberNo}`}>
      <Page size={[242.6, 153.0]} style={styles.page}>
        <View style={styles.cardContainer}>

          {/* Background — sudah mengandung logo, header, label kartu, footer sosmed */}
          <Image src={backgroundCardPath} style={styles.backgroundImage} />

          {/* Badge Jenis Anggota */}
          <View style={styles.badgeJenisWrap}>
            <Text style={styles.badgeJenisText}>{member.jenisAnggota}</Text>
          </View>

          {/* Nomor Anggota */}
          <Text style={styles.nomorAnggotaText}>{member.memberNo}</Text>

          {/* Berlaku Hingga */}
          <View style={styles.berlakuHinggaWrap}>
            <Text style={styles.berlakuHinggaLabel}>Berlaku Hingga</Text>
            <Text style={styles.berlakuHinggaDate}>{member.endDate}</Text>
          </View>

          {/* Nama Anggota */}
          <Text style={styles.namaBesarText}>
            {member.fullname.length > 45
              ? `${member.fullname.substring(0, 42).toUpperCase()}...`
              : member.fullname.toUpperCase()}
          </Text>

          {/* Barcode Linear Code128 */}
          <View style={styles.barcodeContainer}>
            {barcodeUrl ? (
              <Image src={barcodeUrl} style={styles.barcodeImg} />
            ) : null}
            <Text style={styles.barcodeSubText}>{member.memberNo}</Text>
          </View>

          {/* Foto Anggota */}
          <View style={styles.photoFrame}>
            {pasFotoUrl ? (
              <Image src={pasFotoUrl} style={styles.photoReal} />
            ) : (
              <Text style={styles.noPhotoText}>PAS FOTO</Text>
            )}
          </View>

        </View>
      </Page>
    </Document>
  );
}