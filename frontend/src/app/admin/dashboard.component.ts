import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { AdminAuditPageComponent } from './admin-audit-page.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminAuditPageComponent],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans relative">
      <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-900 text-white flex flex-col shrink-0 sticky top-0 h-screen">
          <div class="p-6 border-b border-gray-800">
            <h2 class="text-2xl font-bold tracking-wider">Admin<span class="text-indigo-400">Portal</span></h2>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <button (click)="switchView('analytics')" [class.bg-indigo-600]="currentView === 'analytics'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Dashboard</button>
            <button (click)="switchView('towers')" [class.bg-indigo-600]="currentView === 'towers'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Towers</button>
            <button (click)="switchView('units')" [class.bg-indigo-600]="currentView === 'units'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Units</button>
            <button (click)="switchView('amenities')" [class.bg-indigo-600]="currentView === 'amenities'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Amenities</button>
            <button (click)="switchView('bookings')" [class.bg-indigo-600]="currentView === 'bookings'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Bookings</button>
            <button (click)="switchView('leases')" [class.bg-indigo-600]="currentView === 'leases'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Leases</button>
            <button (click)="switchView('maintenance')" [class.bg-indigo-600]="currentView === 'maintenance'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Maintenance</button>
            <button (click)="switchView('payments')" [class.bg-indigo-600]="currentView === 'payments'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium">Payments</button>
            <button (click)="switchView('audit')" [class.bg-indigo-600]="currentView === 'audit'" class="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800 transition font-medium mt-4 border border-gray-700">Audit Logs</button>
          </nav>
          <div class="p-4 border-t border-gray-800 text-sm shrink-0">
             <button (click)="logout()" class="w-full py-2 bg-gray-800 hover:bg-red-600 rounded-lg transition font-semibold">Sign Out</button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto p-8 h-screen">
          
          <!-- ANALYTICS DASHBOARD -->
          <div *ngIf="currentView === 'analytics'" class="space-y-6">
            <div class="flex justify-between items-center mb-8">
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">Property Dashboard</h1>
              <div class="flex items-center gap-3">
                <button (click)="showTowerModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition">+ Add Tower</button>
                <button (click)="openAddUnitModalForTower()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition">🏠 Add Units</button>
                <button (click)="switchView('amenities')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition">+ Amenity</button>
                
                <button (click)="switchView('bookings')" 
                  class="px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition flex items-center gap-2"
                  [ngClass]="dashboard?.pending_bookings > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700'">
                  <span>📋 Pending</span>
                  <span *ngIf="dashboard?.pending_bookings > 0" class="bg-white text-amber-600 px-1.5 py-0.5 rounded-full text-[10px]">{{ dashboard.pending_bookings }}</span>
                </button>

                <button (click)="switchView('leases')" 
                  class="px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition flex items-center gap-2"
                  [ngClass]="dashboard?.leases_expiring_30d > 0 ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'">
                  <span>🕒 Expiring</span>
                  <span *ngIf="dashboard?.leases_expiring_30d > 0" class="bg-white text-rose-600 px-1.5 py-0.5 rounded-full text-[10px]">{{ dashboard.leases_expiring_30d }}</span>
                </button>
              </div>
            </div>
            
            <!-- 8 Stat Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Active Towers -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-indigo-100 text-4xl opacity-20 transition-transform group-hover:scale-110">🏢</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Towers</span>
                  </div>
                  <p class="text-4xl font-black text-gray-900 mb-1">{{ dashboard?.active_towers || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Active Towers</p>
                  <button (click)="switchView('towers')" class="text-xs font-bold text-indigo-600 hover:underline">Manage &rarr;</button>
                </div>
              </div>

              <!-- Total Units -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-gray-100 text-4xl opacity-20 transition-transform group-hover:scale-110">🏠</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-0.5 rounded">Units</span>
                  </div>
                  <p class="text-4xl font-black text-gray-900 mb-1">{{ dashboard?.total_units || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Total Units</p>
                  <button (click)="switchView('units')" class="text-xs font-bold text-gray-600 hover:underline">Manage &rarr;</button>
                </div>
              </div>

              <!-- Available Units -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-emerald-100 text-4xl opacity-20 transition-transform group-hover:scale-110">✅</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Avail</span>
                  </div>
                  <p class="text-4xl font-black text-emerald-600 mb-1">{{ dashboard?.available_units || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Available Units</p>
                </div>
              </div>

              <!-- Booked Units -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-amber-100 text-4xl opacity-20 transition-transform group-hover:scale-110">📋</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Booked</span>
                  </div>
                  <p class="text-4xl font-black text-amber-600 mb-1">{{ dashboard?.booked_units || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Booked Units</p>
                  <button (click)="switchView('bookings')" class="text-xs font-bold text-amber-600 hover:underline">View Bookings &rarr;</button>
                </div>
              </div>

              <!-- Leased Units -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-purple-100 text-4xl opacity-20 transition-transform group-hover:scale-110">📄</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50 px-2 py-0.5 rounded">Leased</span>
                  </div>
                  <p class="text-4xl font-black text-purple-600 mb-1">{{ dashboard?.leased_units || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Leased Units</p>
                </div>
              </div>

              <!-- Active Leases -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-blue-100 text-4xl opacity-20 transition-transform group-hover:scale-110">🛡️</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p class="text-4xl font-black text-blue-600 mb-1">{{ dashboard?.active_leases || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Active Leases</p>
                  <button (click)="switchView('leases')" class="text-xs font-bold text-blue-600 hover:underline">View Leases &rarr;</button>
                </div>
              </div>

              <!-- Pending Bookings -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-orange-100 text-4xl opacity-20 transition-transform group-hover:scale-110">🕒</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Pending</span>
                  </div>
                  <p class="text-4xl font-black text-orange-600 mb-1">{{ dashboard?.pending_bookings || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Pending Bookings</p>
                  <button (click)="switchView('bookings')" class="text-xs font-bold text-orange-600 hover:underline">Approve Now &rarr;</button>
                </div>
              </div>

              <!-- Tickets/Maintenance -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-rose-100 text-4xl opacity-20 transition-transform group-hover:scale-110">⚙️</div>
                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Tickets</span>
                  </div>
                  <p class="text-4xl font-black text-rose-600 mb-1">{{ dashboard?.open_maintenance || 0 }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Open Maintenance</p>
                  <button (click)="switchView('maintenance')" class="text-xs font-bold text-rose-600 hover:underline">View Tickets &rarr;</button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Occupancy Overview Donut -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="font-bold text-gray-900 text-lg">Occupancy Overview</h3>
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Live unit status distribution</span>
                </div>
                <div class="flex items-center gap-8 h-full">
                  <div class="relative w-44 h-44">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" stroke-width="12"/>
                      <circle *ngFor="let seg of donutSegments" cx="60" cy="60" r="54" fill="none" [attr.stroke]="seg.color" stroke-width="12" [attr.stroke-dasharray]="donutCircumference" [attr.stroke-dashoffset]="seg.offset" class="transition-all duration-1000"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-3xl font-black text-gray-900">{{ dashboard?.occupancy_percentage || 0 }}%</span>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">Occupied</span>
                    </div>
                  </div>
                  <div class="flex-1 space-y-4">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-500"></span><span class="font-bold">Available</span></div>
                      <span class="text-gray-900 font-black">{{ dashboard?.available_units || 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-purple-500"></span><span class="font-bold">Leased</span></div>
                      <span class="text-gray-900 font-black">{{ dashboard?.leased_units || 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-yellow-500"></span><span class="font-bold">Booked</span></div>
                      <span class="text-gray-900 font-black">{{ dashboard?.booked_units || 0 }}</span>
                    </div>
                    <div class="pt-4 border-t flex items-center justify-between text-xs text-rose-600 font-bold italic">
                      <div>⚠️ Expiring in 30d</div>
                      <div>{{ dashboard?.leases_expiring_30d || 0 }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Booking Trend Bar Chart -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="font-bold text-gray-900 text-lg">Booking Trend</h3>
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Bookings per month (last 6 months)</span>
                </div>
                <div class="flex-1 flex items-end justify-between gap-2 px-2 pb-2 h-44">
                  <div *ngFor="let b of barChartData" class="flex-1 flex flex-col items-center group relative">
                    <div class="w-full bg-indigo-50 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-300 relative" [style.height.px]="b.height">
                      <div class="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30 shadow-xl border border-gray-700">
                        {{ b.count }} bookings
                      </div>
                    </div>
                    <span class="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-tighter">{{ b.shortMonth }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Revenue Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Revenue Summary Card -->
              <div class="bg-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
                <div class="relative z-10 space-y-6">
                  <div class="flex items-center gap-2 text-indigo-200">
                    <span class="text-xl">💰</span>
                    <span class="text-xs font-black uppercase tracking-widest">Revenue Summary</span>
                  </div>
                  <div>
                    <p class="text-indigo-100 text-[10px] font-bold uppercase mb-1">Monthly Revenue</p>
                    <p class="text-4xl font-black">₹{{ (dashboard?.monthly_revenue || 0) | number }}</p>
                  </div>
                  <div class="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p class="text-indigo-200 text-[10px] font-bold uppercase mb-0.5">Annual Projection</p>
                      <p class="text-xl font-bold">₹{{ (dashboard?.annual_revenue_projection || 0) | number }}</p>
                    </div>
                    <div>
                      <p class="text-indigo-200 text-[10px] font-bold uppercase mb-0.5">Total Deposits Held</p>
                      <p class="text-xl font-bold">₹{{ (dashboard?.total_deposits || 0) | number }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Revenue Trend Chart -->
              <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="font-bold text-gray-900 text-lg">Revenue Trend</h3>
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Monthly revenue from active leases (last 6 months)</span>
                </div>
                <div class="flex-1 relative min-h-[160px]">
                  <svg viewBox="0 0 340 110" class="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revGradMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.2"/>
                        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <polygon *ngIf="revenueAreaPoints" [attr.points]="revenueAreaPoints" fill="url(#revGradMain)"/>
                    <polyline *ngIf="revenueLinePoints" [attr.points]="revenueLinePoints" fill="none" stroke="#6366f1" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
                    <circle *ngFor="let pt of revenuePointList" [attr.cx]="pt.x" [attr.cy]="pt.y" r="5" fill="white" stroke="#6366f1" stroke-width="3" class="transition-all hover:r-6 cursor-help"/>
                  </svg>
                </div>
                <div class="flex gap-2 mt-4">
                  <div *ngFor="let d of dashboard?.revenue_trend" class="flex-1 text-center text-[10px] text-gray-400 font-bold uppercase">{{ d.month.split(' ')[0] }}</div>
                </div>
              </div>
            </div>

            <!-- Tower Breakdown Table -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="p-6 border-b border-gray-100 flex flex-col gap-1">
                <h3 class="font-bold text-gray-900 text-lg">Tower-Level Breakdown</h3>
                <p class="text-[10px] text-gray-400 font-bold uppercase">Click a tower name to filter units by that tower</p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead class="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <tr>
                      <th class="p-6">Tower</th>
                      <th class="p-6 text-center">Total</th>
                      <th class="p-6 text-center text-emerald-600">Available</th>
                      <th class="p-6 text-center text-amber-600">Booked</th>
                      <th class="p-6 text-center text-purple-600">Leased</th>
                      <th class="p-6">Occupancy</th>
                      <th class="p-6 text-right">Revenue/Mo</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    <tr *ngFor="let t of dashboard?.tower_breakdown" class="border-t border-gray-50 hover:bg-indigo-50/30 transition-colors group cursor-pointer" (click)="switchView('units', t.tower_code)">
                      <td class="p-6">
                        <div class="flex flex-col">
                          <span class="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{{ t.name }}</span>
                          <span class="text-[10px] text-gray-400 font-bold lowercase tracking-tight">{{ t.tower_code }}</span>
                        </div>
                      </td>
                      <td class="p-6 text-center font-bold text-gray-500">{{ t.total_units }}</td>
                      <td class="p-6 text-center font-black text-emerald-600 bg-emerald-50/20">{{ t.available }}</td>
                      <td class="p-6 text-center font-black text-amber-600">{{ t.booked || 0 }}</td>
                      <td class="p-6 text-center font-black text-purple-600 bg-purple-50/20">{{ t.leased }}</td>
                      <td class="p-6 min-w-[140px]">
                        <div class="flex items-center gap-3">
                          <div class="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                            <div class="bg-indigo-600 h-full rounded-full transition-all duration-1000" [style.width.%]="t.occupancy_pct"></div>
                          </div>
                          <span class="text-[10px] font-black text-gray-900 w-8">{{ t.occupancy_pct }}%</span>
                        </div>
                      </td>
                      <td class="p-6 text-right font-black text-gray-900 text-lg">₹{{ t.monthly_revenue | number }}</td>
                    </tr>
                    <tr *ngIf="!dashboard?.tower_breakdown?.length">
                      <td colspan="7" class="p-12 text-center text-gray-400 italic">No tower data available.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TOWERS MANAGEMENT -->
          <div *ngIf="currentView === 'towers'" class="space-y-8">
            <div class="flex justify-between items-center">
              <h1 class="text-3xl font-black text-gray-900">Property Towers</h1>
              <button (click)="showTowerModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition">+ Add Tower</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div *ngFor="let t of towers" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all relative group overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-black text-gray-900 text-xl tracking-tight leading-none mb-1">{{ t.tower_code }}</h3>
                    <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest">{{ t.name }}</p>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-green-50 text-green-700 border border-green-100">{{ t.status || 'ACTIVE' }}</span>
                </div>
                <div class="space-y-2 mb-6 text-xs text-gray-500 font-medium">
                  <div class="flex justify-between"><span>Floors</span><span class="text-gray-900">{{ t.total_floors }}</span></div>
                  <div class="flex justify-between"><span>Units</span><span class="text-gray-900">{{ t.total_units }}</span></div>
                </div>
                <div class="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-2">
                  <button (click)="switchView('units', t.tower_code)" class="w-full bg-gray-900 text-white font-bold py-2 rounded-lg text-xs hover:bg-indigo-600 transition">View Units</button>
                  <div class="grid grid-cols-3 gap-2">
                    <button (click)="openTowerAmenitiesModal(t)" class="text-[10px] font-bold py-1.5 border rounded-lg hover:bg-gray-50 transition">Amenities</button>
                    <button (click)="openEditTowerModal(t)" class="text-[10px] font-bold py-1.5 border rounded-lg hover:bg-gray-50 transition">Edit</button>
                    <button (click)="openTowerImageModal(t)" class="text-[10px] font-bold py-1.5 border rounded-lg hover:bg-gray-50 transition">Photo</button>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="towers.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <p class="text-lg font-bold text-gray-700">No properties exist yet</p>
                <p class="text-sm mt-1">Add your first tower to start managing units.</p>
              </div>
          </div>

          <!-- UNITS MANAGEMENT -->
          <div *ngIf="currentView === 'units'" class="space-y-6">
            <div class="flex justify-between items-center">
              <h1 class="text-3xl font-black text-gray-900">{{ selectedTowerCode ? 'Units in ' + selectedTowerCode : 'Global Inventory' }}</h1>
              <div class="flex gap-4">
                <input type="text" [(ngModel)]="unitSearch" placeholder="Search units..." class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                <button (click)="openAddUnitModalForTower()" class="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">+ Add Unit</button>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th class="p-4">Unit #</th>
                    <th class="p-4">Tower</th>
                    <th class="p-4">Type</th>
                    <th class="p-4">Rent</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr *ngFor="let u of filteredUnits" class="border-t border-gray-100 hover:bg-gray-50/50 transition">
                    <td class="p-4 font-bold text-gray-900">{{ u.unit_number }}</td>
                    <td class="p-4 text-gray-500">{{ u.tower_name }}</td>
                    <td class="p-4 font-medium">{{ u.flat_type }}</td>
                    <td class="p-4 font-bold">₹{{ u.rent_amount | number }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                        [ngClass]="u.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : u.status === 'LEASED' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'">{{ u.status }}</span>
                    </td>
                    <td class="p-4 text-right">
                      <div class="flex justify-end gap-1.5">
                          <button (click)="openEditUnitModal(u)" class="px-2.5 py-1 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition">Edit</button>
                          <button (click)="openImageModal(u)" class="px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-700 hover:text-white transition">Photo</button>
                          <button (click)="setUnitMaintenance(u, u.status !== 'UNDER_MAINTENANCE')" class="px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white transition">Maint</button>
                          <button (click)="softDeleteUnit(u)" class="px-2.5 py-1 text-[10px] font-bold rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white transition">Del</button>
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- AMENITIES MANAGEMENT -->
          <div *ngIf="currentView === 'amenities'" class="space-y-8">
            <h1 class="text-3xl font-black text-gray-900">Amenities & Services</h1>
            
            <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 class="font-bold text-indigo-900 mb-4">Create New Amenity</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input [(ngModel)]="newAmenityName" placeholder="Amenity Name (e.g. Gym)" class="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <select [(ngModel)]="newAmenityCategory" class="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="General">General</option>
                  <option value="Recreation">Recreation</option>
                  <option value="Safety">Safety</option>
                  <option value="Utility">Utility</option>
                </select>
                <select [(ngModel)]="newAmenityTowerId" class="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option [ngValue]="null">Global Amenity</option>
                  <option *ngFor="let t of towers" [ngValue]="t.id">{{ t.name }}</option>
                </select>
                <button (click)="createAmenity()" [disabled]="!newAmenityName?.trim()" class="bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50">Add Amenity</button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div *ngFor="let am of amenities" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group">
                <button (click)="deleteAmenity(am.id)" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <span class="text-[9px] font-black uppercase tracking-widest text-indigo-500 block mb-1">{{ am.category }}</span>
                <h4 class="font-black text-gray-900 mb-1 leading-tight">{{ am.name }}</h4>
                <p class="text-[10px] text-gray-400 font-bold mb-4">{{ am.tower_name || 'Global' }}</p>
                <select [(ngModel)]="am.status" (change)="updateAmenityStatus(am)" class="w-full px-2 py-1.5 text-[10px] font-black uppercase rounded bg-gray-50 border-none outline-none cursor-pointer">
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="MAINTENANCE">Maint</option>
                </select>
              </div>
            </div>
          </div>
          <!-- BOOKINGS MANAGEMENT -->
          <div *ngIf="currentView === 'bookings'" class="space-y-6">
            <div class="flex justify-between items-center">
              <h1 class="text-3xl font-black text-gray-900">Tenant Applications</h1>
              <div class="flex gap-2">
                <button *ngFor="let f of bookingFilters" (click)="bookingFilter=f"
                  [ngClass]="bookingFilter===f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                  class="px-4 py-2 rounded-lg text-xs font-bold border transition">{{ f }}</button>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th class="p-4">Applicant</th>
                    <th class="p-4">Unit</th>
                    <th class="p-4">Move-in</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr *ngFor="let b of filteredBookings" class="border-t border-gray-100 hover:bg-gray-50/50 transition">
                    <td class="p-4"><span class="font-bold text-gray-900">{{ b.user_name }}</span><br><span class="text-xs text-gray-400">{{ b.user_email }}</span></td>
                    <td class="p-4">Flat {{ b.unit_number }}<br><span class="text-[10px] text-gray-400 font-bold">{{ b.tower_name }}</span></td>
                    <td class="p-4">{{ b.move_in_date }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider" 
                        [ngClass]="b.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : b.status === 'APPROVED' ? 'bg-orange-100 text-orange-700 border border-orange-200' : b.status === 'BOOKED' ? 'bg-green-50 text-green-700 border border-green-200' : b.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-700'">{{ b.status === 'APPROVED' ? 'PENDING PAYMENT' : b.status }}</span>
                    </td>
                    <td class="p-4 text-right whitespace-nowrap">
                      <div class="flex justify-end gap-2">
                        <button (click)="openBookingDetailModal(b)" class="px-3 py-1.5 text-[10px] font-black uppercase border border-gray-200 rounded-lg hover:bg-gray-900 hover:text-white transition">View</button>
                        <button *ngIf="b.status === 'PENDING'" (click)="approveBooking(b.id)" class="px-3 py-1.5 text-[10px] font-black uppercase bg-green-50 text-green-700 border border-green-100 rounded-lg hover:bg-green-600 hover:text-white transition">Approve</button>
                        <button *ngIf="b.status === 'PENDING'" (click)="openRejectModal(b)" class="px-3 py-1.5 text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition">Reject</button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredBookings.length === 0">
                    <td colspan="5" class="p-10 text-center text-gray-500">No applications found in this category.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- LEASES MANAGEMENT -->
          <div *ngIf="currentView === 'leases'" class="space-y-6">
            <div class="flex justify-between items-center">
              <h1 class="text-3xl font-black text-gray-900">Lease Agreements</h1>
              <div class="flex gap-2">
                <button *ngFor="let f of leaseFilters" (click)="leaseFilter=f"
                  [ngClass]="leaseFilter===f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                  class="px-4 py-2 rounded-lg text-xs font-bold border transition">{{ f }}</button>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th class="p-4">ID / Tenant</th>
                    <th class="p-4">Unit</th>
                    <th class="p-4">Rent</th>
                    <th class="p-4">Expires</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr *ngFor="let l of filteredLeases" class="border-t border-gray-100 hover:bg-gray-50/50 transition">
                    <td class="p-4 text-xs">
                      <span class="font-black text-indigo-600">{{ l.agreement_id }}</span><br>
                      <span class="font-bold text-gray-900">{{ l.tenant_name }}</span>
                    </td>
                    <td class="p-4 font-medium">{{ l.unit_number }}<br><span class="text-[10px] text-gray-400">{{ l.tower_name }}</span></td>
                    <td class="p-4 font-black">₹{{ l.rent_amount | number }}</td>
                    <td class="p-4">
                      <span class="font-bold text-gray-700">{{ l.end_date }}</span>
                      <br><span class="text-[10px] font-bold uppercase" [ngClass]="l.days_remaining <= 30 ? 'text-red-600' : 'text-gray-400'">{{ l.days_remaining }} days left</span>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                        [ngClass]="l.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">{{ l.computed_status }}</span>
                      <!-- Vacate Request Badge -->
                      <div *ngIf="l.vacate_request_status === 'PENDING'" class="mt-1 flex items-center gap-1 text-[9px] font-bold text-orange-600 uppercase">
                        <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Vacate Requested
                      </div>
                    </td>
                    <td class="p-4 text-right whitespace-nowrap">
                      <div class="flex flex-col gap-2 items-end">
                        <div class="flex justify-end gap-1">
                          <button (click)="openLeaseDetailModal(l)" class="px-2.5 py-1 text-[10px] font-black uppercase border border-gray-200 rounded-lg hover:bg-gray-100 transition">Detail</button>
                          <button *ngIf="l.status === 'ACTIVE'" (click)="openExtendLeaseModal(l)" class="px-2.5 py-1 text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition">Extend</button>
                          <button *ngIf="l.status === 'ACTIVE'" (click)="openTerminateLeaseModal(l)" class="px-2.5 py-1 text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition">End</button>
                        </div>
                        <div *ngIf="l.vacate_request_status === 'PENDING'" class="flex gap-1">
                          <button (click)="approveVacate(l.id)" class="px-2 py-1 bg-green-600 text-white rounded text-[9px] font-black uppercase hover:bg-green-700 transition">Approve Vacate</button>
                          <button (click)="rejectVacate(l.id)" class="px-2 py-1 bg-orange-500 text-white rounded text-[9px] font-black uppercase hover:bg-orange-600 transition">Reject</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MAINTENANCE HUB -->
          <div *ngIf="currentView === 'maintenance'" class="space-y-8">
            <h1 class="text-3xl font-black text-gray-900">Maintenance & Tickets</h1>
            <div class="grid grid-cols-1 gap-4">
              <div *ngFor="let req of maintenanceRequests" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4" [ngClass]="req.status === 'RESOLVED' ? 'border-l-green-400' : 'border-l-orange-400'">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-black text-gray-900 text-lg leading-tight">{{ req.category }}</h3>
                    <p class="text-xs text-gray-400 font-bold uppercase mt-1">Tenant Request • Unit {{ req.unit_id }}</p>
                  </div>
                  <select [(ngModel)]="req.status" (change)="updateMaintenance(req)" [disabled]="req.status === 'RESOLVED'" class="px-4 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                <p class="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">{{ req.description }}</p>
                <div *ngIf="req.status !== 'RESOLVED'" class="flex gap-2 mt-4">
                  <input [(ngModel)]="req.newComment" placeholder="Add a comment or fix details..." class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <button (click)="updateMaintenance(req)" class="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 transition">Update</button>
                </div>
                <div *ngIf="req.admin_comment" class="mt-3 p-3 bg-indigo-50 text-indigo-900 text-xs rounded-xl border border-indigo-100">
                  <span class="font-bold">Admin Resolution:</span> {{ req.admin_comment }}
                </div>
              </div>
              <div *ngIf="maintenanceRequests.length === 0" class="p-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                No active maintenance tickets.
              </div>
            </div>
          </div>

          <!-- PAYMENTS LEDGER -->
          <div *ngIf="currentView === 'payments'" class="space-y-6">
            <h1 class="text-3xl font-black text-gray-900">Transaction Ledger</h1>
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th class="p-4">Txn Ref #</th>
                    <th class="p-4">Tenant</th>
                    <th class="p-4">Type</th>
                    <th class="p-4 text-right">Amount</th>
                    <th class="p-4">Date</th>
                    <th class="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr *ngFor="let p of payments" class="border-t border-gray-100 hover:bg-gray-50/50 transition">
                    <td class="p-4 font-mono text-xs text-indigo-500 font-bold">{{ p.reference_id }}</td>
                    <td class="p-4 font-bold text-gray-900">{{ p.user_name }}</td>
                    <td class="p-4"><span class="text-[10px] font-black uppercase text-gray-500">{{ p.payment_type }}</span></td>
                    <td class="p-4 text-right font-black">₹{{ p.amount | number }}</td>
                    <td class="p-4 text-gray-500 text-xs">{{ p.payment_date | date: 'mediumDate' }}</td>
                    <td class="p-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                        [ngClass]="p.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : p.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'">{{ p.status }}</span>
                    </td>
                  </tr>
                  <tr *ngIf="payments.length === 0">
                    <td colspan="6" class="p-10 text-center text-gray-500">No transactions recorded.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- AUDIT LOGS -->
          <app-admin-audit-page *ngIf="currentView === 'audit'"></app-admin-audit-page>

            <!-- MODALS -->

            <!-- Add Tower Modal -->
            <div *ngIf="showTowerModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold">Add New Property Tower</div>
                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Tower Name</label>
                    <input type="text" [(ngModel)]="newTower.name" placeholder="e.g. Sapphire Residency" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Tower Code</label>
                    <input type="text" [(ngModel)]="newTower.towerCode" placeholder="e.g. TWR-A" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase">
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Total Floors</label>
                      <input type="number" [(ngModel)]="newTower.totalFloors" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Flats per Floor</label>
                      <input type="number" [(ngModel)]="newTower.flatsPerFloor" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea [(ngModel)]="newTower.description" rows="3" placeholder="Describe the tower..." class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                  </div>

                  <!-- Location / Address Section -->
                  <div class="mt-4 border-t border-gray-100 pt-4">
                    <h4 class="text-sm font-bold text-gray-900 mb-3">📍 Location & Address</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Country</label>
                        <input type="text" [(ngModel)]="newTower.country" placeholder="e.g. India" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">State</label>
                        <input type="text" [(ngModel)]="newTower.state" placeholder="e.g. Telangana" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">City</label>
                        <input type="text" [(ngModel)]="newTower.city" placeholder="e.g. Hyderabad" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Area / Locality</label>
                        <input type="text" [(ngModel)]="newTower.area" placeholder="e.g. Madhapur" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                    </div>
                    <div class="mt-3">
                      <label class="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                      <input type="text" [(ngModel)]="newTower.pincode" placeholder="e.g. 500081" maxlength="10" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div class="mt-3">
                      <label class="block text-sm font-bold text-gray-700 mb-1">Full Address Line</label>
                      <input type="text" [(ngModel)]="newTower.addressLine" placeholder="e.g. Plot 42, HITEC City Main Road" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                  </div>

                  <div class="mt-4 border-t border-gray-100 pt-4">
                    <h4 class="text-sm font-bold text-gray-900 mb-3">Default Unit Settings</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Unit Type</label>
                        <select [(ngModel)]="newTower.defaultFlatType" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                          <option value="1BHK">1BHK</option>
                          <option value="2BHK">2BHK</option>
                          <option value="3BHK">3BHK</option>
                          <option value="4BHK">4BHK</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Area (sq.ft)</label>
                        <input type="number" [(ngModel)]="newTower.defaultSqft" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Monthly Rent</label>
                        <input type="number" [(ngModel)]="newTower.defaultRent" placeholder="0" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Security Deposit</label>
                        <input type="number" [(ngModel)]="newTower.defaultDeposit" placeholder="0" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showTowerModal = false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="createTower()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">Save & Generate</button>
                </div>
              </div>
            </div>

            <!-- Edit Tower Modal -->
            <div *ngIf="showEditTowerModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold shrink-0">Edit Tower {{ activeTower?.name }}</div>
                <div class="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] flex-1" *ngIf="activeTower">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Tower Name</label>
                    <input type="text" [(ngModel)]="activeTower.name" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select [(ngModel)]="activeTower.status" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                      <option value="ACTIVE">Active</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea [(ngModel)]="activeTower.description" rows="3" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showEditTowerModal = false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="updateTower()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">Save Changes</button>
                </div>
              </div>
            </div>

            <!-- Upload Tower Image Modal -->
            <div *ngIf="showTowerImageModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold">Image Upload: Tower {{ activeTowerForImage?.name }}</div>
                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Select File</label>
                    <input type="file" (change)="onTowerImageSelected($event)" accept="image/*" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showTowerImageModal = false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="uploadTowerImage()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm w-32 flex justify-center items-center" [disabled]="!selectedTowerImageFile">Upload</button>
                </div>
              </div>
            </div>

            <!-- Edit Unit Modal -->
            <div *ngIf="showEditUnitModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold">Edit Unit {{ activeUnit?.unit_number }}</div>
                <div class="p-6 space-y-4" *ngIf="activeUnit">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Rent Amount</label>
                      <input type="number" [(ngModel)]="activeUnit.rent_amount" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Deposit Amount</label>
                      <input type="number" [(ngModel)]="activeUnit.deposit_amount" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Unit Type</label>
                      <input type="text" [(ngModel)]="activeUnit.flat_type" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Square Feet</label>
                      <input type="number" [(ngModel)]="activeUnit.square_feet" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showEditUnitModal = false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="updateUnit()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">Save Changes</button>
                </div>
              </div>
            </div>

            <!-- Upload Image Modal -->
            <div *ngIf="showImageModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold">Image Upload: Unit {{ activeUnitForImage?.unit_number }}</div>
                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Select Files (Multiple Allowed)</label>
                    <input type="file" multiple (change)="onImageSelected($event)" accept="image/*" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <div class="mt-2 text-xs text-gray-500" *ngIf="selectedImageFiles.length > 0">{{ selectedImageFiles.length }} files selected</div>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showImageModal = false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="uploadImages()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm w-32 flex justify-center items-center" [disabled]="selectedImageFiles.length === 0">Upload</button>
                </div>
              </div>
            </div>

            <!-- Manage Amenities Modal -->
            <div *ngIf="showTowerAmenitiesModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold">Manage Amenities: {{ activeTowerForAmenities?.name }}</div>
                <div class="p-6 overflow-y-auto space-y-3 flex-1">
                  <div *ngFor="let am of amenities" class="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer" (click)="toggleAmenityForTower(am.id)">
                    <div class="w-5 h-5 rounded border flex items-center justify-center" [ngClass]="selectedAmenityIds.includes(am.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'">
                      <svg *ngIf="selectedAmenityIds.includes(am.id)" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span class="font-bold text-gray-800">{{ am.name }}</span>
                  </div>
                  <div *ngIf="amenities.length === 0" class="text-sm text-gray-500 text-center py-4">No amenities defined in system. Please add from Amenities tab first.</div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t mt-auto">
                  <button (click)="showTowerAmenitiesModal = false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="saveTowerAmenities()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">Save Changes</button>
                </div>
              </div>
            </div>

            <!-- Add Unit Modal -->
            <div *ngIf="showAddUnitModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-gray-900 p-6 text-white text-xl font-bold">Add Unit Manually</div>
                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Tower</label>
                      <select [(ngModel)]="newUnit.tower_id" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option *ngFor="let t of towers" [ngValue]="t.id">{{ t.name }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Floor Number</label>
                      <input type="number" [(ngModel)]="newUnit.floor_number" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Unit Number</label>
                      <input type="text" [(ngModel)]="newUnit.unit_number" placeholder="e.g. A-301" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Flat Type</label>
                      <select [(ngModel)]="newUnit.flat_type" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option>1BHK</option><option>2BHK</option><option>3BHK</option><option>4BHK</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Monthly Rent (₹)</label>
                      <input type="number" [(ngModel)]="newUnit.rent_amount" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Deposit (₹)</label>
                      <input type="number" [(ngModel)]="newUnit.deposit_amount" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Square Feet</label>
                      <input type="number" [(ngModel)]="newUnit.square_feet" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showAddUnitModal=false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                  <button (click)="createUnit()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">Add Unit</button>
                </div>
              </div>
            </div>

            <!-- Lease Detail Modal -->
            <div *ngIf="showLeaseDetailModal && activeLease" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-indigo-700 p-6 text-white">
                  <div class="text-xs font-bold text-indigo-300 mb-1">AGREEMENT ID</div>
                  <div class="text-2xl font-black">{{ activeLease.agreement_id }}</div>
                </div>
                <div class="p-6 grid grid-cols-2 gap-4 text-sm">
                  <div><span class="font-bold text-gray-500">Tenant</span><p class="text-gray-900 font-medium">{{ activeLease.tenant_name }}</p><p class="text-gray-400 text-xs">{{ activeLease.tenant_email }}</p></div>
                  <div><span class="font-bold text-gray-500">Unit</span><p class="text-gray-900 font-medium">{{ activeLease.unit_number }}</p><p class="text-gray-400 text-xs">{{ activeLease.tower_name }}</p></div>
                  <div><span class="font-bold text-gray-500">Start Date</span><p class="text-gray-900">{{ activeLease.start_date }}</p></div>
                  <div><span class="font-bold text-gray-500">End Date</span><p class="text-gray-900">{{ activeLease.end_date }}</p></div>
                  <div><span class="font-bold text-gray-500">Monthly Rent</span><p class="text-gray-900 font-bold">₹{{ activeLease.rent_amount }}</p></div>
                  <div><span class="font-bold text-gray-500">Deposit</span><p class="text-gray-900">₹{{ activeLease.deposit_amount }}</p></div>
                  <div><span class="font-bold text-gray-500">Days Remaining</span><p class="font-bold" [ngClass]="activeLease.days_remaining<=0?'text-red-600':activeLease.days_remaining<=30?'text-yellow-600':'text-green-600'">{{ activeLease.days_remaining > 0 ? activeLease.days_remaining + ' days' : 'Expired' }}</p></div>
                  <div><span class="font-bold text-gray-500">Status</span><p class="font-bold">{{ activeLease.computed_status }}</p></div>
                  <div *ngIf="activeLease.termination_reason" class="col-span-2"><span class="font-bold text-red-600">Termination Reason</span><p class="text-gray-700 mt-1">{{ activeLease.termination_reason }}</p></div>
                  
                  <!-- TENANT CONTACT DETAILS -->
                  <div class="col-span-2 mt-4 pt-4 border-t border-gray-100">
                    <span class="text-xs font-black uppercase text-indigo-500 tracking-wider">Tenant Profile & Contact</span>
                    <div class="grid grid-cols-2 gap-4 mt-3">
                      <div><span class="font-bold text-gray-500">Phone Number</span><p class="text-gray-900 font-medium">{{ activeLease.tenant_phone || '—' }}</p></div>
                      <div><span class="font-bold text-gray-500">City / State</span><p class="text-gray-900 font-medium">{{ activeLease.tenant_city }}, {{ activeLease.tenant_state }}</p></div>
                      <div class="col-span-2">
                        <span class="font-bold text-gray-500">Permanent Address</span>
                        <p class="text-gray-700 mt-0.5">{{ activeLease.tenant_address || '—' }}</p>
                        <p class="text-gray-400 text-[11px] font-bold" *ngIf="activeLease.tenant_zip_code">ZIP: {{ activeLease.tenant_zip_code }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end border-t">
                  <button (click)="showLeaseDetailModal=false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900">Close</button>
                </div>
              </div>
            </div>

            <!-- Terminate Lease Modal -->
            <div *ngIf="showTerminateLeaseModal && activeLease" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-red-600 p-6 text-white text-xl font-bold">Terminate Lease</div>
                <div class="p-6 space-y-4">
                  <p class="text-sm text-gray-700">Terminate <span class="font-bold">{{ activeLease.agreement_id }}</span> for <span class="font-bold">{{ activeLease.tenant_name }}</span>? The unit will revert to AVAILABLE.</p>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Termination Reason *</label>
                    <textarea [(ngModel)]="terminateReason" rows="3" placeholder="Explain the reason for termination..." class="w-full px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none"></textarea>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showTerminateLeaseModal=false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900">Cancel</button>
                  <button (click)="confirmTerminateLease()" [disabled]="!terminateReason.trim()" class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition">Confirm Terminate</button>
                </div>
              </div>
            </div>

            <!-- Extend Lease Modal -->
            <div *ngIf="showExtendLeaseModal && activeLease" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-blue-600 p-6 text-white text-xl font-bold">Extend Lease</div>
                <div class="p-6 space-y-4">
                  <p class="text-sm text-gray-700">Extend <span class="font-bold">{{ activeLease.agreement_id }}</span>. Current end date: <span class="font-bold">{{ activeLease.end_date }}</span> </p>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Extend by (months)</label>
                    <select [(ngModel)]="extendMonths" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                      <option [ngValue]="1">1 month</option><option [ngValue]="3">3 months</option>
                      <option [ngValue]="6">6 months</option><option [ngValue]="12">12 months</option>
                    </select>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showExtendLeaseModal=false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900">Cancel</button>
                  <button (click)="confirmExtendLease()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition">Confirm Extension</button>
                </div>
              </div>
            </div>

            <!-- Booking Detail Modal -->
            <div *ngIf="showBookingDetailModal && activeBooking" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div class="bg-gray-900 p-6 text-white">
                  <div class="text-xs font-bold text-gray-400 mb-1">BOOKING APPLICATION</div>
                  <div class="text-xl font-black">{{ activeBooking.unit_number }} — {{ activeBooking.tower_name }}</div>
                </div>
                <div class="p-6 grid grid-cols-2 gap-4 text-sm">
                  <div><span class="font-bold text-gray-500">Applicant</span><p class="text-gray-900 font-medium">{{ activeBooking.user_name }}</p><p class="text-gray-400 text-xs">{{ activeBooking.user_email }}</p></div>
                  <div><span class="font-bold text-gray-500">Unit Type</span><p class="text-gray-900">{{ activeBooking.flat_type }}</p></div>
                  <div><span class="font-bold text-gray-500">Move-in Date</span><p class="text-gray-900">{{ activeBooking.move_in_date }}</p></div>
                  <div><span class="font-bold text-gray-500">Lease Term</span><p class="text-gray-900">{{ activeBooking.lease_duration }} months</p></div>
                  <div><span class="font-bold text-gray-500">Monthly Rent</span><p class="text-gray-900 font-bold">₹{{ activeBooking.rent_amount }}</p></div>
                  <div><span class="font-bold text-gray-500">Deposit Required</span><p class="text-gray-900">₹{{ activeBooking.deposit_amount }}</p></div>
                  <div class="col-span-2" *ngIf="activeBooking.unit_amenities?.length">
                    <span class="font-bold text-gray-500">Unit Amenities</span>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span *ngFor="let a of activeBooking.unit_amenities" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">{{ a.name }}</span>
                    </div>
                  </div>
                  <div class="col-span-2" *ngIf="activeBooking.notes"><span class="font-bold text-gray-500">Notes</span><p class="text-gray-700 mt-1 italic">{{ activeBooking.notes }}</p></div>

                  <!-- APPLICANT CONTACT DETAILS -->
                  <div class="col-span-2 mt-4 pt-4 border-t border-gray-100">
                    <span class="text-xs font-black uppercase text-indigo-500 tracking-wider">Applicant Profile & Contact</span>
                    <div class="grid grid-cols-2 gap-4 mt-3">
                      <div><span class="font-bold text-gray-500">Phone Number</span><p class="text-gray-900 font-medium">{{ activeBooking.user_phone || '—' }}</p></div>
                      <div><span class="font-bold text-gray-500">City / State</span><p class="text-gray-900 font-medium">{{ activeBooking.user_city }}, {{ activeBooking.user_state }}</p></div>
                      <div class="col-span-2">
                        <span class="font-bold text-gray-500">Permanent Address</span>
                        <p class="text-gray-700 mt-0.5">{{ activeBooking.user_address || '—' }}</p>
                        <p class="text-gray-400 text-[11px] font-bold" *ngIf="activeBooking.user_zip_code">ZIP: {{ activeBooking.user_zip_code }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showBookingDetailModal=false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900">Close</button>
                  <button *ngIf="activeBooking.status === 'PENDING'" (click)="approveBooking(activeBooking.id); showBookingDetailModal=false" class="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition">Approve & Lease</button>
                  <button *ngIf="activeBooking.status === 'PENDING'" (click)="openRejectModal(activeBooking)" class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-5 py-2.5 rounded-xl transition">Reject</button>
                </div>
              </div>
            </div>

            <!-- Reject Booking Modal -->
            <div *ngIf="showRejectModal && activeBooking" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-red-600 p-6 text-white text-xl font-bold">Reject Booking</div>
                <div class="p-6 space-y-4">
                  <p class="text-sm text-gray-700">Reject booking by <span class="font-bold">{{ activeBooking.user_name }}</span> for unit <span class="font-bold">{{ activeBooking.unit_number }}</span>?</p>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Rejection Reason</label>
                    <textarea [(ngModel)]="rejectReason" rows="3" placeholder="Provide a reason (optional)..." class="w-full px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none"></textarea>
                  </div>
                </div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button (click)="showRejectModal=false" class="px-5 py-2.5 font-bold text-gray-600 hover:text-gray-900">Cancel</button>
                  <button (click)="confirmRejectBooking()" class="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">Confirm Reject</button>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    `
})
export class DashboardComponent implements OnInit {
  currentView = 'analytics';
  analytics: any = null;
  dashboard: any = null;
  towers: any[] = [];
  units: any[] = [];
  filterTowerId: number | null = null;
  bookings: any[] = [];
  leases: any[] = [];
  maintenanceRequests: any[] = [];
  recentBookings: any[] = [];
  recentMaintenance: any[] = [];
  recentPayments: any[] = [];
  amenities: any[] = [];
  payments: any[] = [];

  // SVG donut chart
  readonly donutCircumference = 339.3; // 2 * π * 54

  get donutSegments(): { color: string, dash: number, offset: number }[] {
    if (!this.dashboard) return [];
    const C = this.donutCircumference;
    const total = this.dashboard.total_units || 1;
    const avail = (this.dashboard.available_units || 0) / total * C;
    const leased = (this.dashboard.leased_units || 0) / total * C;
    const booked = (this.dashboard.booked_units || 0) / total * C;
    return [
      { color: '#22c55e', dash: avail, offset: C - 0 },
      { color: '#a855f7', dash: leased, offset: C - avail },
      { color: '#eab308', dash: booked, offset: C - (avail + leased) }
    ];
  }

  get barChartData(): { month: string, count: number, height: number, shortMonth: string }[] {
    if (!this.dashboard?.booking_trend?.length) return [];
    const max = Math.max(...this.dashboard.booking_trend.map((b: any) => b.count), 1);
    return this.dashboard.booking_trend.map((b: any) => ({
      month: b.month,
      count: b.count,
      height: Math.max((b.count / max) * 130, b.count > 0 ? 5 : 2),
      shortMonth: b.month.split(' ')[0]
    }));
  }

  get revenuePointList(): { x: number, y: number }[] {
    const data = this.dashboard?.revenue_trend;
    if (!data?.length) return [];
    const max = Math.max(...data.map((d: any) => d.revenue), 1);
    const W = 330, H = 100, P = 5;
    return data.map((d: any, i: number) => ({
      x: data.length > 1 ? P + (i / (data.length - 1)) * (W - P * 2) : W / 2,
      y: H - P - (d.revenue / max) * (H - P * 2)
    }));
  }

  get revenueLinePoints(): string {
    return this.revenuePointList.map(p => `${p.x},${p.y} `).join(' ');
  }

  get revenueAreaPoints(): string {
    const pts = this.revenuePointList;
    if (!pts.length) return '';
    const H = 100;
    return [...pts.map(p => `${p.x},${p.y} `), `${pts[pts.length - 1].x},${H} `, `${pts[0].x},${H} `].join(' ');
  }

  showTowerModal = false;
  newTower = { name: '', towerCode: '', totalFloors: 10, flatsPerFloor: 4, description: '', defaultFlatType: '2BHK', defaultRent: 0, defaultDeposit: 0, defaultSqft: 1000, country: '', state: '', city: '', area: '', pincode: '', addressLine: '' };

  showEditTowerModal = false;
  activeTower: any = null;

  showTowerImageModal = false;
  activeTowerForImage: any = null;
  selectedTowerImageFile: File | null = null;

  showEditUnitModal = false;
  activeUnit: any = null;
  showImageModal = false;
  activeUnitForImage: any = null;
  selectedImageFiles: File[] = [];

  showAddUnitModal = false;
  newUnit = { tower_id: null as number | null, floor_number: 1, unit_number: '', flat_type: '2BHK', rent_amount: 0, deposit_amount: 0, square_feet: 1000 };

  newAmenityName = '';
  newAmenityCategory = 'General';
  newAmenityDescription = '';
  newAmenityTowerId: number | null = null;
  showTowerAmenitiesModal = false;
  activeTowerForAmenities: any = null;
  selectedAmenityIds: number[] = [];

  // ─── Lease modal state ───────────────────────────────────────────────────
  leaseFilters = ['ALL', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'CANCELLED'];
  leaseFilter = 'ALL';
  activeLease: any = null;
  showLeaseDetailModal = false;
  showTerminateLeaseModal = false;
  terminateReason = '';
  showExtendLeaseModal = false;
  extendMonths = 3;

  // ─── Booking modal state ─────────────────────────────────────────────────
  bookingFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  bookingFilter = 'ALL';
  activeBooking: any = null;
  showBookingDetailModal = false;
  showRejectModal = false;
  rejectReason = '';

  // ─── Unit search ─────────────────────────────────────────────────────────
  unitSearch = '';

  // ─── Selected Tower State for Units View ─────────────────────────────────
  selectedTowerCode: string | null = null;
  selectedTower: any = null;

  get filteredLeases(): any[] {
    if (this.leaseFilter === 'ALL') return this.leases;
    return this.leases.filter((l: any) =>
    (this.leaseFilter === 'EXPIRING' ? l.computed_status === 'EXPIRING' :
      this.leaseFilter === 'EXPIRED' ? l.computed_status === 'EXPIRED' :
        this.leaseFilter === 'ACTIVE' ? l.status === 'ACTIVE' :
          this.leaseFilter === 'CANCELLED' ? l.computed_status === 'CANCELLED' : true)
    );
  }

  get filteredBookings(): any[] {
    if (this.bookingFilter === 'ALL') return this.bookings;
    return this.bookings.filter((b: any) => b.status === this.bookingFilter);
  }

  get filteredUnits(): any[] {
    const q = this.unitSearch.toLowerCase().trim();
    if (!q) return this.units;
    return this.units.filter((u: any) =>
      (u.unit_number || '').toLowerCase().includes(q) ||
      (u.tower_name || '').toLowerCase().includes(q) ||
      (u.flat_type || '').toLowerCase().includes(q)
    );
  }


  constructor(private authService: AuthService, private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getTowers().subscribe(res => {
      this.towers = res;
      this.loadData();
    });
    // Pre-load amenities
    this.apiService.getAmenities().subscribe(res => this.amenities = res);
  }

  logout() {
    this.authService.logout();
  }

  switchView(view: string, towerCode?: string) {
    console.log('Switching view to:', view, 'towerCode:', towerCode);
    this.currentView = view;

    if (view === 'units' && towerCode) {
      this.selectedTowerCode = towerCode;
    } else if (view !== 'units') {
      this.selectedTowerCode = null;
    }

    this.loadData();
  }

  loadData() {
    if (this.currentView === 'analytics') {
      this.apiService.getDashboard().subscribe(res => {
        this.dashboard = res;
      });
      // Load recent activities for the overview
      this.apiService.getAllBookings().subscribe(res => this.recentBookings = res.slice(0, 5));
      this.apiService.getAllMaintenanceRequests().subscribe(res => this.recentMaintenance = res.slice(0, 5));
      this.apiService.getAllPayments().subscribe(res => this.recentPayments = res.slice(0, 5));

    } else if (this.currentView === 'towers') {
      this.apiService.getTowers().subscribe(res => this.towers = res);
    } else if (this.currentView === 'units') {

      this.selectedTower = this.selectedTowerCode
        ? this.towers.find(t => t.tower_code === this.selectedTowerCode)
        : null;

      this.apiService.getAdminUnits(this.selectedTowerCode || undefined).subscribe((res: any) => {
        this.units = res;
      });

    } else if (this.currentView === 'bookings') {
      this.apiService.getAllBookings().subscribe(res => this.bookings = res);
    } else if (this.currentView === 'leases') {
      this.apiService.getAllLeases().subscribe(res => this.leases = res);
    } else if (this.currentView === 'maintenance') {
      this.apiService.getAllMaintenanceRequests().subscribe(res => this.maintenanceRequests = res);
    } else if (this.currentView === 'payments') {
      this.loadAllPayments();
    }
  }

  goToTowerUnits(towerId: number) {
    const t = this.towers.find(t => t.id === towerId);
    if (t) {
      this.switchView('units', t.tower_code);
    }
  }

  openAddUnitModalForTower() {
    this.showAddUnitModal = true;
    if (this.selectedTower) {
      this.newUnit.tower_id = this.selectedTower.id;
    }
  }

  createTower() {
    if (!this.newTower.name || !this.newTower.towerCode || !this.newTower.totalFloors || !this.newTower.flatsPerFloor) return;
    this.apiService.createTower(
      this.newTower.name,
      this.newTower.towerCode,
      this.newTower.totalFloors,
      this.newTower.flatsPerFloor,
      this.newTower.description,
      this.newTower.defaultFlatType,
      this.newTower.defaultRent,
      this.newTower.defaultDeposit,
      this.newTower.defaultSqft,
      this.newTower.country,
      this.newTower.state,
      this.newTower.city,
      this.newTower.area,
      this.newTower.pincode,
      this.newTower.addressLine
    ).subscribe({
      next: () => {
        alert('Tower added and units auto-generated.');
        this.showTowerModal = false;
        this.newTower = { name: '', towerCode: '', totalFloors: 10, flatsPerFloor: 4, description: '', defaultFlatType: '2BHK', defaultRent: 0, defaultDeposit: 0, defaultSqft: 1000, country: '', state: '', city: '', area: '', pincode: '', addressLine: '' };
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  approveBooking(id: number) {
    if (confirm('Are you sure you want to approve this booking and generate a LEASE object?')) {
      this.apiService.approveBooking(id).subscribe({
        next: () => {
          alert('Booking Approved! The user has 6 hours to complete payment.');
          this.loadData();
        },
        error: (err) => alert(err.error?.message || 'Error')
      });
    }
  }

  rejectBooking(id: number) {
    this.openRejectModal(this.bookings.find((b: any) => b.id === id));
  }

  cancelLease(id: number) {
    if (confirm('Cancel this active lease? Unit will revert to AVAILABLE.')) {
      this.apiService.cancelLease(id).subscribe(() => {
        alert('Lease cancelled.');
        this.loadData();
      });
    }
  }

  approveVacate(id: number) {
    if (confirm('Are you sure you want to approve this tenant\'s request to vacate? The lease will be marked as COMPLETED and the unit will become AVAILABLE immediately.')) {
      this.apiService.approveVacate(id).subscribe({
        next: () => {
          alert('Vacate Request Approved. Lease ended.');
          this.loadData();
        },
        error: (err) => alert(err.error?.message || 'Error occurred while approving vacate request.')
      });
    }
  }

  rejectVacate(id: number) {
    if (confirm('Are you sure you want to reject this vacate request?')) {
      this.apiService.rejectVacate(id).subscribe({
        next: () => {
          alert('Vacate Request Rejected.');
          this.loadData();
        },
        error: (err) => alert(err.error?.message || 'Error occurred while rejecting vacate request.')
      });
    }
  }

  updateMaintenance(req: any) {
    this.apiService.updateMaintenance(req.id, req.status, req.newComment || req.admin_comment).subscribe(() => {
      alert('Maintenance updated.');
      if (req.newComment) req.admin_comment = req.newComment;
      req.newComment = '';
    });
  }

  // --- Tower Management ---
  openEditTowerModal(tower: any) {
    this.activeTower = { ...tower };
    this.showEditTowerModal = true;
  }

  updateTower() {
    if (!this.activeTower) return;
    this.apiService.updateTower(this.activeTower.id, this.activeTower).subscribe({
      next: () => {
        alert('Tower updated.');
        this.showEditTowerModal = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  openTowerImageModal(tower: any) {
    this.activeTowerForImage = tower;
    this.showTowerImageModal = true;
    this.selectedTowerImageFile = null;
  }

  onTowerImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedTowerImageFile = event.target.files[0];
    }
  }

  uploadTowerImage() {
    if (!this.activeTowerForImage || !this.selectedTowerImageFile) return;
    this.apiService.uploadTowerImage(this.activeTowerForImage.id, this.selectedTowerImageFile).subscribe({
      next: () => {
        alert('Tower image uploaded successfully.');
        this.showTowerImageModal = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  // --- Unit Management ---
  openEditUnitModal(unit: any) {
    console.log('Opening Edit Unit Modal for:', unit);
    this.activeUnit = { ...unit }; // clone to avoid saving before explicit save
    this.showEditUnitModal = true;
  }

  updateUnit() {
    if (!this.activeUnit) return;
    this.apiService.updateUnit(this.activeUnit.id, this.activeUnit).subscribe({
      next: () => {
        alert('Unit updated.');
        this.showEditUnitModal = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  openImageModal(unit: any) {
    console.log('Opening Image Modal for:', unit);
    this.activeUnitForImage = unit;
    this.showImageModal = true;
    this.selectedImageFiles = [];
  }

  onImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedImageFiles = Array.from(event.target.files);
    }
  }

  uploadImages() {
    if (!this.activeUnitForImage || this.selectedImageFiles.length === 0) return;
    this.apiService.uploadUnitImages(this.activeUnitForImage.id, this.selectedImageFiles).subscribe({
      next: () => {
        alert('Images uploaded successfully.');
        this.showImageModal = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  // --- Amenities Management ---
  createAmenity() {
    if (!this.newAmenityName.trim()) return;
    this.apiService.createAmenity({
      name: this.newAmenityName.trim(),
      tower_id: this.newAmenityTowerId || undefined,
      category: this.newAmenityCategory,
      description: this.newAmenityDescription
    }).subscribe({
      next: () => {
        this.newAmenityName = '';
        this.newAmenityDescription = '';
        this.newAmenityCategory = 'General';
        this.newAmenityTowerId = null;
        this.apiService.getAmenities().subscribe(res => this.amenities = res);
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  updateAmenityStatus(amenity: any) {
    this.apiService.modifyAmenity(amenity.id, { status: amenity.status }).subscribe({
      next: () => { /* live update, no alert needed */ },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  deleteAmenity(amenityId: number) {
    if (confirm('Are you sure you want to delete this amenity?')) {
      this.apiService.deleteAmenity(amenityId).subscribe({
        next: () => {
          this.apiService.getAmenities().subscribe(res => this.amenities = res);
        },
        error: (err) => alert(err.error?.message || 'Error occurred')
      });
    }
  }

  openTowerAmenitiesModal(tower: any) {
    console.log('Opening Tower Amenities Modal for:', tower);
    this.activeTowerForAmenities = tower;
    this.selectedAmenityIds = tower.amenities ? tower.amenities.map((a: any) => a.id) : [];
    this.showTowerAmenitiesModal = true;
  }

  toggleAmenityForTower(amenityId: number) {
    const idx = this.selectedAmenityIds.indexOf(amenityId);
    if (idx > -1) {
      this.selectedAmenityIds.splice(idx, 1);
    } else {
      this.selectedAmenityIds.push(amenityId);
    }
  }

  saveTowerAmenities() {
    if (!this.activeTowerForAmenities) return;
    this.apiService.attachAmenitiesToTower(this.activeTowerForAmenities.id, this.selectedAmenityIds).subscribe({
      next: () => {
        alert('Amenities attached to tower.');
        this.showTowerAmenitiesModal = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Error occurred')
    });
  }

  // ─── Lease Actions ───────────────────────────────────────────────────────
  openLeaseDetailModal(l: any) {
    console.log('Opening Lease Detail Modal for:', l);
    this.activeLease = l;
    this.showLeaseDetailModal = true;
  }

  openTerminateLeaseModal(l: any) {
    console.log('Opening Terminate Lease Modal for:', l);
    this.activeLease = l;
    this.terminateReason = '';
    this.showTerminateLeaseModal = true;
  }

  confirmTerminateLease() {
    if (!this.activeLease || !this.terminateReason.trim()) return;
    this.apiService.terminateLease(this.activeLease.id, this.terminateReason).subscribe({
      next: () => {
        this.showTerminateLeaseModal = false;
        this.activeLease = null;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to terminate lease')
    });
  }

  openExtendLeaseModal(l: any) {
    console.log('Opening Extend Lease Modal for:', l);
    this.activeLease = l;
    this.extendMonths = 3;
    this.showExtendLeaseModal = true;
  }

  confirmExtendLease() {
    if (!this.activeLease) return;
    this.apiService.extendLease(this.activeLease.id, this.extendMonths).subscribe({
      next: () => {
        this.showExtendLeaseModal = false;
        this.activeLease = null;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to extend lease')
    });
  }

  // ─── Booking Actions ─────────────────────────────────────────────────────
  openBookingDetailModal(b: any) {
    console.log('Opening Booking Detail Modal for:', b);
    this.activeBooking = b;
    this.showBookingDetailModal = true;
  }

  openRejectModal(b: any) {
    console.log('Opening Reject Modal for:', b);
    this.activeBooking = b;
    this.rejectReason = '';
    this.showRejectModal = true;
    this.showBookingDetailModal = false;
  }

  confirmRejectBooking() {
    if (!this.activeBooking) return;
    this.apiService.rejectBooking(this.activeBooking.id, this.rejectReason || 'Rejected by admin').subscribe({
      next: () => {
        this.showRejectModal = false;
        this.activeBooking = null;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to reject booking')
    });
  }

  // ─── Tower / Unit Lifecycle ───────────────────────────────────────────────
  softDeleteTower(tower: any) {
    if (!confirm(`Delete tower "${tower.name}" ? All units will be blocked.This cannot be undone if active leases exist.`)) return;
    this.apiService.deleteTower(tower.id).subscribe({
      next: () => { alert('Tower marked INACTIVE.'); this.loadData(); },
      error: (err) => alert(err.error?.message || 'Cannot delete tower')
    });
  }

  softDeleteUnit(unit: any) {
    console.log('Soft deleting unit:', unit);
    if (!confirm(`Delete unit ${unit.unit_number}? It will be blocked.`)) return;
    this.apiService.deleteUnit(unit.id).subscribe({
      next: () => { this.loadData(); },
      error: (err) => alert(err.error?.message || 'Cannot delete unit')
    });
  }

  geocodeAddress(tower: any) {
    console.log('Geocoding address for tower:', tower);
    if (!tower.address_line && !tower.city) {
      alert('Please provide an address or city to geocode.');
      return;
    }
    const query = [tower.address_line, tower.area, tower.city, tower.state, tower.pincode].filter(x => !!x).join(', ');
    console.log('Querying nominating for:', query);

    // Using OpenStreetMap Nominatim API (Free)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          tower.latitude = parseFloat(data[0].lat);
          tower.longitude = parseFloat(data[0].lon);
          console.log('Geocoded successfully:', tower.latitude, tower.longitude);
        } else {
          alert('Could not geocode this address. Please enter coordinates manually.');
        }
      })
      .catch(err => {
        console.error('Geocoding error:', err);
        alert('Geocoding service unavailable.');
      });
  }

  setUnitMaintenance(unit: any, enable: boolean) {
    const msg = enable
      ? `Place unit ${unit.unit_number} under maintenance? Pending bookings will be auto-rejected.`
      : `Restore unit ${unit.unit_number} to AVAILABLE?`;
    if (!confirm(msg)) return;
    this.apiService.setUnitMaintenance(unit.id, enable).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to update maintenance status')
    });
  }

  createUnit() {
    if (!this.newUnit.tower_id || !this.newUnit.unit_number) {
      alert('Please fill in Tower and Unit Number at minimum.');
      return;
    }
    this.apiService.createUnit(this.newUnit).subscribe({
      next: () => {
        this.showAddUnitModal = false;
        this.newUnit = { tower_id: null, floor_number: 1, unit_number: '', flat_type: '2BHK', rent_amount: 0, deposit_amount: 0, square_feet: 1000 };
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to create unit')
    });
  }

  loadAllPayments() {
    this.apiService.getAllPayments().subscribe({
      next: (res) => this.payments = res,
      error: (err) => console.error('Failed to load payments', err)
    });
  }
}
