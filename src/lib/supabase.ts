import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xhnfkiyjirfgnqrodbnn.supabase.co';
const DEFAULT_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vbQs7-vgIpbDV-1s02ApwA_FAwXPVH0';

export function getSupabaseUrl(): string {
  try {
    return localStorage.getItem('FMW_CUSTOM_SUPABASE_URL') || DEFAULT_URL || '';
  } catch {
    return DEFAULT_URL || '';
  }
}

export function getSupabaseAnonKey(): string {
  try {
    return localStorage.getItem('FMW_CUSTOM_SUPABASE_KEY') || DEFAULT_ANON_KEY || '';
  } catch {
    return DEFAULT_ANON_KEY || '';
  }
}

export function checkIsSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && key && url.startsWith('http'));
}

let activeClient: SupabaseClient | null = null;

function initClient(): SupabaseClient | null {
  if (!checkIsSupabaseConfigured()) return null;
  try {
    return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.warn('[Supabase Client Error]', err);
    return null;
  }
}

activeClient = initClient();

export function getSupabase(): SupabaseClient | null {
  if (!activeClient) {
    activeClient = initClient();
  }
  return activeClient;
}

export function setCustomSupabaseConfig(url: string, key: string): void {
  try {
    localStorage.setItem('FMW_CUSTOM_SUPABASE_URL', url.trim());
    localStorage.setItem('FMW_CUSTOM_SUPABASE_KEY', key.trim());
    activeClient = createClient(url.trim(), key.trim(), {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.error('[Supabase Config Save Error]', err);
  }
}

export function resetCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem('FMW_CUSTOM_SUPABASE_URL');
    localStorage.removeItem('FMW_CUSTOM_SUPABASE_KEY');
    activeClient = initClient();
  } catch (err) {
    console.error('[Supabase Reset Error]', err);
  }
}

export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ ok: boolean; message: string; latency?: number }> {
  const url = customUrl || getSupabaseUrl();
  const key = customKey || getSupabaseAnonKey();

  if (!url || !key) {
    return { ok: false, message: 'URL atau Anon Key Supabase belum diisi.' };
  }

  const startTime = Date.now();
  try {
    const testClient = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await testClient.from('app_state').select('id').limit(1);
    const latency = Date.now() - startTime;

    if (error) {
      if (
        error.code === 'PGRST116' ||
        error.message?.includes('relation "app_state" does not exist') ||
        error.message?.includes('does not exist')
      ) {
        return {
          ok: true,
          message: `Terhubung ke Supabase Cloud (${latency}ms), tetapi tabel 'app_state' belum dibuat. Silakan buat tabel di SQL Editor Supabase.`,
          latency
        };
      }
      return {
        ok: false,
        message: `Error dari Supabase: ${error.message} (Kode: ${error.code || 'UNKNOWN'})`,
        latency
      };
    }

    return {
      ok: true,
      message: `Berhasil terhubung ke Supabase Cloud (${latency}ms)! Sinkronisasi multi-device siap digunakan.`,
      latency
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Koneksi gagal (${err.name || 'Error'}): ${err.message || 'Periksa URL Supabase atau koneksi internet.'}`
    };
  }
}

// Backwards compatibility exports
export const isSupabaseConfigured = checkIsSupabaseConfigured();
export const supabase = activeClient;
