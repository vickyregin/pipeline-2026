import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarService } from './services/sidebar.service';
import { AddDealModalComponent } from './components/add-deal-modal/add-deal-modal.component';
import { SchemaModalComponent } from './components/schema-modal/schema-modal.component';
import { SalesService } from './services/sales.service';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';
import { DealStage } from './models/types';
import { Deal } from './models/types';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, SidebarComponent, AddDealModalComponent, SchemaModalComponent, LucideAngularModule],
  templateUrl: './app.html'
})
export class App {
  salesService = inject(SalesService);
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  router = inject(Router);

  activeTab = signal('Dashboard');
  isSchemaModalOpen = signal(false);

  openDealsCount = computed(() => {
    return this.salesService.deals()
      .filter(d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST)
      .length;
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      if (url.includes('dashboard')) this.activeTab.set('Dashboard');
      else if (url.includes('pipeline')) this.activeTab.set('Pipeline');
      else if (url.includes('customers')) this.activeTab.set('Customers');
      else if (url.includes('incentives')) this.activeTab.set('Incentives');
    });
  }

  handleSaveDeal(dealData: Partial<Deal>) {
    if (dealData.id && !dealData.id.startsWith('temp-')) {
      // Update
      this.salesService.updateDeal(dealData as Deal);
    } else {
      // Create
      this.salesService.addDeal(dealData);
    }
    this.salesService.closeDealModal();
  }

  handleDeleteDeal(dealId: string) {
    this.salesService.deleteDeal(dealId);
    this.salesService.closeDealModal();
  }
}
