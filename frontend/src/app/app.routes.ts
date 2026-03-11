import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
    { path: 'user', loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES) },
    { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
    { path: '**', redirectTo: '' }
];
