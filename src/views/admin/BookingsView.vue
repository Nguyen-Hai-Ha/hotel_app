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
                        <th>In hóa đơn</th>
                        <th>Thêm thức ăn</th>
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
                            <div class="action-buttons">
                                <button v-if="booking.status === 'pending'"
                                    @click="changeBookingStatus(booking, 'confirmed')" class="btn btn-sm btn-warning"
                                    title="Xác nhận đặt phòng">
                                    <FontAwesomeIcon :icon="['fas', 'check']" />
                                    Xác nhận
                                </button>
                                <button v-if="booking.status === 'confirmed'"
                                    @click="changeBookingStatus(booking, 'done')" class="btn btn-sm btn-success"
                                    title="Hoàn thành">
                                    <FontAwesomeIcon :icon="['fas', 'check-double']" />
                                    Hoàn thành
                                </button>
                                <span v-if="booking.status === 'done'" class="status-done">
                                    <FontAwesomeIcon :icon="['fas', 'check-circle']" />
                                    Đã hoàn thành
                                </span>
                            </div>
                        </td>
                        <td>
                            <button v-if="booking.status === 'done' && booking.id_user != 1"
                                @click="printThermalBill(booking.id)" class="btn btn-sm btn-info"
                                title="In hóa đơn nhiệt">
                                <FontAwesomeIcon :icon="['fas', 'receipt']"></FontAwesomeIcon>
                                In Bill
                            </button>
                        </td>
                        <td>
                            <button v-if="booking.status !== 'done' && booking.id_user != 1"
                                @click="addFoodToBooking(booking.id)" class="btn btn-sm btn-primary"
                                title="Thêm thức ăn">
                                <FontAwesomeIcon :icon="['fas', 'utensils']"></FontAwesomeIcon>
                                Thêm thức ăn
                            </button>
                        </td>
                        <td>
                            <button v-if="booking.status !== 'done'" @click="deleteeBooking(booking.id)"
                                class="btn btn-sm btn-danger" title="Xóa đặt phòng">
                                <FontAwesomeIcon :icon="['fas', 'times']" />
                            </button>
                            <span v-else class="text-muted" style="font-size: 0.75rem;">
                                Không thể xóa
                            </span>
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
        <div class="modal-contents" @click.stop>
            <div class="modal-header">
                <h3>Thêm đặt phòng mới</h3>
                <button @click="closeAddBookingModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddBooking" class="modal-form">
                <!-- Customer Information -->
                <div class="form-section">
                    <h4>Thông tin khách hàng</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerName">Tên khách hàng *</label>
                            <input ref="BookingNameInput" id="customerName" v-model="newBooking.customerName"
                                type="text" required placeholder="Nhập tên khách hàng" />
                        </div>
                        <div class="form-group">
                            <label for="customerPhone">Số điện thoại *</label>
                            <input id="customerPhone" v-model="newBooking.customerPhone" type="tel" required
                                placeholder="Nhập số điện thoại" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerEmail">Email</label>
                            <input id="customerEmail" v-model="newBooking.customerEmail" type="email"
                                placeholder="Nhập email" />
                        </div>
                        <div class="form-group">
                            <label for="customerPassport">CMND/CCCD *</label>
                            <input id="customerPassport" v-model="newBooking.customerPassport" type="text" required
                                placeholder="Nhập CMND/CCCD" />
                        </div>
                    </div>
                </div>

                <!-- Room Selection -->
                <div class="form-section">
                    <h4>Thông tin phòng</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="roomType">Loại phòng *</label>
                            <select id="roomType" v-model="newBooking.roomTypeId" @change="onRoomTypeChange" required
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
                            <select id="availableRooms" v-model="newBooking.roomId" required class="form-select"
                                :disabled="!newBooking.roomTypeId">
                                <option value="">Chọn phòng</option>
                                <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                                    Phòng {{ room.room_number }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div v-if="isHourlyRental" class="form-group">
                            <label for="checkIn">Giờ nhận phòng *</label>
                            <input id="checkIn" v-model="newBooking.checkIn" type="datetime-local" required />
                        </div>
                        <template v-else>
                            <div class="form-group">
                                <label for="checkIn">Ngày nhận phòng *</label>
                                <input id="checkIn" v-model="newBooking.checkIn" type="datetime-local" required />
                            </div>
                            <div class="form-group">
                                <label for="checkOut">Ngày trả phòng *</label>
                                <input id="checkOut" v-model="newBooking.checkOut" type="datetime-local" required />
                            </div>
                        </template>
                    </div>

                    <div class="form-group" v-if="!isHourlyRental">
                        <label>Số đêm: <strong>{{ bookingNights }}</strong></label>
                    </div>
                </div>

                <!-- Services Selection -->
                <div class="form-section" v-if="!isHourlyRental">
                    <h4>Dịch vụ bổ sung</h4>
                    <div class="services-selection">
                        <div v-for="service in services" :key="service.id" class="service-item">
                            <div class="service-info">
                                <label class="service-checkbox">
                                    <input type="checkbox" :value="service.id" v-model="newBooking.selectedServices" />
                                    <div class="service-details">
                                        <strong>{{ service.name }}</strong>
                                        <p>{{ service.description }}</p>
                                        <span class="service-price">{{ formatCurrency(service.price) }}</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tax Selection -->
                <div class="form-section" v-if="!isHourlyRental">
                    <h4>Thuế áp dụng</h4>
                    <div class="tax-selection">
                        <div v-for="tax in taxes" :key="tax.id" class="tax-item">
                            <label class="tax-checkbox">
                                <input type="checkbox" :value="tax.id" v-model="newBooking.selectedTaxes" />

                                <span>{{ tax.name }} ({{ tax.rate }}%)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h4>Giảm giá áp dụng (%)</h4>
                    <div class="discount-selection">
                        <div class="discount-item" style="width: 25%;">
                            <input type="number" v-model="newBooking.discount" />
                            <button type="button" @click="applyDiscount">Áp
                                dụng</button>
                        </div>
                    </div>
                </div>

                <!-- Cost Breakdown -->
                <div class="form-section cost-breakdown" v-if="isHourlyRental">
                    <h4>Chi tiết chi phí</h4>
                    <div class="cost-item">
                        <span>Tiền phòng:</span>
                        <span>{{ formatCurrency(roomCost) }}</span>
                    </div>
                    <div class="cost-item total">
                        <span><strong>Tổng cộng:</strong></span>
                        <!-- Hiển thị cả 2 giá khi có discount -->
                        <span v-if="finalGrandTotal > 0"
                            style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
                                formatCurrency(grandTotal)
                            }}</span>
                            <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(finalGrandTotal)
                            }}</strong>
                        </span>
                        <!-- Hiển thị giá gốc khi chưa discount -->
                        <span v-else><strong>{{ formatCurrency(grandTotal) }}</strong></span>
                    </div>
                </div>

                <div class="form-section cost-breakdown" v-else>
                    <h4>Chi tiết chi phí</h4>
                    <div class="cost-item">
                        <span>Tiền phòng ({{ bookingNights }} đêm):</span>
                        <span>{{ formatCurrency(roomCost) }}</span>
                    </div>
                    <div class="cost-item" v-if="!isHourlyRental">
                        <span>Dịch vụ:</span>
                        <span>{{ formatCurrency(servicesCost) }}</span>
                    </div>
                    <div class="cost-item" v-if="!isHourlyRental">
                        <span>Tổng phụ:</span>
                        <span>{{ formatCurrency(subtotal) }}</span>
                    </div>
                    <div class="cost-item">
                        <span>Thuế:</span>
                        <span>{{ formatCurrency(taxAmount) }}</span>
                    </div>
                    <div class="cost-item total">
                        <span><strong>Tổng cộng:</strong></span>
                        <!-- Hiển thị cả 2 giá khi có discount -->
                        <span v-if="finalGrandTotal > 0"
                            style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
                                formatCurrency(grandTotal)
                            }}</span>
                            <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(finalGrandTotal)
                            }}</strong>
                        </span>
                        <!-- Hiển thị giá gốc khi chưa discount -->
                        <span v-else><strong>{{ formatCurrency(grandTotal) }}</strong></span>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddBookingModal" class="btn btn-outline">
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const bookings = ref([])
const services = ref([])
const taxes = ref([])
const foods = ref([])
const roomTypes = ref([])
const rooms = ref([])
const selectedBookingId = ref(null)
const selectedFoodItems = ref([])

