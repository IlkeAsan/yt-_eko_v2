// Supabase Bağlantı Ayarları
// Bu dosya tüm sayfalarda ortak kullanılır.
const SUPABASE_URL = 'https://avtoydkihbspbclgtmfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dG95ZGtpaGJzcGJjbGd0bWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTMzMzcsImV4cCI6MjA5MjY4OTMzN30.PJdYOGKV9nR6l0SGW_u1ZMUa0ikn_LTpBykxwhvVcy8';

const veritabani = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
