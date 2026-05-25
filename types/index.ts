export type RegistrationStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface Registration {
  id: number;
  ticketNumber: string;
  fullname: string;
  identityNo: string;
  noHp: string;
  email: string;
  placeOfBirth: string;
  dateOfBirth: string;
  address: string;
  kecamatan: string;
  kelurahan: string;
  rt: string;
  rw: string;
  city: string;
  province: string;
  sexId: number;
  agamaId: number;
  maritalStatusId: string;
  pasFotoUrl?: string;
  fotoKtpUrl?: string;
  memberNo?: string;
  endDate?: string;
  motherMaidenName: string;
  identityTypeId: number;
  educationLevelId: number;
  jobId: number;
  institutionName: string;
  namaDarurat: string;
  telpDarurat: string;
  statusHubunganDarurat: string;
  registerDate: string;
  createdAt: string;
  approvedAt: string | null;
  status: RegistrationStatus;
  rejectReason?: string;
}

export interface FormData {
  fullname: string;
  placeOfBirth: string;
  dateOfBirth: string;
  sexId: string;
  agamaId: string;
  maritalStatusId: string;
  motherMaidenName: string;
  identityTypeId: string;
  identityNo: string;
  address: string;
  kecamatan: string;
  kelurahan: string;
  rt: string;
  rw: string;
  city: string;
  province: string;
  noHp: string;
  phone: string;
  email: string;
  educationLevelId: string;
  jobId: string;
  institutionName: string;
  namaDarurat: string;
  telpDarurat: string;
  statusHubunganDarurat: string;
}

export interface FormErrors {
  [key: string]: string;
}
