import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal, DealStage } from '../../models/types';
import { LucideAngularModule } from 'lucide-angular';
import { InrPipe } from '../../pipes/inr.pipe';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, InrPipe, FormsModule],
  template: `
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      <!-- Top Accent Line -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity"
           [ngClass]="{
             'from-blue-500 to-indigo-600': deal.category === 'Technology',
             'from-emerald-400 to-emerald-600': deal.category === 'Finance',
             'from-purple-500 to-indigo-500': deal.category === 'Retail',
             'from-orange-400 to-red-500': deal.category === 'Manufacturing',
             'from-slate-400 to-slate-600': deal.category === 'Other'
           }"></div>

      <div class="flex justify-between items-start mb-3">
        <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border"
              [ngClass]="{
                'bg-blue-50 text-blue-600 border-blue-100': deal.category === 'Technology',
                'bg-emerald-50 text-emerald-600 border-emerald-100': deal.category === 'Finance',
                'bg-purple-50 text-purple-600 border-purple-100': deal.category === 'Retail',
                'bg-orange-50 text-orange-600 border-orange-100': deal.category === 'Manufacturing',
                'bg-slate-50 text-slate-500 border-slate-200': deal.category === 'Other'
              }">
          {{ deal.category }}
        </span>
        
        <div *ngIf="authService.isAuthenticated" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
           <button (click)="onEdit.emit(deal)" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
             <lucide-icon name="edit-2" [size]="14"></lucide-icon>
           </button>
        </div>
      </div>
      
      <h4 class="font-bold text-slate-900 text-sm mb-1 line-clamp-1 leading-tight">{{ deal.title }}</h4>
      <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-4">
        <lucide-icon name="building-2" [size]="12"></lucide-icon>
        <span class="truncate">{{ deal.customerName }}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-auto">
        <div>
          <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Yield Value</p>
          <p class="font-black text-slate-900 text-sm">{{ deal.value | inr }}</p>
        </div>
        <div class="text-right">
           <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Confidence</p>
           <p class="font-black text-sm" [ngClass]="{
             'text-emerald-500': deal.probability > 70,
             'text-blue-500': deal.probability > 40 && deal.probability <= 70,
             'text-amber-500': deal.probability <= 40
           }">{{ deal.probability }}%</p>
        </div>
      </div>

      <!-- Probability Bar -->
      <div class="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
         <div class="h-full rounded-full transition-all duration-1000"
              [ngStyle]="{ width: deal.probability + '%' }"
              [ngClass]="{
                 'bg-emerald-500': deal.probability > 70,
                 'bg-blue-500': deal.probability > 40 && deal.probability <= 70,
                 'bg-amber-500': deal.probability <= 40
              }"></div>
      </div>

      <!-- Controls -->
      <div class="flex justify-between items-center mt-5 pt-4 border-t border-slate-50">
         <button (click)="move('prev')" 
            class="flex items-center justify-center w-8 h-8 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-slate-600 transition-all disabled:opacity-0" 
            [disabled]="deal.stage === 'lead' || !authService.isAuthenticated" title="Previous Stage">
             <lucide-icon name="arrow-left" [size]="14"></lucide-icon>
         </button>
         
         <div class="flex flex-col items-center">
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Est. Close</span>
            <span class="text-[10px] font-bold text-slate-500 mt-1">{{ deal.closeDate | date:'MMM d, y' }}</span>
         </div>

         <button (click)="move('next')" 
            class="flex items-center justify-center w-8 h-8 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-slate-600 transition-all disabled:opacity-0" 
            [disabled]="deal.stage === 'closed_won' || deal.stage === 'closed_lost' || !authService.isAuthenticated" title="Next Stage">
             <lucide-icon name="arrow-right" [size]="14"></lucide-icon>
         </button>
      </div>
    </div>
  `
})
export class DealCardComponent {
  authService = inject(AuthService);
  @Input() deal!: Deal;
  @Output() onMoveStage = new EventEmitter<{ dealId: string, direction: 'next' | 'prev' }>();
  @Output() onEdit = new EventEmitter<Deal>();

  move(direction: 'next' | 'prev') {
    if (!this.authService.isAuthenticated) return;
    this.onMoveStage.emit({ dealId: this.deal.id, direction });
  }
}
