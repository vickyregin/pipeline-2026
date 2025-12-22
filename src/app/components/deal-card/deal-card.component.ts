import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal, DealStage } from '../../models/types';
import { LucideAngularModule, Calendar, MoreVertical, Building2, ArrowRight, ArrowLeft, Edit2 } from 'lucide-angular';
import { InrPipe } from '../../pipes/inr.pipe';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, InrPipe, FormsModule],
  template: `
    <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all group relative">
      <div class="flex justify-between items-start mb-2">
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-blue-50 text-blue-600': deal.category === 'Technology',
                'bg-emerald-50 text-emerald-600': deal.category === 'Finance',
                'bg-purple-50 text-purple-600': deal.category === 'Retail',
                'bg-orange-50 text-orange-600': deal.category === 'Manufacturing',
                'bg-slate-50 text-slate-600': deal.category === 'Other'
              }">
          {{ deal.category }}
        </span>
        <div *ngIf="authService.isAdmin()" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button (click)="onEdit.emit(deal)" class="p-1 hover:bg-slate-100 rounded text-slate-500">
             <lucide-icon name="edit-2" [size]="14"></lucide-icon>
           </button>
        </div>
      </div>
      
      <h4 class="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{{ deal.title }}</h4>
      <div class="flex items-center gap-1 text-xs text-slate-500 mb-3">
        <lucide-icon name="building-2" [size]="12"></lucide-icon>
        <span class="truncate">{{ deal.customerName }}</span>
      </div>
      
      <div class="flex justify-between items-end mt-3">
        <div>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Value</p>
          <p class="font-bold text-slate-900">{{ deal.value | inr }}</p>
        </div>
        <div class="text-right">
           <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Prob.</p>
           <p class="font-bold text-sm" [ngClass]="{
             'text-emerald-600': deal.probability > 70,
             'text-blue-600': deal.probability > 40 && deal.probability <= 70,
             'text-slate-500': deal.probability <= 40
           }">{{ deal.probability }}%</p>
        </div>
      </div>

      <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
         <div class="h-full rounded-full transition-all duration-500"
              [ngStyle]="{ width: deal.probability + '%' }"
              [ngClass]="{
                 'bg-emerald-500': deal.probability > 70,
                 'bg-blue-500': deal.probability > 40 && deal.probability <= 70,
                 'bg-slate-400': deal.probability <= 40
              }"></div>
      </div>

      <div class="flex justify-between mt-3 pt-3 border-t border-slate-100">
         <button (click)="move('prev')" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" 
            [disabled]="deal.stage === 'lead' || !authService.isAdmin()" title="Previous Stage"
            [ngClass]="{'opacity-30 cursor-not-allowed': !authService.isAdmin()}">
             <lucide-icon name="arrow-left" [size]="14"></lucide-icon>
         </button>
         <span class="text-[10px] text-slate-400 font-mono self-center">{{ deal.closeDate | date:'MMM d' }}</span>
         <button (click)="move('next')" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" 
            [disabled]="deal.stage === 'closed_won' || deal.stage === 'closed_lost' || !authService.isAdmin()" title="Next Stage"
            [ngClass]="{'opacity-30 cursor-not-allowed': !authService.isAdmin()}">
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
    if (!this.authService.isAdmin()) return;
    this.onMoveStage.emit({ dealId: this.deal.id, direction });
  }
}
