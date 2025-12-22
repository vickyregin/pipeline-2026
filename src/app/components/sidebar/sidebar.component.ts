import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Kanban, Users, TrendingUp, Activity, Database, Zap, Table2 } from 'lucide-angular';
import { SalesService } from '../../services/sales.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <aside class="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-full">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <lucide-icon name="trending-up" class="text-blue-500"></lucide-icon> SalesFlow
        </h1>
        <button (click)="openSchema.emit()" class="text-[10px] font-mono mt-1 flex items-center gap-1 hover:underline cursor-pointer"
           [ngClass]="(salesService.isLiveMode()) ? 'text-emerald-400' : 'text-amber-400'">
           <lucide-icon name="database" [size]="10"></lucide-icon> 
           {{ (salesService.isLiveMode()) ? "Live Sync Enabled" : "Mock Mode (Click Setup)" }}
        </button>
      </div>
      
      <nav class="flex-1 px-4 space-y-1">
        <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
           class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-800 hover:text-white mb-1">
           <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon> Dashboard
        </a>
        <a routerLink="/pipeline" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
           class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-800 hover:text-white mb-1">
           <lucide-icon name="kanban" [size]="18"></lucide-icon> Pipeline
        </a>
        <a routerLink="/customers" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
           class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-800 hover:text-white mb-1">
           <lucide-icon name="table-2" [size]="18"></lucide-icon> Customers
        </a>
        <a routerLink="/incentives" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
           class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-800 hover:text-white mb-1">
           <lucide-icon name="users" [size]="18"></lucide-icon> Incentives
        </a>
      </nav>

      <div class="p-4 border-t border-slate-800">
         <div class="bg-slate-800/50 rounded-lg p-3 border transition-colors"
             [ngClass]="salesService.isLiveMode() ? 'border-emerald-500/30' : 'border-slate-700'">
           <div class="flex items-center justify-between mb-2">
             <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Engine</span>
             <button (click)="salesService.toggleLiveMode()" 
                class="relative inline-flex h-4 w-8 items-center rounded-full transition-colors"
                [ngClass]="salesService.isLiveMode() ? 'bg-emerald-500' : 'bg-slate-600'">
               <span class="inline-block h-2 w-2 transform rounded-full bg-white transition-transform"
                     [ngClass]="salesService.isLiveMode() ? 'translate-x-5' : 'translate-x-1'"></span>
             </button>
           </div>
           <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-[11px]">
                <lucide-icon name="activity" [size]="12" 
                   [class]="salesService.isLiveMode() ? 'text-emerald-400 animate-pulse-subtle' : 'text-slate-500'"></lucide-icon>
                <span [class]="salesService.isLiveMode() ? 'text-emerald-400 font-medium' : 'text-slate-500'">
                  {{ salesService.isLiveMode() ? "Active" : "Paused" }}
                </span>
              </div>
              <button *ngIf="salesService.isLiveMode()" (click)="triggerPulse()" class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="Force Data Pulse">
                <lucide-icon name="zap" [size]="12"></lucide-icon>
              </button>
           </div>
         </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
    @Output() openSchema = new EventEmitter<void>();

    constructor(public salesService: SalesService) { }

    triggerPulse() {
        this.salesService.triggerPulse();
    }
}
