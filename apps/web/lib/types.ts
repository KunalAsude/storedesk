export type { CompanyStatus, PlanName, ThemeName, UserRole } from "@storedesk/shared";
import type { CompanyStatus, PlanName } from "@storedesk/shared";
export type Company = {
  id: string;
  name: string;
  city: string;
  owner: string;
  email: string;
  plan: PlanName;
  status: CompanyStatus;
  stores: number;
  users: number;
  expiry: string;
  mrr: number;
};
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  sizes: string[];
  colors: string[];
};
export type Bill = {
  id: string;
  date: string;
  customer: string;
  payment: string;
  total: number;
  due: number;
  status: string;
};
