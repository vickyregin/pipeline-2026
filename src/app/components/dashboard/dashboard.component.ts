import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../services/sales.service';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DealStage, BusinessType } from '../../models/types';
import { STAGE_CONFIG } from '../../models/constants';
import { InrPipe } from '../../pipes/inr.pipe';
import { GeminiService } from '../../services/gemini.service';

@Component({
   selector: 'app-dashboard',
   standalone: true,
   imports: [CommonModule, LucideAngularModule, BaseChartDirective, InrPipe],
   template: `
    <div class="space-y-4 md:space-y-8 animate-in fade-in duration-700 pb-12 p-4 md:p-8">
      
      <!-- Top Stats Hero -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
           <div class="flex justify-between items-start mb-4">
              <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <lucide-icon name="trending-up" [size]="20"></lucide-icon>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Yielding</span>
           </div>
           <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Revenue</p>
           <h3 class="text-2xl font-black text-slate-900 leading-none">{{ salesService.metrics().totalRevenue | inr }}</h3>
           <div class="mt-4 flex items-center gap-2">
              <div class="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                 <div class="h-full bg-emerald-500 w-[78%]"></div>
              </div>
              <span class="text-[9px] font-bold text-emerald-600">+12.4%</span>
           </div>
        </div>

        <div class="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
           <div class="flex justify-between items-start mb-4">
              <div class="p-2.5 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <lucide-icon name="activity" [size]="20"></lucide-icon>
              </div>
              <span class="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">Active</span>
           </div>
           <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Pipeline Value</p>
           <h3 class="text-2xl font-black text-slate-900 leading-none">{{ salesService.metrics().totalPipelineValue | inr }}</h3>
           <div class="mt-4 flex items-center gap-2">
              <div class="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                 <div class="h-full bg-red-500 w-[64%]"></div>
              </div>
              <span class="text-[9px] font-bold text-red-600">Stable</span>
           </div>
        </div>

        <div class="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
           <div class="flex justify-between items-start mb-4">
              <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <lucide-icon name="target" [size]="20"></lucide-icon>
              </div>
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Precision</span>
           </div>
           <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Win Rate</p>
           <h3 class="text-2xl font-black text-slate-900 leading-none">{{ salesService.metrics().winRate.toFixed(1) }}%</h3>
           <div class="mt-4 flex items-center gap-2">
              <div class="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                 <div class="h-full bg-indigo-500 w-[42%]"></div>
              </div>
              <span class="text-[9px] font-bold text-indigo-600">Top Tier</span>
           </div>
        </div>

        <div class="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
           <div class="flex justify-between items-start mb-4">
              <div class="p-2.5 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <lucide-icon name="briefcase" [size]="20"></lucide-icon>
              </div>
              <span class="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-full">Growth</span>
           </div>
           <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Avg Deal Size</p>
           <h3 class="text-2xl font-black text-slate-900 leading-none">{{ salesService.metrics().averageDealSize | inr }}</h3>
           <div class="mt-4 flex items-center gap-2">
              <div class="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                 <div class="h-full bg-purple-500 w-[91%]"></div>
              </div>
              <span class="text-[9px] font-bold text-purple-600">Premium</span>
           </div>
        </div>
      </div>

      <!-- Main Analytics Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Pipeline Stage Mix -->
            <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div class="absolute -top-12 -right-12 w-48 h-48 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors"></div>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <lucide-icon name="bar-chart-2" [size]="14" class="text-red-500"></lucide-icon> Pipeline Capacity Matrix
              </h3>
              <div class="h-56 relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                 <canvas baseChart [data]="stageMixData()" [options]="barOptions" [type]="'bar'"></canvas>
              </div>
            </div>

            <!-- New vs Existing -->
            <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div class="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <lucide-icon name="zap" [size]="14" class="text-orange-500"></lucide-icon> Acquisition DNA Split
              </h3>
              <div class="h-56 relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                <canvas baseChart [data]="businessTypeData()" [options]="horizontalBarOptions" [type]="'bar'"></canvas>
              </div>
            </div>
          </div>

          <!-- Revenue Trajectory -->
          <div class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div class="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors"></div>
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
               <lucide-icon name="activity" [size]="14" class="text-emerald-500"></lucide-icon> Enterprise Revenue Velocity
            </h3>
            <div class="h-72 relative z-10 transition-transform duration-500 hover:scale-[1.01]">
               <canvas baseChart [data]="trajectoryData()" [options]="lineOptions" [type]="'line'"></canvas>
            </div>
          </div>
        </div>

        <!-- Right Side AI Sidebar -->
        <div class="flex flex-col gap-8">
           <div class="bg-[#303030] p-8 rounded-[2rem] shadow-2xl text-white flex flex-col flex-1 relative overflow-hidden group border border-white/5">
             <div class="absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-900/40 to-[#303030] opacity-100 group-hover:opacity-110 transition-opacity"></div>
             
             <!-- Decorative Grids -->
             <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 20px 20px;"></div>

             <div class="relative z-10 flex items-center justify-between mb-8">
               <div class="flex flex-col">
                 <span class="text-[9px] font-black text-red-400 uppercase tracking-[0.3em] mb-1">Intelligence Layer</span>
                 <h3 class="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                   Strategy HQ
                 </h3>
               </div>
               <button (click)="runAiAnalysis()" [disabled]="isAnalyzing()" 
                  class="p-3 bg-white/10 hover:bg-[#CA3436] hover:text-white rounded-2xl transition-all active:scale-95 shadow-lg border border-white/10">
                 <lucide-icon name="sparkles" [size]="18" [class.animate-pulse]="isAnalyzing()"></lucide-icon>
               </button>
             </div>

             <div class="relative z-10 flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 text-sm leading-relaxed overflow-y-auto scrollbar-hide border border-white/5 shadow-inner">
                <div *ngIf="isAnalyzing()" class="flex flex-col items-center justify-center h-full gap-6 py-12">
                   <div class="relative">
                      <div class="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
                      <div class="absolute inset-0 blur-lg bg-blue-500/20 animate-pulse"></div>
                   </div>
                   <p class="font-black text-[10px] tracking-[0.3em] text-blue-400 uppercase animate-pulse">Initializing Neural Analysis...</p>
                </div>
                
                <div *ngIf="!isAnalyzing() && aiAnalysis()" class="prose prose-invert prose-sm">
                   <div class="whitespace-pre-wrap font-bold text-slate-100 leading-relaxed text-xs">{{ aiAnalysis() }}</div>
                </div>
                
                <div *ngIf="!isAnalyzing() && !aiAnalysis()" class="text-center py-20 flex flex-col items-center gap-6 group/btn">
                   <div class="p-5 bg-white/5 rounded-3xl group-hover/btn:scale-110 transition-transform duration-500 border border-white/5">
                      <lucide-icon name="zap" [size]="32" class="text-red-500"></lucide-icon>
                   </div>
                   <p class="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Deploy AI Stratagem <br/> for real-time guidance</p>
                </div>
             </div>
             
             <div class="relative z-10 mt-6 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <span>Model: Pipeline-2026-v1</span>
                <span>Uptime 100%</span>
             </div>
           </div>
        </div>
      </div>

      <!-- Performance Leaderboard -->
      <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative group">
         <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div class="flex flex-col">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Human Capital Registry</span>
              <h3 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Elite Performance Matrix
              </h3>
            </div>
            <div class="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
               <lucide-icon name="award" [size]="18" class="text-amber-500"></lucide-icon>
            </div>
         </div>
         <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                   <tr class="bg-slate-50/50">
                      <th class="px-4 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Individual Agent</th>
                      <th class="hidden md:table-cell px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target Quota</th>
                      <th class="px-4 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield (WON)</th>
                      <th class="px-4 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attainment %</th>
                      <th class="hidden lg:table-cell px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pipeline</th>
                      <th class="hidden xl:table-cell px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Precision</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                   <tr *ngFor="let rep of repPerformance(); let idx = index" class="hover:bg-blue-50/30 group transition-all duration-300">
                      <td class="px-4 md:px-8 py-6">
                         <div class="flex items-center gap-3 md:gap-4">
                            <div class="relative">
                               <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-110">
                                  <img [src]="rep.avatar" class="w-full h-full object-cover" />
                               </div>
                               <div *ngIf="idx === 0" class="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-lg p-1 shadow-lg shadow-amber-500/30">
                                 <lucide-icon name="trophy" [size]="10" fill="currentColor"></lucide-icon>
                               </div>
                            </div>
                            <div>
                               <div class="font-black text-slate-900 text-xs md:text-sm tracking-tight">{{ rep.name }}</div>
                               <div class="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Duty</div>
                            </div>
                         </div>
                      </td>
                      <td class="hidden md:table-cell px-8 py-6 text-right text-slate-500 font-black text-xs tabular-nums">{{ rep.quota | inr }}</td>
                      <td class="px-4 md:px-8 py-6 text-right font-black text-slate-900 text-xs md:text-sm tabular-nums">{{ rep.revenue | inr }}</td>
                      <td class="px-4 md:px-8 py-6">
                         <div class="flex items-center gap-3">
                            <div class="hidden sm:block flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px] md:min-w-[100px] border border-slate-200">
                               <div class="h-full rounded-full transition-all duration-1000 bg-gradient-to-r"
                                    [ngClass]="rep.achievement >= 100 ? 'from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'from-blue-500 to-indigo-600'"
                                    [style.width.%]="rep.achievement > 100 ? 100 : rep.achievement"></div>
                            </div>
                            <span class="text-[10px] md:text-xs font-black w-8 md:w-10" [ngClass]="rep.achievement >= 100 ? 'text-emerald-500' : 'text-slate-900'">{{ rep.achievement.toFixed(0) }}%</span>
                         </div>
                      </td>
                      <td class="hidden lg:table-cell px-8 py-6 text-right text-slate-500 text-xs font-black tabular-nums">{{ rep.pipeline | inr }}</td>
                      <td class="hidden xl:table-cell px-8 py-6 text-right">
                         <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                               [ngClass]="rep.winRate > 60 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : rep.winRate > 30 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'">
                            {{ rep.winRate.toFixed(0) }}% ACC
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

   stageMixData = computed<ChartConfiguration<'bar'>['data']>(() => {
      const deals = this.salesService.deals();
      const data = STAGE_CONFIG.map(stage =>
         deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0)
      );
      const colors = ['rgba(203, 213, 225, 0.4)', 'rgba(202, 52, 54, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(167, 139, 250, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'];

      return {
         labels: STAGE_CONFIG.map(s => s.label),
         datasets: [
            { data, backgroundColor: colors, borderRadius: 12, barThickness: 16 }
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
         labels: ['New Venture', 'Retain/Exst'],
         datasets: [
            { data, backgroundColor: ['#f97316', '#cbd5e1'], borderRadius: 12, barThickness: 24 }
         ]
      };
   });

   trajectoryData = computed<ChartConfiguration<'line'>['data']>(() => {
      const deals = this.salesService.deals();
      const dataRecords: Record<string, number> = {};
      const wonWon = deals.filter(d => d.stage === DealStage.CLOSED_WON);

      // Fill with last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
         const d = new Date();
         d.setMonth(d.getMonth() - i);
         const name = d.toLocaleString('default', { month: 'short' });
         months.push(name);
         dataRecords[name] = 0;
      }

      wonWon.forEach(d => {
         const m = new Date(d.closeDate).toLocaleString('default', { month: 'short' });
         if (dataRecords[m] !== undefined) dataRecords[m] += d.value;
      });

      return {
         labels: months,
         datasets: [
            {
               data: Object.values(dataRecords),
               borderColor: '#10b981',
               borderWidth: 4,
               backgroundColor: (context: any) => {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) return null;
                  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                  gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
                  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.15)');
                  return gradient;
               },
               fill: true,
               tension: 0.4,
               pointBackgroundColor: '#10b981',
               pointBorderColor: '#fff',
               pointBorderWidth: 4,
               pointRadius: 6,
               pointHoverRadius: 8
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
         x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
         y: { display: false }
      }
   };

   horizontalBarOptions: ChartOptions<'bar'> = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
         x: { display: false },
         y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
      }
   };

   lineOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: { display: false },
         tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 12,
            displayColors: false
         }
      },
      scales: {
         x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } },
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
