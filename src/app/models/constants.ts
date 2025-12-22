import { Deal, DealStage, SalesRep, DealCategory, BusinessType } from './types';

export const MOCK_REPS: SalesRep[] = [
    {
        id: 'george',
        name: 'George',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
        quota: 40000000,
        teamMembers: []
    },
    {
        id: 'hari',
        name: 'Hari',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hari',
        quota: 45000000,
        teamMembers: []
    },
    {
        id: 'team-dva',
        name: 'Team DVA',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DVA',
        quota: 45000000,
        teamMembers: ['Dinesh', 'Venkat', 'Arjun']
    },
    {
        id: 'team-la',
        name: 'Team LA',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=LA',
        quota: 45000000,
        teamMembers: ['Logesh', 'Ajay']
    },
    {
        id: 'team-snv',
        name: 'Team SNV',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=SNV',
        quota: 45000000,
        teamMembers: ['Sasi', 'Nirupama', 'Vicky']
    }
];

export const INITIAL_DEALS: Deal[] = [
    {
        id: 'deal-1',
        title: 'Enterprise License',
        customerName: 'Cyberdyne Systems',
        value: 5000000,
        stage: DealStage.PROPOSAL,
        probability: 60,
        closeDate: new Date().toISOString(),
        assignedRepId: 'george',
        category: DealCategory.TECHNOLOGY,
        businessType: BusinessType.NEW,
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'deal-2',
        title: 'Cloud Migration',
        customerName: 'TechCorp',
        value: 2500000,
        stage: DealStage.NEGOTIATION,
        probability: 80,
        closeDate: new Date().toISOString(),
        assignedRepId: 'hari',
        category: DealCategory.TECHNOLOGY,
        businessType: BusinessType.EXISTING,
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'deal-3',
        title: 'Security Audit',
        customerName: 'FinBank',
        value: 1500000,
        stage: DealStage.LEAD,
        probability: 20,
        closeDate: new Date().toISOString(),
        assignedRepId: 'team-snv',
        category: DealCategory.FINANCE,
        businessType: BusinessType.NEW,
        lastUpdated: new Date().toISOString()
    }
];

export const STAGE_CONFIG = [
    { id: DealStage.LEAD, label: 'Lead', color: 'bg-slate-300' },
    { id: DealStage.CONTACTED, label: 'Contacted', color: 'bg-blue-400' },
    { id: DealStage.PROPOSAL, label: 'Proposal', color: 'bg-indigo-400' },
    { id: DealStage.NEGOTIATION, label: 'Negotiation', color: 'bg-purple-400' },
    { id: DealStage.CLOSED_WON, label: 'Won', color: 'bg-emerald-500' },
    { id: DealStage.CLOSED_LOST, label: 'Lost', color: 'bg-red-500' }
];