const showAddBookingModal = ref(false)
const showAddFoodToBookingModal = ref(false)
const showAddBookingForAdminModal = ref(false)

const availableRooms = ref([])

const itemsPerPage = 12
const currentPageBookings = ref(1)

const BookingNameInput = ref(null)

const openAddBookingModal = async () => {
    showAddBookingModal.value = true
    await nextTick()
    BookingNameInput.value?.focus()
}

const openAddBookingForAdmin = async () => {
    showAddBookingForAdminModal.value = true
}

const closeAddBookingForAdminModal = () => {
    showAddBookingForAdminModal.value = false
    availableRooms.value = []
}

const finalGrandTotal = ref(0)

const newBooking = ref({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerPassport: '',
    roomTypeId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    selectedServices: [],
    selectedTaxes: [],
    discount: ''
})

const newBookingForAdmin = ref({
    roomTypeId: '',
    roomId: '',
    checkIn: '',
})

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const selectedRoomType = computed(() => {
    return roomTypes.value.find(rt => rt.id == newBooking.value.roomTypeId) || null
})

const bookingNights = computed(() => {
    if (!newBooking.value.checkIn || !newBooking.value.checkOut) return 0
    const checkIn = new Date(newBooking.value.checkIn)
    const checkOut = new Date(newBooking.value.checkOut)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
})

