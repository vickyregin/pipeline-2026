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
    <div class="h-full flex flex-col animate-in slide-in-from-right duration-500">
      <div class="bg-white border-b border-slate-200 px-6 py-3 flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div class="relative flex-1 w-full lg:w-auto">
            <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" [size]="16"></lucide-icon>
            <input type="text" placeholder="Filter pipeline deals..." [(ngModel)]="searchTerm" 
               class="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-slate-50" />
          </div>
          <div class="flex flex-wrap gap-2 w-full lg:w-auto">
              <select [(ngModel)]="categoryFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-600">
                <option value="all">All Sectors</option>
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
              <select [(ngModel)]="repFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-600">
                <option value="all">All Owners</option>
                <option *ngFor="let r of salesService.reps()" [value]="r.id">{{ r.name }}</option>
              </select>
          </div>
      </div>

      <div class="flex-1 overflow-x-auto p-4">
        <div class="flex gap-4 min-w-max h-full">
          <div *ngFor="let stage of stageConfig" class="w-80 flex flex-col bg-slate-100 rounded-xl max-h-full border border-slate-200">
            <div class="p-4 border-b border-slate-200 rounded-t-xl sticky top-0 bg-slate-100/90 backdrop-blur-sm z-10 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" [ngClass]="stage.color"></div>
                <h3 class="font-bold text-xs uppercase tracking-widest text-slate-600">{{ stage.label }}</h3>
              </div>
              <span class="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-sm">
                {{ getDealsInStage(stage.id).length }}
              </span>
            </div>
            
            <div class="p-3 space-y-3 overflow-y-auto scrollbar-hide flex-1">
              <app-deal-card *ngFor="let deal of getDealsInStage(stage.id)" 
                  [deal]="deal" 
                  (onMoveStage)="handleMoveStage($event)" 
                  (onEdit)="handleEditDeal($event)">
              </app-deal-card>
            </div>
            
            <div class="p-3 bg-white/50 border-t border-slate-200 rounded-b-xl">
               <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                 Total {{ getTotalValue(stage.id) | inr }}
               </p>
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

    getDealsInStage(stageId: string) {
        return this.filteredDeals().filter(d => d.stage === stageId);
    }

    getTotalValue(stageId: string) {
        return this.getDealsInStage(stageId).reduce((acc, d) => acc + d.value, 0);
    }

    handleMoveStage(event: { dealId: string, direction: 'next' | 'prev' }) {
        if (!this.authService.isAdmin()) return;
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
        if (!this.authService.isAdmin()) return;
        this.salesService.openDealModal(deal);
    }
}
