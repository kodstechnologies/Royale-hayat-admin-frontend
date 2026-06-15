export type Leadership = {
  id: string;
  initials: string;
  name: string;
  arabicName: string;
  title: string;
  arabicTitle: string;
  description: string[];
  arabicDescription: string[];
  image: string;
  status: "show" | "hide";
  order: number;
  createdAt: string;
  updatedAt?: string;
};