const isHourlyRental = computed(() => selectedRoomType.value?.type === 'hourly')

const roomCost = computed(() => {
    if (isHourlyRental.value) {
        return selectedRoomType.value.base_price
    } else {
        if (!selectedRoomType.value || !bookingNights.value) return 0
        return selectedRoomType.value.base_price * bookingNights.value
    }
})

const servicesCost = computed(() => {
    return newBooking.value.selectedServices.reduce((total, serviceId) => {
        const service = services.value.find(s => s.id == serviceId)
        return total + (service ? service.price : 0)
    }, 0)
})

const subtotal = computed(() => {
    if (isHourlyRental.value) {
        return roomCost.value
    } else {
        return roomCost.value
    }
})

const taxAmount = computed(() => {
    return newBooking.value.selectedTaxes.reduce((total, taxId) => {
        const tax = taxes.value.find(t => t.id == taxId)
        if (tax) {
            return total + (subtotal.value * tax.rate / 100)
        }
        return total
    }, 0)
})

const grandTotal = computed(() => {
    return subtotal.value + taxAmount.value + (servicesCost.value * bookingNights.value)
})

const fetchBookings = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/admin/bookings')
        bookings.value = response.data
    } catch (error) {
        console.error('Error fetching bookings:', error)
    }
}

const fetchServices = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/services')
        services.value = response.data
    } catch (error) {
        console.error('Error fetching services:', error)
    }
}

const fetchFoods = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/foods')
        foods.value = response.data
    } catch (error) {
        console.error('Error fetching foods:', error)
    }
}

const fetchRoomTypes = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/admin/room-types')
        roomTypes.value = response.data
    } catch (error) {
        console.error('Error fetching room types:', error)
    }
}

const fetchTaxes = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/taxes')
        taxes.value = response.data
    } catch (error) {
        console.error('Error fetching taxes:', error)
    }
}

const fetchRooms = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/admin/rooms')
        rooms.value = response.data
        console.log('Admin rooms data:', rooms.value)
    } catch (error) {
        console.error('Error fetching rooms:', error)
    }
}

const changeBookingStatus = async (booking, newStatus) => {
    try {
        const formData = new FormData()
        formData.append('status', newStatus)
        const response = await fetch(`https://api.thesecret-hotel.com/api/admin/change-status-booking/${booking.id}`, {
            method: 'POST',
            body: formData
        })

        if (response.status === 200) {
            await fetchBookings()
        } else {
            throw new Error('Failed to update status')
        }
    } catch (error) {
        console.error('Error updating booking status:', error)
    }
}

