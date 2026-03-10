<template>
    <div class="bookings-management">
        <div class="section-header">
            <h2>Quản lý đặt phòng</h2>
            <div style="display: flex; gap: 10px;">
                <button @click="openAddBookingForAdmin" class="btn btn-success">
                    <FontAwesomeIcon :icon="['fas', 'plus']" />
                    Thêm đặt phòng cho admin
                </button>
                <button @click="openAddBookingModal" class="btn btn-primary">
                    <FontAwesomeIcon :icon="['fas', 'plus']" />
                    Thêm đặt phòng
                </button>
            </div>
        </div>
        <!-- Search Bar -->
        <div class="search-container" style="margin-bottom: 16px;">
            <input type="text" v-model="searchQuery" placeholder="Tìm theo số phòng hoặc tên khách hàng..."
                class="search-input"
                style="width: 100%; max-width: 400px; padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;" />
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Phòng</th>
                        <th>Ngày đến</th>
                        <th>Ngày đi</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="booking in paginatedBookings" :key="booking.id">
                        <td>{{ booking.id }}</td>
                        <td>{{ booking.name }}</td>
                        <td>{{ booking.phone }}</td>
                        <td>{{ booking.room_number }}</td>
                        <td>{{ formatDate(booking.check_in) }}</td>
                        <td>{{ formatDate(booking.check_out) }}</td>
                        <td>{{ formatCurrency(booking.grand_total) }}</td>
                        <td>
                            <span v-if="booking.status === 'pending'" class="badge badge-warning">
                                <FontAwesomeIcon :icon="['fas', 'clock']" /> Đang chờ
                            </span>
                            <span v-else-if="booking.status === 'confirmed'" class="badge badge-info">
                                <FontAwesomeIcon :icon="['fas', 'check']" /> Đã xác nhận
                            </span>
                            <span v-else-if="booking.status === 'done'" class="badge badge-success">
                                <FontAwesomeIcon :icon="['fas', 'check-circle']" /> Hoàn thành
                            </span>
                            <span v-else class="badge badge-secondary">{{ booking.status }}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <!-- Status Actions -->
                                <button v-if="booking.status === 'pending'"
                                    @click="changeBookingStatus(booking, 'confirmed')"
                                    class="btn btn-icon btn-sm btn-warning" title="Xác nhận">
                                    <FontAwesomeIcon :icon="['fas', 'check']" />
                                </button>
                                <button v-if="booking.status === 'confirmed'"
                                    @click="changeBookingStatus(booking, 'done')"
                                    class="btn btn-icon btn-sm btn-success" title="Hoàn thành">
                                    <FontAwesomeIcon :icon="['fas', 'check-double']" />
                                </button>

                                <!-- Food & Bill Actions -->
                                <button v-if="booking.id_user != 1" @click="addFoodToBooking(booking.id)"
                                    class="btn btn-icon btn-sm btn-primary" title="Thêm thức ăn">
                                    <FontAwesomeIcon :icon="['fas', 'utensils']" />
                                </button>
                                <button v-if="booking.status === 'done' && booking.id_user != 1"
                                    @click="printThermalBill(booking.id)" class="btn btn-icon btn-sm btn-info"
                                    title="In hóa đơn">
                                    <FontAwesomeIcon :icon="['fas', 'receipt']" />
                                </button>

                                <!-- Edit/Delete Actions -->
                                <button v-if="booking.status !== 'done'" @click="openEditBookingModal(booking.id)"
                                    class="btn btn-sm btn-secondary" title="Sửa đặt phòng">
                                    <FontAwesomeIcon :icon="['fas', 'edit']" />
                                </button>
                                <button v-if="booking.status !== 'done'" @click="deleteBooking(booking.id)"
                                    class="btn btn-sm btn-danger" title="Xóa đặt phòng">
                                    <FontAwesomeIcon :icon="['fas', 'times']" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Bookings Pagination -->
        <div v-if="totalPagesBookings > 1" class="pagination-container">
            <div class="pagination-info">
                Trang {{ currentPageBookings }} / {{ totalPagesBookings }} ({{ bookings.length }} đặt phòng)
            </div>
            <div class="pagination-controls">
                <button @click="goToFirstPage('bookings')" :disabled="currentPageBookings === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-left']" />
                </button>
                <button @click="goToPreviousPage('bookings')" :disabled="currentPageBookings === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-left']" />
                </button>
                <span class="page-numbers">
                    <button v-for="page in Math.min(5, totalPagesBookings)" :key="page"
                        @click="changePage('bookings', page)"
                        :class="['btn', 'btn-sm', page === currentPageBookings ? 'btn-primary' : 'btn-outline']">
                        {{ page }}
                    </button>
                </span>
                <button @click="goToNextPage('bookings')" :disabled="currentPageBookings === totalPagesBookings"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-right']" />
                </button>
                <button @click="goToLastPage('bookings')" :disabled="currentPageBookings === totalPagesBookings"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-right']" />
                </button>
            </div>
        </div>
    </div>

    <!-- Add Booking Modal -->
    <div v-if="showAddBookingModal" class="modal-overlay" @click="closeAddBookingModal">
        <AddBookingModal @close="closeAddBookingModal" @refresh="fetchBookings" />
    </div>

    <!-- Edit Booking Modal -->
    <div v-if="showEditBookingModal" class="modal-overlay" @click="closeEditBookingModal">
        <EditBookingModal @close="closeEditBookingModal" @refresh="fetchBookings" />
    </div>

    <!-- Add Booking For Admin -->
    <div class="modal-overlay" v-if="showAddBookingForAdminModal" @click="closeAddBookingForAdminModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm đặt phòng cho Admin</h3>
                <button @click="closeAddBookingForAdminModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>
            <form class="modal-form" @submit.prevent="submitAddBookingAdmin">
                <div class="form-group">
                    <label for="roomType">Loại phòng *</label>
                    <select id="roomType" v-model="newBookingForAdmin.roomTypeId" @change="onRoomTypeChange" required
                        class="form-select">
                        <option value="">Chọn loại phòng</option>
                        <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">
                            {{ roomType.name }} - {{ formatCurrency(roomType.base_price) }}/{{ roomType.type ===
                                'hourly' ? 'giờ' : 'đêm' }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="availableRooms">Phòng có sẵn *</label>
                    <select id="availableRooms" v-model="newBookingForAdmin.roomId" required class="form-select"
                        :disabled="!newBookingForAdmin.roomTypeId">
                        <option value="">Chọn phòng</option>
                        <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                            Phòng {{ room.room_number }}
                        </option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="checkIn">Ngày nhận phòng *</label>
                        <input id="checkIn" v-model="newBookingForAdmin.checkIn" type="datetime-local" required />
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddBookingForAdminModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Tạo đặt phòng
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Food to Booking Modal -->
    <div v-if="showAddFoodToBookingModal" class="modal-overlay" @click="closeAddFoodToBookingModal">
        <div class="modal-content" @click.stop style="max-width: 700px;">
            <div class="modal-header">
                <h3>Quản lý thức ăn - Booking #{{ selectedBookingId }}</h3>
                <button @click="closeAddFoodToBookingModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitFoodToBooking" class="modal-form">
                <div class="food-selection-list">
                    <div v-for="food in selectedFoodItems" :key="food.id"
                        :class="['food-selection-item', { 'has-existing': food.hasExisting }]">
                        <div class="food-info">
                            <div class="food-name-wrapper">
                                <span class="food-name">{{ food.name }}</span>
                                <span v-if="food.hasExisting" class="existing-badge">Đã có</span>
                            </div>
                            <span class="food-price">{{ formatCurrency(food.price) }}</span>
                        </div>
                        <div class="quantity-control">
                            <button type="button" @click="food.quantity = Math.max(0, food.quantity - 1)"
                                class="qty-btn">
                                <FontAwesomeIcon :icon="['fas', 'minus']" />
                            </button>
                            <input type="number" v-model.number="food.quantity" min="0" class="qty-input" />
                            <button type="button" @click="food.quantity++" class="qty-btn">
                                <FontAwesomeIcon :icon="['fas', 'plus']" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddFoodToBookingModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'check']" />
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    </div>

