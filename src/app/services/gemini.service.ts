import { Injectable } from '@angular/core';
import { Deal, SalesRep } from '../models/types';

@Injectable({
    providedIn: 'root'
})
export class GeminiService {
    async analyzePipeline(deals: Deal[], reps: SalesRep[]): Promise<string> {
        // Mock analysis
        await new Promise(resolve => setTimeout(resolve, 2000));

        const revenue = deals.reduce((acc, d) => acc + d.value, 0);
        const winRate = (deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100;

        return `## AI Pipeline Analysis
    
Based on current data, your pipeline shows strong potential with a total value of ₹${(revenue / 10000000).toFixed(2)}Cr.

**Key Insights:**
- Win rate is currently at ${winRate.toFixed(1)}%, which is ${winRate > 30 ? 'healthy' : 'needs improvement'}.
- Top performing category is Technology.
- Recommended focus: Accelerate deals in Negotiation stage for ${reps[0]?.name || 'the team'}.

**Action Items:**
1. Follow up with high-value prospects.
2. Review stalled deals in 'Contacted' stage.
3. Optimize quota distribution for next quarter.`;
    }
}
