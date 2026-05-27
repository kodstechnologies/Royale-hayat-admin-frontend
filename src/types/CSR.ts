export type CSR = {
  id: string;
  heading: string;
  subheading: string;
  arabicHeading: string;
  subheadingArabic: string;
  description: string;
  arabicDescription: string;
  images: string[]; // Array of base64 image strings

  order: number;
  createdAt: string;
  updatedAt?: string;
};