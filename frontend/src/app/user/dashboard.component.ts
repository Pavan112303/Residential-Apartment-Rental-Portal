import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">

      <!-- ── Navbar ─────────────────────────────────────────────────────── -->
      <nav class="bg-indigo-700 shadow-lg text-white sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-6">
              <span class="text-xl font-bold tracking-wider">Tenant Portal</span>
              <button (click)="currentView='discovery'" [class.border-b-2]="currentView==='discovery'" class="hover:text-indigo-200 transition px-1 py-5 border-white text-sm font-medium">Discover</button>
              <button (click)="currentView='bookings'" [class.border-b-2]="currentView==='bookings'" class="hover:text-indigo-200 transition px-1 py-5 border-white text-sm font-medium">My Bookings</button>
              <button (click)="currentView='leases'" [class.border-b-2]="currentView==='leases'" class="hover:text-indigo-200 transition px-1 py-5 border-white text-sm font-medium">My Leases</button>
              <button (click)="currentView='maintenance'" [class.border-b-2]="currentView==='maintenance'" class="hover:text-indigo-200 transition px-1 py-5 border-white text-sm font-medium">Maintenance</button>
              <button (click)="currentView='payments'" [class.border-b-2]="currentView==='payments'" class="hover:text-indigo-200 transition px-1 py-5 border-white text-sm font-medium">Payments</button>
            </div>
            <div class="flex items-center space-x-4">
              <button (click)="currentView='profile'" [class.bg-indigo-600]="currentView==='profile'" class="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition">
                <svg class="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span class="font-medium text-sm text-white">Hello, {{ currentUser?.name }}</span>
              </button>
              <!-- Notification Bell -->
              <div class="relative">
                <button (click)="showNotifPanel=!showNotifPanel" class="relative p-2 rounded-full hover:bg-indigo-600 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <span *ngIf="unreadCount>0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{{unreadCount>9?'9+':unreadCount}}</span>
                </button>
                <div *ngIf="showNotifPanel" class="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div class="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
                    <span class="font-bold text-sm">Notifications</span>
                    <button (click)="showNotifPanel=false" class="text-gray-400 hover:text-white text-lg">✕</button>
                  </div>
                  <div class="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    <div *ngFor="let n of notifications" class="flex items-start p-3 hover:bg-gray-50 transition">
                      <span class="text-xl mr-3 mt-0.5">{{n.icon}}</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-gray-900">{{n.title}}</p>
                        <p class="text-xs text-gray-500 truncate">{{n.message}}</p>
                      </div>
                    </div>
                    <div *ngIf="notifications.length===0" class="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
                  </div>
                </div>
              </div>
              <button (click)="logout()" class="bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded-md transition-colors text-sm font-semibold shadow-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <!-- ── Summary Strip (shown on all views) ─────────────────────────── -->
      <div class="bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <div class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">{{summary.active_leases}}</div>
            <div><p class="text-xs text-gray-500 font-medium">Active Leases</p><p class="text-sm font-bold text-gray-900">{{summary.active_leases===1?'1 Lease':'Leases'}}</p></div>
          </div>
          <div class="flex items-center space-x-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
            <div class="w-9 h-9 rounded-lg bg-yellow-500 text-white flex items-center justify-center font-bold text-lg">{{summary.pending_bookings}}</div>
            <div><p class="text-xs text-gray-500 font-medium">Pending</p><p class="text-sm font-bold text-gray-900">Bookings</p></div>
          </div>
          <div class="flex items-center space-x-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
            <div class="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-lg">{{summary.open_maintenance}}</div>
            <div><p class="text-xs text-gray-500 font-medium">Open</p><p class="text-sm font-bold text-gray-900">Maintenance</p></div>
          </div>
          <div class="flex items-center space-x-3 p-3 rounded-xl bg-red-50 border border-red-100">
            <div class="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div><p class="text-xs text-gray-500 font-medium">Expiry</p><p class="text-sm font-bold text-gray-900">{{summary.upcoming_expiry ? summary.upcoming_expiry.days_left+'d left' : 'None'}}</p></div>
          </div>
        </div>
      </div>

      <!-- DISCOVERY VIEW -->
      <div *ngIf="currentView==='discovery'" class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <!-- Left: Tower List + Filters -->
        <div class="w-full md:w-72 flex-shrink-0 flex flex-col gap-4">
          <!-- Location Search -->
          <div class="relative">
            <input type="text" [(ngModel)]="locationFilters.search" (keyup.enter)="applyFilters()" placeholder="Search by name, city, area..." class="w-full pl-10 pr-4 py-3 bg-white border-2 border-transparent shadow-sm rounded-xl focus:border-indigo-500 outline-none transition text-sm font-medium">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <button *ngIf="locationFilters.search" (click)="locationFilters.search=''; applyFilters()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">Properties</h2>
            <div class="bg-gray-200 p-1 rounded-lg flex text-xs font-bold">
              <button (click)="viewMode='list'" [class.bg-white]="viewMode==='list'" [class.shadow-sm]="viewMode==='list'" class="px-3 py-1.5 rounded-md transition text-gray-700">List</button>
              <button (click)="toggleMapView()" [class.bg-white]="viewMode==='map'" [class.shadow-sm]="viewMode==='map'" class="px-3 py-1.5 rounded-md transition text-gray-700 flex items-center gap-1">📍 Map</button>
            </div>
          </div>
          <div class="space-y-2 max-h-[40vh] overflow-y-auto" *ngIf="viewMode==='list'">
            <div *ngFor="let tower of towers" (click)="selectTower(tower)" [class.border-indigo-500]="selectedTower?.id===tower.id" [class.bg-indigo-50]="selectedTower?.id===tower.id" class="bg-white rounded-xl shadow-sm border-2 border-transparent p-4 cursor-pointer hover:border-indigo-300 transition-all">
              <h3 class="font-bold text-gray-900">{{ tower.name }}</h3>
              <p *ngIf="tower.city" class="text-xs text-indigo-600 font-bold tracking-wide mt-0.5 uppercase">{{tower.area ? tower.area + ', ' + tower.city : tower.city}}</p>
              <p class="text-sm text-gray-600 mt-1 flex justify-between items-center">
                <span>{{ tower.total_floors }} Floors</span>
                <span *ngIf="tower.distance_km!=null" class="text-xs font-bold text-gray-500 bg-gray-100 px-2 rounded-full">📍 {{tower.distance_km}}km</span>
              </p>
              <p class="text-sm mt-1"><span class="text-green-600 font-medium">{{ tower.available_units_count }} Available</span></p>
            </div>
            <div *ngIf="towers.length===0" class="text-gray-500 text-sm italic p-4 bg-white rounded-xl border border-gray-100">No properties available.</div>
          </div>
          <!-- Filter Panel -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button (click)="showFilters=!showFilters" class="w-full flex justify-between items-center px-4 py-3 font-bold text-sm text-gray-700 hover:bg-gray-50 transition">
              <span>🔍 Filters & Sort</span>
              <svg [class.rotate-180]="showFilters" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div *ngIf="showFilters" class="border-t border-gray-100 p-4 space-y-4">
              <!-- Location Filters -->
              <div>
                <p class="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">Location</p>
                <div class="space-y-2">
                  <select [(ngModel)]="locationFilters.city" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                    <option value="">Any City</option>
                    <option *ngFor="let c of availableCities" [value]="c">{{c}}</option>
                  </select>
                  <select [(ngModel)]="locationFilters.area" [disabled]="!locationFilters.city" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white disabled:opacity-50">
                    <option value="">Any Area</option>
                    <option *ngFor="let a of availableAreas" [value]="a">{{a}}</option>
                  </select>
                  <input type="text" [(ngModel)]="locationFilters.pincode" placeholder="Pincode e.g 560066" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
                </div>
              </div>
              
              <div class="border-t border-gray-100 pt-3">
                <p class="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">Unit Preferences</p>
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div><label class="text-xs font-bold text-gray-600 block mb-1">Min Rent</label><input type="number" [(ngModel)]="filterState.minRent" placeholder="₹0" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"></div>
                  <div><label class="text-xs font-bold text-gray-600 block mb-1">Max Rent</label><input type="number" [(ngModel)]="filterState.maxRent" placeholder="₹∞" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"></div>
                </div>
                <div><label class="text-xs font-bold text-gray-600 block mb-1">Flat Type</label>
                  <select [(ngModel)]="filterState.flatType" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                    <option value="">All Types</option><option>1BHK</option><option>2BHK</option><option>3BHK</option><option>4BHK</option>
                  </select>
                </div>
              </div>

              <div class="border-t border-gray-100 pt-3">
                <label class="text-xs font-bold text-gray-600 block mb-1">Sort By</label>
                <select [(ngModel)]="filterState.sortBy" class="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                  <option value="score">Best Match</option>
                  <option value="nearest">Distance: Nearest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <div class="flex gap-2 mt-4">
                <button (click)="resetFilters()" class="flex-1 text-gray-600 border border-gray-200 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition">Clear</button>
                <button (click)="applyFilters()" class="flex-[2] bg-indigo-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-indigo-700 transition">Apply Filters</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content (Right Side) -->
        <div class="flex-1 min-w-0">
          
          <!-- Pending Deposits Global Banner -->
          <div *ngIf="getPendingDeposits().length > 0 && currentView !== 'payments'" class="bg-indigo-600 text-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center cursor-pointer hover:bg-indigo-700 transition" (click)="currentView = 'payments'">
            <div class="flex items-center gap-3">
              <span class="bg-white/20 p-2 rounded-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </span>
              <div>
                <p class="font-bold text-lg">Action Required: Pending Deposit</p>
                <p class="text-indigo-100 text-sm">You have {{ getPendingDeposits().length }} approved booking(s) awaiting your deposit. Click here to pay and complete your lease.</p>
              </div>
            </div>
            <button class="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition">Review & Pay</button>
          </div>
          
          <!-- Placeholder when no tower selected and in list view -->
          <div *ngIf="!selectedTower && viewMode==='list'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center text-gray-400">
            <svg class="w-20 h-20 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <p class="text-xl font-medium text-gray-500">Select a property to view availability</p>
          </div>

          <!-- Map View Component -->
          <div [class.hidden]="viewMode!=='map'" class="bg-white rounded-xl shadow-sm border border-gray-100 h-[70vh] flex flex-col overflow-hidden relative">
            <div id="map" class="w-full h-full z-10"></div>
          </div>

          <!-- Selected Tower Details (only when list view) -->
          <div *ngIf="selectedTower && viewMode==='list'">
            <!-- Tower Header -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h2 class="text-3xl font-bold text-gray-800">{{ selectedTower.name }}</h2>
                  <p *ngIf="selectedTower.city" class="text-indigo-600 font-bold tracking-wide mt-1 uppercase text-sm">📍 {{selectedTower.area ? selectedTower.area + ', ' + selectedTower.city : selectedTower.city}} <span *ngIf="selectedTower.pincode">- {{selectedTower.pincode}}</span></p>
                  <p class="text-gray-500 mt-2">{{ selectedTower.description || 'Premium residential apartments.' }}</p>
                </div>
                <div class="flex space-x-2 shrink-0">
                  <button type="button" (click)="openTowerGalleryModal(); $event.stopPropagation()" class="text-sm text-gray-700 font-bold hover:bg-gray-200 bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg transition cursor-pointer">Property Details</button>
                  <button type="button" (click)="openTowerAmenitiesModal(); $event.stopPropagation()" class="text-sm text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition cursor-pointer">View Amenities</button>
                </div>
              </div>
            </div>

            <!-- Recommendations Carousel -->
            <div *ngIf="recommendations.length>0" class="mb-6">
              <div class="flex items-center mb-3">
                <span class="text-base font-bold text-gray-800 mr-2">⭐ Recommended For You</span>
                <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">AI Picks</span>
              </div>
              <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style="scrollbar-width:none">
                <div *ngFor="let unit of recommendations" class="shrink-0 w-56 bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div class="h-28 bg-gray-100 relative">
                    <img *ngIf="unit.images?.length>0" [src]="getImageUrl(unit.images[0].image_path)" class="w-full h-full object-cover">
                    <div *ngIf="!unit.images?.length" class="w-full h-full flex items-center justify-center text-gray-300"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                    <span class="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">⭐ Pick</span>
                    <span *ngIf="unit.status==='UNDER_MAINTENANCE'" class="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">🔧 Maint.</span>
                  </div>
                  <div class="p-3">
                    <p class="font-bold text-gray-900 text-sm">Unit {{ unit.unit_number }}</p>
                    <p class="text-indigo-600 font-bold text-xs">{{ unit.flat_type }}</p>
                    <p class="text-gray-900 font-black text-sm mt-1">₹{{ unit.rent_amount }}<span class="text-xs font-normal text-gray-500">/mo</span></p>
                    <button *ngIf="unit.status==='AVAILABLE'" type="button" (click)="openBookingModal(unit); $event.stopPropagation()" class="w-full mt-2 bg-indigo-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-indigo-700 transition">Reserve</button>
                    <button *ngIf="unit.status!='AVAILABLE'" type="button" disabled class="w-full mt-2 bg-orange-100 text-orange-700 text-xs font-bold py-1.5 rounded-lg cursor-not-allowed">Under Maintenance</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- All Units Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div *ngFor="let unit of getUnits()" class="border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col group">
                <!-- Image -->
                <div class="h-52 bg-gray-100 relative group">
                  <button (click)="scrollImages(imgScroll, -1); $event.stopPropagation()" *ngIf="unit.images?.length>1" class="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button (click)="scrollImages(imgScroll, 1); $event.stopPropagation()" *ngIf="unit.images?.length>1" class="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                  <div #imgScroll *ngIf="unit.images?.length>0" style="scrollbar-width:none" class="unit-carousel w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth">
                    <img *ngFor="let img of unit.images" [src]="getImageUrl(img.image_path)" class="w-full h-full object-cover shrink-0 snap-center">
                  </div>
                  <div *ngIf="!unit.images||unit.images.length===0" class="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                    <svg class="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span class="text-sm">No Images</span>
                  </div>
                  <span *ngIf="unit.status==='AVAILABLE'" class="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-green-500 text-white shadow pointer-events-none">AVAILABLE</span>
                  <span *ngIf="unit.status==='UNDER_MAINTENANCE'" class="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-orange-500 text-white shadow pointer-events-none">🔧 MAINTENANCE</span>
                  <div class="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20 pointer-events-none">Floor {{ unit.floor_number }}</div>
                </div>
                <!-- Card Body -->
                <div class="p-5 flex-1 flex flex-col">
                  <div class="flex justify-between items-start mb-3">
                    <div><h3 class="font-bold text-xl text-gray-900">Unit {{ unit.unit_number }}</h3><p class="text-indigo-600 font-bold text-sm mt-0.5">{{ unit.flat_type }}</p></div>
                    <div class="text-right">
                      <p class="text-2xl font-black text-gray-900">₹{{ unit.rent_amount }}<span class="text-sm font-medium text-gray-500">/mo</span></p>
                      <p class="text-xs text-gray-500 uppercase font-semibold mt-1">Deposit: ₹{{ unit.deposit_amount }}</p>
                    </div>
                  </div>
                  <!-- Specs -->
                  <div class="flex items-center flex-wrap gap-3 mb-3 text-sm text-gray-600 border-y border-gray-100 py-3">
                    <span *ngIf="unit.square_feet" class="flex items-center"><b class="mr-1">{{ unit.square_feet }}</b> sq.ft</span>
                    <span class="flex items-center"><b class="mr-1">{{ unit.bathrooms_count }}</b> Bath</span>
                    <span class="flex items-center"><b class="mr-1">{{ unit.balcony_count }}</b> Balcony</span>
                    <span class="ml-auto text-indigo-700 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg">Move-in: ₹{{ (unit.rent_amount||0)+(unit.deposit_amount||0) }}</span>
                  </div>
                  <!-- Amenity Icons -->
                  <div class="mb-4 flex flex-wrap gap-1.5">
                    <span *ngFor="let am of unit.amenities|slice:0:4" class="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1">
                      {{ getAmenityIcon(am.name) }} {{ am.name }}
                    </span>
                    <span *ngIf="unit.amenities?.length>4" class="text-xs text-gray-400 self-center font-medium">+{{unit.amenities.length-4}} more</span>
                    <span *ngIf="!unit.amenities?.length" class="text-xs text-gray-400 italic">No amenities assigned</span>
                  </div>
                  <!-- Actions -->
                  <div class="mt-auto pt-2 flex gap-3 relative z-20">
                    <button type="button" (click)="openUnitDetailModal(unit); $event.stopPropagation()" class="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2 cursor-pointer">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      View Details
                    </button>
                    <button *ngIf="unit.status==='AVAILABLE'" type="button" (click)="openBookingModal(unit); $event.stopPropagation()" class="flex-1 bg-gray-900 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm relative z-30">
                      Reserve <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                    <div *ngIf="unit.status!='AVAILABLE'" class="flex-1 bg-orange-100 text-orange-700 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed">🔧 Under Maintenance</div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="getUnits().length===0" class="bg-white rounded-xl border-2 border-dashed p-16 text-center text-gray-500 mt-4">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <p class="text-lg font-semibold text-gray-600">No units match your filters</p>
              <p class="text-sm mt-2">Try adjusting your filters or browse other properties.</p>
            </div>
          </div>
        </div>
      </div>
      <!-- BOOKINGS VIEW -->
      <div *ngIf="currentView==='bookings'" class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">My Booking Requests</h2>
        <div class="space-y-5">
          <div *ngFor="let b of bookings" class="bg-white border rounded-2xl shadow-sm overflow-hidden hover:border-indigo-200 transition-all">
            <!-- Card Header -->
            <div class="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h4 class="font-bold text-lg text-gray-900">Unit {{ b.unit_number }}</h4>
                <p class="text-sm text-gray-500">{{ b.tower_name || 'Property' }}</p>
              </div>
              <span class="px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider"
                [ngClass]="{
                  'bg-yellow-100 text-yellow-800 border border-yellow-200': b.status==='PENDING',
                  'bg-indigo-100 text-indigo-800 border border-indigo-200': b.status==='APPROVED',
                  'bg-green-100 text-green-800 border border-green-200': b.status==='BOOKED',
                  'bg-red-100 text-red-800 border border-red-200': b.status==='REJECTED',
                  'bg-gray-100 text-gray-600 border border-gray-200': b.status==='CANCELLED'
                }">{{ b.status === 'BOOKED' ? 'BOOKED ✓' : b.status === 'APPROVED' ? 'PENDING PAYMENT' : b.status }}</span>
            </div>
            <div class="px-6 py-4">
              <!-- Info row -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Move-in Date</p><p class="font-semibold text-gray-900 text-sm">{{ b.move_in_date }}</p></div>
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Lease Term</p><p class="font-semibold text-gray-900 text-sm">{{ b.lease_duration }} months</p></div>
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Monthly Rent</p><p class="font-semibold text-gray-900 text-sm">₹{{ b.rent_amount || '—' }}</p></div>
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider">Deposit</p><p class="font-semibold text-gray-900 text-sm">₹{{ b.deposit_amount || '—' }}</p></div>
              </div>
              <!-- Applied date -->
              <p class="text-xs text-gray-400 mb-4">Applied on {{ b.created_at | date:'mediumDate' }}</p>
              <!-- Status Timeline -->
              <div class="flex items-center gap-0 mb-4 overflow-x-auto">
                <div *ngFor="let step of ['Submitted','Under Review','Decision','Lease Generated']; let i=index" class="flex items-center flex-shrink-0">
                  <div class="flex flex-col items-center">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                      [ngClass]="{'bg-indigo-600 border-indigo-600 text-white': getBookingTimeline(b.status)>i, 'bg-white border-indigo-300 text-indigo-600': getBookingTimeline(b.status)===i, 'bg-gray-100 border-gray-200 text-gray-400': getBookingTimeline(b.status)<i}">
                      <span *ngIf="getBookingTimeline(b.status)>i">✓</span>
                      <span *ngIf="getBookingTimeline(b.status)<=i">{{i+1}}</span>
                    </div>
                    <span class="text-xs text-gray-500 mt-1 w-16 text-center leading-tight">{{step}}</span>
                  </div>
                  <div *ngIf="i<3" class="h-0.5 w-8 md:w-12 flex-shrink-0" [ngClass]="{'bg-indigo-500': getBookingTimeline(b.status)>i, 'bg-gray-200': getBookingTimeline(b.status)<=i}"></div>
                </div>
              </div>
              <!-- Info note -->
              <div *ngIf="b.status==='PENDING'" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 flex items-start gap-3 shadow-sm">
                <div class="bg-amber-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p class="font-bold mb-1">Payment requirement after approval</p>
                  <p class="opacity-90">Once the admin approves your request, you will have exactly <span class="font-black underline">6 hours</span> to complete the deposit payment. Failure to pay within this window will result in automatic cancellation.</p>
                </div>
              </div>
              <div *ngIf="b.status==='APPROVED'" class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-sm text-indigo-800 flex items-start gap-3 shadow-sm mb-4">
                <div class="bg-indigo-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p class="font-bold mb-1">Final step: Complete Payment</p>
                  <p class="opacity-90">Your booking is approved! Please pay the deposit within the countdown timer to generate your lease agreement.</p>
                </div>
              </div>
              <!-- Rejection reason -->
              <div *ngIf="b.status==='REJECTED'&&b.rejection_reason" class="mt-3 p-3 bg-red-50 text-red-800 rounded-xl text-sm border border-red-100">
                <span class="font-bold">Rejection Reason: </span>{{ b.rejection_reason }}
              </div>
              <!-- Review section for APPROVED bookings -->
              <div *ngIf="b.status==='APPROVED'" class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Share Your Experience</p>
                <div *ngIf="!showReviewForm" class="flex items-center gap-3">
                  <button (click)="showReviewForm=true; selectedTower={id: b.tower_id, name: b.tower_name}" class="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    Write a Review
                  </button>
                </div>
                <div *ngIf="showReviewForm&&selectedTower?.id===b.tower_id" class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div class="flex gap-1">
                    <button *ngFor="let star of [1,2,3,4,5]" type="button" (click)="newReview.rating=star" [class.text-yellow-400]="star<=newReview.rating" [class.text-gray-300]="star>newReview.rating" class="focus:outline-none transition-colors">
                      <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    </button>
                  </div>
                  <textarea [(ngModel)]="newReview.comment" rows="2" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Share your experience..."></textarea>
                  <div class="flex gap-2">
                    <button (click)="submitReview()" class="bg-indigo-600 text-white text-sm px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">Submit</button>
                    <button (click)="showReviewForm=false" class="text-gray-500 text-sm px-4 py-2 rounded-xl hover:bg-gray-100 transition">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="bookings.length===0" class="text-center py-20 bg-white rounded-xl border-2 border-dashed text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <p class="text-lg font-semibold">No booking requests yet.</p>
            <button (click)="currentView='discovery'" class="mt-4 text-indigo-600 font-bold hover:underline">Browse Properties →</button>
          </div>
        </div>
      </div>


      <!-- LEASES VIEW -->
      <div *ngIf="currentView==='leases'" class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">My Leases</h2>
        <div class="space-y-6">
          <div *ngFor="let lease of leases" class="bg-white border rounded-2xl shadow-sm overflow-hidden"
            [ngClass]="{'border-yellow-300': getLeaseDaysLeft(lease)<30&&getLeaseDaysLeft(lease)>0,'border-red-300': getLeaseDaysLeft(lease)<=0}">
            <div class="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex justify-between items-center">
              <div>
                <span class="text-indigo-800 font-bold">Agreement: {{ lease.agreement_id }}</span>
                <span class="text-sm ml-3 text-indigo-600 font-medium">Unit {{ lease.unit_number || lease.booking?.unit_number }}</span>
                <span *ngIf="lease.tower_name" class="text-sm ml-2 text-gray-600">• {{ lease.tower_name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span *ngIf="getLeaseDaysLeft(lease)>0&&getLeaseDaysLeft(lease)<30" class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">⏰ Expiring Soon</span>
                <span class="px-3 py-1 text-xs font-bold rounded-full" [ngClass]="{'bg-green-600 text-white': lease.status==='ACTIVE','bg-gray-400 text-white': lease.status!='ACTIVE'}">{{ lease.status }}</span>
              </div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Monthly Rent</p><p class="font-bold text-gray-900">₹{{ lease.monthly_rent || lease.booking?.rent_amount || '—' }}</p></div>
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Deposit</p><p class="font-bold text-gray-900">₹{{ lease.deposit_amount || lease.booking?.deposit_amount || '—' }}</p></div>
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Start Date</p><p class="font-medium text-gray-900 text-sm">{{ lease.start_date }}</p></div>
                <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">End Date</p><p class="font-medium text-gray-900 text-sm">{{ lease.end_date }}</p></div>
              </div>
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Lease Progress</span>
                  <span [ngClass]="{'text-yellow-600 font-bold': getLeaseDaysLeft(lease)<30,'text-red-600 font-bold': getLeaseDaysLeft(lease)<=0}">
                    {{ getLeaseDaysLeft(lease) > 0 ? getLeaseDaysLeft(lease)+' days remaining' : 'Expired' }}
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div class="h-2.5 rounded-full transition-all duration-500"
                    [style.width.%]="getLeaseProgress(lease)"
                    [ngClass]="{'bg-indigo-500': getLeaseDaysLeft(lease)>=30,'bg-yellow-500': getLeaseDaysLeft(lease)<30&&getLeaseDaysLeft(lease)>0,'bg-red-500': getLeaseDaysLeft(lease)<=0}"></div>
                </div>
              </div>
              <div class="flex justify-between items-center mt-2">
                <div>
                  <span *ngIf="lease.vacate_request_status === 'APPROVED'" class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">✅ Vacate Approved</span>
                  <span *ngIf="lease.vacate_request_status === 'PENDING'" class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">⏳ Vacate Requested (Admin Reviewing)</span>
                  <span *ngIf="lease.vacate_request_status === 'REJECTED'" class="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-200">❌ Vacate Rejected</span>
                  
                  <button *ngIf="lease.status === 'ACTIVE' && (!lease.vacate_request_status || lease.vacate_request_status === 'REJECTED')" 
                          (click)="openVacateModal(lease)" 
                          class="ml-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-sm font-bold py-2 px-5 rounded-xl transition inline-flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Request to Vacate
                  </button>
                </div>
                <div class="flex justify-end">
                  <button (click)="downloadLease(lease)" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold py-2 px-5 rounded-xl transition inline-flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Lease
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="leases.length===0" class="text-center py-20 bg-white rounded-xl border-2 border-dashed text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p class="text-lg font-semibold">No active leases found.</p>
          </div>
        </div>
      </div>

      <!-- MAINTENANCE VIEW -->
      <div *ngIf="currentView==='maintenance'" class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Maintenance Requests</h2>
          <button (click)="openMaintenanceModal()" class="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            File New Request
          </button>
        </div>
        <div class="space-y-4">
          <div *ngFor="let req of maintenanceRequests" class="bg-white border rounded-2xl shadow-sm overflow-hidden hover:border-gray-300 transition">
            <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <h4 class="font-bold text-gray-900">{{ req.category }}</h4>
                <span class="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">Unit {{ req.unit_id }}</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                  [ngClass]="{'bg-red-100 text-red-700': req.priority==='HIGH','bg-yellow-100 text-yellow-700': req.priority==='MEDIUM','bg-green-100 text-green-700': req.priority==='LOW'}">
                  {{req.priority||'MEDIUM'}} Priority
                </span>
              </div>
              <span class="px-3 py-1 text-xs font-bold rounded-full tracking-wide"
                [ngClass]="{'bg-yellow-100 text-yellow-800': req.status==='OPEN','bg-blue-100 text-blue-800': req.status==='IN_PROGRESS','bg-green-100 text-green-800': req.status==='RESOLVED'}">
                {{ req.status?.replace('_',' ') }}
              </span>
            </div>
            <div class="px-6 py-4">
              <!-- Status timeline -->
              <div class="flex items-center gap-0 mb-4">
                <div *ngFor="let step of ['Reported','In Progress','Resolved']; let i=index" class="flex items-center">
                  <div class="flex flex-col items-center">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2"
                      [ngClass]="{'bg-indigo-600 border-indigo-600 text-white': (req.status==='IN_PROGRESS'&&i<=1)||(req.status==='RESOLVED'), 'bg-white border-indigo-300 text-indigo-600': req.status==='OPEN'&&i===0, 'bg-gray-100 border-gray-200 text-gray-400': req.status==='OPEN'&&i>0}">
                      <span *ngIf="(req.status==='IN_PROGRESS'&&i<=1)||(req.status==='RESOLVED')">✓</span>
                      <span *ngIf="!((req.status==='IN_PROGRESS'&&i<=1)||(req.status==='RESOLVED'))">{{i+1}}</span>
                    </div>
                    <span class="text-xs text-gray-500 mt-1">{{step}}</span>
                  </div>
                  <div *ngIf="i<2" class="h-0.5 w-12" [ngClass]="{'bg-indigo-500': (req.status==='IN_PROGRESS'&&i===0)||req.status==='RESOLVED','bg-gray-200': !(req.status==='IN_PROGRESS'&&i===0)||req.status!='RESOLVED'}"></div>
                </div>
              </div>
              <p class="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm">{{ req.description }}</p>
              <p class="text-xs text-gray-400 mt-2">Reported on {{ req.created_at | date:'mediumDate' }}</p>
              <div *ngIf="req.admin_comment" class="mt-4 p-4 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-sm">
                <span class="font-bold uppercase tracking-wider text-xs block mb-1">Admin Resolution Note</span>
                {{ req.admin_comment }}
              </div>
            </div>
          </div>
          <div *ngIf="maintenanceRequests.length===0" class="text-center py-16 bg-white rounded-xl border-2 border-dashed text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <p class="text-lg font-semibold">No maintenance requests open.</p>
          </div>
        </div>
      </div>

      <!-- PAYMENTS VIEW -->
      <div *ngIf="currentView==='payments'" class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 class="text-2xl font-bold text-gray-800">Payments & Dues</h2>
          <button (click)="openPaymentModal()" class="bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm hover:shadow flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
            Make a Payment
          </button>
        </div>

        <!-- PENDING BOOKING DEPOSITS -->
        <div *ngIf="getPendingDeposits().length > 0" class="mb-8">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Pending Booking Deposits</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let b of getPendingDeposits()" class="bg-indigo-50 rounded-2xl shadow-sm border border-indigo-200 overflow-hidden relative">
              <div class="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ACTION REQUIRED</div>
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-indigo-900 font-bold text-lg mb-1">Deposit Due</h3>
                    <p class="text-indigo-700 text-sm font-medium">Unit {{ b.unit_number }} • Approved: {{ b.approved_at | date:'short' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-3xl font-black text-indigo-800">₹{{ b.deposit_amount | number: '1.2-2' }}</p>
                  </div>
                </div>
                <div class="bg-white/80 rounded-xl p-4 text-sm max-w-sm mb-5">
                  <div class="flex justify-between text-indigo-900 font-bold">
                    <span>Time Remaining</span>
                    <span class="text-red-600">{{ getDepositTimeLeft(b.approved_at) }}</span>
                  </div>
                </div>
                <button (click)="payDeposit(b)" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm hover:shadow text-sm flex justify-center items-center gap-2">
                  Pay Deposit &amp; Generate Lease
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- DUES OVERVIEW BOXES -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" *ngIf="duesData">
          
          <!-- CURRENT DUE (LATE) -->
          <div *ngIf="duesData.current_due" class="bg-red-50 rounded-2xl shadow-sm border border-red-200 overflow-hidden relative">
            <div class="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">OVERDUE BY {{ duesData.current_due.days_late }} DAYS</div>
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-red-800 font-bold text-lg mb-1">Current Due</h3>
                  <p class="text-red-600 text-sm font-medium">Unit {{ duesData.current_due.unit_number }} • Due: {{ duesData.current_due.due_date | date:'mediumDate' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-black text-red-700">₹{{ duesData.current_due.amount | number: '1.2-2' }}</p>
                </div>
              </div>
              <div class="bg-white/60 rounded-xl p-4 text-sm max-w-sm mb-5">
                <div class="flex justify-between text-gray-700 mb-1"><span>Base Rent</span><span>₹{{ duesData.current_due.base_rent | number }}</span></div>
                <div class="flex justify-between text-red-600 font-bold"><span>Late Fee Applied</span><span>₹{{ duesData.current_due.late_fee | number }}</span></div>
              </div>
              <button (click)="payDue(duesData.current_due)" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm hover:shadow text-sm flex justify-center items-center gap-2">
                Pay Now
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
          <div *ngIf="!duesData.current_due" class="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-6 flex flex-col justify-center items-center text-center">
             <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
             <h3 class="text-green-800 font-bold text-lg mb-1">All Caught Up!</h3>
             <p class="text-green-600 text-sm">You have no outstanding or overdue payments.</p>
          </div>

          <!-- UPCOMING DUE -->
          <div *ngIf="duesData.upcoming_due" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-gray-800 font-bold text-lg">Upcoming Due</h3>
                <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">PENDING</span>
              </div>
              <p class="text-gray-500 text-sm font-medium mb-4">Unit {{ duesData.upcoming_due.unit_number }} • Due by {{ duesData.upcoming_due.due_date | date:'mediumDate' }}</p>
              <p class="text-3xl font-black text-gray-900 mb-6">₹{{ duesData.upcoming_due.amount | number: '1.2-2' }}</p>
            </div>
            <button (click)="payDue(duesData.upcoming_due)" class="w-full bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-xl transition text-sm flex justify-center items-center">
              Pay Early
            </button>
          </div>
          <div *ngIf="!duesData.upcoming_due" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
             <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
             <h3 class="text-gray-800 font-bold text-lg mb-1">No Upcoming Dues</h3>
             <p class="text-gray-500 text-sm">There are no upcoming payments scheduled for your active leases.</p>
          </div>

        </div>
        
        <h3 class="text-lg font-bold text-gray-800 mb-4">Transaction History</h3>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th class="p-4">Transaction ID</th>
                  <th class="p-4">Date</th>
                  <th class="p-4">Type</th>
                  <th class="p-4">Method</th>
                  <th class="p-4 text-right">Amount</th>
                  <th class="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                <tr *ngFor="let p of payments" class="hover:bg-gray-50/50 transition">
                  <td class="p-4 font-mono text-xs text-gray-500">{{ p.reference_id }}</td>
                  <td class="p-4 text-gray-700 font-medium">{{ p.payment_date | date:'mediumDate' }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-xl"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': p.payment_type === 'RENT',
                        'bg-purple-100 text-purple-800': p.payment_type === 'DEPOSIT',
                        'bg-gray-100 text-gray-800': p.payment_type === 'MAINTENANCE'
                      }">{{ p.payment_type }}</span>
                  </td>
                  <td class="p-4 text-gray-600">{{ p.payment_method.replace('_', ' ') }}</td>
                  <td class="p-4 text-right font-black text-gray-900">₹{{ p.amount | number }}</td>
                  <td class="p-4 text-center">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': p.status === 'SUCCESS',
                        'bg-yellow-100 text-yellow-800': p.status === 'PENDING',
                        'bg-red-100 text-red-800': p.status === 'FAILED'
                      }">{{ p.status }}</span>
                  </td>
                </tr>
                <tr *ngIf="payments.length === 0">
                  <td colspan="6" class="p-12 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p class="font-medium">No payment history found.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- PROFILE VIEW -->
      <div *ngIf="currentView==='profile'" class="flex-grow max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="bg-indigo-700 px-8 py-10 text-white relative">
            <h2 class="text-3xl font-extrabold">My Profile</h2>
            <p class="text-indigo-100 mt-2 opacity-90">Manage your contact information and address details.</p>
            <div class="absolute -bottom-6 right-8 w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center text-indigo-700 text-4xl font-black border-4 border-gray-50 uppercase">
              {{ currentUser?.name?.charAt(0) }}
            </div>
          </div>
          
          <div class="p-8 pt-12 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                <input type="text" [(ngModel)]="profileData.name" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                <input type="email" [value]="currentUser?.email" disabled class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium">
                <p class="text-[10px] text-gray-400 mt-1 font-bold">Email cannot be changed</p>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                <input type="text" [(ngModel)]="profileData.phone" placeholder="+91 00000 00000" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Permanent Address</label>
                <textarea [(ngModel)]="profileData.address" rows="3" placeholder="Street, House No, Locality..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">City</label>
                <input type="text" [(ngModel)]="profileData.city" placeholder="City" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">State</label>
                <input type="text" [(ngModel)]="profileData.state" placeholder="State" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Zip Code</label>
                <input type="text" [(ngModel)]="profileData.zip_code" placeholder="Zip Code" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button (click)="currentView='discovery'" class="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button (click)="saveProfile()" [disabled]="isLoading" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md flex items-center gap-2">
                <span *ngIf="!isLoading">Save Changes</span>
                <span *ngIf="isLoading" class="animate-spin text-xl">◌</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════ MODALS ══════════════════ -->

    <!-- Tower Gallery Modal -->
    <div *ngIf="showTowerGalleryModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" (click)="showTowerGalleryModal=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
        <div class="bg-gray-900 p-5 text-white text-xl font-bold flex justify-between items-center shrink-0">
          <span>{{ selectedTower?.name }}</span><button (click)="showTowerGalleryModal=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-6 overflow-y-auto space-y-5 bg-gray-50 flex-1">
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-700 leading-relaxed">
            <span class="font-bold text-gray-900 text-lg block mb-2">About this Property</span>
            {{ selectedTower?.description || 'No detailed description provided.' }}
          </div>
          <!-- Location Details -->
          <div *ngIf="selectedTower?.address_line || selectedTower?.city || selectedTower?.area" class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-700 leading-relaxed flex gap-4 items-start">
            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
            <div>
              <span class="font-bold text-gray-900 text-lg block mb-1">Location details</span>
              <p *ngIf="selectedTower?.address_line" class="font-medium text-gray-800">{{ selectedTower.address_line }}</p>
              <p>{{ selectedTower?.area ? selectedTower.area + ', ' : '' }}{{ selectedTower?.city ? selectedTower.city : '' }}{{ selectedTower?.state ? ', ' + selectedTower.state : '' }}</p>
              <p *ngIf="selectedTower?.pincode || selectedTower?.country" class="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">{{ selectedTower?.pincode ? 'Pincode: ' + selectedTower.pincode : '' }}{{ selectedTower?.pincode && selectedTower?.country ? ' • ' : '' }}{{ selectedTower?.country ? selectedTower.country : '' }}</p>
            </div>
          </div>
          <div class="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center min-h-[14rem]">
            <img *ngIf="selectedTower?.tower_image" [src]="getImageUrl(selectedTower.tower_image)" class="w-full h-auto object-cover max-h-80">
            <div *ngIf="!selectedTower?.tower_image" class="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg class="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span class="text-sm">No Photo Uploaded</span>
            </div>
          </div>
          <!-- Reviews -->
          <div class="border-t border-gray-200 pt-5">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-gray-900 text-lg">Property Reviews</h3>
              <button (click)="showReviewForm=!showReviewForm" class="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition">{{ showReviewForm ? 'Cancel' : 'Write a Review' }}</button>
            </div>
            <div *ngIf="showReviewForm" class="bg-white p-4 rounded-xl border border-gray-100 mb-4 space-y-3">
              <div class="flex gap-1">
                <button *ngFor="let s of [1,2,3,4,5]" type="button" (click)="newReview.rating=s; $event.stopPropagation()" [class.text-yellow-400]="s<=newReview.rating" [class.text-gray-300]="s>newReview.rating" class="focus:outline-none transition-colors">
                  <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </button>
              </div>
              <textarea [(ngModel)]="newReview.comment" rows="3" class="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Share your experience..."></textarea>
              <button (click)="submitReview(); $event.stopPropagation()" class="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition text-sm">Submit Review</button>
            </div>
            <div class="space-y-3">
              <div *ngIf="towerReviews.length===0" class="text-center text-gray-500 py-6 bg-white rounded-xl border border-gray-100 text-sm">No reviews yet. Be the first!</div>
              <div *ngFor="let rev of towerReviews" class="bg-white p-4 rounded-xl border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{{rev.user_name?.charAt(0)||'U'}}</div>
                    <span class="font-bold text-sm text-gray-900">{{rev.user_name}}</span>
                    <span class="text-xs text-gray-400">{{ rev.created_at | date:'mediumDate' }}</span>
                  </div>
                  <div class="flex">
                    <svg *ngFor="let s of [1,2,3,4,5]" class="w-4 h-4" [class.text-yellow-400]="s<=rev.rating" [class.text-gray-200]="s>rev.rating" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  </div>
                </div>
                <p *ngIf="rev.comment" class="text-gray-700 text-sm">{{rev.comment}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unit Detail Modal -->
    <div *ngIf="showUnitDetailModal&&activeDetailUnit" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" (click)="showUnitDetailModal=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
        <div class="bg-gray-900 p-5 text-white font-bold flex justify-between items-center shrink-0">
          <span>Unit {{ activeDetailUnit?.unit_number }} — Details</span><button (click)="showUnitDetailModal=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-xl"><p class="text-xs text-gray-500 font-bold uppercase">Flat Type</p><p class="font-bold text-gray-900">{{ activeDetailUnit?.flat_type }}</p></div>
            <div class="bg-gray-50 p-4 rounded-xl"><p class="text-xs text-gray-500 font-bold uppercase">Floor</p><p class="font-bold text-gray-900">{{ activeDetailUnit?.floor_number }}</p></div>
            <div class="bg-gray-50 p-4 rounded-xl"><p class="text-xs text-gray-500 font-bold uppercase">Monthly Rent</p><p class="font-bold text-indigo-600 text-lg">₹{{ activeDetailUnit?.rent_amount }}</p></div>
            <div class="bg-gray-50 p-4 rounded-xl"><p class="text-xs text-gray-500 font-bold uppercase">Security Deposit</p><p class="font-bold text-gray-900">₹{{ activeDetailUnit?.deposit_amount }}</p></div>
            <div class="col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100"><p class="text-xs text-indigo-600 font-bold uppercase">Estimated Move-in Cost</p><p class="font-black text-indigo-900 text-xl">₹{{ (activeDetailUnit?.rent_amount||0)+(activeDetailUnit?.deposit_amount||0) }}</p></div>
          </div>
          <div>
            <p class="font-bold text-gray-900 mb-3">Unit Amenities</p>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let am of activeDetailUnit?.amenities" class="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-1.5">{{ getAmenityIcon(am.name) }} {{ am.name }}</span>
              <span *ngIf="!activeDetailUnit?.amenities?.length" class="text-gray-400 text-sm italic">No amenities assigned</span>
            </div>
          </div>
          <div>
            <p class="font-bold text-gray-900 mb-3">Tower Amenities</p>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let am of selectedTower?.amenities" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg flex items-center gap-1.5">{{ getAmenityIcon(am.name) }} {{ am.name }}</span>
              <span *ngIf="!selectedTower?.amenities?.length" class="text-gray-400 text-sm italic">No tower amenities listed</span>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p class="font-bold text-gray-900 mb-2">Nearby Facilities</p>
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <span>🏥 Hospital — 1.2 km</span><span>🏫 School — 0.8 km</span>
              <span>🛒 Supermarket — 0.5 km</span><span>🚌 Bus Stop — 0.3 km</span>
            </div>
          </div>
          <div class="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-sm text-yellow-900">
            <p class="font-bold mb-1">Tenancy Terms Summary</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>Monthly rent due on the 1st of each month.</li>
              <li>Security deposit refundable within 30 days of move-out.</li>
              <li>1-month notice required before vacating.</li>
              <li>No subletting without written approval.</li>
            </ul>
          </div>
        </div>
        <div class="border-t p-5 flex gap-3 shrink-0 bg-white">
          <button (click)="showUnitDetailModal=false" class="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">Close</button>
          <button *ngIf="activeDetailUnit?.status==='AVAILABLE'" (click)="showUnitDetailModal=false; openBookingModal(activeDetailUnit)" class="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm">Reserve This Unit</button>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div *ngIf="isBookingModalOpen&&selectedUnit" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div class="relative mx-auto w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <!-- Left Image -->
        <div class="hidden md:block w-1/3 bg-gray-100 relative shrink-0">
          <img *ngIf="selectedUnit.images?.length>0" [src]="getImageUrl(selectedUnit.images[0].image_path)" class="absolute inset-0 w-full h-full object-cover">
          <div *ngIf="!selectedUnit.images?.length" class="absolute inset-0 flex items-center justify-center text-gray-300"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div class="absolute bottom-6 left-6 right-6 text-white">
            <h3 class="text-3xl font-bold">Unit {{ selectedUnit.unit_number }}</h3>
            <p class="text-gray-200 mt-1 font-medium">{{ selectedTower?.name }}</p>
            <p class="text-sm text-gray-300 mt-1">Floor {{ selectedUnit.floor_number }} • {{ selectedUnit.flat_type }}</p>
          </div>
        </div>
        <!-- Right Content -->
        <div class="w-full md:w-2/3 flex flex-col max-h-[90vh]">
          <div class="md:hidden bg-indigo-700 p-6 text-white shrink-0">
            <h3 class="text-2xl font-bold">Reserve Unit {{ selectedUnit.unit_number }}</h3>
          </div>
          <div class="p-6 overflow-y-auto space-y-5 flex-1">
            <div *ngIf="!showPaymentFlow" class="bg-gray-50 p-5 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
              <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Monthly Rent</p><p class="text-2xl font-bold text-gray-900">₹{{ selectedUnit.rent_amount }}</p></div>
              <div><p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Security Deposit</p><p class="text-2xl font-bold text-gray-900">₹{{ selectedUnit.deposit_amount }}</p></div>
              <div class="col-span-2 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                <p class="text-sm text-gray-600 font-medium flex items-center justify-between col-span-2"><span>Total Move-in Cost:</span><span class="text-gray-900 font-bold text-lg">₹{{ selectedUnit.rent_amount+selectedUnit.deposit_amount }}</span></p>
                <p *ngIf="bookingData.moveInDate" class="text-xs text-gray-500 col-span-2 flex justify-between"><span>Lease End Date:</span><span class="font-bold text-gray-700">{{ getLeaseEndDate() }}</span></p>
              </div>
            </div>
            <div *ngIf="!showPaymentFlow" class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label class="block text-sm font-bold text-gray-700 mb-2">Move-in Date</label><input type="date" [(ngModel)]="bookingData.moveInDate" [min]="today" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"></div>
              <div><label class="block text-sm font-bold text-gray-700 mb-2">Lease Duration</label>
                <select [(ngModel)]="bookingData.leaseDuration" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm font-medium">
                  <option [ngValue]="3">3 Months</option><option [ngValue]="6">6 Months</option><option [ngValue]="12">12 Months</option><option [ngValue]="24">24 Months</option>
                </select>
              </div>
            </div>
            <div *ngIf="!showPaymentFlow"><label class="block text-sm font-bold text-gray-700 mb-2">Notes to Admin</label><textarea [(ngModel)]="bookingData.notes" rows="2" placeholder="Any special requests..." class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"></textarea></div>
            <div *ngIf="towerReviews.length>0&&!showPaymentFlow" class="border border-gray-100 p-4 rounded-xl">
              <p class="font-bold text-gray-900 mb-3 flex items-center gap-2"><svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>Reviews ({{ towerReviews.length }})</p>
              <div class="max-h-40 overflow-y-auto space-y-2">
                <div *ngFor="let rev of towerReviews" class="border-b border-gray-50 pb-2 last:border-0"><div class="flex justify-between"><span class="font-bold text-xs text-gray-900">{{ rev.user_name }}</span><div class="flex"><svg *ngFor="let s of [1,2,3,4,5]" class="w-3 h-3" [class.text-yellow-400]="s<=rev.rating" [class.text-gray-200]="s>rev.rating" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div></div><p *ngIf="rev.comment" class="text-xs text-gray-500 truncate">{{ rev.comment }}</p></div>
              </div>
            </div>
            <div *ngIf="!showPaymentFlow" class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <input type="checkbox" id="terms" [(ngModel)]="bookingData.agreedToTerms" class="mt-1 w-4 h-4 text-indigo-600 cursor-pointer rounded">
              <label for="terms" class="text-sm text-gray-600 cursor-pointer leading-relaxed">I agree to the <a href="#" class="text-indigo-600 hover:underline font-medium">Terms of Tenancy</a> and understand a holding deposit may be required upon approval.</label>
            </div>
            <!-- We removed the in-modal payment flow for Request Booking mode -->
          </div>
          <div class="p-5 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-white">
            <button (click)="closeBookingModal()" class="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
            <button (click)="submitBooking()" [disabled]="!bookingData.moveInDate||!bookingData.agreedToTerms" [class.opacity-40]="!bookingData.moveInDate||!bookingData.agreedToTerms" class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Request Booking
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance Modal -->
    <div *ngIf="isMaintenanceModalOpen" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-gray-900 p-5 text-white font-bold text-xl flex justify-between items-center shrink-0">
          <span>File Maintenance Request</span><button (click)="isMaintenanceModalOpen=false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div><label class="block text-sm font-bold text-gray-700 mb-2">Unit</label>
            <select [(ngModel)]="maintenanceData.unitId" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option [ngValue]="null" disabled>Select Leased Unit</option>
              <option *ngFor="let lease of getActiveLeases()" [ngValue]="lease.booking?.unit_id">Agreement: {{ lease.agreement_id }}</option>
            </select>
            <p *ngIf="getActiveLeases().length===0" class="text-sm text-red-500 mt-1">You must have an active lease to file a request.</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select [(ngModel)]="maintenanceData.category" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Plumbing</option><option>Electrical</option><option>Civil</option><option>HVAC</option><option>Appliances</option><option>Other</option>
              </select>
            </div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2">Priority</label>
              <select [(ngModel)]="maintenanceData.priority" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="LOW">🟢 Low</option><option value="MEDIUM">🟡 Medium</option><option value="HIGH">🔴 High</option>
              </select>
            </div>
          </div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
            <textarea [(ngModel)]="maintenanceData.description" rows="4" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400" placeholder="Please describe the issue in detail..."></textarea>
          </div>
        </div>
        <div class="p-5 border-t flex justify-end gap-3 shrink-0 bg-white">
          <button (click)="isMaintenanceModalOpen=false" class="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
          <button (click)="submitMaintenance()" class="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition text-sm">Submit Request</button>
        </div>
      </div>
    </div>

    <!-- Vacate Request Modal -->
    <div *ngIf="showVacateModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-red-700 p-5 text-white font-bold text-xl flex justify-between items-center shrink-0">
          <span>Request to Vacate Unit {{ activeVacateLease?.unit_number || activeVacateLease?.booking?.unit_number }}</span>
          <button (click)="showVacateModal=false" class="text-white/70 hover:text-white">✕</button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <p class="text-gray-700 text-sm">Please provide the date you intend to vacate the property and a brief reason for your request. A minimum of 30 days notice is typically required as per your lease agreement.</p>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Intended Vacate Date</label>
            <input type="date" [(ngModel)]="vacateData.date" [min]="today" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Reason for Vacating</label>
            <textarea [(ngModel)]="vacateData.reason" rows="4" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-400" placeholder="e.g., Relocation, new job, personal reasons..."></textarea>
          </div>
          <div class="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-red-900">
            <p class="font-bold mb-1">Important Notice</p>
            <p>Submitting this request does not guarantee approval. The property management will review your request and contact you regarding the next steps and any applicable terms from your lease agreement.</p>
          </div>
        </div>
        <div class="p-5 border-t flex justify-end gap-3 shrink-0 bg-white">
          <button (click)="showVacateModal=false" class="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
          <button (click)="submitVacateRequest()" [disabled]="!vacateData.date || !vacateData.reason" class="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition text-sm" [class.opacity-50]="!vacateData.date || !vacateData.reason">Submit Vacate Request</button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div *ngIf="showPaymentModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="bg-indigo-600 p-5 text-white font-bold text-lg flex justify-between items-center shrink-0">
          <span class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> Secure Checkout</span>
          <button (click)="showPaymentModal=false" class="text-indigo-200 hover:text-white">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Payment Purpose</label>
            <select [(ngModel)]="paymentData.type" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm">
              <option value="RENT">Monthly Rent</option>
              <option value="DEPOSIT">Security Deposit</option>
              <option value="MAINTENANCE">Maintenance Charges</option>
            </select>
          </div>
          <div *ngIf="paymentData.breakdown" class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2 mb-4">
            <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Fare Breakdown</p>
            <div class="flex justify-between text-sm text-indigo-900">
              <span>Security Deposit:</span>
              <span class="font-bold">₹{{ paymentData.breakdown.deposit }}</span>
            </div>
            <div class="flex justify-between text-sm text-indigo-900 pb-2 border-b border-indigo-200">
              <span>First Month's Rent:</span>
              <span class="font-bold">₹{{ paymentData.breakdown.rent }}</span>
            </div>
            <div class="flex justify-between text-base text-indigo-900 pt-1">
              <span class="font-black">Total Initial Payment:</span>
              <span class="font-black text-xl">₹{{ paymentData.amount }}</span>
            </div>
          </div>

          <div *ngIf="!paymentData.breakdown">
            <label class="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input type="number" [(ngModel)]="paymentData.amount" placeholder="0.00" class="w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-black text-gray-900">
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Payment Method</label>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <label class="border rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition shadow-sm" [class.ring-2]="paymentData.method==='CREDIT_CARD'" [class.border-indigo-500]="paymentData.method==='CREDIT_CARD'" [class.bg-indigo-50]="paymentData.method==='CREDIT_CARD'">
                <input type="radio" [(ngModel)]="paymentData.method" value="CREDIT_CARD" class="hidden">💳 Card
              </label>
              <label class="border rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition shadow-sm" [class.ring-2]="paymentData.method==='UPI'" [class.border-indigo-500]="paymentData.method==='UPI'" [class.bg-indigo-50]="paymentData.method==='UPI'">
                <input type="radio" [(ngModel)]="paymentData.method" value="UPI" class="hidden">📱 UPI
              </label>
              <label class="border rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition shadow-sm" [class.ring-2]="paymentData.method==='BANK_TRANSFER'" [class.border-indigo-500]="paymentData.method==='BANK_TRANSFER'" [class.bg-indigo-50]="paymentData.method==='BANK_TRANSFER'">
                <input type="radio" [(ngModel)]="paymentData.method" value="BANK_TRANSFER" class="hidden">🏦 NetBanking
              </label>
            </div>
          </div>
          <div><label class="block text-sm font-bold text-gray-700 mb-1">Notes (Optional)</label><textarea [(ngModel)]="paymentData.notes" rows="2" placeholder="Any specific details for this payment..." class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm"></textarea></div>
        </div>
        <div class="p-5 border-t bg-gray-50 flex gap-3">
          <button (click)="showPaymentModal=false" class="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
          <button (click)="submitPayment()" [disabled]="!paymentData.amount || paymentData.amount <= 0" class="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50 text-sm">Pay ₹{{paymentData.amount||'0'}}</button>
        </div>
      </div>
    </div>

    <!-- Tower Amenities Modal -->
    <div *ngIf="isTowerAmenitiesModalOpen" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden">
        <div class="bg-indigo-700 p-5 text-white font-bold text-xl flex justify-between items-center shrink-0">
          <span>{{ selectedTower?.name }} Amenities</span><button (click)="isTowerAmenitiesModalOpen=false" class="text-white/70 hover:text-white">✕</button>
        </div>
        <div class="p-5 overflow-y-auto space-y-3 flex-1">
          <div *ngIf="!selectedTower?.amenities?.length" class="text-center text-gray-500 py-8 text-sm">No amenities listed for this property.</div>
          <div *ngFor="let am of selectedTower?.amenities" class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xl">{{ getAmenityIcon(am.name) }}</div>
            <div><span class="font-bold text-gray-800">{{ am.name }}</span><p *ngIf="am.description" class="text-xs text-gray-500 mt-0.5">{{am.description}}</p></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Custom Toast Notification ─────────────────────────────────────── -->
    <div *ngIf="toast.show" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in">
      <div [class]="'flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md min-w-[320px] max-w-md ' + 
        (toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 'bg-red-50/90 border-red-200 text-red-800')">
        <div [class]="'w-10 h-10 rounded-full flex items-center justify-center shrink-0 ' + 
          (toast.type === 'success' ? 'bg-green-100' : 'bg-red-100')">
          <svg *ngIf="toast.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          <svg *ngIf="toast.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <div class="flex-1">
          <p class="font-bold text-sm tracking-tight">{{ toast.type === 'success' ? 'Success' : 'Error' }}</p>
          <p class="text-xs font-medium leading-relaxed opacity-90 whitespace-pre-line">{{ toast.message }}</p>
        </div>
        <button (click)="toast.show=false" class="text-gray-400 hover:text-gray-600 transition p-1">✕</button>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  currentUser: any;
  currentView: 'discovery' | 'bookings' | 'maintenance' | 'leases' | 'payments' | 'profile' = 'discovery';

  // Data
  towers: any[] = [];
  selectedTower: any = null;
  units: any[] = [];
  recommendations: any[] = [];
  duesData: any = null;
  bookings: any[] = [];
  leases: any[] = [];
  maintenanceRequests: any[] = [];
  payments: any[] = []; // Added
  towerReviews: any[] = [];
  notifications: any[] = [];
  summary: any = { active_leases: 0, pending_bookings: 0, open_maintenance: 0, upcoming_expiry: null };

  // UI State
  isLoading = false;
  unreadCount = 0;
  showNotifPanel = false;
  showReviewForm = false;
  newReview = { rating: 5, comment: '', unitId: null as number | null };

  // Filters & Location
  filterState = { minRent: '', maxRent: '', flatType: '', floorNumber: '', sortBy: 'score' };
  locationFilters = { city: '', area: '', pincode: '', search: '' };
  availableCities: string[] = [];
  availableAreas: string[] = [];

  showFilters = false;
  viewMode: 'list' | 'map' = 'list';
  userLocation: { lat: number, lng: number } | null = null;
  map: any;
  markers: any[] = [];

  // Modals
  isBookingModalOpen = false;
  showPaymentFlow = false;
  selectedUnit: any = null;
  bookingData = { moveInDate: '', leaseDuration: 12, notes: '', agreedToTerms: false };

  isMaintenanceModalOpen = false;
  maintenanceData = { unitId: null as number | null, category: 'Plumbing', description: '', priority: 'MEDIUM' };

  isTowerAmenitiesModalOpen = false;
  showTowerGalleryModal = false;

  showUnitDetailModal = false;
  activeDetailUnit: any = null;

  today: string;
  autoScrollInterval: any;

  showVacateModal = false;
  activeVacateLease: any = null;
  vacateData = { date: '', reason: '' };

  profileData = { name: '', phone: '', address: '', city: '', state: '', zip_code: '' };

  showPaymentModal = false; // Added
  staticUrl = environment.staticUrl; // Base URL for static files served by Flask
  paymentData = { amount: null as number | null, type: 'RENT', method: 'CREDIT_CARD', notes: '' }; // Added

  // Toast Notification
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };
  private toastTimeout: any;

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { show: true, message, type };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.show = false, 6000);
  }

  constructor(private authService: AuthService, private apiService: ApiService) {
    this.currentUser = this.authService.currentUserValue;
    this.profileData = {
      name: this.currentUser?.name || '',
      phone: this.currentUser?.phone || '',
      address: this.currentUser?.address || '',
      city: this.currentUser?.city || '',
      state: this.currentUser?.state || '',
      zip_code: this.currentUser?.zip_code || ''
    };
    const dp = new Date();
    dp.setDate(dp.getDate() + 1);
    this.today = dp.toISOString().split('T')[0];
  }

  saveProfile() {
    this.isLoading = true;
    this.apiService.updateProfile(this.profileData).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Update local currentUser and auth storage if necessary
        this.currentUser = { ...this.currentUser, ...res.user };
        // We might need to tell authService to update its stored user
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        alert('Profile updated successfully');
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Failed to update profile');
      }
    });
  }

  ngOnInit() {
    this.loadLocations();
    this.getUserLocation();
    this.loadTowers();
    this.loadMyData();
    this.loadSummary();
    this.loadNotifications();
  }

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);
    if (this.map) this.map.remove();
  }

  // ── Location & Map ────────────────────────────────────────────────────────
  loadLocations() {
    this.apiService.getLocations().subscribe(res => {
      this.availableCities = res.cities || [];
      this.availableAreas = res.areas || [];
    });
  }

  getUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          // If towers are already loaded, refresh them to trigger distance calculation
          if (this.towers.length > 0) this.loadTowers();
        },
        (error) => console.log('Geolocation denied or failed', error),
        { timeout: 10000 }
      );
    }
  }

  toggleMapView() {
    this.viewMode = 'map';
    // Small delay to ensure the #map div is in the DOM
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap() {
    if (this.map) this.map.remove(); // Re-initialize

    // Default center to India or User Location
    const centerLat = this.userLocation?.lat || 20.5937;
    const centerLng = this.userLocation?.lng || 78.9629;
    const zoom = this.userLocation ? 10 : 4;

    // @ts-ignore - Leaflet is loaded via CDN globally
    this.map = L.map('map').setView([centerLat, centerLng], zoom);

    // @ts-ignore
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.renderMapMarkers();
  }

  renderMapMarkers() {
    if (!this.map) return;

    // Clear old markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const bounds: any[] = [];

    this.towers.forEach(tower => {
      if (tower.latitude && tower.longitude) {
        // @ts-ignore
        const marker = L.marker([tower.latitude, tower.longitude]).addTo(this.map);

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 150px;">
            <h3 style="margin:0; font-size:14px; font-weight:bold; color:#111827;">${tower.name}</h3>
            <p style="margin:2px 0 6px; font-size:11px; color:#4F46E5; font-weight:bold;">${tower.area ? tower.area + ', ' : ''}${tower.city || ''}</p>
            <p style="margin:0 0 8px; font-size:12px; color:#059669;">${tower.available_units_count} Units Available</p>
            <button onclick="document.dispatchEvent(new CustomEvent('map-select-tower', {detail: ${tower.id}}))" 
                    style="width:100%; padding:6px; background:#4F46E5; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
              View Property
            </button>
          </div>
        `;
        marker.bindPopup(popupContent);
        this.markers.push(marker);
        bounds.push([tower.latitude, tower.longitude]);
      }
    });

    if (bounds.length > 0) {
      // @ts-ignore - Fit map to bounds of all towers
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    // Set up listener for the popup button click
    if (!(window as any).mapListenerAdded) {
      document.addEventListener('map-select-tower', (e: any) => {
        const towerId = e.detail;
        const tower = this.towers.find(t => t.id === towerId);
        if (tower) {
          // Switch back to list view and select tower
          this.viewMode = 'list';
          this.selectTower(tower);
        }
      });
      (window as any).mapListenerAdded = true;
    }
  }

  // ── Data Loading ──────────────────────────────────────────────────────────
  loadTowers() {
    if (this.filterState.sortBy === 'nearest' && this.userLocation) {
      this.apiService.getNearbyTowers(this.userLocation.lat, this.userLocation.lng, 50).subscribe(towers => {
        this.towers = this.applyLocalFilters(towers);
        if (this.viewMode === 'map') this.renderMapMarkers();
        if (this.towers.length > 0 && !this.selectedTower) this.selectTower(this.towers[0]);
      });
    } else {
      this.apiService.getUserTowers(this.locationFilters).subscribe(towers => {
        // If sorting isn't requested by DB but we have user location, just append the distance property without sorting
        if (this.userLocation && this.filterState.sortBy !== 'nearest') {
          towers.forEach(t => {
            if (t.latitude && t.longitude) {
              t.distance_km = this.calculateDistance(this.userLocation!.lat, this.userLocation!.lng, t.latitude, t.longitude);
            }
          });
        }
        this.towers = towers;
        if (this.viewMode === 'map') this.renderMapMarkers();
        if (this.towers.length > 0 && (!this.selectedTower || !this.towers.find(t => t.id === this.selectedTower.id))) {
          this.selectTower(this.towers[0]);
        }
      });
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 +
      c(lat1 * p) * c(lat2 * p) *
      (1 - c((lon2 - lon1) * p)) / 2;
    return Math.round(12742 * Math.asin(Math.sqrt(a)) * 10) / 10; // 2 * R; R = 6371 km
  }

  applyLocalFilters(towers: any[]): any[] {
    // Used when getting nearby towers API which doesn't support the extensive text filters
    return towers.filter(t => {
      let match = true;
      if (this.locationFilters.city && t.city !== this.locationFilters.city) match = false;
      if (this.locationFilters.area && t.area !== this.locationFilters.area) match = false;
      if (this.locationFilters.pincode && t.pincode !== this.locationFilters.pincode) match = false;
      if (this.locationFilters.search) {
        const term = this.locationFilters.search.toLowerCase();
        if (!t.name.toLowerCase().includes(term) &&
          !(t.city || '').toLowerCase().includes(term) &&
          !(t.area || '').toLowerCase().includes(term) &&
          !(t.pincode || '').includes(term)) {
          match = false;
        }
      }
      return match;
    });
  }

  selectTower(tower: any) {
    this.selectedTower = tower;
    this.applyFilters();
    this.loadRecommendations(tower.id);
    this.loadTowerReviews(tower.id);
  }

  applyFilters() {
    this.loadTowers(); // Reloads towers using location filters

    if (!this.selectedTower) return;
    const f = this.filterState;
    this.apiService.getRecommendedUnits(
      this.selectedTower.id.toString(),
      f.minRent || undefined,
      f.maxRent || undefined,
      f.flatType || undefined,
      f.floorNumber || undefined,
      f.sortBy === 'nearest' ? undefined : f.sortBy || undefined
    ).subscribe(res => this.units = res.units || []);
  }

  resetFilters() {
    this.filterState = { minRent: '', maxRent: '', flatType: '', floorNumber: '', sortBy: 'score' };
    this.locationFilters = { city: '', area: '', pincode: '', search: '' };
    this.applyFilters();
  }

  loadRecommendations(towerId: number) {
    this.apiService.getSmartRecommendations(towerId).subscribe(res => {
      this.recommendations = (res.units || []).slice(0, 6);
    });
  }

  loadSummary() {
    this.apiService.getUserSummary().subscribe(res => this.summary = res, () => { });
  }

  loadNotifications() {
    this.apiService.getNotifications().subscribe(res => {
      this.notifications = res.notifications || [];
      this.unreadCount = res.unread_count || 0;
    }, () => { });
  }

  loadMyData() {
    this.apiService.getMyBookings().subscribe(res => this.bookings = res);
    this.apiService.getMyLeases().subscribe(res => this.leases = res);
    this.apiService.getMyMaintenanceRequests().subscribe(res => this.maintenanceRequests = res);
    this.loadPayments(); // Call loadPayments here
  }

  loadPayments() {
    this.apiService.getMyPayments().subscribe(res => this.payments = res);
    this.apiService.getMyDues().subscribe(res => this.duesData = res);
  }

  loadTowerReviews(towerId: number) {
    this.apiService.getTowerReviews(towerId).subscribe(res => this.towerReviews = res);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getUnits() { return this.units; }

  getActiveLeases() { return this.leases.filter(l => l.status === 'ACTIVE'); }

  getLeaseDaysLeft(lease: any): number {
    if (!lease.end_date) return 0;
    const end = new Date(lease.end_date);
    const today = new Date();
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  getLeaseProgress(lease: any): number {
    if (!lease.start_date || !lease.end_date) return 0;
    const start = new Date(lease.start_date).getTime();
    const end = new Date(lease.end_date).getTime();
    const now = new Date().getTime();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }

  getLeaseEndDate(): string {
    if (!this.bookingData.moveInDate || !this.bookingData.leaseDuration) return '';
    const d = new Date(this.bookingData.moveInDate);
    d.setMonth(d.getMonth() + this.bookingData.leaseDuration);
    return d.toISOString().split('T')[0];
  }

  getAmenityIcon(name: string): string {
    const map: any = {
      'Gym': '🏋️', 'Pool': '🏊', 'Swimming Pool': '🏊', 'Parking': '🅿️',
      'Security': '🔒', 'Power Backup': '⚡', 'Lift': '🛗', 'Elevator': '🛗',
      'Garden': '🌿', 'Clubhouse': '🏠', 'WiFi': '📶', 'CCTV': '📷',
      'Laundry': '🧺', 'Play Area': '🎠', 'Rooftop': '🌆', 'AC': '❄️'
    };
    for (const key of Object.keys(map)) {
      if (name.toLowerCase().includes(key.toLowerCase())) return map[key];
    }
    return '✨';
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    // Cloudinary and other absolute URLs — use as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Legacy local filesystem path — prepend backend staticUrl
    return this.staticUrl + '/' + path;
  }

  getBookingTimeline(status: string): number {
    switch (status) {
      case 'PENDING':   return 1;  // Step 1 active
      case 'APPROVED':  return 2;  // Steps 1-2 done, step 3 active (payment pending)
      case 'BOOKED':    return 4;  // All 4 steps complete
      case 'REJECTED':  return 2;  // Steps 1-2 done, rejected at decision
      case 'CANCELLED': return 2;  // Steps 1-2 done, cancelled
      default:          return 1;
    }
  }

  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      document.querySelectorAll('.unit-carousel').forEach((carousel: any) => {
        if (carousel.scrollWidth > carousel.clientWidth) {
          if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
          }
        }
      });
    }, 4000);
  }

  scrollImages(el: HTMLElement, direction: number) {
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
  }

  logout() { this.authService.logout(); }

  // ── Reviews ───────────────────────────────────────────────────────────────
  submitReview() {
    if (!this.selectedTower) return;
    this.apiService.submitReview(this.selectedTower.id, this.newReview.rating, this.newReview.comment, this.newReview.unitId ?? undefined).subscribe({
      next: () => {
        this.newReview = { rating: 5, comment: '', unitId: null };
        this.showReviewForm = false;
        this.loadTowerReviews(this.selectedTower.id);
        this.loadSummary();
      },
      error: (err) => this.showToast(err.error?.message || 'Error submitting review', 'error')
    });
  }

  // ── Tower Modals ─────────────────────────────────────────────────────────
  openTowerGalleryModal() { this.showTowerGalleryModal = true; }
  openTowerAmenitiesModal() { this.isTowerAmenitiesModalOpen = true; }

  openUnitDetailModal(unit: any) {
    this.activeDetailUnit = unit;
    this.showUnitDetailModal = true;
  }

  downloadLease(lease: any) {
    if (!lease.pdf_path) { this.showToast('No lease document available.', 'error'); return; }
    const token = this.authService.currentUserValue?.token;
    if (token && lease.id) {
      this.apiService.downloadLeaseBlob(lease.id).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${lease.agreement_id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error: () => window.open(this.staticUrl + '/' + lease.pdf_path, '_blank')
      });
    } else {
      window.open(this.staticUrl + '/' + lease.pdf_path, '_blank');
    }
  }

  openVacateModal(lease: any) {
    this.activeVacateLease = lease;
    this.vacateData = { date: '', reason: '' };
    this.showVacateModal = true;
  }

  submitVacateRequest() {
    if (!this.activeVacateLease || !this.vacateData.date) return;

    this.apiService.requestVacate(this.activeVacateLease.id, {
      vacate_reason: this.vacateData.reason,
      desired_vacate_date: this.vacateData.date
    }).subscribe({
      next: (res: any) => {
        this.showToast(res.message);
        this.showVacateModal = false;
        this.loadMyData(); // refresh leases
        this.loadSummary();
      },
      error: (err) => this.showToast(err.error?.message || 'Error occurred while requesting vacate.', 'error')
    });
  }

  // ── Booking Modal ─────────────────────────────────────────────────────────
  openBookingModal(unit: any) {
    this.selectedUnit = unit;
    this.showPaymentFlow = false;
    this.bookingData = { moveInDate: '', leaseDuration: 12, notes: '', agreedToTerms: false };
    this.isBookingModalOpen = true;
  }

  closeBookingModal() {
    this.isBookingModalOpen = false;
    this.selectedUnit = null;
  }

  submitBooking() {
    if (!this.selectedUnit || !this.bookingData.moveInDate || !this.bookingData.agreedToTerms) return;
    this.apiService.bookUnit(this.selectedUnit.id, this.bookingData.moveInDate, this.bookingData.leaseDuration, this.bookingData.notes).subscribe({
      next: () => {
        this.showToast('Booking Request Received!\n\nIMPORTANT: Once the admin approves your request, you will have exactly 6 HOURS to complete the deposit payment. Please keep an eye on your status.');
        this.closeBookingModal();
        this.currentView = 'bookings';
        this.loadMyData();
        this.loadSummary();
      },
      error: (err) => this.showToast(err.error?.message || 'Error occurred', 'error')
    });
  }

  getPendingDeposits() {
    return this.bookings.filter(b =>
      b.status === 'APPROVED' &&
      !this.leases.find(l => l.booking && l.booking.id === b.id)
    );
  }

  getDepositTimeLeft(approvedAtStr: string): string {
    if (!approvedAtStr) return 'Unknown';
    const approvedAt = new Date(approvedAtStr).getTime();
    if (isNaN(approvedAt)) return 'Invalid Date';
    // Let's assume approved_at is UTC, so we compare with current UTC time
    const nowLocal = new Date();
    const now = new Date(nowLocal.getTime() + nowLocal.getTimezoneOffset() * 60000).getTime();

    // Check if the backend gave us an ISO string with Z. If it doesn't end with Z, we treat it as UTC.
    let parsedApprove = approvedAtStr.endsWith('Z') ? approvedAt : new Date(approvedAtStr + 'Z').getTime();

    const diffMs = (parsedApprove + (6 * 60 * 60 * 1000)) - Date.now();
    if (diffMs <= 0) return 'Expired';
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  payDeposit(booking: any) {
    const totalAmount = Number(booking.deposit_amount || 0) + Number(booking.rent_amount || 0);
    this.paymentData = {
      amount: totalAmount,
      type: 'BOOKING_PAYMENT',
      method: 'CREDIT_CARD',
      notes: `Initial Payment (Deposit + Rent) for Unit ${booking.unit_number}`
    };
    // Store breakdown for display in modal
    (this.paymentData as any).breakdown = {
      deposit: booking.deposit_amount,
      rent: booking.rent_amount
    };
    // Let's hijack the payment modal but mark it so it pays the deposit endpoint
    this.showPaymentModal = true;
    (this.paymentData as any).bookingId = booking.id; // Secretly store the booking id
  }

  // ── Maintenance Modal ─────────────────────────────────────────────────────
  openMaintenanceModal() {
    this.isMaintenanceModalOpen = true;
    const activeLeases = this.getActiveLeases();
    if (activeLeases.length === 1) this.maintenanceData.unitId = activeLeases[0].booking?.unit_id || null;
  }

  submitMaintenance() {
    if (!this.maintenanceData.unitId) { this.showToast('Please select a leased unit.', 'error'); return; }
    if (!this.maintenanceData.description) { this.showToast('Please provide a description.', 'error'); return; }
    this.apiService.createMaintenanceRequest(
      this.maintenanceData.unitId, this.maintenanceData.category, this.maintenanceData.description, this.maintenanceData.priority
    ).subscribe({
      next: () => {
        this.isMaintenanceModalOpen = false;
        this.maintenanceData = { unitId: null, category: 'Plumbing', description: '', priority: 'MEDIUM' };
        this.loadMyData();
        this.loadSummary();
      },
      error: (err) => this.showToast(err.error?.message || 'Error occurred', 'error')
    });
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  payDue(dueItem: any) {
    this.paymentData = {
      amount: dueItem.amount,
      type: 'RENT',
      method: 'CREDIT_CARD',
      notes: `Rent Payment for Unit ${dueItem.unit_number || 'N/A'} (Due Date: ${dueItem.due_date})`
    };
    this.showPaymentModal = true;
  }

  openPaymentModal() {
    this.paymentData = { amount: null, type: 'RENT', method: 'CREDIT_CARD', notes: '' };
    this.showPaymentModal = true;
  }

  submitPayment() {
    if (!this.paymentData.amount || Number(this.paymentData.amount) <= 0) {
      this.showToast('Valid amount required', 'error');
      return;
    }

    if ((this.paymentData as any).bookingId) {
      // Pay Deposit flow
      this.apiService.payBookingDeposit((this.paymentData as any).bookingId, this.paymentData.method).subscribe({
        next: (res) => {
          this.showToast('Deposit paid and Lease generated successfully!');
          this.showPaymentModal = false;
          (this.paymentData as any).bookingId = null;
          this.loadMyData();
        },
        error: (err) => this.showToast('Payment failed: ' + (err.error?.message || 'Unknown error'), 'error')
      });
    } else {
      // Standard Payment flow
      this.apiService.makePayment(Number(this.paymentData.amount), this.paymentData.method, this.paymentData.type, this.paymentData.notes).subscribe({
        next: (res) => {
          this.showToast('Payment processed successfully!');
          this.showPaymentModal = false;
          this.loadPayments();
        },
        error: (err) => this.showToast('Payment failed: ' + (err.error?.message || 'Unknown error'), 'error')
      });
    }
  }
}
