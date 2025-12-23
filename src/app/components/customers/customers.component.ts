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
    <div class="flex flex-col h-full animate-in zoom-in-95 duration-700 p-4 md:p-8 space-y-4 md:space-y-6">
      
      <!-- Explorer Header -->
      <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 p-4 md:p-8">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
           <div class="flex flex-col">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Entity Intelligence</span>
              <h1 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Account Registry & Yields</h1>
           </div>
           
           <div class="bg-slate-50 p-1.5 md:p-2 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-2 w-full lg:w-auto">
              <div class="relative w-full md:w-64">
                <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" [size]="14"></lucide-icon>
                <input type="text" placeholder="Filter entities..." [(ngModel)]="searchTerm" 
                   class="pl-9 pr-4 py-2 text-xs border-none rounded-xl outline-none w-full bg-white shadow-sm font-bold placeholder:font-medium placeholder:text-slate-400" />
              </div>
              
              <div class="flex gap-2 w-full md:w-auto">
                 <select [(ngModel)]="stageFilter" class="flex-1 md:flex-none px-4 py-2 text-xs border border-slate-100 rounded-xl outline-none bg-white font-black text-slate-800 cursor-pointer shadow-sm">
                    <option value="all">Global Stages</option>
                    <option *ngFor="let s of stages" [value]="s">{{ s }}</option>
                  </select>
                  <select [(ngModel)]="categoryFilter" class="flex-1 md:flex-none px-4 py-2 text-xs border border-slate-100 rounded-xl outline-none bg-white font-black text-slate-800 cursor-pointer shadow-sm">
                    <option value="all">Direct Sectors</option>
                    <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  </select>
              </div>
           </div>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1">
        <div class="flex-1 overflow-auto">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead class="sticky top-0 z-10">
              <tr class="bg-slate-50/80 backdrop-blur-md">
                <th class="px-4 md:px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer Entity</th>
                <th class="hidden sm:table-cell px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">DNA</th>
                <th class="hidden md:table-cell px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Classification</th>
                <th class="px-4 md:px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-100">Market Value</th>
                <th class="hidden lg:table-cell px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-100">Probability</th>
                <th class="hidden xl:table-cell px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-100">Projected Yield</th>
                <th class="px-4 md:px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">Ops</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let deal of paginatedDeals()" class="hover:bg-blue-50/20 transition-all group">
                <td class="px-4 md:px-8 py-5">
                   <div class="font-black text-slate-900 text-xs md:text-sm group-hover:text-blue-600 transition-colors">{{ deal.customerName }}</div>
                   <div class="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ deal.title }}</div>
                </td>
                <td class="hidden sm:table-cell px-8 py-5">
                   <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shadow-sm inline-block"
                         [ngClass]="deal.businessType === businessType.NEW ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-400 border-slate-200'">
                     {{ deal.businessType === businessType.NEW ? 'New Ops' : 'Existing' }}
                   </span>
                </td>
                <td class="hidden md:table-cell px-8 py-5">
                   <span class="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest shadow-sm">
                      {{ deal.category }}
                   </span>
                </td>
                <td class="px-4 md:px-8 py-5 text-right font-black text-slate-700 text-xs md:text-sm tabular-nums">{{ deal.value | inr }}</td>
                <td class="hidden lg:table-cell px-8 py-5 text-right">
                    <div class="flex items-center justify-end gap-2">
                       <div class="w-1.5 h-1.5 rounded-full" [ngClass]="deal.probability > 70 ? 'bg-emerald-500' : deal.probability > 40 ? 'bg-blue-500' : 'bg-amber-500'"></div>
                       <span class="text-xs font-black text-slate-600">{{ deal.probability }}%</span>
                    </div>
                </td>
                <td class="hidden xl:table-cell px-8 py-5 text-right font-black text-slate-900 text-sm tabular-nums">{{ (deal.value * (deal.probability / 100)) | inr }}</td>
                <td class="px-4 md:px-8 py-5 text-center">
                   <button *ngIf="authService.isAuthenticated" (click)="handleEditDeal(deal)" 
                      class="text-blue-600 hover:text-white text-[9px] font-black uppercase tracking-widest px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 hover:bg-blue-600 rounded-xl border border-blue-100 transition-all active:scale-95">Review</button>
                   <div *ngIf="!authService.isAuthenticated" class="flex flex-col items-center">
                      <lucide-icon name="lock" [size]="14" class="text-slate-200"></lucide-icon>
                      <span class="text-[8px] font-black text-slate-300 uppercase mt-1">Locked</span>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="paginatedDeals().length === 0" class="flex flex-col items-center justify-center py-32 text-slate-400 gap-6">
            <div class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
               <lucide-icon name="filter" [size]="48" class="text-slate-200"></lucide-icon>
            </div>
            <p class="text-[11px] font-black uppercase tracking-[0.2em]">Zero Entity Matched</p>
          </div>
        </div>

        <!-- Pagination Cockpit -->
        <div class="p-4 md:p-6 bg-slate-50 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest order-2 sm:order-1">
             Batch {{ page() }} / {{ max(1, totalPages()) }}
           </div>
           <div class="flex items-center gap-2 order-1 sm:order-2">
              <button [disabled]="page() === 1" (click)="setPage(page() - 1)" 
                class="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all text-slate-600 shadow-sm active:scale-90">
                <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
              </button>
              
              <div class="flex items-center gap-1 md:gap-1.5 px-1 md:px-2">
                <button *ngFor="let p of pages()" (click)="setPage(p)" 
                  class="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl text-[10px] font-black transition-all border"
                  [ngClass]="page() === p ? 'bg-slate-950 text-white border-slate-950 shadow-lg' : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-100'"
                  [class.hidden]="totalPages() > 5 && (p < page() - 1 || p > page() + 1) && p !== 1 && p !== totalPages()">
                  {{ p }}
                </button>
                <span *ngIf="totalPages() > 5 && page() > 3" class="text-slate-300 px-1 hidden sm:inline">...</span>
              </div>

              <button [disabled]="page() >= totalPages()" (click)="setPage(page() + 1)" 
                class="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all text-slate-600 shadow-sm active:scale-90">
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
