// ============ ENUMS ============
export type UserRole = "basic" | "extensive" | "administrator";
export type CaseStatusDB = "open" | "closed" | "in_progress";
export type CompanyType = "internal" | "contractor";

// ============ ENTITIES ============
export interface Company {
  id: number;
  name: string;
  type: CompanyType;
  created_at?: string;
}

export interface Unit {
  id: number;
  name: string;
  company_id: number;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company_id: number;
  unit_id: number;
  created_at?: string;
}

export interface Location {
  id: number;
  name: string;
  created_at?: string;
}

export interface CaseCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface CaseType {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  created_at?: string;
}

export interface Case {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  case_type_id?: number;
  location_id?: number;
  company_id?: number;
  unit_id?: number;
  reported_by?: number;
  send_to?: number;
  work_activity?: string;
  system_involved?: string;
  system_description?: string;
  status: CaseStatusDB;
  equipment_involved?: string;
  equipment_description?: string;
  actual_consequences?: string;
  potential_consequences?: string;
  communication_causes?: string;
  management_causes?: string;
  training_causes?: string;
  operating_environment_causes?: string;
  equipment_causes?: string;
  comments?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedSearch {
  id: number;
  user_id?: number;
  case_id?: number;
  created_at?: string;
}

export interface Notification {
  id: number;
  user_id?: number;
  case_id?: number;
  is_read: boolean;
  created_at?: string;
}

export interface Permission {
  id: number;
  user_id?: number;
  permission_name: string;
  created_at?: string;
}

// ============ AUTH ============
export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  access_token: string;
}

// ============ DASHBOARD ============
export interface DashboardStats {
  total_cases: number;
  open_cases: number;
  in_progress_cases: number;
  closed_cases: number;
  total_companies: number;
  total_users: number;
}

// ============ STATUS DISPLAY ============
export type CaseStatus = CaseStatusDB;

export interface StatCard {
  title: string;
  count: number;
  icon: string;
  color: "cyan" | "blue" | "amber" | "red";
}
