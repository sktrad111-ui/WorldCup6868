import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hifibbzqzfvhhifiogyh.supabase.co";

const supabaseAnonKey = "sb_publishable_xlYFr24L_KK3NkPovQCclQ_Wq8E2inQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);