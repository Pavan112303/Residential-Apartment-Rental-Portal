import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex bg-white font-sans overflow-hidden">
      <!-- Left Side: Image and Quote -->
      <div class="hidden lg:flex w-1/2 relative">
        <img src="/assets/images/login-bg.png" class="absolute inset-0 w-full h-full object-cover" alt="Luxury Apartment">
        <!-- Dark Overlay with Gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-transparent"></div>
        
        <!-- Content Overlay -->
        <div class="relative z-10 w-full p-20 flex flex-col justify-between">
          <div class="flex items-center cursor-pointer" routerLink="/">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl mr-4 shadow-xl">K</div>
            <span class="text-3xl font-black text-white tracking-tight">KOTS<span class="text-indigo-300">Portal</span></span>
          </div>

          <div>
            <div class="w-12 h-1 bg-indigo-400 mb-8"></div>
            <blockquote class="text-4xl font-bold text-white leading-tight mb-8">
              "Experience the future of residential living, where comfort meets technology."
            </blockquote>
            <p class="text-indigo-200 text-lg font-medium">Join our exclusive community today.</p>
          </div>

          <div class="text-indigo-300 text-xs font-bold uppercase tracking-widest">
            © 2026 RESIDENTIAL MANAGEMENT SYSTEM. SECURE ACCESS.
          </div>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-gray-50 lg:bg-white relative">
        <!-- Mobile Logo (shown only on small screens) -->
        <div class="absolute top-8 left-8 flex items-center lg:hidden" routerLink="/">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm mr-2">K</div>
          <span class="text-xl font-black text-gray-900 tracking-tight">KOTS<span class="text-indigo-600">Portal</span></span>
        </div>

        <div class="max-w-md w-full space-y-10">
          <div>
            <h2 class="text-4xl font-black text-gray-900 tracking-tight mb-3">Welcome Back</h2>
            <p class="text-gray-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div class="space-y-5">
              <div class="group">
                <label class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block transition group-focus-within:text-indigo-600">Email Address</label>
                <div class="relative">
                  <input name="email" type="email" required [(ngModel)]="email"
                    class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-indigo-600 transition-all duration-300 font-medium"
                    placeholder="name@example.com">
                  <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none opacity-40 group-focus-within:opacity-100 transition">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </div>
                </div>
              </div>

              <div class="group">
                <div class="flex justify-between mb-2">
                  <label class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] block transition group-focus-within:text-indigo-600">Password</label>
                  <a href="#" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">Forgot password?</a>
                </div>
                <div class="relative">
                  <input name="password" type="password" required [(ngModel)]="password"
                    class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-indigo-600 transition-all duration-300 font-medium"
                    placeholder="••••••••">
                  <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none opacity-40 group-focus-within:opacity-100 transition">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center">
              <input id="remember-me" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-gray-50 cursor-pointer">
              <label for="remember-me" class="ml-3 block text-sm text-gray-500 font-bold cursor-pointer">Stay signed in</label>
            </div>

            <div class="pt-2" *ngIf="errorMessage">
              <div class="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                {{ errorMessage }}
              </div>
            </div>

            <button type="submit" [disabled]="isLoading"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              {{ isLoading ? 'VERIFYING...' : 'SIGN IN' }}
            </button>

            <p class="text-center text-gray-500 font-bold text-sm mt-8">
              Don't have an account? 
              <a routerLink="/register" class="text-indigo-600 hover:text-indigo-800 transition underline underline-offset-4 decoration-2 decoration-indigo-200 hover:decoration-indigo-600">Register here</a>
            </p>
          </form>
        </div>
      </div>
    </div>


  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
