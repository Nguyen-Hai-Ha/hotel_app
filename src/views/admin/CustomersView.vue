<template>
    <div class="customers-management">
        <div class="section-header">
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Số phòng</th>
                        <th>Trạng thái thanh toán</th>
                        <th>Số tiền phải trả</th>
                        <th>Ngày check-in</th>
                        <th>Ngày check-out</th>
                        <th>Thêm thuế</th>
                        <th>Phụ thu</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="customers.length === 0">
                        <td colspan="8" style="text-align: center; color: #999;">
                            Không có khách hàng nào
                        </td>
                    </tr>
                    <tr v-for="customer in customers" :key="customer.id">
                        <td>{{ customer.id }}</td>
                        <td>{{ customer.name }}</td>
                        <td>{{ customer.phone }}</td>
                        <td>{{ customer.room_number }}</td>

                        <td v-if="customer.payment_status === 'deposited'">Đã đặt cọc</td>
                        <td v-else-if="customer.payment_status === 'success' || customer.payment_status === 'done'">Đã
                            Thanh Toán</td>
                        <td v-else>Chưa thanh toán</td>

                        <td v-if="customer.payment_status === 'deposited'">{{ formatCurrency(customer.grand_total -
                            customer.deposited_amount) }}</td>
                        <td v-else-if="customer.payment_status === 'success' || customer.payment_status === 'done'">$0
                        </td>
                        <td v-else> {{ formatCurrency(customer.grand_total) }}
                        </td>

                        <td>{{ formatDate(customer.checkin_date) }}</td>
                        <td>{{ formatDate(customer.checkout_date) }}</td>
                        <td>
                            <button @click="addTax(customer)"
                                v-if="customer.booking_type === 'hourly' && customer.id_user != 1"
                                class="btn btn-sm btn-primary">Thêm thuế
                            </button>
                        </td>
                        <td>
                            <button @click="openAddOverTimeModal(customer)" v-if="customer.id_user != 1"
                                class="btn btn-sm btn-primary">Thêm phụ thu
                            </button>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button v-if="customer.status === 'occupied'" @click="checkInCustomer(customer)"
                                    class="btn btn-sm btn-primary" title="Check In">
                                    <FontAwesomeIcon :icon="['fas', 'sign-in-alt']" />
                                    Check In
                                </button>
                                <button v-if="customer.status === 'checked_in'" @click="checkOutCustomer(customer)"
                                    class="btn btn-sm btn-warning" title="Check Out">
                                    <FontAwesomeIcon :icon="['fas', 'sign-out-alt']" />
                                    Check Out
                                </button>
                                <button v-if="customer.status === 'checked_out'" @click="markRoomCleaned(customer)"
                                    class="btn btn-sm btn-success" title="Đánh dấu đã dọn phòng">
                                    <FontAwesomeIcon :icon="['fas', 'broom']" />
                                    Đã dọn
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add Overtime/Surcharge Modal -->
    <div v-if="showAddOverTimeModal" class="modal-overlay" @click="closeAddOverTimeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm phụ thu</h3>
                <button @click="closeAddOverTimeModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="addSubCharge(customer)" class="modal-form">
                <div class="form-group">
                    <label for="sub_charge">Số tiền phụ thu (USD) *</label>
                    <input ref="SubChargeInput" id="sub_charge" v-model.number="sub_charge" type="number" step="0.01"
                        min="0" required placeholder="Nhập số tiền phụ thu" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddOverTimeModal" class="btn btn-secondary">
                        <FontAwesomeIcon :icon="['fas', 'times']" />
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm phụ thu
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const customers = ref([])
const customer = ref({
    id: null,
    // name: '',
    // phone: '',
    // room_number: '',
    // checkin_date: '',
    // checkout_date: '',
    // booking_type: '',
    // status: '',
    // payment_status: '',
    // grand_total: 0,
    // deposited_amount: 0,
    // booking_id: null,
    // amount: 0,
    // over_time: 0,
    // sub_charse: 0,
})
const sub_charge = ref('')
const SubChargeInput = ref(null)
const showAddOverTimeModal = ref(false)

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
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

