// ===============================
// DropLink Configuration
// ===============================

// Replace these with your own Supabase project values

export const SUPABASE_URL =
    "https://evvfdaquhaprnyyhifqc.supabase.co";

export const SUPABASE_ANON_KEY =
    "sb_publishable_D5gIbi-QMuQ1lTKNyF15Pw_NJ5iCqft";

// ===============================
// Upload Settings
// ===============================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_TYPES = [

    "image/jpeg",
    "image/png",
    "image/webp",

    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

];

// Storage Bucket Name

export const STORAGE_BUCKET = "files";

// Base URL after deployment
// Change this after deploying to Vercel.

export const SITE_URL = "https://droplink-gpt.vercel.app";