const onRoomTypeChange = async () => {
    if (newBooking.value.roomTypeId || newBookingForAdmin.value.roomTypeId) {
        try {
            // Fetch room type details and available rooms using the show endpoint
            const response = await axios.get(`https://api.thesecret-hotel.com/api/rooms/${newBooking.value.roomTypeId || newBookingForAdmin.value.roomTypeId}`)
            console.log('Room type response:', response.data)

            // Extract available rooms from the response
            if (response.data && response.data.available_rooms) {
                // Filter only available rooms
                availableRooms.value = response.data.available_rooms.filter(room =>
                    room.status === 'available' || room.status === 'Available'
                )
            } else {
                console.warn('No available_rooms in response:', response.data)
                availableRooms.value = []
            }

            console.log('Available rooms set to:', availableRooms.value)
        } catch (error) {
            console.error('Error fetching available rooms:', error)

            // Fallback: filter from all rooms using admin endpoint
            try {
                console.log('Trying fallback: filtering from admin rooms')
                const allRoomsResponse = await axios.get('https://api.thesecret-hotel.com/api/admin/rooms')
                const allRooms = Array.isArray(allRoomsResponse.data) ? allRoomsResponse.data : allRoomsResponse.data.data || []

                // Filter rooms by room type and status
                availableRooms.value = allRooms.filter(room =>
                    room.id_room_type == newBooking.value.roomTypeId || room.id_room_type == newBookingForAdmin.value.roomTypeId &&
                    (room.status === 'available' || room.status === 'Available')
                )

                console.log('Fallback available rooms:', availableRooms.value)
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError)
                availableRooms.value = []
            }
        }
    } else {
        availableRooms.value = []
    }
    newBooking.value.roomId = ''
}

const closeAddBookingModal = () => {
    showAddBookingModal.value = false
    newBooking.value = {
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        roomTypeId: '',
        roomId: '',
        checkIn: '',
        checkOut: '',
        selectedServices: [],
        selectedTaxes: [],
        discount: ''
    }
    availableRooms.value = []
    finalGrandTotal.value = 0
}

const submitAddBooking = async () => {
    try {
        // Validate required fields
        if (selectedRoomType.value?.type === 'daily') {
            if (!newBooking.value.customerName || !newBooking.value.customerPhone ||
                !newBooking.value.roomId || !newBooking.value.checkIn || !newBooking.value.checkOut
                || !newBooking.value.customerPassport) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc')
                return
            }
        } else {
            if (!newBooking.value.customerName || !newBooking.value.customerPhone ||
                !newBooking.value.roomId || !newBooking.value.checkIn
                || !newBooking.value.customerPassport) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc')
                return
            }
        }

        // Validate dates
        const checkIn = new Date(newBooking.value.checkIn)
        const checkOut = new Date(newBooking.value.checkOut)
        if (checkOut <= checkIn) {
            console.error('Ngày trả phòng phải sau ngày nhận phòng')
            return
        }
        const booking_type = selectedRoomType.value.type

        const effectiveGrandTotal = finalGrandTotal.value > 0 ? finalGrandTotal.value : grandTotal.value
        const discountAmount = grandTotal.value - effectiveGrandTotal

        // Prepare booking data
        const bookingData = {
            customer_name: newBooking.value.customerName.trim(),
            customer_phone: newBooking.value.customerPhone.trim(),
            customer_email: newBooking.value.customerEmail.trim() || null,
            customer_passport: newBooking.value.customerPassport.trim(),
            id_room: newBooking.value.roomId,
            check_in: newBooking.value.checkIn,
            check_out: newBooking.value.checkOut,
            tax_amount: taxAmount.value,
            subtotal: subtotal.value,
            grand_total: effectiveGrandTotal,
            discount_total: discountAmount,
            service_charge: (servicesCost.value * bookingNights.value) || 0,
            id_tax: newBooking.value.selectedTaxes.length > 0 ? String(newBooking.value.selectedTaxes[0]) : '1',
            status: 'check-in',
            id_user: '4',
            booking_type: booking_type
        }

        console.log('Sending booking data:', bookingData)

        const response = await axios.post('https://api.thesecret-hotel.com/api/admin/bookings', bookingData)
        console.log('Success response:', response.data)

        await fetchBookings()
        await fetchRooms() // Refresh rooms to update availability
        closeAddBookingModal()

    } catch (error) {
        console.error('Error adding booking:', error)

        if (error.response) {
            console.error('Error response:', error.response.data)
            console.error('Error status:', error.response.status)

            if (error.response.status === 422) {
                const validationErrors = error.response.data.errors || error.response.data
                let errorMessage = 'Lỗi validation:\n'

                if (typeof validationErrors === 'object') {
                    Object.keys(validationErrors).forEach(key => {
                        errorMessage += `- ${key}: ${validationErrors[key].join(', ')}\n`
                    })
                } else {
                    errorMessage += JSON.stringify(validationErrors, null, 2)
                }

                console.error(errorMessage)
            } else {
                console.error(`Lỗi: ${error.response.data.message || 'Không thể tạo đặt phòng'}`)
            }
        } else if (error.request) {
            console.error('Error request:', error.request)
            console.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
        } else {
            console.error('Error message:', error.message)
            console.error(`Lỗi: ${error.message}`)
        }
    }
}

