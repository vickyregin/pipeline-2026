import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient | null = null;
    public isSupabaseConfigured = false;

    constructor() {
        const supabaseUrl = environment.supabaseUrl;
        const supabaseKey = environment.supabaseKey;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            this.isSupabaseConfigured = true;
        }
    }

    getClient() {
        return this.supabase;
    }
}
