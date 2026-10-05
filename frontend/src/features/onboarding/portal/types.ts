export interface CandidateFormData {
  birthDate: string;
  birthPlace: string;
  nationality: string;
  gender: string;
  nationalIdNumber: string;
  address: string;
  maritalStatus: string;
  childrenCount: number;
  bankName: string;
  bankRib: string;
  mobileMoneyProvider: string;
  mobileMoneyNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  shoeSize: string;
  clothingSize: string;
}

export interface UploadedDocMeta {
  fileName: string;
  fileSize: number;
}
