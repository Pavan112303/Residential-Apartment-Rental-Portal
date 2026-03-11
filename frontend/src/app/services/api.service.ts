import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient, private auth: AuthService) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.auth.getToken()}`
        });
    }

    // ─── User: Towers ────────────────────────────────────────────────────────
    getUserTowers(filters?: { city?: string; area?: string; pincode?: string; search?: string }): Observable<any[]> {
        let params = new URLSearchParams();
        if (filters?.city) params.append('city', filters.city);
        if (filters?.area) params.append('area', filters.area);
        if (filters?.pincode) params.append('pincode', filters.pincode);
        if (filters?.search) params.append('search', filters.search);
        const qs = params.toString();
        return this.http.get<any[]>(`${this.baseUrl}/user/towers${qs ? '?' + qs : ''}`, { headers: this.getHeaders() });
    }

    getLocations(): Observable<{ cities: string[]; areas: string[]; pincodes: string[] }> {
        return this.http.get<any>(`${this.baseUrl}/user/locations`, { headers: this.getHeaders() });
    }

    getNearbyTowers(lat: number, lng: number, radiusKm = 10): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/user/towers/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`, { headers: this.getHeaders() });
    }

    // ─── User: Units / Search / Recommendations ───────────────────────────────
    getRecommendedUnits(towerId?: string, minRent?: string, maxRent?: string, flatType?: string, floorNumber?: string, sortBy?: string): Observable<any> {
        let params = new URLSearchParams();
        if (towerId) params.append('tower_id', towerId);
        if (minRent) params.append('min_rent', minRent);
        if (maxRent) params.append('max_rent', maxRent);
        if (flatType) params.append('flat_type', flatType);
        if (floorNumber) params.append('floor_number', floorNumber);
        if (sortBy) params.append('sort_by', sortBy);
        return this.http.get<any>(`${this.baseUrl}/user/units/search?${params.toString()}`, { headers: this.getHeaders() });
    }

    getSmartRecommendations(towerId?: number, maxRent?: number, flatType?: string): Observable<any> {
        let params = new URLSearchParams();
        if (towerId) params.append('tower_id', towerId.toString());
        if (maxRent) params.append('max_rent', maxRent.toString());
        if (flatType) params.append('flat_type', flatType);
        return this.http.get<any>(`${this.baseUrl}/user/recommendations?${params.toString()}`, { headers: this.getHeaders() });
    }

    // ─── User: Summary & Notifications ───────────────────────────────────────
    getUserSummary(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/user/summary`, { headers: this.getHeaders() });
    }

    getNotifications(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/user/notifications`, { headers: this.getHeaders() });
    }

    updateProfile(profileData: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/user/profile`, profileData, { headers: this.getHeaders() });
    }

    // ─── User: Bookings ───────────────────────────────────────────────────────
    bookUnit(unitId: number, moveInDate: string, leaseDuration: number, notes: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/user/bookings`,
            { unit_id: unitId, move_in_date: moveInDate, lease_duration: leaseDuration, notes },
            { headers: this.getHeaders() });
    }

    payBookingDeposit(bookingId: number, paymentMethod: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/user/bookings/${bookingId}/pay-deposit`,
            { payment_method: paymentMethod },
            { headers: this.getHeaders() });
    }

    getMyBookings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/user/bookings`, { headers: this.getHeaders() });
    }

    // ─── User: Leases ─────────────────────────────────────────────────────────
    getMyLeases(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/user/leases`, { headers: this.getHeaders() });
    }

    // ─── User: Maintenance ────────────────────────────────────────────────────
    getMyMaintenanceRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/user/maintenance`, { headers: this.getHeaders() });
    }

    createMaintenanceRequest(unitId: number, category: string, description: string, priority: string = 'MEDIUM'): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/user/maintenance`,
            { unit_id: unitId, category, description, priority },
            { headers: this.getHeaders() });
    }

    // ─── User: Reviews ────────────────────────────────────────────────────────
    submitReview(towerId: number, rating: number, comment: string, unitId?: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/user/reviews`,
            { tower_id: towerId, rating, comment, unit_id: unitId },
            { headers: this.getHeaders() });
    }

    getTowerReviews(towerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/user/towers/${towerId}/reviews`, { headers: this.getHeaders() });
    }

    // ─── User: Payments ────────────────────────────────────────────────────────
    getMyPayments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/user/payments`, { headers: this.getHeaders() });
    }

    getMyDues(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/user/payments/dues`, { headers: this.getHeaders() });
    }

    makePayment(amount: number, paymentType: string = 'RENT', paymentMethod: string = 'CREDIT_CARD', notes: string = ''): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/user/payments/pay`, { amount, payment_type: paymentType, payment_method: paymentMethod, notes }, { headers: this.getHeaders() });
    }

    // ─── Admin: Analytics ────────────────────────────────────────────────────
    getAnalytics(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/admin/analytics/summary`, { headers: this.getHeaders() });
    }

    getDashboard(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/admin/analytics/dashboard`, { headers: this.getHeaders() });
    }

    // ─── Admin: Amenities ─────────────────────────────────────────────────────
    getAmenities(towerId?: number): Observable<any[]> {
        let url = `${this.baseUrl}/admin/amenities`;
        if (towerId) url += `?tower_id=${towerId}`;
        return this.http.get<any[]>(url, { headers: this.getHeaders() });
    }

    createAmenity(data: { name: string; tower_id?: number; category?: string; description?: string; icon?: string }): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/amenities`, data, { headers: this.getHeaders() });
    }

    modifyAmenity(amenityId: number, data: { status?: string; name?: string; category?: string; description?: string }): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/admin/amenities/${amenityId}`, data, { headers: this.getHeaders() });
    }

    deleteAmenity(amenityId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/admin/amenities/${amenityId}`, { headers: this.getHeaders() });
    }

    attachAmenitiesToTower(towerId: number, amenityIds: number[]): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/towers/${towerId}/amenities`, { amenity_ids: amenityIds }, { headers: this.getHeaders() });
    }

    // ─── Admin: Towers ────────────────────────────────────────────────────────
    getTowers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/towers`, { headers: this.getHeaders() });
    }

    createTower(name: string, towerCode: string, totalFloors: number, flatsPerFloor: number, description: string, defaultFlatType: string, defaultRent: number, defaultDeposit: number, defaultSqft: number, country = '', state = '', city = '', area = '', pincode = '', addressLine = ''): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/towers`, {
            name, tower_code: towerCode, total_floors: totalFloors, flats_per_floor: flatsPerFloor, description,
            default_flat_type: defaultFlatType, default_rent: defaultRent, default_deposit: defaultDeposit, default_sqft: defaultSqft,
            country, state, city, area, pincode, address_line: addressLine
        }, { headers: this.getHeaders() });
    }

    updateTower(towerId: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/admin/towers/${towerId}`, data, { headers: this.getHeaders() });
    }

    deleteTower(towerId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/admin/towers/${towerId}`, { headers: this.getHeaders() });
    }

    uploadTowerImage(towerId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<any>(`${this.baseUrl}/admin/towers/${towerId}/image`, formData, {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` })
        });
    }

    uploadFloorLayout(towerId: number, floorNumber: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('floor_number', floorNumber.toString());
        formData.append('image', file);
        return this.http.post<any>(`${this.baseUrl}/admin/towers/${towerId}/floor-layout`, formData, {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` })
        });
    }

    // ─── Admin: Units ─────────────────────────────────────────────────────────
    getAdminUnits(towerCode?: string): Observable<any[]> {
        let params = new HttpParams();
        if (towerCode) {
            params = params.set('towerCode', towerCode);
        }
        return this.http.get<any[]>(`${this.baseUrl}/admin/units`, { headers: this.getHeaders(), params });
    }

    createUnit(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/units`, data, { headers: this.getHeaders() });
    }

    updateUnit(unitId: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/admin/units/${unitId}`, data, { headers: this.getHeaders() });
    }

    deleteUnit(unitId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/admin/units/${unitId}`, { headers: this.getHeaders() });
    }

    setUnitMaintenance(unitId: number, enable: boolean): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/units/${unitId}/maintenance`, { enable }, { headers: this.getHeaders() });
    }

    uploadUnitImages(unitId: number, files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return this.http.post<any>(`${this.baseUrl}/admin/units/${unitId}/images`, formData, {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` })
        });
    }

    // ─── Admin: Leases ────────────────────────────────────────────────────────
    getAllLeases(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/leases`, { headers: this.getHeaders() });
    }

    cancelLease(leaseId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/leases/${leaseId}/cancel`, {}, { headers: this.getHeaders() });
    }

    terminateLease(leaseId: number, reason: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/leases/${leaseId}/terminate`, { reason }, { headers: this.getHeaders() });
    }

    extendLease(leaseId: number, months: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/leases/${leaseId}/extend`, { months }, { headers: this.getHeaders() });
    }

    // ─── Admin: Bookings ──────────────────────────────────────────────────────
    getAllBookings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/bookings`, { headers: this.getHeaders() });
    }

    getBookingDetail(bookingId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/admin/bookings/${bookingId}`, { headers: this.getHeaders() });
    }

    approveBooking(bookingId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/bookings/${bookingId}/approve`, {}, { headers: this.getHeaders() });
    }

    rejectBooking(bookingId: number, reason: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/bookings/${bookingId}/reject`, { reason }, { headers: this.getHeaders() });
    }

    // ─── Admin: Maintenance ───────────────────────────────────────────────────
    getAllMaintenanceRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/maintenance`, { headers: this.getHeaders() });
    }

    updateMaintenance(reqId: number, status: string, adminComment: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/admin/maintenance/${reqId}`,
            { status, admin_comment: adminComment }, { headers: this.getHeaders() });
    }

    // ─── Admin: Audit Logs ──────────────────────────────────────────────────────
    getAuditLogs(page: number = 1, limit: number = 10, towerCode: string = 'ALL', status: string = 'ALL', startDate: string = '', endDate: string = ''): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (towerCode && towerCode !== 'ALL') params = params.set('tower_code', towerCode);
        if (status && status !== 'ALL') params = params.set('status', status);
        if (startDate) params = params.set('start_date', startDate);
        if (endDate) params = params.set('end_date', endDate);

        return this.http.get<any>(`${this.baseUrl}/admin/audit/logins`, { headers: this.getHeaders(), params });
    }

    getAuditUserDetails(userId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/admin/audit/user/${userId}`, { headers: this.getHeaders() });
    }

    // ─── Lease Download ───────────────────────────────────────────────────────
    downloadLeaseBlob(leaseId: number): Observable<Blob> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
        return this.http.get(`${this.baseUrl}/user/leases/${leaseId}/download`, { headers, responseType: 'blob' });
    }

    adminDownloadLeaseBlob(leaseId: number): Observable<Blob> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
        return this.http.get(`${this.baseUrl}/admin/leases/${leaseId}/download`, { headers, responseType: 'blob' });
    }

    regenerateLeasePdf(leaseId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/leases/${leaseId}/regenerate-pdf`, {}, { headers: this.getHeaders() });
    }

    // ─── Vacate Requests ──────────────────────────────────────────────────────
    requestVacate(leaseId: number, data: { vacate_reason: string, desired_vacate_date: string }): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/user/leases/${leaseId}/vacate`, data, { headers: this.getHeaders() });
    }

    approveVacate(leaseId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/leases/${leaseId}/vacate/approve`, {}, { headers: this.getHeaders() });
    }

    rejectVacate(leaseId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/admin/leases/${leaseId}/vacate/reject`, {}, { headers: this.getHeaders() });
    }

    getAllPayments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/payments`, { headers: this.getHeaders() });
    }
}
