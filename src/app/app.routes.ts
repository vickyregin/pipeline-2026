import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PipelineComponent } from './components/pipeline/pipeline.component';
import { CustomersComponent } from './components/customers/customers.component';
import { IncentivesComponent } from './components/incentives/incentives.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'pipeline', component: PipelineComponent },
    { path: 'customers', component: CustomersComponent },
    { path: 'incentives', component: IncentivesComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' }
];
