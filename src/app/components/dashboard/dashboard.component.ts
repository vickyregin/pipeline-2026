import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../services/sales.service';
import { LucideAngularModule, Sparkles, RefreshCcw, Trophy, BarChart2, Briefcase, TrendingUp } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { DealStage, BusinessType, Deal } from '../../models/types';
import { STAGE_CONFIG } from '../../models/constants';
import { InrPipe } from '../../pipes/inr.pipe';
import { GeminiService } from '../../services/gemini.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, BaseChartDirective, InrPipe],
    template: `
    <div class="space-y-6 animate-in fade-in duration-500 pb-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-default group">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Revenue</p>
          <p class="text-2xl font-bold text-emerald-600 group-hover:scale-105 transition-transform origin-left">{{ salesService.metrics().totalRevenue | inr }}</p>
          <p class="text-[10px] text-slate-400 mt-1 font-medium italic">Closed Won</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-default group">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pipeline Value</p>
          <p class="text-2xl font-bold text-blue-600 group-hover:scale-105 transition-transform origin-left">{{ salesService.metrics().totalPipelineValue | inr }}</p>
          <p class="text-[10px] text-slate-400 mt-1 font-medium italic">Open Opportunities</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-default group">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Win Rate</p>
          <p class="text-2xl font-bold text-indigo-600 group-hover:scale-105 transition-transform origin-left">{{ salesService.metrics().winRate.toFixed(1) }}%</p>
          <p class="text-[10px] text-slate-400 mt-1 font-medium italic">Historical</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-default group">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Avg Deal Size</p>
          <p class="text-2xl font-bold text-purple-600 group-hover:scale-105 transition-transform origin-left">{{ salesService.metrics().averageDealSize | inr }}</p>
          <p class="text-[10px] text-slate-400 mt-1 font-medium italic">Per Won Deal</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Pipeline Stage Mix -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 class="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
                <lucide-icon name="bar-chart-2" [size]="18" class="text-blue-500"></lucide-icon> Pipeline Stage Mix
              </h3>
              <div class="h-48 relative">
                 <canvas baseChart [data]="stageMixData()" [options]="barOptions" [type]="'bar'"></canvas>
              </div>
            </div>

            <!-- New vs Existing -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 class="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
                 <lucide-icon name="briefcase" [size]="18" class="text-orange-500"></lucide-icon> New vs Existing Business
              </h3>
              <div class="h-48 relative">
                <canvas baseChart [data]="businessTypeData()" [options]="horizontalBarOptions" [type]="'bar'"></canvas>
              </div>
            </div>
          </div>

          <!-- Revenue Trajectory -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 class="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
               <lucide-icon name="trending-up" [size]="18" class="text-emerald-500"></lucide-icon> Revenue Trajectory
            </h3>
            <div class="h-64 relative">
               <canvas baseChart [data]="trajectoryData()" [options]="lineOptions" [type]="'line'"></canvas>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-6">
           <div class="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 rounded-xl shadow-xl text-white flex flex-col flex-1 max-h-[440px] border border-white/10">
             <div class="flex items-center justify-between mb-4">
               <h3 class="text-lg font-bold flex items-center gap-2">
                 <lucide-icon name="sparkles" [size]="20" class="text-yellow-400"></lucide-icon> AI Strategy
               </h3>
               <button (click)="runAiAnalysis()" [disabled]="isAnalyzing()" class="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-90">
                 <lucide-icon name="refresh-ccw" [size]="16" [class.animate-spin]="isAnalyzing()"></lucide-icon>
               </button>
             </div>
             <div class="flex-1 bg-black/20 rounded-lg p-4 text-sm leading-relaxed overflow-y-auto scrollbar-hide border border-white/5">
                <div *ngIf="isAnalyzing()" class="flex flex-col items-center justify-center h-full gap-4 opacity-80">
                   <div class="w-8 h-8 border-3 border-white/10 border-t-yellow-400 rounded-full animate-spin"></div>
                   <p class="font-medium text-xs tracking-wider animate-pulse uppercase">Syncing AI Brain...</p>
                </div>
                <div *ngIf="!isAnalyzing() && aiAnalysis()" class="prose prose-invert prose-sm">
                   <pre class="whitespace-pre-wrap font-sans text-indigo-50">{{ aiAnalysis() }}</pre>
                </div>
                <div *ngIf="!isAnalyzing() && !aiAnalysis()" class="text-center opacity-70 mt-12 flex flex-col items-center gap-4">
                   <lucide-icon name="sparkles" [size]="32" class="text-indigo-300"></lucide-icon>
                   <p class="text-xs">Launch AI insights for real-time risk assessment and next-best-action guidance for your pipeline.</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      <!-- Rep Performance -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div class="p-6 border-b border-slate-200 bg-slate-50/50">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <lucide-icon name="trophy" [size]="18" class="text-amber-500"></lucide-icon> Rep Performance Matrix
            </h3>
         </div>
         <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
               <thead class="bg-white border-b border-slate-100">
                  <tr>
                     <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Representative</th>
                     <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Quota</th>
                     <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                     <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achievement</th>
                     <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Pipeline</th>
                     <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Win Rate</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let rep of repPerformance(); let idx = index" class="hover:bg-slate-50 group transition-colors">
                     <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                           <div class="relative">
                              <img [src]="rep.avatar" [alt]="rep.name" class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200" />
                              <div *ngIf="idx === 0" class="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow-sm">
                                <lucide-icon name="trophy" [size]="10" fill="currentColor"></lucide-icon>
                              </div>
                           </div>
                           <div>
                              <div class="font-bold text-slate-900 text-sm">{{ rep.name }}</div>
                              <div *ngIf="rep.teamMembers" class="text-[10px] text-slate-500 font-medium">Team: {{ rep.teamMembers.join(', ') }}</div>
                           </div>
                        </div>
                     </td>
                     <td class="px-6 py-4 text-right text-slate-500 font-mono text-xs">{{ rep.quota | inr }}</td>
                     <td class="px-6 py-4 text-right font-bold text-slate-800 text-sm">{{ rep.revenue | inr }}</td>
                     <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                           <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                              <div class="h-full rounded-full transition-all duration-1000"
                                   [ngClass]="rep.achievement >= 100 ? 'bg-emerald-500' : 'bg-blue-500'"
                                   [style.width.%]="rep.achievement > 100 ? 100 : rep.achievement"></div>
                           </div>
                           <span class="text-xs font-bold" [ngClass]="rep.achievement >= 100 ? 'text-emerald-600' : 'text-slate-600'">{{ rep.achievement.toFixed(1) }}%</span>
                        </div>
                     </td>
                     <td class="px-6 py-4 text-right text-slate-600 text-xs font-medium">{{ rep.pipeline | inr }}</td>
                     <td class="px-6 py-4 text-right">
                        <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight"
                              [ngClass]="rep.winRate > 60 ? 'bg-emerald-100 text-emerald-700' : rep.winRate > 30 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'">
                           {{ rep.winRate.toFixed(1) }}%
                        </span>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
    salesService = inject(SalesService);
    gemini = inject(GeminiService);

    aiAnalysis = signal<string>('');
    isAnalyzing = signal<boolean>(false);

    // Charts Logic (Computed)
    stageMixData = computed<ChartConfiguration<'bar'>['data']>(() => {
        const deals = this.salesService.deals();
        const data = STAGE_CONFIG.map(stage =>
            deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0)
        );
        const colors = ['#cbd5e1', '#60a5fa', '#818cf8', '#a78bfa', '#10b981', '#ef4444'];

        return {
            labels: STAGE_CONFIG.map(s => s.label),
            datasets: [
                { data, backgroundColor: colors, borderRadius: 4 }
            ]
        };
    });

    businessTypeData = computed<ChartConfiguration<'bar'>['data']>(() => {
        const deals = this.salesService.deals();
        const types = [BusinessType.NEW, BusinessType.EXISTING];
        const data = types.map(type =>
            deals.filter(d => d.businessType === type).reduce((sum, d) => sum + d.value, 0)
        );
        return {
            labels: ['New', 'Existing'],
            datasets: [
                { data, backgroundColor: ['#f97316', '#94a3b8'], borderRadius: 4, barThickness: 20 }
            ]
        };
    });

    trajectoryData = computed<ChartConfiguration<'line'>['data']>(() => {
        const deals = this.salesService.deals();
        const data: Record<string, number> = {};
        const sortedDeals = [...deals]
            .filter(d => d.stage === DealStage.CLOSED_WON)
            .sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime());

        sortedDeals.forEach(d => {
            const date = new Date(d.closeDate);
            const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            data[key] = (data[key] || 0) + d.value;
        });

        const labels = Object.keys(data);
        const values = Object.values(data);

        return {
            labels,
            datasets: [
                {
                    data: values,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointRadius: 5
                }
            ]
        };
    });

    repPerformance = computed(() => {
        const deals = this.salesService.deals();
        const reps = this.salesService.reps();
        return reps.map(rep => {
            const repDeals = deals.filter(d => d.assignedRepId === rep.id);
            const won = repDeals.filter(d => d.stage === DealStage.CLOSED_WON);
            const lost = repDeals.filter(d => d.stage === DealStage.CLOSED_LOST);
            const active = repDeals.filter(d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST);
            const revenue = won.reduce((acc, d) => acc + d.value, 0);
            const pipeline = active.reduce((acc, d) => acc + d.value, 0);
            const totalClosed = won.length + lost.length;
            const winRate = totalClosed > 0 ? (won.length / totalClosed) * 100 : 0;
            const achievement = rep.quota ? (revenue / rep.quota) * 100 : 0;
            return { ...rep, revenue, pipeline, winRate, achievement };
        }).sort((a, b) => b.achievement - a.achievement);
    });

    barOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { display: false } // Hide Y axis like in Recharts example roughly 
        }
    };

    horizontalBarOptions: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: { grid: { display: false } }
        }
    };

    lineOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { display: false }
        }
    };

    async runAiAnalysis() {
        this.isAnalyzing.set(true);
        const analysis = await this.gemini.analyzePipeline(this.salesService.deals(), this.salesService.reps());
        this.aiAnalysis.set(analysis);
        this.isAnalyzing.set(false);
    }
}
