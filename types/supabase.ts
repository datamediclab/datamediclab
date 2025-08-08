 // types/supabase.ts

 export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

 export interface Database {
   public: {
     Tables: {
       brand: {
         Row: {
           id: string;
           name: string;
           createdAt: string;
         };
         Insert: {
           id?: string;
           name: string;
           createdAt?: string;
         };
         Update: {
           id?: string;
           name?: string;
           createdAt?: string;
         };
         Relationships: [];
       };
       brand_model: {
         Row: {
           id: string;
           name: string;
           brand_id: string;
           createdAt: string;
         };
         Insert: {
           id?: string;
           name: string;
           brand_id: string;
           createdAt?: string;
         };
         Update: {
           id?: string;
           name?: string;
           brand_id?: string;
           createdAt?: string;
         };
         Relationships: [];
       };
       customer: {
         Row: {
           id: string;
           full_name: string;
           phone: string;
           email: string | null;
           line_id: string | null;
           createdAt: string;
         };
         Insert: {
           id?: string;
           full_name: string;
           phone: string;
           email?: string | null;
           line_id?: string | null;
           createdAt?: string;
         };
         Update: {
           id?: string;
           full_name?: string;
           phone?: string;
           email?: string | null;
           line_id?: string | null;
           createdAt?: string;
         };
         Relationships: [];
       };
       device: {
         Row: {
           id: string;
           customer_id: string;
           device_type: string;
           brand_id: string;
           model_id: string | null;
           capacity: string;
           serial_number: string | null;
           description: string | null;
           current_status: string;
           status_history: Json | null;
           technician_note: string | null;
           technician_id: string | null;
           changed_by_id: string | null;
           received_at: string;
           createdAt: string;
         };
         Insert: {
           id?: string;
           customer_id: string;
           device_type: string;
           brand_id: string;
           model_id?: string | null;
           capacity: string;
           serial_number?: string | null;
           description?: string | null;
           current_status: string;
           status_history?: Json | null;
           technician_note?: string | null;
           technician_id?: string | null;
           changed_by_id?: string | null;
           received_at?: string;
           createdAt?: string;
         };
         Update: {
           id?: string;
           customer_id?: string;
           device_type?: string;
           brand_id?: string;
           model_id?: string | null;
           capacity?: string;
           serial_number?: string | null;
           description?: string | null;
           current_status?: string;
           status_history?: Json | null;
           technician_note?: string | null;
           technician_id?: string | null;
           changed_by_id?: string | null;
           received_at?: string;
           createdAt?: string;
         };
         Relationships: [];
       };
       track_log: {
         Row: {
           id: string;
           device_id: string;
           actor_id: string | null;
           action: string;
           note: string | null;
           createdAt: string;
         };
         Insert: {
           id?: string;
           device_id: string;
           actor_id?: string | null;
           action: string;
           note?: string | null;
           createdAt?: string;
         };
         Update: {
           id?: string;
           device_id?: string;
           actor_id?: string | null;
           action?: string;
           note?: string | null;
           createdAt?: string;
         };
         Relationships: [];
       };
       repair_record: {
         Row: {
           id: string;
           device_id: string;
           repair_date: string;
           technician_id: string | null;
           description: string | null;
           cost: number;
           note: string | null;
           createdAt: string;
         };
         Insert: {
           id?: string;
           device_id: string;
           repair_date?: string;
           technician_id?: string | null;
           description?: string | null;
           cost: number;
           note?: string | null;
           createdAt?: string;
         };
         Update: {
           id?: string;
           device_id?: string;
           repair_date?: string;
           technician_id?: string | null;
           description?: string | null;
           cost?: number;
           note?: string | null;
           createdAt?: string;
         };
         Relationships: [];
       };
       status_history: {
         Row: {
           id: string;
           device_id: string;
           from: string;
           to: string;
           changed_by_id: string | null;
           note: string | null;
           changed_at: string;
         };
         Insert: {
           id?: string;
           device_id: string;
           from: string;
           to: string;
           changed_by_id?: string | null;
           note?: string | null;
           changed_at?: string;
         };
         Update: {
           id?: string;
           device_id?: string;
           from?: string;
           to?: string;
           changed_by_id?: string | null;
           note?: string | null;
           changed_at?: string;
         };
         Relationships: [];
       };
       payment_record: {
         Row: {
           id: string;
           device_id: string;
           amount: number;
           method: string;
           paid_at: string;
           note: string | null;
         };
         Insert: {
           id?: string;
           device_id: string;
           amount: number;
           method: string;
           paid_at?: string;
           note?: string | null;
         };
         Update: {
           id?: string;
           device_id?: string;
           amount?: number;
           method?: string;
           paid_at?: string;
           note?: string | null;
         };
         Relationships: [];
       };
       admin: {
         Row: {
           id: string;
           name: string;
           email: string;
           password: string;
           role: string;
           createdAt: string;
         };
         Insert: {
           id?: string;
           name: string;
           email: string;
           password: string;
           role: string;
           createdAt?: string;
         };
         Update: {
           id?: string;
           name?: string;
           email?: string;
           password?: string;
           role?: string;
           createdAt?: string;
         };
         Relationships: [];
       };
       admin_activity_log: {
         Row: {
           id: string;
           admin_id: string;
           device_id: string;
           action: string;
           detail: string | null;
           createdAt: string;
         };
         Insert: {
           id?: string;
           admin_id: string;
           device_id: string;
           action: string;
           detail?: string | null;
           createdAt?: string;
         };
         Update: {
           id?: string;
           admin_id?: string;
           device_id?: string;
           action?: string;
           detail?: string | null;
           createdAt?: string;
         };
         Relationships: [];
       };
       customer_note: {
         Row: {
           id: string;
           customer_id: string;
           note: string;
           createdAt: string;
         };
         Insert: {
           id?: string;
           customer_id: string;
           note: string;
           createdAt?: string;
         };
         Update: {
           id?: string;
           customer_id?: string;
           note?: string;
           createdAt?: string;
         };
         Relationships: [];
       };
     };
     Views: Record<string, never>;
     Functions: Record<string, never>;
     Enums: Record<string, string>;
   };
 }
 
 
 
 
 
 