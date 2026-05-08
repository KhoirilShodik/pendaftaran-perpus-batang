'use client'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#ffffff',
  },
  card: {
    width: 320,
    height: 200,
    position: 'relative',
    backgroundColor: '#1e3a5f', 
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(30, 58, 95, 0.4)', 
  },
  content: {
    padding: 15,
    zIndex: 10,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottom: '1px solid #c8a84b',
    paddingBottom: 5,
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 6,
    color: '#c8a84b',
    textTransform: 'uppercase',
  },
  mainArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoContainer: {
    width: 70,
    height: 90,
    border: '2px solid #c8a84b',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginRight: 15,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  details: {
    flex: 1,
  },
  label: {
    fontSize: 6,
    color: '#c8a84b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  ticketNo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#c8a84b',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrCode: {
    width: 45,
    height: 45,
    backgroundColor: '#ffffff',
    padding: 2,
    borderRadius: 2,
  },
  scanText: {
    fontSize: 5,
    color: '#ffffff',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  footerText: {
    fontSize: 7,
    fontStyle: 'italic',
    color: '#ffffff',
  }
});

interface LibraryCardPDFProps {
  registration: {
    fullname: string;
    ticketNo: string;
  };
  qrCodeUrl: string;
  pasFotoPublicUrl: string;
}

export const LibraryCardPDF = ({ registration, qrCodeUrl, pasFotoPublicUrl }: LibraryCardPDFProps) => {
  return (
    <Document>
      <Page size={[320, 200]} style={styles.page}>
        <View style={styles.card}>
          <View style={styles.overlay} />

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>KARTU ANGGOTA PERPUSTAKAAN</Text>
                <Text style={styles.subtitle}>Dispuspa Kabupaten Batang</Text>
              </View>
            </View>

            {/* Main Area */}
            <View style={styles.mainArea}>
              <View style={styles.photoContainer}>
                {pasFotoPublicUrl ? (
                  <Image src={pasFotoPublicUrl} style={styles.photo} />
                ) : (
                  <View style={styles.photo} />
                )}
              </View>

              <View style={styles.details}>
                <View>
                  <Text style={styles.label}>Nama Lengkap</Text>
                  <Text style={styles.value}>{registration.fullname}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Nomor Anggota / Tiket</Text>
                  <Text style={styles.ticketNo}>{registration.ticketNo}</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View>
                <Text style={styles.footerText}>Berlaku selama menjadi anggota</Text>
                <Text style={styles.footerText}>https://dispuspa.batangkab.go.id</Text>
              </View>
              
              <View style={styles.qrContainer}>
                {qrCodeUrl && (
                  <Image src={qrCodeUrl} style={styles.qrCode} />
                )}
                <Text style={styles.scanText}>Scan untuk Verifikasi</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};