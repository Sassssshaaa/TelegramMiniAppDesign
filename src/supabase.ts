import { createClient } from "@supabase/supabase-js";

// Берём адрес и ключ из настроек
const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Этот код сам автоматически исправляет любые ошибки в ссылке
const supabaseUrl = rawUrl.trim().replace(/\/+(rest\/v1\/?)?$/, "");

export const supabase = createClient(supabaseUrl, supabaseKey);
