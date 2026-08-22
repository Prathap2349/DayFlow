// src/services/officeService.ts
import { supabase } from '../db/supabaseClient';

export interface OfficeLocation {
  id: string;
  name: string;
  allowedIpAddresses: string[];
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

export const officeService = {
  /**
   * Fetch current public IP address of the client device
   */
  async getClientIp(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('IP service unavailable');
      const data = await res.json();
      return data.ip || '127.0.0.1';
    } catch {
      // Fallback local IP for dev/testing
      return '127.0.0.1';
    }
  },

  /**
   * Fetch all registered office location network rules
   */
  async getOfficeLocations(): Promise<OfficeLocation[]> {
    try {
      const { data, error } = await supabase
        .from('office_locations')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Error fetching office locations:', error.message);
        return [
          {
            id: 'default-hq',
            name: 'HQ Main Office',
            allowedIpAddresses: ['127.0.0.1', '::1', '*'],
          },
        ];
      }

      return (data || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        allowedIpAddresses: o.allowed_ip_addresses || [],
        latitude: o.latitude || undefined,
        longitude: o.longitude || undefined,
        radiusMeters: o.radius_meters || 100,
      }));
    } catch (err) {
      console.warn('Unhandled exception in getOfficeLocations:', err);
      return [
        {
          id: 'default-hq',
          name: 'HQ Main Office',
          allowedIpAddresses: ['127.0.0.1', '::1', '*'],
        },
      ];
    }
  },

  /**
   * Add or update an office location with allowed IP addresses
   */
  async saveOfficeLocation(location: Partial<OfficeLocation>): Promise<OfficeLocation> {
    const payload = {
      name: location.name,
      allowed_ip_addresses: location.allowedIpAddresses || [],
      latitude: location.latitude,
      longitude: location.longitude,
      radius_meters: location.radiusMeters || 100,
    };

    if (location.id && !location.id.startsWith('default-')) {
      const { data, error } = await supabase
        .from('office_locations')
        .update(payload)
        .eq('id', location.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return {
        id: data.id,
        name: data.name,
        allowedIpAddresses: data.allowed_ip_addresses,
      };
    } else {
      const { data, error } = await supabase
        .from('office_locations')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return {
        id: data.id,
        name: data.name,
        allowedIpAddresses: data.allowed_ip_addresses,
      };
    }
  },

  /**
   * Delete an office location rule
   */
  async deleteOfficeLocation(id: string): Promise<void> {
    const { error } = await supabase.from('office_locations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
