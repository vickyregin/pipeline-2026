import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { DealCardComponent } from '../deal-card/deal-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { STAGE_CONFIG } from '../../models/constants';
import { DealCategory, Deal, DealStage } from '../../models/types';
import { InrPipe } from '../../pipes/inr.pipe';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DealCardComponent, InrPipe],
  template: `
    <div class="h-full flex flex-col animate-in slide-in-from-right duration-700 relative">
      <!-- Top Intelligence Bar -->
      <div class="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3 md:py-4 flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center relative z-20 shadow-sm">
          <div class="relative flex-1 w-full lg:w-96 group">
            <lucide-icon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" [size]="16"></lucide-icon>
            <input type="text" placeholder="Search operational deals..." [(ngModel)]="searchTerm" 
               class="pl-12 pr-4 py-2.5 text-xs border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none w-full bg-slate-50 transition-all font-bold placeholder:font-medium placeholder:text-slate-400" />
          </div>
          
          <div class="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
              <div class="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-slate-50 rounded-2xl border border-slate-100 flex-1 md:flex-none">
                <span class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Sector</span>
                <select [(ngModel)]="categoryFilter" class="px-2 md:px-3 py-2 text-xs border-none rounded-xl outline-none bg-transparent focus:ring-0 transition-all font-black text-slate-900 cursor-pointer w-full md:w-auto">
                  <option value="all">Global Mix</option>
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
              </div>

              <div class="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-slate-50 rounded-2xl border border-slate-100 flex-1 md:flex-none">
                <span class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Owner</span>
                <select [(ngModel)]="repFilter" class="px-2 md:px-3 py-2 text-xs border-none rounded-xl outline-none bg-transparent focus:ring-0 transition-all font-black text-slate-900 cursor-pointer w-full md:w-auto">
                  <option value="all">Full Corps</option>
                  <option *ngFor="let r of salesService.reps()" [value]="r.id">{{ r.name }}</option>
                </select>
              </div>
          </div>

          <div class="ml-auto hidden xl:flex items-center gap-4 border-l border-slate-100 pl-6">
             <div class="flex flex-col items-end">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Capital</span>
                <span class="text-sm font-black text-slate-900">{{ getTotalPipeline() | inr }}</span>
             </div>
             <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <lucide-icon name="activity" [size]="18"></lucide-icon>
             </div>
          </div>
      </div>

      <!-- KANBAN CORE -->
      <div class="flex-1 overflow-x-auto p-4 md:p-8 relative z-10 bg-slate-50/30">
        <div class="flex gap-4 md:gap-8 min-w-max h-full">
          <div *ngFor="let stage of stageConfig" 
               class="w-[18rem] md:w-[22rem] flex flex-col bg-white/40 rounded-[2rem] md:rounded-[2.5rem] max-h-full border border-white p-2 md:p-3 group/stage hover:bg-white/60 transition-colors">
            
            <div class="p-5 flex justify-between items-center mb-2">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm" [ngClass]="stage.color"></div>
                <h3 class="font-black text-[11px] uppercase tracking-[0.2em] text-slate-500 group-hover/stage:text-slate-900 transition-colors">{{ stage.label }}</h3>
              </div>
              <div class="flex items-center gap-2">
                 <span class="text-[10px] font-black text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                   {{ getDealsInStage(stage.id).length }}
                 </span>
              </div>
            </div>
            
            <div class="px-2 pb-4 space-y-4 overflow-y-auto scrollbar-hide flex-1">
              <app-deal-card *ngFor="let deal of getDealsInStage(stage.id)" 
                  [deal]="deal" 
                  (onMoveStage)="handleMoveStage($event)" 
                  (onEdit)="handleEditDeal($event)"
                  class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              </app-deal-card>

              <!-- Empty State in Stage -->
              <div *ngIf="getDealsInStage(stage.id).length === 0" class="flex flex-col items-center justify-center py-20 opacity-20 group-hover/stage:opacity-40 transition-opacity pointer-events-none">
                 <lucide-icon [name]="'sparkles'" [size]="32" class="mb-2 text-slate-400"></lucide-icon>
                 <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero Load</span>
              </div>
            </div>
            
            <div class="p-5 mt-auto bg-white/80 rounded-[2rem] border border-slate-50 shadow-sm mx-1 mb-1">
               <div class="flex justify-between items-center">
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stage Value</span>
                  <span class="text-xs font-black text-slate-800">{{ getTotalValue(stage.id) | inr }}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PipelineComponent {
  salesService = inject(SalesService);
  authService = inject(AuthService);

  searchTerm = signal('');
  categoryFilter = signal('all');
  repFilter = signal('all');

  stageConfig = STAGE_CONFIG;
  categories = Object.values(DealCategory);

  filteredDeals = computed(() => {
    const deals = this.salesService.deals();
    const term = this.searchTerm().toLowerCase();
    const cat = this.categoryFilter();
    const rep = this.repFilter();

    return deals.filter(deal => {
      const matchesSearch = (
        deal.customerName.toLowerCase().includes(term) ||
        deal.title.toLowerCase().includes(term) ||
        (deal.notes && deal.notes.toLowerCase().includes(term))
      );
      const matchesCategory = cat === 'all' || deal.category === cat;
      const matchesRep = rep === 'all' || deal.assignedRepId === rep;
      return matchesSearch && matchesCategory && matchesRep;
    });
  });

  getTotalPipeline() {
    return this.filteredDeals().reduce((acc, d) => acc + d.value, 0);
  }

  getDealsInStage(stageId: string) {
    return this.filteredDeals().filter(d => d.stage === stageId);
  }

  getTotalValue(stageId: string) {
    return this.getDealsInStage(stageId).reduce((acc, d) => acc + d.value, 0);
  }

  handleMoveStage(event: { dealId: string, direction: 'next' | 'prev' }) {
    if (!this.authService.isAuthenticated) return;
    const deal = this.salesService.deals().find(d => d.id === event.dealId);
    if (!deal) return;

    const stages = Object.values(DealStage);
    const currentIndex = stages.indexOf(deal.stage);
    let newIndex = event.direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0) newIndex = 0;
    if (newIndex >= stages.length) newIndex = stages.length - 1;

    const newStage = stages[newIndex];
    const updatedDeal = { ...deal, stage: newStage, lastUpdated: new Date().toISOString() };

    this.salesService.updateDeal(updatedDeal);
  }

  handleEditDeal(deal: Deal) {
    if (!this.authService.isAuthenticated) return;
    this.salesService.openDealModal(deal);
  }
}
