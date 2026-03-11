import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-admin-audit-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="animate-fadeIn">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">System Audit Logs</h1>
        <div class="flex items-center gap-3">
          <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer" title="Start Date">
          <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer" title="End Date">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer">
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
          <select [(ngModel)]="towerFilter" (change)="applyFilters()" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer min-w-[160px]">
            <option value="ALL">All Towers</option>
            <option *ngFor="let t of towers" [value]="t.tower_code">{{ t.name }} ({{ t.tower_code }})</option>
          </select>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm border-b">
              <th class="p-4 font-bold tracking-wider">ID</th>
              <th class="p-4 font-bold tracking-wider">LAST LOGIN TIME</th>
              <th class="p-4 font-bold tracking-wider">NAME</th>
              <th class="p-4 font-bold tracking-wider">EMAIL</th>
              <th class="p-4 font-bold tracking-wider">ROLE</th>
              <th class="p-4 font-bold tracking-wider">IP ADDRESS</th>
              <th class="p-4 font-bold tracking-wider">STATUS</th>
              <th class="p-4 font-bold tracking-wider text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of auditLogs" class="border-b last:border-0 hover:bg-gray-50 transition border-gray-100">
              <td class="p-4 font-medium text-gray-500 text-sm">{{ log.user_id || 'N/A' }}</td>
              <td class="p-4 font-medium text-gray-600 text-sm whitespace-nowrap">{{ log.created_at | date:'MMM d, y, h:mm a' }}</td>
              <td class="p-4 font-bold text-gray-900">{{ log.user_name }}</td>
              <td class="p-4 text-gray-600">{{ log.email }}</td>
              <td class="p-4 text-gray-500 text-xs font-bold">{{ log.user_role }}</td>
              <td class="p-4 text-gray-500 font-mono text-sm">{{ log.ip_address || 'Unknown' }}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 text-xs font-bold rounded-full tracking-wider"
                  [ngClass]="{
                    'bg-green-100 text-green-800': log.login_status === 'SUCCESS',
                    'bg-red-100 text-red-800': log.login_status === 'FAILED'
                  }">{{ log.login_status }}</span>
              </td>
              <td class="p-4 text-right">
                <button *ngIf="log.user_id" (click)="viewAuditStatus(log.user_id)" class="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg transition border border-indigo-100">View Status</button>
                <span *ngIf="!log.user_id" class="text-xs text-gray-400 font-medium italic">Unregistered</span>
              </td>
            </tr>
            <tr *ngIf="auditLogs.length === 0">
              <td colspan="8" class="p-8 text-center text-gray-500">No audit logs found matching your criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="flex justify-between items-center px-4 py-3 bg-white border rounded-xl shadow-sm" *ngIf="totalPages > 1">
        <span class="text-sm text-gray-700">
          Showing <span class="font-semibold">{{ ((currentPage - 1) * pageSize) + 1 }}</span> to <span class="font-semibold">{{ Math.min(currentPage * pageSize, totalItems) }}</span> of <span class="font-semibold">{{ totalItems }}</span> logs
        </span>
        <div class="flex gap-2">
           <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold disabled:opacity-50 transition">Previous</button>
           <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    </div>

    <!-- AUDIT USER STATUS MODAL -->
    <div *ngIf="showAuditStatusModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        <div class="bg-gray-900 p-6 text-white text-xl font-bold shrink-0 flex justify-between items-center">
            <span>User Status Detail</span>
            <button (click)="showAuditStatusModal = false" class="text-gray-400 hover:text-white transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="p-6 overflow-y-auto flex flex-col gap-6" *ngIf="selectedAuditUser">
            
            <div class="flex flex-col md:flex-row gap-6">
                <!-- User Profile Header -->
                <div class="flex-1 border border-gray-200 rounded-2xl p-6 bg-gray-50">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black">
                            {{ selectedAuditUser.name.charAt(0) }}
                        </div>
                        <div>
                            <h2 class="text-2xl font-black text-gray-900">{{ selectedAuditUser.name }}</h2>
                            <p class="text-gray-600 font-medium">{{ selectedAuditUser.email }} &bull; 
                                <span class="text-xs px-2 py-0.5 rounded uppercase font-bold text-white tracking-wider"
                                    [ngClass]="{'bg-purple-600': selectedAuditUser.role === 'ADMIN', 'bg-blue-600': selectedAuditUser.role === 'USER'}">
                                    {{ selectedAuditUser.role }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white border rounded-xl p-4 flex items-center gap-4">
                            <div class="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
                            <div><span class="block text-2xl font-black text-gray-900 leading-none">{{ selectedAuditUser.total_bookings }}</span><span class="text-xs text-gray-500 font-bold">Lifetime Bookings</span></div>
                        </div>
                        <div class="bg-white border rounded-xl p-4 flex items-center gap-4">
                            <div class="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                            <div><span class="block text-lg font-black text-gray-900 leading-none">{{ selectedAuditUser.created_at | date:'mediumDate' }}</span><span class="text-xs text-gray-500 font-bold">User Since</span></div>
                        </div>
                    </div>
                </div>

                <!-- Current Lease Assessment -->
                <div class="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl p-6" *ngIf="selectedAuditUser.current_lease">
                    <h3 class="text-lg font-bold text-gray-900 border-b border-indigo-200 pb-2 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Current Residence Status
                    </h3>
                    <div class="grid grid-cols-2 gap-y-4">
                        <div><span class="text-xs text-indigo-500 font-bold uppercase block mb-0.5">Tower Name</span><span class="font-black text-gray-900">{{ selectedAuditUser.current_lease.tower_name }}</span></div>
                        <div><span class="text-xs text-indigo-500 font-bold uppercase block mb-0.5">Unit Config</span><span class="font-black text-gray-900">{{ selectedAuditUser.current_lease.unit_number }} ({{ selectedAuditUser.current_lease.flat_type }})</span></div>
                        <div><span class="text-xs text-indigo-500 font-bold uppercase block mb-0.5">Lease Status</span><span class="font-black text-green-700 uppercase">{{ selectedAuditUser.current_lease.status }}</span></div>
                        <div><span class="text-xs text-indigo-500 font-bold uppercase block mb-0.5">Lease Term</span><span class="font-bold text-gray-800 text-sm">{{ selectedAuditUser.current_lease.start_date | date:'mediumDate' }} - {{ selectedAuditUser.current_lease.end_date | date:'mediumDate' }}</span></div>
                    </div>
                </div>
                <div class="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center" *ngIf="!selectedAuditUser.current_lease">
                    <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span class="text-gray-500 font-medium">User does not hold an active lease.</span>
                </div>
            </div>

            <!-- Maintenance Requests -->
            <div class="border rounded-2xl overflow-hidden">
                <h3 class="text-lg font-bold text-gray-900 bg-gray-50 p-4 border-b">Maintenance Requests History</h3>
                <div class="p-0">
                    <table class="w-full text-left" *ngIf="selectedAuditUser.maintenance_requests && selectedAuditUser.maintenance_requests.length > 0">
                        <thead>
                            <tr class="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                                <th class="p-3">Date</th>
                                <th class="p-3">Category</th>
                                <th class="p-3">Description</th>
                                <th class="p-3 w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let req of selectedAuditUser.maintenance_requests" class="border-t text-sm">
                                <td class="p-3 whitespace-nowrap">{{ req.created_at | date:'mediumDate' }}</td>
                                <td class="p-3 font-semibold text-gray-700">{{ req.category }}</td>
                                <td class="p-3 text-gray-600">{{ req.description | slice:0:100 }}{{ req.description.length > 100 ? '...' : '' }}</td>
                                <td class="p-3">
                                    <span class="px-2 py-1 rounded text-xs font-bold"
                                        [ngClass]="{
                                            'bg-green-100 text-green-800': req.status === 'RESOLVED',
                                            'bg-yellow-100 text-yellow-800': req.status === 'IN_PROGRESS',
                                            'bg-red-100 text-red-800': req.status === 'OPEN'
                                        }">{{ req.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div *ngIf="!selectedAuditUser.maintenance_requests || selectedAuditUser.maintenance_requests.length === 0" class="p-6 text-center text-gray-500 italic">
                        No maintenance requests filed by this user.
                    </div>
                </div>
            </div>

        </div>
        <div class="p-4 bg-gray-50 border-t flex justify-end shrink-0">
            <button (click)="showAuditStatusModal = false" class="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-2 rounded-xl transition shadow-sm">Close</button>
        </div>
        </div>
    </div>
  `
})
export class AdminAuditPageComponent implements OnInit {
    auditLogs: any[] = [];

    // Filtering & Pagination
    currentPage = 1;
    pageSize = 10;
    totalItems = 0;
    totalPages = 1;

    towers: any[] = [];
    towerFilter = 'ALL';
    statusFilter = 'ALL';
    startDate = '';
    endDate = '';

    // Modal State
    showAuditStatusModal = false;
    selectedAuditUser: any = null;

    Math = Math;

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        this.apiService.getTowers().subscribe(res => {
            this.towers = res;
        });
        this.loadData();
    }

    loadData() {
        this.apiService.getAuditLogs(
            this.currentPage,
            this.pageSize,
            this.towerFilter,
            this.statusFilter,
            this.startDate,
            this.endDate
        ).subscribe({
            next: (res: any) => {
                this.auditLogs = res.data;
                this.totalItems = res.total;
                this.currentPage = res.page;
                this.totalPages = res.pages;
            },
            error: (err: any) => console.error("Error fetching audit logs", err)
        });
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadData();
    }



    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadData();
        }
    }

    viewAuditStatus(userId: number) {
        this.apiService.getAuditUserDetails(userId).subscribe({
            next: (res: any) => {
                this.selectedAuditUser = res;
                this.showAuditStatusModal = true;
            },
            error: (err: any) => alert(err.error?.message || 'Error fetching user status')
        });
    }
}
