import { Injectable, signal, computed } from '@angular/core';
import { Deal, SalesRep, DealStage, SalesMetrics } from '../models/types';
import { ApiService } from './api.service';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    // Data Signals
    deals = signal<Deal[]>([]);
    reps = signal<SalesRep[]>([]);
    isLoading = signal<boolean>(false);
    isLiveMode = signal<boolean>(true);

    // UI State Signals
    isAddDealModalOpen = signal<boolean>(false);
    editingDeal = signal<Deal | null>(null);

    // Computed Metrics
    metrics = computed<SalesMetrics>(() => {
        const deals = this.deals();
        const closedWon = deals.filter(d => d.stage === DealStage.CLOSED_WON);
        const activeDeals = deals.filter(d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST);

        return {
            totalRevenue: closedWon.reduce((acc, d) => acc + d.value, 0),
            totalPipelineValue: activeDeals.reduce((acc, d) => acc + d.value, 0),
            winRate: (closedWon.length / (deals.filter(d => d.stage === DealStage.CLOSED_WON || d.stage === DealStage.CLOSED_LOST).length || 1)) * 100,
            averageDealSize: closedWon.length ? closedWon.reduce((acc, d) => acc + d.value, 0) / closedWon.length : 0
        };
    });

    constructor(private api: ApiService, private supabase: SupabaseService) {
        this.loadData();
        this.setupLiveMode();
    }

    async loadData() {
        this.isLoading.set(true);
        try {
            const [repsData, dealsData] = await Promise.all([
                this.api.fetchReps(),
                this.api.fetchDeals()
            ]);
            this.reps.set(repsData);
            this.deals.set(dealsData);
        } catch (e) {
            console.error('Failed to load data', e);
        } finally {
            this.isLoading.set(false);
        }
    }

    toggleLiveMode() {
        this.isLiveMode.update(v => !v);
    }

    triggerPulse() {
        const deals = this.deals();
        const activeDeals = deals.filter(d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST);
        if (activeDeals.length === 0) return;

        // Don't pulse editing deal
        const currentEditingId = this.editingDeal()?.id;

        const randomIdx = Math.floor(Math.random() * activeDeals.length);
        const randomDeal = activeDeals[randomIdx];

        if (currentEditingId && randomDeal.id === currentEditingId) return;

        this.deals.update(prev => prev.map(d => {
            if (d.id === randomDeal.id) {
                const change = Math.random() > 0.5 ? 2 : -2;
                const newProb = Math.min(Math.max(d.probability + change, 5), 95);
                return { ...d, probability: newProb, lastUpdated: new Date().toISOString() };
            }
            return d;
        }));
    }

    private setupLiveMode() {
        setInterval(() => {
            if (this.isLiveMode() && !this.supabase.isSupabaseConfigured) {
                if (Math.random() < 0.25) this.triggerPulse();
            }
        }, 5000);
    }

    // Modal Actions
    openDealModal(deal: Deal | null = null) {
        this.editingDeal.set(deal);
        this.isAddDealModalOpen.set(true);
    }

    closeDealModal() {
        this.isAddDealModalOpen.set(false);
        this.editingDeal.set(null);
    }

    // Data Actions
    async updateRepQuota(repId: string, quota: number) {
        this.reps.update(reps => reps.map(r => r.id === repId ? { ...r, quota } : r));
        await this.api.updateRepQuota(repId, quota);
    }

    async updateDeal(deal: Deal) {
        this.deals.update(deals => deals.map(d => d.id === deal.id ? deal : d));
        // Also update history
        // Logic to update history matches React
        await this.api.updateDeal(deal);
    }

    async addDeal(dealData: Partial<Deal>) {
        // Basic creation logic
        const tempId = `temp-${Date.now()}`;
        const newDeal = {
            ...dealData,
            id: tempId,
            closeDate: dealData.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastUpdated: new Date().toISOString()
        } as Deal;

        this.deals.update(deals => [...deals, newDeal]);

        try {
            const saved = await this.api.createDeal(newDeal);
            this.deals.update(deals => deals.map(d => d.id === tempId ? saved : d));
        } catch (e) {
            this.deals.update(deals => deals.filter(d => d.id !== tempId));
            alert('Failed to create deal');
        }
    }

    async deleteDeal(dealId: string) {
        this.deals.update(deals => deals.filter(d => d.id !== dealId));
        await this.api.deleteDeal(dealId);
    }
}
