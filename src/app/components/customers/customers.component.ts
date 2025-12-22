import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { DealStage, DealCategory, BusinessType, Deal } from '../../models/types';
import { InrPipe } from '../../pipes/inr.pipe';

const ITEMS_PER_PAGE = 8;

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, InrPipe],
    template: `
    <div class="flex flex-col h-full animate-in zoom-in-95 duration-500 p-8">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div class="p-6 border-b border-slate-200 flex flex-col gap-4">
          <div class="flex justify-between items-center">
             <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Customer Registry & Projected Yields</h3>
             <span class="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">
               Showing {{ paginatedDeals().length }} of {{ filteredDeals().length }} Customers
             </span>
          </div>
          <div class="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div class="relative flex-1 w-full lg:w-auto">
              <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" [size]="14"></lucide-icon>
              <input type="text" placeholder="Search accounts..." [(ngModel)]="searchTerm" 
                 class="pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none w-full bg-white shadow-sm" />
            </div>
            <div class="flex gap-2">
               <select [(ngModel)]="stageFilter" class="px-2 py-1.5 text-xs border border-slate-200 rounded-md outline-none bg-white font-medium text-slate-500">
                  <option value="all">Any Stage</option>
                  <option *ngFor="let s of stages" [value]="s">{{ s }}</option>
                </select>
                <select [(ngModel)]="categoryFilter" class="px-2 py-1.5 text-xs border border-slate-200 rounded-md outline-none bg-white font-medium text-slate-500">
                  <option value="all">Any Sector</option>
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
                <select [(ngModel)]="repFilter" class="px-2 py-1.5 text-xs border border-slate-200 rounded-md outline-none bg-white font-medium text-slate-500">
                  <option value="all">Any Owner</option>
                  <option *ngFor="let r of salesService.reps()" [value]="r.id">{{ r.name }}</option>
                </select>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sector</th>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Value</th>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Prob.</th>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Proj. Vol</th>
                <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let deal of paginatedDeals()" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{{ deal.customerName }}</div>
                  <div class="text-[10px] text-slate-400 font-semibold uppercase">{{ deal.title }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded"
                        [ngClass]="deal.businessType === businessType.NEW ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-500 border border-slate-200'">
                    {{ deal.businessType === businessType.NEW ? 'New' : 'Existing' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-tighter">
                     {{ deal.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right font-medium text-slate-700 text-sm">{{ deal.value | inr }}</td>
                <td class="px-6 py-4 text-right text-slate-600 text-sm">{{ deal.probability }}%</td>
                <td class="px-6 py-4 text-right font-bold text-slate-900 text-sm">{{ (deal.value * (deal.probability / 100)) | inr }}</td>
                <td class="px-6 py-4 text-center">
                   <button *ngIf="authService.isAdmin()" (click)="handleEditDeal(deal)" class="text-blue-600 hover:text-blue-800 text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors">Review</button>
                   <span *ngIf="!authService.isAdmin()" class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Locked</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="paginatedDeals().length === 0" class="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <lucide-icon name="filter" [size]="48" class="text-slate-200"></lucide-icon>
            <p class="text-sm font-medium">No customers found matching these criteria.</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
           <div class="text-xs text-slate-500 font-medium">
             Page {{ page() }} of {{ max(1, totalPages()) }}
           </div>
           <div class="flex items-center gap-1">
              <button [disabled]="page() === 1" (click)="setPage(page() - 1)" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600">
                <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
              </button>
              
              <button *ngFor="let p of pages()" (click)="setPage(p)" 
                class="w-8 h-8 rounded-md text-xs font-bold transition-all"
                [ngClass]="page() === p ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'hover:bg-slate-100 text-slate-500'">
                {{ p }}
              </button>

              <button [disabled]="page() >= totalPages()" (click)="setPage(page() + 1)" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600">
                <lucide-icon name="chevron-right" [size]="18"></lucide-icon>
              </button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class CustomersComponent {
    salesService = inject(SalesService);
    authService = inject(AuthService);

    searchTerm = signal('');
    stageFilter = signal('all');
    categoryFilter = signal('all');
    repFilter = signal('all');
    page = signal(1);

    stages = Object.values(DealStage);
    categories = Object.values(DealCategory);
    businessType = BusinessType;
    max = Math.max;

    filteredDeals = computed(() => {
        const deals = this.salesService.deals();
        const term = this.searchTerm().toLowerCase();
        const stage = this.stageFilter();
        const cat = this.categoryFilter();
        const rep = this.repFilter();

        return deals.filter(deal => {
            const matchesSearch = (
                deal.customerName.toLowerCase().includes(term) ||
                deal.title.toLowerCase().includes(term) ||
                deal.category.toLowerCase().includes(term)
            );
            const matchesStage = stage === 'all' || deal.stage === stage;
            const matchesCategory = cat === 'all' || deal.category === cat;
            const matchesRep = rep === 'all' || deal.assignedRepId === rep;
            return matchesSearch && matchesStage && matchesCategory && matchesRep;
        }).sort((a, b) => b.value - a.value);
    });

    paginatedDeals = computed(() => {
        const filtered = this.filteredDeals();
        const startIndex = (this.page() - 1) * ITEMS_PER_PAGE;
        return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    });

    totalPages = computed(() => Math.ceil(this.filteredDeals().length / ITEMS_PER_PAGE));

    pages = computed(() => {
        return Array.from({ length: Math.max(1, this.totalPages()) }, (_, i) => i + 1);
    });

    setPage(p: number) {
        this.page.set(p);
    }

    handleEditDeal(deal: Deal) {
        this.salesService.openDealModal(deal);
    }
}