</template>

<script setup>
import { onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import EditBookingModal from '@/components/booking-view/EditBookingModal.vue'
import AddBookingModal from '@/components/booking-view/AddBookingModal.vue'

// Stores pinia
import { useEditBookingStore } from '@/stores/EditBookingStore'
import { useAddBookingStore } from '@/stores/AddBookingStore'
import { storeToRefs } from 'pinia'

const store = useEditBookingStore()
const stores = useAddBookingStore()
const { showEditBookingModal } = storeToRefs(store)
const {
    bookings, services, taxes, foods, roomTypes,
    rooms, selectedBookingId, selectedFoodItems,
    showAddBookingModal, showAddFoodToBookingModal,
    showAddBookingForAdminModal, availableRooms,
    currentPageBookings, searchQuery, newBookingForAdmin,
    // computed
    paginatedBookings, totalPagesBookings } = storeToRefs(stores)
const { closeEditBookingModal, openEditBookingModal } = store

const {
    openAddBookingModal, closeAddBookingModal,
    openAddBookingForAdmin, closeAddBookingForAdminModal, formatCurrency,
    formatDate, fetchBookings, fetchServices,
    fetchFoods, fetchRoomTypes, fetchTaxes, fetchRooms, changeBookingStatus,
    deleteBooking, printThermalBill, addFoodToBooking, closeAddFoodToBookingModal,
    submitFoodToBooking, onRoomTypeChange, submitAddBookingAdmin,
    changePage, goToFirstPage, goToLastPage,
    goToPreviousPage, goToNextPage } = stores

onMounted(async () => {
    const promises = []
    if (bookings.value.length === 0) {
        promises.push(fetchBookings())
    }
    if (services.value.length === 0) {
        promises.push(fetchServices())
    }
    if (taxes.value.length === 0) {
        promises.push(fetchTaxes())
    }
    if (foods.value.length === 0) {
        promises.push(fetchFoods())
    }
    if (roomTypes.value.length === 0) {
        promises.push(fetchRoomTypes())
    }
    if (rooms.value.length === 0) {
        promises.push(fetchRooms())
    }
    await Promise.all(promises)
})
</script>

<style scoped>
@import '@/assets/admin-global.css';

/* Table Improvements */
.table-container {
    overflow-x: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    background: white;
}

table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

th {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    border-bottom: 2px solid #e2e8f0;
}

td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
}

tr:hover td {
    background-color: #f8fafc;
}

/* Badge Styles */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
}

.badge-warning {
    background-color: #fffbeb;
    color: #b45309;
    border: 1px solid #fcd34d;
}

.badge-success {
    background-color: #f0fdf4;
    color: #15803d;
    border: 1px solid #86efac;
}

.badge-info {
    background-color: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #93c5fd;
}

.badge-secondary {
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
}

.btn-icon {
    width: 32px;
    height: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
}

.btn-icon:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Rental Type Toggle */
.rental-toggle {
    display: inline-flex;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
    gap: 4px;
    border: 1px solid #e2e8f0;
}

.rental-radio {
    display: none;
}

.rental-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 7px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    white-space: nowrap;
}

.rental-pill:hover {
    background: #e2e8f0;
    color: #334155;
}

.rental-radio:checked+.rental-pill {
    background: #4f46e5;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
}
</style>
