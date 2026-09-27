import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { SensorVitals, AlertItem, EmergencyContact, SportsSessionState } from '../types';

export { isSupabaseConfigured };

export interface SupabaseHealthCheck {
  connected: boolean;
  message: string;
}

export const checkSupabaseConnection = async (): Promise<SupabaseHealthCheck> => {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase URL or Anon key is missing in environment settings.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      message: 'Failed to initialize Supabase client.',
    };
  }

  try {
    // Quick probe query to test connectivity
    const { error } = await client.from('smart_jacket_vitals').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Table might not be created yet, but connection was made if we got a Postgres error
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'Connected to Supabase! (Tables need to be created with provided SQL schema)',
        };
      }
      return {
        connected: false,
        message: `Supabase error: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Connected and synchronized with Supabase database.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Failed to connect to Supabase.',
    };
  }
};

/**
 * Log vital biometrics to Supabase
 */
export const logVitalsToSupabase = async (vitals: SensorVitals, jacketId: string = 'JACKET-ALPHA-01') => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { error } = await client.from('smart_jacket_vitals').insert([
      {
        jacket_id: jacketId,
        heart_rate: vitals.heartRate,
        spo2: vitals.spo2,
        respiration_rate: vitals.respiration,
        skin_temperature: vitals.skinTemp,
        blood_pressure_systolic: vitals.bloodPressureSystolic,
        blood_pressure_diastolic: vitals.bloodPressureDiastolic,
        hrv: vitals.hrv,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn('Could not insert vitals to Supabase:', error.message);
    }
  } catch (e) {
    // Graceful no-op on network issues
  }
};

/**
 * Log an alert to Supabase
 */
export const logAlertToSupabase = async (alert: AlertItem, jacketId: string = 'JACKET-ALPHA-01') => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { error } = await client.from('smart_jacket_alerts').insert([
      {
        jacket_id: jacketId,
        alert_id: alert.id,
        title: alert.title,
        message: alert.description,
        source: alert.source,
        severity: alert.severity,
        acknowledged: alert.acknowledged || false,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn('Could not insert alert to Supabase:', error.message);
    }
  } catch (e) {
    // Graceful no-op
  }
};

/**
 * Persist emergency contacts to Supabase
 */
export const saveContactsToSupabase = async (contacts: EmergencyContact[]) => {
  const client = getSupabase();
  if (!client) return false;

  try {
    // Upsert contacts
    const formatted = contacts.map(c => ({
      id: c.id,
      name: c.name,
      relationship: c.relation,
      phone: c.phone,
      is_priority: Boolean(c.isPrimary),
      notified: Boolean(c.notified),
      notified_time: c.notifiedTime || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('smart_jacket_contacts').upsert(formatted, { onConflict: 'id' });
    if (error) {
      console.warn('Failed to save contacts to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Fetch emergency contacts from Supabase
 */
export const fetchContactsFromSupabase = async (): Promise<EmergencyContact[] | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('smart_jacket_contacts')
      .select('*')
      .order('is_priority', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      relation: row.relationship || 'Contact',
      phone: row.phone,
      avatarSeed: 'contact_avatar',
      notified: Boolean(row.notified),
      notifiedTime: row.notified_time || undefined,
      isPrimary: Boolean(row.is_priority),
    }));
  } catch (e) {
    return null;
  }
};

/**
 * Save completed workout/sports session
 */
export const saveWorkoutSessionToSupabase = async (
  session: SportsSessionState,
  avgHr: number,
  peakHr: number,
  jacketId: string = 'JACKET-ALPHA-01'
) => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { error } = await client.from('smart_jacket_workouts').insert([
      {
        jacket_id: jacketId,
        sport_type: session.sportType,
        duration_seconds: session.elapsedSeconds,
        calories_burned: session.caloriesBurned,
        avg_heart_rate: avgHr,
        peak_heart_rate: peakHr,
        avg_cadence: session.cadence,
        total_laps: session.laps ? session.laps.length : 0,
        laps_data: session.laps || [],
        active_zone: session.activeZone,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn('Could not record workout to Supabase:', error.message);
    }
  } catch (e) {
    // Graceful
  }
};
