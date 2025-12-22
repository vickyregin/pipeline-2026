import { Injectable, inject } from '@angular/core';
import { MOCK_REPS, INITIAL_DEALS } from '../models/constants';
import { Deal, SalesRep } from '../models/types';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private supabaseService = inject(SupabaseService);

    private mapDealFromDb(dbDeal: any): Deal {
        return {
            id: dbDeal.id,
            title: dbDeal.title,
            customerName: dbDeal.customer_name,
            value: Number(dbDeal.value),
            stage: dbDeal.stage,
            probability: dbDeal.probability,
            closeDate: dbDeal.close_date,
            assignedRepId: dbDeal.assigned_rep_id,
            category: dbDeal.category,
            businessType: dbDeal.business_type,
            notes: dbDeal.notes,
            lastUpdated: dbDeal.last_updated,
            stageHistory: dbDeal.stage_history
        };
    }

    private mapDealToDb(deal: Partial<Deal>) {
        const dbDeal: any = {};
        if (deal.title !== undefined) dbDeal.title = deal.title;
        if (deal.customerName !== undefined) dbDeal.customer_name = deal.customerName;
        if (deal.value !== undefined) dbDeal.value = deal.value;
        if (deal.stage !== undefined) dbDeal.stage = deal.stage;
        if (deal.probability !== undefined) dbDeal.probability = deal.probability;
        if (deal.closeDate !== undefined) {
            // Postgres DATE type expects YYYY-MM-DD
            dbDeal.close_date = typeof deal.closeDate === 'string' ? deal.closeDate.split('T')[0] : deal.closeDate;
        }
        if (deal.assignedRepId !== undefined) dbDeal.assigned_rep_id = deal.assignedRepId;
        if (deal.category !== undefined) dbDeal.category = deal.category;
        if (deal.businessType !== undefined) dbDeal.business_type = deal.businessType;
        if (deal.notes !== undefined) dbDeal.notes = deal.notes;
        if (deal.stageHistory !== undefined) dbDeal.stage_history = deal.stageHistory;
        dbDeal.last_updated = new Date().toISOString();
        return dbDeal;
    }

    async fetchReps(): Promise<SalesRep[]> {
        const client = this.supabaseService.getClient();
        if (client) {
            const { data, error } = await client.from('sales_reps').select('*');
            if (error) console.error('Supabase fetchReps error:', error);
            if (!error && data && data.length > 0) {
                return data.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    avatar: r.avatar,
                    quota: Number(r.quota),
                    teamMembers: r.team_members || []
                }));
            }
        }
        return [...MOCK_REPS];
    }

    async fetchDeals(): Promise<Deal[]> {
        const client = this.supabaseService.getClient();
        if (client) {
            const { data, error } = await client.from('deals').select('*').order('last_updated', { ascending: false });
            if (error) console.error('Supabase fetchDeals error:', error);
            if (!error && data) {
                return data.map(this.mapDealFromDb);
            }
        }
        return [...INITIAL_DEALS];
    }

    async createDeal(deal: Omit<Deal, 'id' | 'lastUpdated'>): Promise<Deal> {
        const client = this.supabaseService.getClient();
        if (client) {
            const dbDeal = this.mapDealToDb(deal);
            console.log('Inserting deal to Supabase:', dbDeal);
            const { data, error } = await client.from('deals').insert([dbDeal]).select();

            if (error) {
                console.error('Supabase createDeal error detail:', error.message, error.details, error.hint);
                // If it's a constraint error, it might be the assigned_rep_id
                throw error;
            }

            if (data && data.length > 0) {
                console.log('Successfully saved to Supabase:', data[0]);
                return this.mapDealFromDb(data[0]);
            }
        }

        // Mock Fallback
        const newDeal = {
            ...deal,
            id: `deal-${Date.now()}`,
            lastUpdated: new Date().toISOString()
        } as Deal;
        return newDeal;
    }

    async updateDeal(deal: Deal): Promise<Deal> {
        const client = this.supabaseService.getClient();
        if (client) {
            const dbDeal = this.mapDealToDb(deal);
            const { data, error } = await client.from('deals').update(dbDeal).eq('id', deal.id).select();
            if (error) {
                console.error('Supabase updateDeal error:', error);
                throw error;
            }
            if (data && data.length > 0) {
                return this.mapDealFromDb(data[0]);
            }
        }
        return deal;
    }

    async deleteDeal(dealId: string): Promise<boolean> {
        const client = this.supabaseService.getClient();
        if (client) {
            const { error } = await client.from('deals').delete().eq('id', dealId);
            if (error) console.error('Supabase delete error:', error);
            return !error;
        }
        return true;
    }

    async updateRepQuota(repId: string, quota: number): Promise<boolean> {
        const client = this.supabaseService.getClient();
        if (client) {
            const { error } = await client.from('sales_reps').update({ quota }).eq('id', repId);
            if (error) console.error('Supabase update rep quota error:', error);
            return !error;
        }
        return true;
    }
}
