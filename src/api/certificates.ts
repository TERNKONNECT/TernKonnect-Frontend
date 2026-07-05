import api from "./axios";

export interface CertificateDetails {
  valid: boolean;
  certificateId: string;
  issuedAt: string;
  user: {
    name: string;
  };
  course: {
    title: string;
  };
}

export const certificatesApi = {
  verifyCertificate: (certificateId: string): Promise<CertificateDetails> =>
    api.get(`/api/certificates/verify/${certificateId}`).then((res) => res.data),
};
