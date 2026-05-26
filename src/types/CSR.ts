export type CSR = {
  id: string;
  heading: string;
  arabicHeading: string;
  description: string;
  arabicDescription: string;
  images: string[]; // Array of base64 image strings

  order: number;
  createdAt: string;
  updatedAt?: string;
};