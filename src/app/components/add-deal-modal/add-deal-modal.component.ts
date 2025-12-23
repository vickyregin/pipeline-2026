import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deal, DealStage, DealCategory, BusinessType, SalesRep } from '../../models/types';
import { LucideAngularModule } from 'lucide-angular';
import { SalesService } from '../../services/sales.service';

@Component({
   selector: 'app-add-deal-modal',
   standalone: true,
   imports: [CommonModule, FormsModule, LucideAngularModule],
   template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 class="text-lg font-bold text-slate-800">{{ isEditing ? 'Edit Deal' : 'New Deal' }}</h3>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <form (ngSubmit)="submit()" class="p-6 space-y-4">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deal Title</label>
              <input type="text" [(ngModel)]="formData.title" name="title" required class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="e.g. Enterprise License Q4">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Customer</label>
                <input type="text" [(ngModel)]="formData.customerName" name="customerName" required class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="Company Name">
              </div>
              <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Value (INR)</label>
                 <input type="number" [(ngModel)]="formData.value" name="value" required class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="0">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stage</label>
                  <select [(ngModel)]="formData.stage" name="stage" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white">
                     <option *ngFor="let s of stages" [value]="s">{{ s }}</option>
                  </select>
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Probability (%)</label>
                  <input type="number" [(ngModel)]="formData.probability" name="probability" min="0" max="100" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
               </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select [(ngModel)]="formData.category" name="category" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white">
                     <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  </select>
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Type</label>
                  <select [(ngModel)]="formData.businessType" name="businessType" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white">
                     <option [value]="businessTypes.NEW">New Business</option>
                     <option [value]="businessTypes.EXISTING">Existing Business</option>
                  </select>
               </div>
            </div>

            <div>
               <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Assigned Rep</label>
               <select [(ngModel)]="formData.assignedRepId" name="assignedRepId" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white">
                  <option *ngFor="let r of salesService.reps()" [value]="r.id">{{ r.name }}</option>
               </select>
            </div>
             
            <div>
               <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
               <textarea [(ngModel)]="formData.notes" name="notes" rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"></textarea>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-between border-t border-slate-100 mt-6">
            <button *ngIf="isEditing" type="button" (click)="delete.emit(formData.id)" class="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
               <lucide-icon name="trash-2" [size]="16"></lucide-icon> Delete
            </button>
            <div class="flex gap-3 ml-auto">
               <button type="button" (click)="close.emit()" class="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
               <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">Save Deal</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddDealModalComponent {
   @Input() deal: Deal | null = null;
   @Output() close = new EventEmitter<void>();
   @Output() save = new EventEmitter<Partial<Deal>>();
   @Output() delete = new EventEmitter<string>();

   salesService = inject(SalesService); // to get reps

   formData: Partial<Deal> = {
      title: '',
      customerName: '',
      value: 0,
      stage: DealStage.LEAD,
      probability: 20,
      category: DealCategory.TECHNOLOGY,
      businessType: BusinessType.NEW,
      notes: '',
      assignedRepId: ''
   };

   stages = Object.values(DealStage);
   categories = Object.values(DealCategory);
   businessTypes = BusinessType;

   get isEditing() {
      return !!this.deal;
   }

   ngOnChanges() {
      if (this.deal) {
         this.formData = { ...this.deal };
      } else {
         // Reset or Default
         this.formData = {
            title: '',
            customerName: '',
            value: 0,
            stage: DealStage.LEAD,
            probability: 20,
            category: DealCategory.TECHNOLOGY,
            businessType: BusinessType.NEW,
            notes: '',
            assignedRepId: this.salesService.reps()[0]?.id || ''
         };
      }
   }

   submit() {
      this.save.emit(this.formData);
   }
}
