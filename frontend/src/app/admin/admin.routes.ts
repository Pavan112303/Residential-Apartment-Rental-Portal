import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const ADMIN_ROUTES: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