const submitAddBookingAdmin = async () => {
    try {
        const booking = {
            id_room: newBookingForAdmin.value.roomId,
            customer_name: 'admin',
            customer_phone: '',
            customer_email: '',
            customer_passport: 'admin',
            check_in: newBookingForAdmin.value.checkIn,
            check_out: '',
            tax_amount: '0',
            subtotal: '0',
            grand_total: '0',
            discount_total: '0',
            service_charge: '0',
            id_tax: '1',
            status: 'success',
            id_user: '1',
            booking_type: 'daily'
        }

        const response = await axios.post('https://api.thesecret-hotel.com/api/admin/bookings', booking)
        console.log('Success response:', response.data)

        await fetchBookings()
        await fetchRooms()
        closeAddBookingForAdminModal()

    } catch (error) {
        console.error('Error adding booking:', error)

        if (error.response) {
            console.error('Error response:', error.response.data)
            console.error('Error status:', error.response.status)

            if (error.response.status === 422) {
                const validationErrors = error.response.data.errors || error.response.data
                let errorMessage = 'Lỗi validation:\n'

                if (typeof validationErrors === 'object') {
                    Object.keys(validationErrors).forEach(key => {
                        errorMessage += `- ${key}: ${validationErrors[key].join(', ')}\n`
                    })
                } else {
                    errorMessage += JSON.stringify(validationErrors, null, 2)
                }

                console.error(errorMessage)
            } else {
                console.error(`Lỗi: ${error.response.data.message || 'Không thể tạo đặt phòng'}`)
            }
        } else if (error.request) {
            console.error('Error request:', error.request)
            console.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
        } else {
            console.error('Error message:', error.message)
            console.error(`Lỗi: ${error.message}`)
        }
    }
}

const deleteeBooking = async (bookingId) => {
    if (confirm('Bạn có chắc muốn xóa đặt phòng này?')) {
        try {
            await axios.delete(`https://api.thesecret-hotel.com/api/admin/bookings/${bookingId}`)
            await fetchBookings()
        } catch (error) {
            console.error('Error deleting booking:', error)
        }
    }
}

const printThermalBill = async (bookingId) => {
    try {
        const apiUrl = 'https://api.thesecret-hotel.com/api/booking/' + bookingId + '/thermal-bill'
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data.success) {
            const printWindow = window.open('', '_blank', 'width=1000,height=1000')

            printWindow.document.write('<!DOCTYPE html>')
            printWindow.document.write('<html><head>')
            printWindow.document.write('<title>Hóa Đơn Khách Sạn</title>')
            printWindow.document.write('<meta charset="UTF-8">')
            printWindow.document.write('<style>')
            printWindow.document.write('body { font-family: monospace; font-size: 12px; margin: 20px; }')
            printWindow.document.write('.bill { white-space: pre-wrap; }')
            printWindow.document.write('@media print { body { margin: 0; } }')
            printWindow.document.write('</style>')
            printWindow.document.write('</head><body>')
            printWindow.document.write('<div class="bill">')
            printWindow.document.write(data.thermal_bill)
            printWindow.document.write('</div>')
            setTimeout(function () { printWindow.print(); }, 500)
            printWindow.document.write('</body></html>')

            printWindow.document.close()

        } else {
            throw new Error(data.error || 'Không thể tạo hóa đơn')
        }

    } catch (error) {
        console.error('Error printing thermal bill:', error)
    }
}

