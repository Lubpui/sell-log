export interface Item {
  id?: string;
  owner: "Neng" | "Joy";
  detail: string;
  price: number;
  status: "sold" | "pending";
  game: "pes" | "lrg" | "payroll";
  createdAt?: string;
  createdBy?: string;
}

export interface FilterOptions {
  owner: string[];
  status: string[];
  game: string[];
  details: string[];
  createdAtRange?: [Date, Date];
}
