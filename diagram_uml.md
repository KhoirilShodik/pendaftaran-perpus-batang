# 📊 Diagram UML — Sistem Pendaftaran Anggota Perpustakaan Online Kabupaten Batang

> **Sistem**: Portal Pendaftaran Anggota Perpustakaan Online  
> **Instansi**: Dinas Perpustakaan dan Kearsipan (Dispuspa) Kabupaten Batang  
> **Dibuat**: 12 Juni 2026  
> **Format**: Mermaid Diagram

---

## Daftar Diagram

| No | Diagram | Tujuan |
|----|---------|--------|
| 1 | [Use Case Diagram](#1-use-case-diagram) | Menggambarkan interaksi aktor dengan sistem |
| 2 | [Activity Diagram — Pendaftaran](#2-activity-diagram--pendaftaran-anggota) | Alur proses pendaftaran anggota baru |
| 3 | [Activity Diagram — Verifikasi Admin](#3-activity-diagram--verifikasi-pendaftaran-oleh-admin) | Alur approve/reject pendaftaran |
| 4 | [Activity Diagram — Cek Status](#4-activity-diagram--cek-status-pendaftaran) | Alur pengecekan status oleh pendaftar |
| 5 | [Activity Diagram — Login Admin](#5-activity-diagram--login-admin) | Alur autentikasi admin |
| 6 | [Class Diagram](#6-class-diagram) | Struktur kelas dan relasi antar entitas |
| 7 | [Sequence Diagram — Pendaftaran](#7-sequence-diagram--pendaftaran-anggota) | Interaksi antar komponen saat pendaftaran |
| 8 | [Sequence Diagram — Approval](#8-sequence-diagram--approval-pendaftaran) | Interaksi saat admin menyetujui pendaftaran |
| 9 | [ERD (Entity Relationship Diagram)](#9-erd-entity-relationship-diagram) | Struktur database dan relasi antar tabel |
| 10 | [Component Diagram](#10-component-diagram) | Arsitektur komponen sistem |
| 11 | [Deployment Diagram](#11-deployment-diagram) | Infrastruktur dan distribusi deployment |
| 12 | [State Machine Diagram](#12-state-machine-diagram--status-pendaftaran) | Transisi status pendaftaran |

---

## 1. Use Case Diagram

> Menggambarkan semua aktor dan fungsionalitas yang tersedia dalam sistem.

```mermaid
flowchart TB
    subgraph System["🏛️ Sistem Pendaftaran Anggota Perpustakaan Online"]
        direction TB

        subgraph PublikUC["Use Case Publik"]
            UC1(("📝 Mengisi Formulir\nPendaftaran"))
            UC2(("📤 Mengunggah Dokumen\n(Pas Foto & KTP)"))
            UC3(("🔍 Cek Status\nPendaftaran"))
            UC4(("📥 Mengunduh Kartu\nAnggota Digital (PDF)"))
            UC5(("📧 Menerima\nNotifikasi Email"))
        end

        subgraph AuthUC["Use Case Autentikasi"]
            UC6(("🔐 Login Admin"))
            UC7(("🚪 Logout"))
            UC8(("🔑 Ganti Password"))
        end

        subgraph AdminUC["Use Case Admin"]
            UC9(("📊 Melihat Dashboard\n& Statistik"))
            UC10(("✅ Menyetujui\nPendaftaran"))
            UC11(("❌ Menolak\nPendaftaran"))
            UC12(("👁️ Melihat Detail\nPendaftaran"))
            UC13(("📥 Download Kartu\nAnggota PDF"))
            UC14(("👤 Edit Profil\nAdmin"))
        end

        subgraph SuperAdminUC["Use Case Superadmin"]
            UC15(("👥 Kelola Pengguna\nAdmin"))
            UC16(("➕ Tambah Akun\nAdmin/Petugas"))
            UC17(("✏️ Edit Akun\nPengguna"))
            UC18(("🗑️ Hapus Akun\nPengguna"))
            UC19(("🔄 Aktifkan/Non-\naktifkan Akun"))
        end
    end

    Pendaftar["👤 Pendaftar\n(Masyarakat)"]
    Petugas["👨‍💼 Petugas"]
    SuperAdmin["👨‍💻 Superadmin"]
    EmailService["📮 Resend API\n(Email Service)"]
    INLISLite["📚 INLIS Lite\n(PHP Bridge)"]

    %% Pendaftar connections
    Pendaftar --> UC1
    Pendaftar --> UC2
    Pendaftar --> UC3
    Pendaftar --> UC4
    Pendaftar --> UC5

    %% Petugas connections
    Petugas --> UC6
    Petugas --> UC7
    Petugas --> UC8
    Petugas --> UC9
    Petugas --> UC10
    Petugas --> UC11
    Petugas --> UC12
    Petugas --> UC13
    Petugas --> UC14

    %% Superadmin connections (inherits Petugas + extras)
    SuperAdmin --> UC6
    SuperAdmin --> UC7
    SuperAdmin --> UC8
    SuperAdmin --> UC9
    SuperAdmin --> UC10
    SuperAdmin --> UC11
    SuperAdmin --> UC12
    SuperAdmin --> UC13
    SuperAdmin --> UC14
    SuperAdmin --> UC15
    SuperAdmin --> UC16
    SuperAdmin --> UC17
    SuperAdmin --> UC18
    SuperAdmin --> UC19

    %% External system connections
    UC1 -.->|"<<include>>"| UC2
    UC10 -.->|"<<include>>"| UC5
    UC11 -.->|"<<include>>"| UC5
    UC1 -.->|"<<include>>"| UC5

    UC5 -.-> EmailService
    UC10 -.-> INLISLite
```

### Penjelasan Aktor

| Aktor | Deskripsi | Jumlah Use Case |
|-------|-----------|-----------------|
| **Pendaftar (Masyarakat)** | Warga Kabupaten Batang yang ingin mendaftar sebagai anggota perpustakaan | 5 |
| **Petugas** | Staff perpustakaan yang bertugas memverifikasi pendaftaran | 10 (termasuk autentikasi) |
| **Superadmin** | Admin tertinggi yang bisa mengelola seluruh sistem termasuk manajemen pengguna | 15 (semua use case Petugas + 5 manajemen) |
| **Resend API** | Sistem eksternal untuk pengiriman email notifikasi | Aktor sekunder |
| **INLIS Lite** | Sistem perpustakaan nasional untuk sinkronisasi data anggota | Aktor sekunder |

---

## 2. Activity Diagram — Pendaftaran Anggota

> Alur lengkap proses pendaftaran anggota baru dari sisi pendaftar dan sistem.

```mermaid
flowchart TD
    Start([🟢 Mulai]) --> A["Pendaftar mengakses\nhalaman utama (/)"]
    A --> B["Sistem menampilkan\nformulir pendaftaran\n(3 langkah)"]
    B --> C["Pendaftar mengisi\ndata pribadi\n(Step 1: Personal Info)"]
    C --> D["Pendaftar mengisi\ndata identitas & alamat\n(Step 2: Identity & Address)"]
    D --> E["Pendaftar mengisi\ndata kontak & darurat\n(Step 3: Contact & Emergency)"]
    E --> F["Pendaftar mengunggah\npas foto & foto KTP"]
    F --> G{"Validasi\nclient-side\n(22+ field)"}
    
    G -->|"❌ Gagal"| H["Tampilkan pesan error\npada field bermasalah"]
    H --> I["Scroll otomatis ke\nfield pertama yang error"]
    I --> C

    G -->|"✅ Berhasil"| J["Sistem generate\nnomor tiket\n(REG-2026-XXXXX)"]
    J --> K["POST /api/upload\nUpload pas foto\nke Hostinger"]
    K --> L{"Upload pas foto\nberhasil?"}
    
    L -->|"❌ Gagal"| M["Tampilkan error\nupload gagal"]
    M --> F
    
    L -->|"✅ Berhasil"| N["POST /api/upload\nUpload foto KTP\nke Hostinger"]
    N --> O{"Upload foto KTP\nberhasil?"}
    
    O -->|"❌ Gagal"| M
    O -->|"✅ Berhasil"| P["POST /api/registrations\nSimpan data ke MySQL\n(status = Menunggu)"]
    
    P --> Q{"Data berhasil\ntersimpan?"}
    Q -->|"❌ Gagal"| R["Tampilkan error\nserver"]
    R --> F
    
    Q -->|"✅ Berhasil"| S["POST /api/notify\nKirim email konfirmasi\n(WELCOME_CONFIRMATION)"]
    S --> T["Tampilkan halaman sukses\ndengan nomor tiket"]
    T --> End([🔴 Selesai])
```

---

## 3. Activity Diagram — Verifikasi Pendaftaran oleh Admin

> Alur proses admin memverifikasi (approve/reject) pendaftaran anggota.

```mermaid
flowchart TD
    Start([🟢 Mulai]) --> A["Admin membuka\nDashboard Admin"]
    A --> B["Sistem menampilkan\nstatistik & daftar\npendaftaran"]
    B --> C["Admin memilih\npendaftaran\ndengan status 'Menunggu'"]
    C --> D["Sistem menampilkan\nmodal detail pendaftaran\n(data + foto)"]
    D --> E{"Admin memutuskan\nverifikasi"}
    
    E -->|"✅ Setujui"| F["Admin klik\ntombol 'Setujui'"]
    E -->|"❌ Tolak"| G["Admin klik\ntombol 'Tolak'"]
    
    F --> H["PATCH /api/registrations\nstatus = 'Disetujui'"]
    H --> I["Sistem sinkron\nke PHP Bridge\n(INLIS Lite)"]
    I --> J{"Sinkronisasi\nberhasil?"}
    
    J -->|"✅ Berhasil"| K["Terima member_no\n& end_date\ndari INLIS Lite"]
    K --> L["UPDATE registrations\nSET status='Disetujui',\nmember_no, end_date,\napproved_at, approved_by"]
    L --> M["POST /api/notify\nKirim email\nSTATUS_APPROVED"]
    M --> N["Tampilkan notifikasi\nsukses di dashboard"]
    N --> O["Refresh daftar\npendaftaran"]
    O --> End([🔴 Selesai])
    
    J -->|"❌ Gagal"| P["Tampilkan error\nGagal sinkronisasi\nke INLIS Lite"]
    P --> End
    
    G --> Q["Sistem menampilkan\nform alasan penolakan"]
    Q --> R["Admin mengisi\nalasan penolakan"]
    R --> S["PATCH /api/registrations\nstatus = 'Ditolak'\n+ reject_reason"]
    S --> T["UPDATE registrations\nSET status='Ditolak',\nreject_reason,\napproved_at, approved_by"]
    T --> U["POST /api/notify\nKirim email\nSTATUS_REJECTED"]
    U --> N
```

---

## 4. Activity Diagram — Cek Status Pendaftaran

> Alur proses pengecekan status pendaftaran oleh pendaftar.

```mermaid
flowchart TD
    Start([🟢 Mulai]) --> A["Pendaftar mengakses\nhalaman /cek-status"]
    A --> B["Sistem menampilkan\nform input nomor tiket"]
    B --> C["Pendaftar memasukkan\nnomor tiket\n(REG-2026-XXXXX)"]
    C --> D["GET /api/registrations\n?ticket_no=REG-2026-XXXXX"]
    D --> E{"Data\nditemukan?"}
    
    E -->|"❌ Tidak"| F["Tampilkan pesan\n'Data tidak ditemukan'"]
    F --> C
    
    E -->|"✅ Ditemukan"| G{"Cek status\npendaftaran"}
    
    G -->|"⏳ Menunggu"| H["Tampilkan StatusCard\n• Status: Menunggu\n• Info: Pendaftaran\n  sedang diproses"]
    
    G -->|"✅ Disetujui"| I["Tampilkan StatusCard\n• Status: Disetujui\n• Nomor Anggota\n• Masa Berlaku"]
    I --> J["Generate barcode\n(bwip-js toCanvas)"]
    J --> K["Tampilkan tombol\n'Download Kartu Anggota'"]
    K --> L{"Pendaftar klik\ndownload?"}
    L -->|"Ya"| M["GET /api/download-card\n?tiket=REG-2026-XXXXX\nGenerate PDF kartu anggota"]
    M --> N["Download file PDF\nkartu anggota"]
    L -->|"Tidak"| End
    
    G -->|"❌ Ditolak"| O["Tampilkan StatusCard\n• Status: Ditolak\n• Alasan Penolakan\n• Saran perbaikan"]
    
    H --> End([🔴 Selesai])
    N --> End
    O --> End
```

---

## 5. Activity Diagram — Login Admin

> Alur autentikasi admin/petugas ke dashboard.

```mermaid
flowchart TD
    Start([🟢 Mulai]) --> A["Admin mengakses\nhalaman /admin"]
    A --> B["Sistem cek\ncookie admin_token\n(GET /api/auth/me)"]
    B --> C{"Token JWT\nvalid?"}
    
    C -->|"✅ Valid"| D["Redirect ke\nDashboard Admin"]
    D --> End([🔴 Selesai])
    
    C -->|"❌ Invalid / Kosong"| E["Tampilkan form\nlogin admin"]
    E --> F["Admin memasukkan\nemail & password"]
    F --> G["POST /api/auth/login"]
    G --> H["Sistem query\nadmin_users\nWHERE email = ?"]
    H --> I{"Akun\nditemukan?"}
    
    I -->|"❌ Tidak"| J["Tampilkan error\n'Email atau Password salah'"]
    J --> F
    
    I -->|"✅ Ditemukan"| K{"Akun\naktif?"}
    K -->|"❌ Non-aktif"| L["Tampilkan error\n'Akun Anda dinonaktifkan'"]
    L --> F
    
    K -->|"✅ Aktif"| M["bcrypt.compare\n(password, hash)"]
    M --> N{"Password\ncocok?"}
    
    N -->|"❌ Tidak cocok"| J
    N -->|"✅ Cocok"| O["Generate JWT token\n(payload: id, email, role)\nexpiry: 1 hari"]
    O --> P["Set HttpOnly Cookie\n'admin_token'\n(secure, sameSite=strict)"]
    P --> Q["Update last_login\ndi admin_users"]
    Q --> D
```

---

## 6. Class Diagram

> Struktur kelas/entitas utama dalam sistem beserta atribut, method, dan relasi.

```mermaid
classDiagram
    direction TB

    class Registration {
        +int id
        +String ticketNumber
        +String fullname
        +String identityNo
        +int identityTypeId
        +String placeOfBirth
        +String dateOfBirth
        +int sexId
        +int agamaId
        +String maritalStatusId
        +String motherMaidenName
        +String address
        +String kecamatan
        +String kelurahan
        +String rt
        +String rw
        +String city
        +String province
        +String email
        +String noHp
        +String phone
        +int educationLevelId
        +int jobId
        +String institutionName
        +String namaDarurat
        +String telpDarurat
        +String statusHubunganDarurat
        +String pasFotoUrl
        +String fotoKtpUrl
        +RegistrationStatus status
        +String rejectReason
        +String memberNo
        +String endDate
        +String approvedBy
        +DateTime approvedAt
        +DateTime createdAt
        +DateTime updatedAt
        +create() Registration
        +findByTicket(ticketNo) Registration
        +findAll() Registration[]
        +updateStatus(id, status) void
        +updateApproval(id, memberNo, endDate) void
    }

    class AdminUser {
        +int id
        +String name
        +String email
        +String password
        +String role
        +boolean isActive
        +DateTime lastLogin
        +DateTime createdAt
        +login(email, password) JWT
        +verifyToken(token) Payload
        +changePassword(newPassword) void
        +updateProfile(name, email) void
        +updateLastLogin() void
    }

    class FormData {
        +String fullname
        +String placeOfBirth
        +String dateOfBirth
        +String sexId
        +String agamaId
        +String maritalStatusId
        +String motherMaidenName
        +String identityTypeId
        +String identityNo
        +String address
        +String kecamatan
        +String kelurahan
        +String rt
        +String rw
        +String city
        +String province
        +String noHp
        +String phone
        +String email
        +String educationLevelId
        +String jobId
        +String institutionName
        +String namaDarurat
        +String telpDarurat
        +String statusHubunganDarurat
        +validate() FormErrors
    }

    class FormErrors {
        +Map~String, String~ errors
        +hasErrors() boolean
        +getError(field) String
    }

    class RegistrationStatus {
        <<enumeration>>
        Menunggu
        Disetujui
        Ditolak
    }

    class FileUploadService {
        +File pasFoto
        +File fotoKtp
        +uploadFile(file, type, ticketNo) String
        +validateFileSize(file) boolean
        +validateFileType(file) boolean
    }

    class EmailService {
        +sendWelcomeConfirmation(email, fullname, ticketNo) void
        +sendStatusApproved(email, fullname, ticketNo) void
        +sendStatusRejected(email, fullname, ticketNo, reason) void
        +getEmailTemplate(type) EmailTemplate
    }

    class EmailTemplate {
        +String subject
        +String html
    }

    class AuthService {
        +login(email, password) JWTPayload
        +logout() void
        +verifySession() JWTPayload
        +changePassword(userId, newPassword) void
        +hashPassword(password) String
        +comparePassword(plain, hash) boolean
    }

    class JWTPayload {
        +int id
        +String email
        +String role
        +int iat
        +int exp
    }

    class PHPBridgeService {
        +syncToINLIS(registrationData) BridgeResponse
    }

    class BridgeResponse {
        +boolean success
        +String memberNo
        +String endDate
    }

    class LibraryCardPDF {
        +Registration registration
        +String barcodeData
        +generatePDF() Buffer
        +renderCard() ReactElement
    }

    class DatabasePool {
        +String host
        +int port
        +String database
        +String user
        +String password
        +execute(sql, params) ResultSet
        +getConnection() Connection
    }

    %% Relationships
    Registration --> RegistrationStatus : memiliki
    Registration "0..*" -- "0..1" AdminUser : "diverifikasi oleh\n(approved_by = email)"
    FormData --> FormErrors : "menghasilkan\nvalidasi"
    FormData ..> Registration : "<<creates>>"
    FileUploadService ..> Registration : "menyediakan URL foto"
    EmailService --> EmailTemplate : "menggunakan"
    EmailService ..> Registration : "mengirim notifikasi"
    AuthService --> JWTPayload : "menghasilkan"
    AuthService --> AdminUser : "mengautentikasi"
    PHPBridgeService ..> Registration : "sinkronisasi data"
    PHPBridgeService --> BridgeResponse : "mengembalikan"
    LibraryCardPDF --> Registration : "menggunakan data"
    Registration --> DatabasePool : "akses via"
    AdminUser --> DatabasePool : "akses via"
```

---

## 7. Sequence Diagram — Pendaftaran Anggota

> Menggambarkan interaksi detail antar komponen saat proses pendaftaran.

```mermaid
sequenceDiagram
    autonumber
    actor P as 👤 Pendaftar
    participant RF as RegistrationForm
    participant Hook as useRegistrationForm
    participant UpAPI as /api/upload
    participant Host as Hostinger PHP
    participant RegAPI as /api/registrations
    participant DB as MySQL Database
    participant NotAPI as /api/notify
    participant Resend as Resend API

    P->>RF: Mengakses halaman utama (/)
    RF->>P: Menampilkan formulir 3 langkah

    P->>RF: Mengisi data personal (Step 1)
    P->>RF: Mengisi data identitas (Step 2)
    P->>RF: Mengisi kontak & darurat (Step 3)
    P->>RF: Mengunggah pas foto & foto KTP
    P->>RF: Klik tombol "Daftar Sekarang"

    RF->>Hook: handleSubmit()
    Hook->>Hook: validate() - 22+ field
    
    alt Validasi Gagal
        Hook-->>RF: FormErrors (field-specific)
        RF-->>P: Scroll ke field error pertama
    end

    Hook->>Hook: generateTicketNumber()
    Note over Hook: REG-2026-XXXXXX

    Hook->>UpAPI: POST /api/upload (pas_foto)
    UpAPI->>Host: POST upload.php (FormData)
    Host-->>UpAPI: { success, url, fileName }
    UpAPI-->>Hook: pasFotoUrl

    Hook->>UpAPI: POST /api/upload (foto_ktp)
    UpAPI->>Host: POST upload.php (FormData)
    Host-->>UpAPI: { success, url, fileName }
    UpAPI-->>Hook: fotoKtpUrl

    Hook->>RegAPI: POST /api/registrations (JSON)
    RegAPI->>DB: INSERT INTO registrations (28 fields)
    DB-->>RegAPI: { insertId }
    RegAPI-->>Hook: { success, ticket_no }

    Hook->>NotAPI: POST /api/notify (fire-and-forget)
    Note over Hook,NotAPI: Tidak menunggu response
    NotAPI->>Resend: resend.emails.send()
    Resend-->>NotAPI: { success }

    Hook-->>RF: isSuccess = true, ticketNumber
    RF-->>P: Tampilkan SuccessState + Nomor Tiket
```

---

## 8. Sequence Diagram — Approval Pendaftaran

> Menggambarkan interaksi saat admin menyetujui pendaftaran dan sinkronisasi ke INLIS Lite.

```mermaid
sequenceDiagram
    autonumber
    actor A as 👨‍💼 Admin
    participant Dash as AdminDashboard
    participant Modal as ActionModals
    participant Hook as useRegistrations
    participant RegAPI as /api/registrations
    participant DB as MySQL Database
    participant Bridge as PHP Bridge
    participant INLIS as INLIS Lite DB
    participant NotAPI as /api/notify
    participant Resend as Resend API

    A->>Dash: Membuka dashboard admin
    Dash->>Hook: fetchRegistrations()
    Hook->>RegAPI: GET /api/registrations
    RegAPI->>DB: SELECT * FROM registrations ORDER BY created_at DESC
    DB-->>RegAPI: Registration[]
    RegAPI-->>Hook: { data: Registration[] }
    Hook-->>Dash: Tampilkan tabel pendaftaran

    A->>Dash: Klik pendaftaran "Menunggu"
    Dash->>Modal: Buka modal detail
    Modal-->>A: Tampilkan detail + foto pendaftar

    A->>Modal: Klik tombol "Setujui"
    Modal->>Hook: handleApprove(id)
    Hook->>RegAPI: PATCH /api/registrations { id, status: "Disetujui" }
    
    RegAPI->>DB: SELECT * FROM registrations WHERE id = ?
    DB-->>RegAPI: Registration data
    
    RegAPI->>Bridge: POST perpus-bridge.php?action=insert-member
    Note over RegAPI,Bridge: Kirim data anggota (fullname, NIK, alamat, dll)
    Bridge->>INLIS: INSERT ke database lokal INLIS
    INLIS-->>Bridge: member_no, end_date
    Bridge-->>RegAPI: { success, member_no, end_date }
    
    RegAPI->>DB: UPDATE registrations SET status='Disetujui', member_no, end_date, approved_at, approved_by
    DB-->>RegAPI: { affectedRows: 1 }
    RegAPI-->>Hook: { success, member_no, message }

    Hook->>NotAPI: POST /api/notify (STATUS_APPROVED)
    NotAPI->>Resend: resend.emails.send()
    Resend-->>NotAPI: { success }

    Hook-->>Dash: Refresh data + toast sukses
    Dash-->>A: Tampilkan notifikasi "Berhasil disetujui"
```

---

## 9. ERD (Entity Relationship Diagram)

> Struktur database sistem dengan detail kolom dan tipe data.

```mermaid
erDiagram
    REGISTRATIONS {
        int id PK "AUTO_INCREMENT"
        varchar ticket_no UK "REG-2026-XXXXX"
        varchar member_no "Dari INLIS Lite (nullable)"
        date end_date "Masa berlaku kartu (nullable)"
        varchar fullname "Nama lengkap"
        varchar identity_no "NIK/Nomor identitas"
        int identity_type_id "1=KTP, 2=SIM, 3=Kartu Pelajar"
        varchar place_of_birth "Tempat lahir"
        date date_of_birth "Tanggal lahir"
        int sex_id "1=Laki-laki, 2=Perempuan"
        int agama_id "1-6"
        varchar marital_status_id "Status perkawinan"
        varchar mother_maiden_name "Nama ibu kandung"
        text address "Alamat lengkap"
        varchar kecamatan "Kecamatan"
        varchar kelurahan "Kelurahan/Desa"
        varchar rt "RT"
        varchar rw "RW"
        varchar city "Kota/Kabupaten"
        varchar province "Provinsi"
        varchar email "Email pendaftar"
        varchar no_hp "Nomor HP"
        varchar phone "Telepon rumah (optional)"
        int education_level_id "1-7 Pendidikan"
        int job_id "1-8 Pekerjaan"
        varchar institution_name "Nama instansi/sekolah"
        varchar nama_darurat "Nama kontak darurat"
        varchar telp_darurat "Telepon darurat"
        varchar status_hubungan_darurat "Hubungan darurat"
        varchar pas_foto_url "URL pas foto"
        varchar foto_ktp_url "URL foto KTP"
        enum status "Menunggu|Disetujui|Ditolak"
        text reject_reason "Alasan penolakan (nullable)"
        varchar approved_by "Email admin yang verifikasi"
        datetime approved_at "Waktu verifikasi"
        datetime created_at "Waktu pendaftaran"
        datetime updated_at "Waktu update terakhir"
    }

    ADMIN_USERS {
        int id PK "AUTO_INCREMENT"
        varchar name "Nama lengkap admin"
        varchar email UK "Email/username login"
        varchar password "Hash bcrypt"
        varchar role "superadmin|petugas"
        tinyint is_active "1=aktif, 0=nonaktif"
        datetime last_login "Login terakhir"
        datetime created_at "Waktu dibuat"
    }

    ADMIN_USERS ||--o{ REGISTRATIONS : "memverifikasi (approved_by = email)"
```

> [!NOTE]
> Relasi antara `REGISTRATIONS.approved_by` dan `ADMIN_USERS.email` bersifat **logis/referensial** — tidak ada foreign key eksplisit di database. Sistem hanya menggunakan 2 tabel.

---

## 10. Component Diagram

> Arsitektur komponen teknis sistem dengan layer-layer yang jelas.

```mermaid
flowchart TB
    subgraph Client["🖥️ Presentation Layer (React/Next.js)"]
        direction TB
        subgraph Pages["Pages"]
            Landing["📄 page.tsx\n(Landing / Form)"]
            CekStatusPage["📄 cek-status/page.tsx"]
            AdminPage["📄 admin/page.tsx"]
        end
        subgraph Components["Komponen UI"]
            RegForm["📦 RegistrationForm"]
            FormSec["📦 FormSections\n(6 section)"]
            FileUp["📦 FileUploadSection"]
            Success["📦 SuccessState"]
            Navbar["📦 Navbar"]
            CekStatusComp["📦 CekStatus"]
            StatusCard["📦 StatusCard"]
            AdminDash["📦 AdminDashboard"]
            RegTable["📦 RegistrationTable"]
            ActionModal["📦 ActionModals"]
            Stats["📦 StatsOverview"]
            UserMgmt["📦 UserManagement"]
            Profile["📦 ProfileSettings"]
            PDFCard["📦 LibraryCardPDF"]
        end
        subgraph UI["UI Primitives"]
            ProgressSteps["🎨 ProgressSteps"]
            StatusBadge["🎨 StatusBadge"]
            Toast["🎨 Toast"]
        end
    end

    subgraph Hooks["⚡ Business Logic Layer (Custom Hooks)"]
        useRegForm["🔧 useRegistrationForm\n• Validasi 22+ field\n• Orchestrate submit"]
        useRegs["🔧 useRegistrations\n• CRUD admin\n• Approve/Reject"]
        useStatus["🔧 useStatusSearch\n• Cari status\n• Generate barcode"]
    end

    subgraph API["🔌 API Layer (Next.js Route Handlers)"]
        direction TB
        subgraph PublicAPI["Public Endpoints"]
            ApiReg["POST /api/registrations\nGET /api/registrations?ticket_no="]
            ApiUpload["POST /api/upload"]
            ApiNotify["POST /api/notify"]
            ApiDownload["GET /api/download-card"]
            ApiProxy["GET /api/proxy-image"]
        end
        subgraph AuthAPI["Auth Endpoints"]
            ApiLogin["POST /api/auth/login"]
            ApiMe["GET /api/auth/me"]
            ApiLogout["POST /api/auth/logout"]
            ApiChangePw["POST /api/auth/change-password"]
            ApiSeed["GET /api/auth/seed"]
        end
        subgraph AdminAPI["Admin-Only Endpoints"]
            ApiRegPatch["PATCH /api/registrations"]
            ApiUsers["CRUD /api/admin/users"]
            ApiProfile["GET|PUT /api/admin/profile"]
        end
    end

    subgraph Middleware["🛡️ Middleware Layer"]
        MW["middleware.ts\nJWT Verification\nRoute Protection"]
    end

    subgraph Shared["📚 Shared Layer"]
        DB["lib/db.ts\nMySQL Pool"]
        Constants["lib/constants.ts\nConfig & Regex"]
        EmailTPL["lib/emailTemplates.ts\n3 HTML Templates"]
        Types["types/index.ts\nTypeScript Interfaces"]
    end

    subgraph External["🌐 External Services"]
        MySQL[("🗄️ MySQL\nHostinger")]
        Hostinger["📁 Hostinger\nFile Storage"]
        Resend["📧 Resend API"]
        PHPBridge["🔗 PHP Bridge\nINLIS Lite"]
    end

    %% Page to Component
    Landing --> RegForm
    CekStatusPage --> CekStatusComp
    AdminPage --> AdminDash

    %% Component to Hook
    RegForm --> useRegForm
    CekStatusComp --> useStatus
    AdminDash --> useRegs

    %% Hook to API
    useRegForm --> ApiUpload
    useRegForm --> ApiReg
    useRegForm --> ApiNotify
    useRegs --> ApiReg
    useRegs --> ApiRegPatch
    useRegs --> ApiNotify
    useStatus --> ApiReg

    %% Middleware intercepts
    MW -.->|"protects"| AdminAPI
    MW -.->|"protects"| ApiRegPatch

    %% API to External
    ApiReg --> DB
    ApiRegPatch --> DB
    ApiRegPatch --> PHPBridge
    ApiUpload --> Hostinger
    ApiNotify --> Resend
    ApiDownload --> DB
    ApiLogin --> DB
    ApiUsers --> DB
    ApiProfile --> DB
    DB --> MySQL

    %% API to Shared
    ApiNotify --> EmailTPL
```

---

## 11. Deployment Diagram

> Infrastruktur dan distribusi deployment sistem.

```mermaid
flowchart TB
    subgraph UserDevice["👤 Perangkat Pengguna"]
        Browser["🌐 Web Browser\n(Chrome, Firefox, Safari)"]
    end

    subgraph Vercel["☁️ Vercel Platform"]
        direction TB
        subgraph VercelEdge["Edge Network"]
            CDN["🌍 CDN\nStatic Assets"]
            MWLayer["🛡️ Middleware\nJWT Verification"]
        end
        subgraph VercelServerless["Serverless Functions"]
            SSR["⚡ Next.js SSR\nServer Components"]
            APIRoutes["🔌 API Routes\n12 endpoints"]
        end
    end

    subgraph Hostinger["🏢 Hostinger Server"]
        direction TB
        subgraph HostDB["Database Server"]
            MySQLDB[("🗄️ MySQL\nu158561617_perpus_web\nPort: 3306\nSSL: Auto")]
        end
        subgraph HostPHP["PHP Runtime"]
            UploadPHP["📤 upload.php\nFile Upload Handler"]
            BridgePHP["🔗 perpus-bridge.php\nINLIS Lite Sync"]
        end
        subgraph HostStorage["File Storage"]
            PasFoto["📁 /uploads/pas_foto/"]
            FotoKTP["📁 /uploads/foto_ktp/"]
        end
        subgraph LocalDB["Local Database"]
            INLIS[("📚 INLIS Lite DB\nSistem Perpustakaan\nLokal")]
        end
    end

    subgraph ResendCloud["☁️ Resend Cloud"]
        ResendAPI["📧 Resend Email API\nSMTP Delivery"]
    end

    Browser -->|"HTTPS"| CDN
    Browser -->|"HTTPS"| SSR
    CDN -->|"Static files"| Browser
    SSR --> APIRoutes
    MWLayer -.->|"intercepts"| APIRoutes
    APIRoutes -->|"mysql2/promise\nTCP:3306"| MySQLDB
    APIRoutes -->|"POST FormData\nHTTPS"| UploadPHP
    APIRoutes -->|"POST JSON\nHTTPS + API Key"| BridgePHP
    APIRoutes -->|"REST API\nHTTPS"| ResendAPI
    UploadPHP -->|"write"| PasFoto
    UploadPHP -->|"write"| FotoKTP
    BridgePHP -->|"SQL"| INLIS
    ResendAPI -->|"Email SMTP"| Browser
```

---

## 12. State Machine Diagram — Status Pendaftaran

> Transisi status pendaftaran dari awal hingga akhir.

```mermaid
stateDiagram-v2
    [*] --> Menunggu : Pendaftar submit formulir\n(POST /api/registrations)

    state Menunggu {
        [*] --> DataMasuk : Data tersimpan di DB
        DataMasuk --> EmailTerkirim : Email konfirmasi dikirim\n(WELCOME_CONFIRMATION)
        EmailTerkirim --> MenungguVerifikasi : Menunggu admin\nmemverifikasi
    }

    Menunggu --> Disetujui : Admin klik "Setujui"\n(PATCH status=Disetujui)
    Menunggu --> Ditolak : Admin klik "Tolak"\n(PATCH status=Ditolak)

    state Disetujui {
        [*] --> SyncINLIS : Sinkronisasi ke PHP Bridge
        SyncINLIS --> TerimaNoAnggota : Terima member_no\n& end_date
        TerimaNoAnggota --> UpdateDB : Update DB dengan\nnomor anggota
        UpdateDB --> EmailApproved : Kirim email\nSTATUS_APPROVED
        EmailApproved --> KartuReady : Kartu anggota\nsiap diunduh
    }

    state Ditolak {
        [*] --> SimpanAlasan : Simpan reject_reason
        SimpanAlasan --> EmailRejected : Kirim email\nSTATUS_REJECTED
        EmailRejected --> SelesaiDitolak : Pendaftar dapat\nmendaftar ulang
    }

    Disetujui --> [*] : Pendaftar download\nkartu anggota PDF
    Ditolak --> [*] : Proses selesai
```

---

## Catatan Teknis

> [!IMPORTANT]
> **Limitasi Mermaid untuk Use Case Diagram:**
> Mermaid tidak memiliki tipe diagram Use Case resmi (seperti PlantUML). Diagram Use Case di atas diimplementasikan menggunakan `flowchart` sebagai pendekatan terbaik yang tersedia. Untuk diagram Use Case yang persis seperti contoh gambar (dengan oval dan stick figure), disarankan menggunakan tools seperti:
> - **Draw.io** (gratis)
> - **StarUML**
> - **PlantUML**
> - **Visual Paradigm**

> [!TIP]
> **Cara Render Diagram Mermaid:**
> 1. **VS Code**: Install ekstensi "Markdown Preview Mermaid Support"
> 2. **Online**: Buka [mermaid.live](https://mermaid.live) dan paste kode diagram
> 3. **GitHub**: Langsung render di file markdown GitHub
> 4. **Export**: Gunakan [mermaid.live](https://mermaid.live) untuk export sebagai PNG/SVG

---

## Rekomendasi Diagram Tambahan untuk Laporan Magang

| No | Diagram | Alasan | Prioritas |
|----|---------|--------|-----------|
| 1 | **Flowchart Sistem Keseluruhan** | Gambaran umum alur sistem dari awal hingga akhir | ⭐⭐⭐ |
| 2 | **Data Flow Diagram (DFD)** | Menunjukkan aliran data antar proses, cocok untuk laporan formal | ⭐⭐⭐ |
| 3 | **Arsitektur Sistem (Block Diagram)** | Menggambarkan arsitektur monolith full-stack yang digunakan | ⭐⭐⭐ |
| 4 | **Sitemap / Navigation Diagram** | Struktur halaman dan navigasi website | ⭐⭐ |
| 5 | **Wireframe / Mockup** | Tampilan visual halaman-halaman utama | ⭐⭐ |
| 6 | **Gantt Chart** | Timeline pengerjaan proyek selama magang | ⭐⭐ |

> Diagram 1-6 di atas sudah **tercakup sebagian** dalam file [arsitektur_teknis.md](file:///d:/project/pendaftaran-perpus-batang/arsitektur_teknis.md) namun belum dalam format diagram formal. Untuk laporan magang, diagram **Use Case, Activity, Class, Sequence, dan ERD** adalah yang paling standar dan wajib ada.
