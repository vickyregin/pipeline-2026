import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SalesService } from '../../services/sales.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Mobile Overlay -->
    <div *ngIf="sidebarService.isOpen()" 
         (click)="sidebarService.close()"
         class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300">
    </div>

    <aside [class.translate-x-0]="sidebarService.isOpen()" 
           [class.-translate-x-full]="!sidebarService.isOpen()"
           class="fixed inset-y-0 left-0 w-72 bg-[#303030] text-slate-300 flex-shrink-0 flex flex-col h-full border-r border-white/5 shadow-2xl z-50 overflow-hidden transition-transform duration-300 lg:translate-x-0 lg:static">
      
      <!-- Background Decorative Blobs -->
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-[#CA3436]/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div class="p-8 relative z-10">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-tr from-[#CA3436] to-red-500 rounded-xl shadow-lg shadow-red-500/20">
              <lucide-icon name="trending-up" class="text-white" [size]="24"></lucide-icon>
            </div>
            <h1 class="text-xl font-black text-white tracking-tight uppercase italic">Pipeline<span class="text-[#CA3436]">2026</span></h1>
          </div>
          <button (click)="sidebarService.close()" class="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <lucide-icon name="x" [size]="24"></lucide-icon>
          </button>
        </div>
        
        <button (click)="onOpenSchema()" 
           class="group flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border mt-4 w-full"
           [ngClass]="(salesService.isLiveMode()) ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20 hover:bg-amber-500/10'">
           <div class="w-1.5 h-1.5 rounded-full" [ngClass]="salesService.isLiveMode() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"></div>
           {{ (salesService.isLiveMode()) ? "LIVE SYNC ACTIVE" : "MOCK ENGINE DETECTED" }}
           <lucide-icon name="database" [size]="10" class="ml-auto opacity-40 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </button>
      </div>
      
      <nav class="flex-1 px-4 space-y-2 mt-4 relative z-10">
        <a routerLink="/dashboard" routerLinkActive="active-nav" (click)="sidebarService.close()"
           class="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:bg-white/5 hover:text-white relative overflow-hidden text-slate-400">
           <lucide-icon name="layout-dashboard" [size]="20" class="relative z-10 opacity-70 group-[.active-nav]:opacity-100 transition-opacity"></lucide-icon> 
           <span class="font-bold text-sm tracking-wide relative z-10">Market Insights</span>
           <div class="absolute inset-0 bg-gradient-to-r from-[#CA3436] to-red-500 opacity-0 group-[.active-nav]:opacity-100 transition-opacity"></div>
        </a>

        <a routerLink="/pipeline" routerLinkActive="active-nav" (click)="sidebarService.close()"
           class="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:bg-white/5 hover:text-white relative overflow-hidden text-slate-400">
           <lucide-icon name="kanban" [size]="20" class="relative z-10 opacity-70 group-[.active-nav]:opacity-100 transition-opacity"></lucide-icon> 
           <span class="font-bold text-sm tracking-wide relative z-10">Sales Pipeline</span>
           <div class="absolute inset-0 bg-gradient-to-r from-[#CA3436] to-red-500 opacity-0 group-[.active-nav]:opacity-100 transition-opacity"></div>
        </a>

        <a routerLink="/customers" routerLinkActive="active-nav" (click)="sidebarService.close()"
           class="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:bg-white/5 hover:text-white relative overflow-hidden text-slate-400">
           <lucide-icon name="table-2" [size]="20" class="relative z-10 opacity-70 group-[.active-nav]:opacity-100 transition-opacity"></lucide-icon> 
           <span class="font-bold text-sm tracking-wide relative z-10">Account Registry</span>
           <div class="absolute inset-0 bg-gradient-to-r from-[#CA3436] to-red-500 opacity-0 group-[.active-nav]:opacity-100 transition-opacity"></div>
        </a>

        <a routerLink="/incentives" routerLinkActive="active-nav" (click)="sidebarService.close()"
           class="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:bg-white/5 hover:text-white relative overflow-hidden text-slate-400">
           <lucide-icon name="users" [size]="20" class="relative z-10 opacity-70 group-[.active-nav]:opacity-100 transition-opacity"></lucide-icon> 
           <span class="font-bold text-sm tracking-wide relative z-10">Performance IQ</span>
           <div class="absolute inset-0 bg-gradient-to-r from-[#CA3436] to-red-500 opacity-0 group-[.active-nav]:opacity-100 transition-opacity"></div>
        </a>
      </nav>

      <div class="p-6 relative z-10 mt-auto">
         <div class="bg-white/5 rounded-3xl p-5 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
           <div class="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
           
           <div class="flex items-center justify-between mb-4">
             <div class="flex flex-col">
               <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
               <span class="text-xs font-bold" [ngClass]="salesService.isLiveMode() ? 'text-emerald-400' : 'text-slate-400'">
                 {{ salesService.isLiveMode() ? "Real-time Sync" : "Engine Standby" }}
               </span>
             </div>
             <button (click)="salesService.toggleLiveMode()" 
                class="relative inline-flex h-5 w-10 items-center rounded-full transition-all ring-2 ring-white/5"
                [ngClass]="salesService.isLiveMode() ? 'bg-[#CA3436]' : 'bg-slate-700'">
               <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                     [ngClass]="salesService.isLiveMode() ? 'translate-x-6' : 'translate-x-1'"></span>
             </button>
           </div>
           
           <div class="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" [ngClass]="salesService.isLiveMode() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'"></div>
                <span class="text-[10px] font-bold text-slate-500 uppercase">Latency 12ms</span>
              </div>
              <button *ngIf="salesService.isLiveMode()" (click)="triggerPulse()" 
                      class="flex items-center justify-center p-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/0 hover:shadow-blue-500/20" title="Manual Pulse">
                <lucide-icon name="zap" [size]="14"></lucide-icon>
              </button>
           </div>
         </div>
      </div>
    </aside>

    <style>
      .active-nav {
         color: white !important;
         box-shadow: 0 10px 15px -3px rgba(202, 52, 54, 0.2);
         transform: translateX(4px);
      }
      .active-nav lucide-icon {
         opacity: 1 !important;
      }
    </style>
  `
})
export class SidebarComponent {
  @Output() openSchema = new EventEmitter<void>();
  salesService = inject(SalesService);
  sidebarService = inject(SidebarService);

  onOpenSchema() {
    this.openSchema.emit();
    this.sidebarService.close();
  }

  triggerPulse() {
    this.salesService.triggerPulse();
  }
}