const fetchCustomers = async () => {
    try {
        // For now, we'll use booking data and transform it to customer format
        const response = await axios.get('http://127.0.0.1:8000/api/admin/bookings-customer')
        customers.value = response.data.map(booking => ({
            id: booking.id,
            id_room: booking.id_room,
            name: booking.name,
            phone: booking.phone || 'Không có',
            room_number: booking.room_number,
            checkin_date: booking.check_in,
            checkout_date: booking.check_out,
            booking_type: booking.booking_type,
            status: booking.status_room,
            payment_status: booking.payment_status,
            grand_total: booking.grand_total,
            deposited_amount: booking.deposited_amount,
            booking_id: booking.id,
            amount: booking.grand_total,
            over_time: booking.over_time,
            sub_charse: booking.sub_charse,
            id_user: booking.id_user,
        })).filter(customer =>
            customer.status !== 'cleaned' &&
            customer.status !== 'available' &&
            customer.payment_status !== 'done'
        ) // Don't show cleaned, available rooms, or completed payments

        // Add some sample data if no bookings exist
        console.log('Admin customers data:', customers.value)

    } catch (error) {
        console.error('Error fetching customers:', error)
        // Add sample data on error too

    }
}

const getCurrentTimestamp = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const addTax = async (customer) => {
    if (confirm(`Xác nhận thêm thuế cho khách hàng ${customer.name}?`)) {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/admin/add-tax-for-booking-hour/' + customer.id)
            if (response.status === 200) {
                console.log('Thêm thuế thành công')
                await fetchCustomers()
                await fetchBookings()
            }
        } catch (error) {
            console.error('Error adding tax:', error)
        }
    }
}

const checkInCustomer = async (customer) => {
    try {
        const timestamp = getCurrentTimestamp()
        const formData = new FormData()
        formData.append('status', 'checked_in')
        formData.append('timestamp', timestamp)
        const response = await axios.post('http://127.0.0.1:8000/api/admin/change-status-room/' + customer.id_room, formData)

        if (response.status === 200) {
            // Cập nhật trạng thái trực tiếp trong mảng customers

            await fetchCustomers()
            console.log(`Customer ${customer.name} checked in successfully at ${timestamp}`)
            // Refresh customers data to ensure UI is updated
        }
    } catch (error) {
        console.error('Error checking in customer:', error)
    }

}

const checkOutCustomer = async (customer) => {
    try {
        const timestamp = getCurrentTimestamp()
        const formData = new FormData()
        formData.append('status', 'checked_out')
        formData.append('timestamp', timestamp)
        const response = await axios.post(`http://127.0.0.1:8000/api/admin/change-status-room/` + customer.id_room, formData)

        if (response.status === 200) {
            // Cập nhật trạng thái trực tiếp trong mảng customers
            await fetchCustomers()
            console.log(`Customer ${customer.name} checked out successfully at ${timestamp}`)
            // Refresh customers data to ensure UI is updated
        }
    } catch (error) {
        console.error('Error checking out customer:', error)
    }
}

const markRoomCleaned = async (customer) => {
    try {
        const formData = new FormData()
        formData.append('status', 'available')
        const response = await axios.post('http://127.0.0.1:8000/api/admin/change-status-room/' + customer.id_room, formData)

        if (response.status === 200) {
            // Cập nhật trạng thái trực tiếp trong mảng customers
            await fetchCustomers()
            console.log(`Room ${customer.room_number} marked as cleaned`)
            // Refresh customers data to ensure UI is updated
        }
    } catch (error) {
        console.error('Error marking room as cleaned:', error)
    }

}
const openAddOverTimeModal = async (customers) => {
    customer.value = {
        id: customers.id,
    }
    showAddOverTimeModal.value = true
    await nextTick()
    SubChargeInput.value.focus()
}

const closeAddOverTimeModal = () => {
    showAddOverTimeModal.value = false
    sub_charge.value = ''
}

const addSubCharge = async (customer) => {
    try {
        const formData = new FormData()
        formData.append('sub_charge', sub_charge.value)
        const response = await fetch(`http://127.0.0.1:8000/api/admin/add-sub-charge/${customer.id}`, {
            method: 'POST',
            body: formData
        })

        if (response.status === 200) {
            // Cập nhật trạng thái trực tiếp trong mảng customers
            await fetchCustomers()
            console.log(`Sub charge added for customer ${customer.name}`)
            closeAddOverTimeModal()
            // Refresh customers data to ensure UI is updated
        }
    } catch (error) {
        console.error('Error adding sub charge:', error)
    }

}

onMounted(() => {
    fetchCustomers()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
