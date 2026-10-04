export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  GROQ_API_KEY: string;

  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;

  CONVERSATIONS: KVNamespace;
}
