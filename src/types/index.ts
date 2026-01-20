import { Database } from './supabase';

export type ActionResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export type UserRole = Database['public']['Enums']['user_role'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
