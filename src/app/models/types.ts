export type DealStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export const DealStage = {
    LEAD: 'lead' as DealStage,
    CONTACTED: 'contacted' as DealStage,
    PROPOSAL: 'proposal' as DealStage,
    NEGOTIATION: 'negotiation' as DealStage,
    CLOSED_WON: 'closed_won' as DealStage,
    CLOSED_LOST: 'closed_lost' as DealStage
};

export type BusinessType = 'New Business' | 'Existing Business';

export const BusinessType = {
    NEW: 'New Business' as BusinessType,
    EXISTING: 'Existing Business' as BusinessType
};

export type DealCategory = 'Technology' | 'Healthcare' | 'Finance' | 'Retail' | 'Manufacturing' | 'Other';

export const DealCategory = {
    TECHNOLOGY: 'Technology' as DealCategory,
    HEALTHCARE: 'Healthcare' as DealCategory,
    FINANCE: 'Finance' as DealCategory,
    RETAIL: 'Retail' as DealCategory,
    MANUFACTURING: 'Manufacturing' as DealCategory,
    OTHER: 'Other' as DealCategory
};

export interface Deal {
    id: string;
    title: string;
    customerName: string;
    value: number;
    stage: DealStage;
    probability: number; // 0-100
    closeDate: string; // ISO Date
    assignedRepId: string;
    category: string;
    businessType: BusinessType;
    notes?: string;
    lastUpdated: string;
    stageHistory?: Record<string, string>; // stage -> date
}

export interface SalesRep {
    id: string;
    name: string;
    avatar: string; // URL
    quota: number;
    teamMembers?: string[];
}

export interface SalesMetrics {
    totalRevenue: number;
    totalPipelineValue: number;
    winRate: number;
    averageDealSize: number;
}
