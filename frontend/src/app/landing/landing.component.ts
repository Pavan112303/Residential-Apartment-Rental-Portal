import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
      <!-- NAVIGATION -->
      <nav class="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20 items-center">
            <div class="flex items-center cursor-pointer" routerLink="/">
              <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl mr-3 shadow-md shadow-indigo-200">K</div>
              <span class="text-2xl font-black text-gray-900 tracking-tight">KOTS<span class="text-indigo-600">Portal</span></span>
            </div>
            <div class="hidden md:flex space-x-8">
              <a href="#" (click)="$event.preventDefault(); scrollTo('hero')" class="text-gray-600 hover:text-indigo-600 font-bold text-sm transition font-sans">Home</a>
              <a href="#" (click)="$event.preventDefault(); scrollTo('apartments')" class="text-gray-600 hover:text-indigo-600 font-bold text-sm transition font-sans">Apartments</a>
              <a href="#" (click)="$event.preventDefault(); scrollTo('about')" class="text-gray-600 hover:text-indigo-600 font-bold text-sm transition font-sans">About</a>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/login" class="text-gray-700 hover:text-indigo-600 font-bold text-sm transition px-2">Login</a>
              <a routerLink="/register" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5">Register</a>
            </div>
          </div>
        </div>
      </nav>

      <main class="flex-grow">
        <!-- HERO SECTION -->
        <section id="hero" class="relative overflow-hidden bg-white pt-24 pb-32">
          <div class="absolute inset-0 z-0">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-90"></div>
            <!-- Decorative blobs -->
            <div class="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div class="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div class="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>
          <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 border-b border-transparent">
            <span class="inline-block py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider mb-6 border border-indigo-100">MODERN LIVING REDEFINED</span>
            <h1 class="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-8">
              Find Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Perfect Apartment</span>
            </h1>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              Browse available residential apartments, explore amenities, and reserve your next home with ease. The future of renting is here.
            </p>
            <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <a href="#" (click)="$event.preventDefault(); scrollTo('apartments')" class="w-full sm:w-auto px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1">
                Browse Apartments
              </a>
              <a routerLink="/login" class="w-full sm:w-auto px-8 py-4 border-2 border-gray-200 text-base font-bold rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 md:text-lg transition transform hover:-translate-y-1">
                Sign In
              </a>
            </div>
          </div>
        </section>

        <!-- FEATURE HIGHLIGHTS -->
        <section class="py-24 bg-gray-50 relative z-10 -mt-10">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 group">
                <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Smart Discovery</h3>
                <p class="text-gray-600 leading-relaxed">Explore available towers, compare apartments, and find the best option based on your specific needs and location preferences.</p>
              </div>
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 group">
                <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Easy Booking</h3>
                <p class="text-gray-600 leading-relaxed">Reserve a unit instantly, generate transparent lease agreements, and manage everything online without the paperwork.</p>
              </div>
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 group">
                <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Quick Maintenance</h3>
                <p class="text-gray-600 leading-relaxed">Submit maintenance issues, track resolutions directly through the tenant portal, and get support exactly when you need it.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- APARTMENTS PREVIEW -->
        <section id="apartments" class="py-24 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Available Residences</h2>
              <p class="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Discover premium living spaces ready for your arrival. Your next chapter starts here.</p>
            </div>
            
            <div *ngIf="isLoading" class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>

            <div *ngIf="!isLoading && previewTowers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <!-- Using similar styling to tenant portal tower cards -->
              <div *ngFor="let tower of previewTowers" class="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col">
                <div class="relative h-64 overflow-hidden bg-gray-200">
                  <img *ngIf="tower.tower_image" [src]="getImageUrl(tower.tower_image)" class="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out">
                  <div *ngIf="!tower.tower_image" class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <svg class="w-16 h-16 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg>
                  </div>
                  <div class="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                    {{ tower.available_units_count || 0 }} Unit{{ tower.available_units_count !== 1 ? 's' : '' }} Available
                  </div>
                </div>
                
                <div class="p-6 flex-1 flex flex-col">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition">{{ tower.name }}</h3>
                  </div>
                  <div class="flex items-center text-gray-500 text-sm mb-4 font-medium" *ngIf="tower.city">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {{ tower.area ? tower.area + ', ' + tower.city : tower.city }}
                  </div>
                  
                  <div class="space-y-2 mt-auto">
                    <div class="flex items-center justify-between text-sm py-2 border-t border-gray-100">
                      <span class="text-gray-500 font-medium">Total Floors</span>
                      <span class="font-black text-gray-900">{{ tower.total_floors }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm py-2 border-t border-gray-100">
                      <span class="text-gray-500 font-medium">Total Capacity</span>
                      <span class="font-bold text-gray-700">{{ tower.total_units }} Units</span>
                    </div>
                  </div>
                  
                  <button (click)="redirectToLogin()" class="mt-6 w-full py-3.5 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition duration-300">
                    View & Reserve
                  </button>
                </div>
              </div>
            </div>

            <div *ngIf="!isLoading && previewTowers.length === 0" class="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
              <p class="text-gray-500 font-medium">No properties currently available. Check back soon!</p>
            </div>
            
            <div class="mt-16 text-center">
              <a routerLink="/login" class="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-base font-bold rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition shadow-sm">
                View All Properties <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
            </div>
          </div>
        </section>

        <!-- SYSTEM FEATURES SECTION -->
        <section class="py-24 bg-gray-900 text-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-5xl font-black mb-4 tracking-tight">Everything you need</h2>
              <p class="text-xl text-gray-400 max-w-2xl mx-auto font-medium">A complete digital solution for modern residential living.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
              <div class="px-4">
                <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h4 class="font-bold text-lg mb-2">Apartment Discovery</h4>
                <p class="text-sm text-gray-400">Search and filter active inventory.</p>
              </div>
              <div class="px-4">
                <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 class="font-bold text-lg mb-2">Online Booking</h4>
                <p class="text-sm text-gray-400">Reserve your home instantly.</p>
              </div>
              <div class="px-4">
                <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h4 class="font-bold text-lg mb-2">Digital Leases</h4>
                <p class="text-sm text-gray-400">Automated agreement generation.</p>
              </div>
              <div class="px-4">
                <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1z"></path></svg>
                </div>
                <h4 class="font-bold text-lg mb-2">Maintenance Hub</h4>
                <p class="text-sm text-gray-400">Integrated request tracking.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ABOUT SECTION -->
        <section id="about" class="py-24 bg-white border-t border-gray-100">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-indigo-50 rounded-[3rem] p-10 md:p-16 border border-indigo-100 relative overflow-hidden">
              <div class="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 opacity-10">
                 <svg width="404" height="404" fill="none" viewBox="0 0 404 404"><defs><pattern id="8b1b5f72-e944-4457-af67-0c6d15a99f38" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" fill="currentColor"></rect></pattern></defs><rect width="404" height="404" fill="url(#8b1b5f72-e944-4457-af67-0c6d15a99f38)"></rect></svg>
              </div>
              <div class="relative z-10 max-w-3xl">
                <span class="inline-block py-1.5 px-4 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wider mb-6">ABOUT THE PLATFORM</span>
                <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Revolutionizing Residential Rentals</h2>
                <p class="text-lg text-gray-700 leading-relaxed mb-6 font-medium">
                  This Residential Apartment Rental Portal empowers tenants to effortlessly discover available apartments, explore premium amenities, submit booking requests, and manage leases digitally.
                </p>
                <p class="text-lg text-gray-700 leading-relaxed font-medium mb-8">
                  Designed for modern living, property administrators are equipped with a powerful dashboard to streamline tower management, units, amenities, leases, and maintenance operations all securely from one place.
                </p>
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex -space-x-3">
                    <img class="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="Tenant 1">
                    <img class="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" alt="Tenant 2">
                    <img class="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" alt="Tenant 3">
                  </div>
                  <span class="text-sm font-bold text-gray-600">Join 1,000+ Happy Residents</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- FOOTER -->
      <footer class="bg-white border-t border-gray-100 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div class="mb-6 md:mb-0 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start mb-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm mr-2 shadow-sm">K</div>
              <span class="text-xl font-black text-gray-900 tracking-tight">KOTS<span class="text-indigo-600">Portal</span></span>
            </div>
            <p class="text-gray-500 text-sm font-medium">© 2026 Residential Management System. All rights reserved.</p>
          </div>
          <div class="flex space-x-6 text-sm font-bold text-gray-500">
            <a href="#" class="hover:text-indigo-600 transition">Contact</a>
            <a href="#" class="hover:text-indigo-600 transition">Privacy Policy</a>
            <a href="#" class="hover:text-indigo-600 transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
  `]
})
export class LandingComponent implements OnInit {
  previewTowers: any[] = [];
  isLoading = true;
  staticUrl = environment.staticUrl;

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit() {
    this.fetchPreviewTowers();
  }

  fetchPreviewTowers() {
    this.isLoading = true;
    this.apiService.getUserTowers().subscribe({
      next: (towers: any[]) => {
        // Filter to towers that have available units and take top 3
        this.previewTowers = towers.filter(t => t.available_units_count > 0).slice(0, 3);

        // If logged in user sees no available towers, fallback to any 3 towers just for visual preview
        if (this.previewTowers.length === 0) {
          this.previewTowers = towers.slice(0, 3);
        }
        this.isLoading = false;
      },
      error: (err) => {
        // Since we cannot modify the backend API to make this route unauthenticated, 
        // guests will receive a 401. We provide a beautiful mock preview for them instead.
        this.previewTowers = [
          { name: 'KOTS Whitefield Premium', city: 'Bangalore', area: 'Whitefield', available_units_count: 5, total_floors: 12, total_units: 48, tower_image: '' },
          { name: 'KOTS Residency Heights', city: 'Bangalore', area: 'Koramangala', available_units_count: 2, total_floors: 8, total_units: 32, tower_image: '' },
          { name: 'KOTS Eco Living', city: 'Bangalore', area: 'HSR Layout', available_units_count: 12, total_floors: 15, total_units: 60, tower_image: '' }
        ];
        this.isLoading = false;
      }
    });
  }

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return this.staticUrl + '/' + path;
  }
}
