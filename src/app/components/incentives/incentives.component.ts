import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { InrPipe } from '../../pipes/inr.pipe';
import { DealStage } from '../../models/types';

@Component({
    selector: 'app-incentives',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, InrPipe],
    template: `
    <div class="max-w-6xl mx-auto animate-in fade-in duration-700 p-8 h-full overflow-y-auto">
      <div class="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        <button *ngFor="let rep of salesService.reps()" 
            (click)="selectedRepId.set(rep.id)" 
            class="flex items-center gap-4 px-6 py-4 rounded-xl border transition-all min-w-[220px]"
            [ngClass]="selectedRepId() === rep.id ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-lg -translate-y-1' : 'bg-white border-slate-200 opacity-60 hover:opacity-100'">
            <img [src]="rep.avatar" [alt]="rep.name" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div class="text-left">
              <div class="font-bold text-sm" [ngClass]="selectedRepId() === rep.id ? 'text-blue-700' : 'text-slate-700'">{{ rep.name }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Plan Status</div>
            </div>
        </button>
      </div>

      <div *ngIf="selectedRep() as rep" class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
         <div class="p-8 border-b border-slate-100 bg-slate-50">
            <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
               Incentive Simulator <span class="text-sm font-normal text-slate-500 px-2 py-1 bg-white rounded border border-slate-200 shadow-sm ml-4">{{ rep.name }}</span>
            </h2>
            <p class="text-slate-500 text-sm mt-2">
               {{ authService.isAdmin() ? 'Adjust quota targets to simulate commission payouts based on current pipeline velocity.' : 'View commission payouts based on current pipeline velocity. (Read Only)' }}
            </p>
         </div>
         
         <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div class="space-y-8">
               <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Annual Quota Target</label>
                  <div class="flex items-center gap-4">
                     <input type="range" class="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none transition-all" 
                        [ngClass]="authService.isAdmin() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
                        [min]="5000000" [max]="50000000" [step]="1000000" 
                        [disabled]="!authService.isAdmin()"
                        [ngModel]="rep.quota" (ngModelChange)="updateQuota(rep.id, $event)">
                     <span class="text-lg font-mono font-bold text-slate-800 w-32 text-right">{{ rep.quota | inr }}</span>
                  </div>
                   <div *ngIf="!authService.isAdmin()" class="mt-1 text-[10px] font-bold text-amber-600 uppercase tracking-tight">Requires Admin permission to modify quota</div>
               </div>

               <div class="bg-blue-50 rounded-lg p-6 border border-blue-100 space-y-4">
                  <div class="flex justify-between items-center text-sm">
                     <span class="text-slate-600">Current Revenue (Closed Won)</span>
                     <span class="font-bold text-slate-900">{{ getRepRevenue(rep.id) | inr }}</span>
                  </div>
                  <div class="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                     <div class="h-full bg-blue-600 rounded-full" [style.width.%]="getAchievement(rep.id) > 100 ? 100 : getAchievement(rep.id)"></div>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                     <span class="font-bold text-blue-600">{{ getAchievement(rep.id).toFixed(1) }}% attained</span>
                     <span class="text-slate-500">Target: 100%</span>
                  </div>
               </div>
            </div>

            <div class="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
               
              <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
                 <lucide-icon name="calculator" class="text-emerald-400"></lucide-icon> Estimated Payout
              </h3>

              <div class="space-y-6 relative z-10">
                 <div class="flex justify-between items-end border-b border-white/10 pb-4">
                    <span class="text-slate-400 text-sm">Base Commission (Tier 1)</span>
                    <span class="font-mono font-bold">{{ calculateCommission(rep.id).base | inr }}</span>
                 </div>
                 <div class="flex justify-between items-end border-b border-white/10 pb-4">
                    <span class="text-slate-400 text-sm">Accelerator Bonus (Tier 2)</span>
                    <span class="font-mono font-bold text-emerald-400">+ {{ calculateCommission(rep.id).bonus | inr }}</span>
                 </div>
                 <div class="pt-2">
                    <span class="text-slate-400 text-xs uppercase tracking-widest">Total Earnings</span>
                    <div class="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                       {{ calculateCommission(rep.id).total | inr }}
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

    getRepRevenue(repId: string) {
        const deals = this.salesService.deals();
        return deals
            .filter(d => d.assignedRepId === repId && d.stage === DealStage.CLOSED_WON)
            .reduce((acc, d) => acc + d.value, 0);
    }

    getAchievement(repId: string) {
        const revenue = this.getRepRevenue(repId);
        const rep = this.salesService.reps().find(r => r.id === repId);
        return rep ? (revenue / rep.quota) * 100 : 0;
    }

    updateQuota(repId: string, quota: number) {
        if (!this.authService.isAdmin()) return;
        this.salesService.updateRepQuota(repId, Number(quota));
    }

    calculateCommission(repId: string) {
        const revenue = this.getRepRevenue(repId);
        const rep = this.salesService.reps().find(r => r.id === repId);
        if (!rep) return { base: 0, bonus: 0, total: 0 };

        const quota = rep.quota;
        let base = 0;
        let bonus = 0;

        if (revenue <= quota) {
            base = revenue * 0.05;
        } else {
            base = quota * 0.05;
            bonus = (revenue - quota) * 0.10;
        }

        return { base, bonus, total: base + bonus };
    }
}