// Food to Booking Methods
const addFoodToBooking = async (bookingId) => {
    selectedBookingId.value = bookingId

    try {
        // Fetch existing foods for this booking
        const response = await axios.get(`https://api.thesecret-hotel.com/api/admin/booking/${bookingId}/foods`)
        const existingFoods = response.data.foods || []

        // Create a map of existing food quantities
        const existingFoodMap = {}
        existingFoods.forEach(food => {
            existingFoodMap[food.id_food] = food.amount
        })

        // Initialize food items with existing quantities or 0
        selectedFoodItems.value = foods.value.map(food => ({
            ...food,
            quantity: existingFoodMap[food.id] || 0,
            hasExisting: !!existingFoodMap[food.id] // Flag to indicate if food already exists
        }))

        showAddFoodToBookingModal.value = true
    } catch (error) {
        console.error('Error fetching booking foods:', error)
        // Fallback: Initialize with quantity 0
        selectedFoodItems.value = foods.value.map(food => ({
            ...food,
            quantity: 0,
            hasExisting: false
        }))
        showAddFoodToBookingModal.value = true
    }
}

const closeAddFoodToBookingModal = () => {
    showAddFoodToBookingModal.value = false
    selectedBookingId.value = null
    selectedFoodItems.value = []
}

const submitFoodToBooking = async () => {
    try {
        // Send all foods with their quantities (including 0 to delete)
        // Only send foods that have changed from their original state
        const foodsToUpdate = selectedFoodItems.value
            .filter(item => {
                // Include items that either have quantity > 0 OR had existing quantity
                return item.quantity > 0 || item.hasExisting
            })
            .map(item => ({
                id_food: item.id,
                amount: item.quantity
            }))

        if (foodsToUpdate.length === 0) {
            console.log('Không có thay đổi nào')
            closeAddFoodToBookingModal()
            return
        }

        const response = await axios.post('https://api.thesecret-hotel.com/api/admin/update-invoice-foods', {
            id_booking: selectedBookingId.value,
            foods: foodsToUpdate
        })

        if (response.data.success) {
            console.log(`${response.data.message}\nTổng tiền thức ăn: ${formatCurrency(response.data.total_food_cost)}\nTổng hóa đơn mới: ${formatCurrency(response.data.new_grand_total)}`)
            await fetchBookings() // Refresh bookings to show updated total
            closeAddFoodToBookingModal()
        } else {
            console.log('Có lỗi xảy ra khi cập nhật thức ăn')
        }
    } catch (error) {
        console.error('Error updating food to booking:', error)
        console.log(`Lỗi: ${error.response?.data?.error || error.message}`)
    }
}

const applyDiscount = () => {
    const discountPercent = parseFloat(newBooking.value.discount) || 0

    if (discountPercent < 0 || discountPercent > 100) {
        console.log('Giảm giá phải từ 0% đến 100%')
        return
    }

    // Tính tổng tiền gốc (chưa giảm)
    const originalTotal = grandTotal.value

    // Tính grand total sau giảm giá và lưu vào finalGrandTotal
    finalGrandTotal.value = originalTotal * (1 - discountPercent / 100)

    console.log(`Giảm ${discountPercent}%: ${originalTotal} → ${finalGrandTotal.value}`)
}

const paginatedBookings = computed(() => {
    const start = (currentPageBookings.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return bookings.value.slice(start, end)
})

const totalPagesBookings = computed(() => {
    return Math.ceil(bookings.value.length / itemsPerPage)
})

const changePage = (section, page) => {
    if (section === 'bookings' && page >= 1 && page <= totalPagesBookings.value) {
        currentPageBookings.value = page
    }
}

const goToFirstPage = (section) => {
    if (section === 'bookings') {
        changePage(section, 1)
    }
}

const goToLastPage = (section) => {
    if (section === 'bookings') {
        changePage(section, totalPagesBookings.value)
    }
}

const goToPreviousPage = (section) => {
    if (section === 'bookings') {
        changePage(section, currentPageBookings.value - 1)
    }
}

const goToNextPage = (section) => {
    if (section === 'bookings') {
        changePage(section, currentPageBookings.value + 1)
    }
}

onMounted(() => {
    fetchBookings()
    fetchServices()
    fetchFoods()
    fetchRoomTypes()
    fetchTaxes()
    fetchRooms()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
