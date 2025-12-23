import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { InrPipe } from '../../pipes/inr.pipe';
import { DealStage, BusinessType } from '../../models/types';

@Component({
  selector: 'app-incentives',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, InrPipe],
  template: `
    <div class="max-w-7xl mx-auto animate-in fade-in duration-700 p-4 md:p-8 h-full overflow-y-auto space-y-4 md:space-y-8 scrollbar-hide pb-20">
      
      <!-- Horizontal Representative Selector -->
      <div class="flex gap-3 md:gap-4 mb-4 md:mb-8 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
        <button *ngFor="let rep of salesService.reps()" 
            (click)="selectedRepId.set(rep.id)" 
            class="group flex flex-col items-center gap-2 md:gap-4 px-4 md:px-6 py-4 md:py-6 rounded-2xl md:rounded-3xl border transition-all min-w-[120px] md:min-w-[160px] relative overflow-hidden"
            [ngClass]="selectedRepId() === rep.id ? 'bg-white border-blue-500 ring-4 md:ring-8 ring-blue-500/5 shadow-xl md:shadow-2xl -translate-y-1 md:-translate-y-2' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'">
            
            <div class="relative">
              <img [src]="rep.avatar" [alt]="rep.name" class="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover border-2 transition-transform group-hover:scale-110"
                   [ngClass]="selectedRepId() === rep.id ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-50' " />
              <div *ngIf="selectedRepId() === rep.id" class="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                 <div class="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            <div class="text-center">
              <div class="font-black text-[10px] md:text-sm tracking-tight" [ngClass]="selectedRepId() === rep.id ? 'text-slate-900' : 'text-slate-500'">{{ rep.name }}</div>
              <div class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational ID</div>
            </div>

            <div *ngIf="selectedRepId() === rep.id" class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        </button>
      </div>

      <div *ngIf="selectedRep() as rep" class="space-y-4 md:space-y-8">
        <!-- Main Header & Simulator -->
        <div class="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative group">
          <div class="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div class="p-6 md:p-10 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div>
              <span class="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Human Capital Intelligence</span>
              <h2 class="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                 Performance Dashboard 
                 <span class="text-[10px] md:text-sm font-bold text-slate-400 px-3 md:px-4 py-1 bg-white rounded-full border border-slate-100 shadow-sm">{{ rep.name }}</span>
              </h2>
            </div>
            <div class="text-left md:text-right">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Current Yield (WON)</span>
                <span class="text-2xl md:text-4xl font-black text-slate-950 tracking-tight tabular-nums">{{ metrics().totalWonRevenue | inr }}</span>
            </div>
          </div>
          
          <div class="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
            <div class="space-y-10">
               <div class="relative">
                  <div class="flex justify-between items-center mb-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust Simulation Quota</label>
                    <div class="flex items-center gap-2">
                       <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                       <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">Real-time Compute</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner group/slider">
                     <input type="range" class="flex-1 accent-slate-950 h-1.5 bg-slate-200 rounded-lg appearance-none transition-all cursor-pointer" 
                        [min]="10000000" [max]="100000000" [step]="1000000" 
                        [disabled]="!authService.isAuthenticated"
                        [ngModel]="rep.quota" (ngModelChange)="updateQuota(rep.id, $event)">
                     <div class="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <span class="text-lg font-black text-slate-900 tabular-nums">{{ rep.quota | inr }}</span>
                     </div>
                  </div>
                  
                  <div *ngIf="!authService.isAuthenticated" class="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <lucide-icon name="lock" [size]="14" class="text-amber-500"></lucide-icon>
                    <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Access Restricted: Login required for quota simulation</span>
                  </div>
               </div>

                <div class="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-4 md:space-y-6 relative overflow-hidden group/attain shadow-2xl">
                   <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
                   <div class="flex justify-between items-baseline relative z-10">
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Attainment</span>
                      <span class="text-xl md:text-3xl font-black text-white tabular-nums">{{ metrics().achievement.toFixed(1) }}%</span>
                   </div>
                   <div class="w-full bg-white/10 h-3 rounded-full overflow-hidden relative z-10 p-0.5 border border-white/5">
                      <div class="h-full rounded-full transition-all duration-1000 bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]" [style.width.%]="metrics().achievement > 100 ? 100 : metrics().achievement"></div>
                   </div>
                   <div class="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest relative z-10">
                      <span class="text-blue-400">{{ metrics().totalWonRevenue | inr }} ACHIEVED</span>
                      <span class="text-slate-500">CAP: {{ rep.quota | inr }}</span>
                   </div>
                </div>
             </div>

             <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl relative overflow-hidden group/payout flex flex-col justify-center">
               <div class="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
                
               <h3 class="text-[9px] md:text-[10px] font-black mb-6 md:mb-10 flex items-center gap-3 uppercase tracking-[0.2em] text-slate-400">
                  <div class="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                     <lucide-icon name="calculator" [size]="16"></lucide-icon>
                  </div>
                  Projected Earnings Protocol
               </h3>

               <div class="space-y-6 md:space-y-8 relative z-10">
                  <div class="flex justify-between items-end border-b border-slate-50 pb-4 md:pb-6">
                     <span class="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Base Protocol (5%)</span>
                     <span class="font-black text-slate-900 text-base md:text-lg tabular-nums">{{ metrics().commission.base | inr }}</span>
                  </div>
                  <div class="flex justify-between items-end border-b border-slate-50 pb-4 md:pb-6">
                     <span class="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Accelerator Bonus (10%)</span>
                     <span class="font-black text-emerald-600 text-base md:text-lg tabular-nums">+ {{ metrics().commission.bonus | inr }}</span>
                  </div>
                  <div class="pt-2 md:pt-4 text-center pb-2 md:pb-4">
                     <span class="text-slate-300 text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black block mb-2 md:mb-4">Total Gross Payout Estimate</span>
                     <div class="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-slate-900 to-slate-500 tracking-tighter tabular-nums drop-shadow-sm">
                        {{ metrics().commission.total | inr }}
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>

        <!-- Detailed Analytics Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          <!-- Business Type Split -->
          <div class="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center group/dna relative overflow-hidden">
            <div class="absolute inset-0 bg-slate-50/30 opacity-0 group-hover/dna:opacity-100 transition-opacity"></div>
            <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 md:mb-10 w-full relative z-10">DNA Allocation (WON)</h3>
            <div class="flex-1 w-full flex flex-col justify-center gap-6 md:gap-10 relative z-10">
              <div class="space-y-3">
                <div class="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-tight">
                  <span class="text-blue-600">New Business Growth</span>
                  <span class="text-slate-900 tabular-nums">{{ metrics().newBusinessRevenue | inr }}</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div class="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" [style.width.%]="(metrics().newBusinessRevenue / (metrics().totalWonRevenue || 1)) * 100"></div>
                </div>
                <p class="text-[8px] md:text-[9px] font-black text-slate-400 text-right uppercase tracking-widest">{{ ((metrics().newBusinessRevenue / (metrics().totalWonRevenue || 1)) * 100).toFixed(0) }}% Contribution</p>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-tight">
                   <span class="text-slate-400">Existing Entity Retain</span>
                   <span class="text-slate-900 tabular-nums">{{ metrics().existingBusinessRevenue | inr }}</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div class="h-full bg-slate-400 rounded-full" [style.width.%]="(metrics().existingBusinessRevenue / (metrics().totalWonRevenue || 1)) * 100"></div>
                </div>
                <p class="text-[8px] md:text-[9px] font-black text-slate-400 text-right uppercase tracking-widest">{{ ((metrics().existingBusinessRevenue / (metrics().totalWonRevenue || 1)) * 100).toFixed(0) }}% Contribution</p>
              </div>
            </div>
          </div>

          <!-- Pipeline Funnel Metrics -->
          <div class="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-lg lg:col-span-2 relative group/funnel overflow-hidden">
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl"></div>
            <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 md:mb-10 w-full relative z-10">Operational Funnel Load</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
              <div *ngFor="let stage of stageMetrics()" class="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 bg-slate-50 group/item hover:border-slate-300 hover:bg-white transition-all transform hover:-translate-y-1">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 truncate">{{ stage.name }}</div>
                <div class="flex items-baseline gap-1 md:gap-2 mb-2">
                  <span class="text-xl md:text-2xl font-black text-slate-900 tabular-nums">{{ stage.count }}</span>
                  <span class="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">Ops</span>
                </div>
                <div class="text-[10px] md:text-[11px] font-black text-slate-500 tabular-nums tracking-tighter">{{ stage.value | inr }}</div>
              </div>

              <!-- Cumulative Summary -->
              <div class="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-950 text-white flex flex-col justify-center relative shadow-2xl overflow-hidden group/cumul">
                <div class="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                <div class="relative z-10">
                  <div class="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 leading-none">Global Cumulative Sales</div>
                  <div class="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter leading-none">{{ metrics().cumulativeRevenue | inr }}</div>
                  <div class="text-[8px] font-bold text-slate-500 mt-2 md:mt-3 uppercase tracking-widest">Aggregate Pipeline & WON</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IncentivesComponent {
  salesService = inject(SalesService);
  authService = inject(AuthService);
  selectedRepId = signal<string>('');

  selectedRep = computed(() => {
    const reps = this.salesService.reps();
    if (reps.length > 0 && !this.selectedRepId()) {
      return reps[0];
    }
    return reps.find(r => r.id === this.selectedRepId()) || reps[0];
  });

  metrics = computed(() => {
    const rep = this.selectedRep();
    const deals = this.salesService.deals().filter(d => d.assignedRepId === rep?.id);

    const wonDeals = deals.filter(d => d.stage === DealStage.CLOSED_WON);
    const totalWonRevenue = wonDeals.reduce((acc, d) => acc + d.value, 0);
    const achievement = rep ? (totalWonRevenue / rep.quota) * 100 : 0;

    const newBusinessWon = wonDeals.filter(d => d.businessType === BusinessType.NEW).reduce((acc, d) => acc + d.value, 0);
    const existingBusinessWon = wonDeals.filter(d => d.businessType === BusinessType.EXISTING).reduce((acc, d) => acc + d.value, 0);

    let base = 0;
    let bonus = 0;
    if (rep) {
      if (totalWonRevenue <= rep.quota) {
        base = totalWonRevenue * 0.05;
      } else {
        base = rep.quota * 0.05;
        bonus = (totalWonRevenue - rep.quota) * 0.10;
      }
    }

    return {
      totalWonRevenue,
      achievement,
      newBusinessRevenue: newBusinessWon,
      existingBusinessRevenue: existingBusinessWon,
      cumulativeRevenue: deals.reduce((acc, d) => acc + d.value, 0),
      commission: {
        base,
        bonus,
        total: base + bonus
      }
    };
  });

  stageMetrics = computed(() => {
    const rep = this.selectedRep();
    const deals = this.salesService.deals().filter(d => d.assignedRepId === rep?.id);

    const stages = [
      { id: DealStage.LEAD, name: 'Lead Acquisition' },
      { id: DealStage.CONTACTED, name: 'Entity Engagement' },
      { id: DealStage.PROPOSAL, name: 'Proposal Protocol' },
      { id: DealStage.NEGOTIATION, name: 'Negotiation' },
      { id: DealStage.CLOSED_WON, name: 'Won (Yield)' },
      { id: DealStage.CLOSED_LOST, name: 'Lost Load' }
    ];

    return stages.map(s => {
      const stageDeals = deals.filter(d => d.stage === s.id);
      return {
        ...s,
        count: stageDeals.length,
        value: stageDeals.reduce((acc, d) => acc + d.value, 0)
      };
    });
  });

  updateQuota(repId: string, quota: number) {
    if (!this.authService.isAuthenticated) return;
    this.salesService.updateRepQuota(repId, Number(quota));
  }
}
