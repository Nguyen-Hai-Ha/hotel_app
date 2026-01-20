<template>
  <div class="modal-contents" @click.stop>
    <div class="modal-header">
      <h3>Sửa đặt phòng</h3>
      <button @click="closeEditBookingModal" class="modal-close">
        <FontAwesomeIcon :icon="['fas', 'times']" />
      </button>
    </div>

    <form @submit.prevent="submitEditBooking" class="modal-form">
      <div class="form-section">
        <h4>Thông tin khách hàng</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="customerName">Tên khách hàng *</label>
            <input ref="editBookingNameInput" id="customerName" v-model="editBookings.customerName" type="text" required
              placeholder="Nhập tên khách hàng" tabindex="1" @click="$event.target.focus()"
              @mousedown="$event.target.focus()" />
          </div>
          <div class="form-group">
            <label for="customerPhone">Số điện thoại *</label>
            <input id="customerPhone" v-model="editBookings.customerPhone" type="tel" required
              placeholder="Nhập số điện thoại" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="customerEmail">Email</label>
            <input id="customerEmail" v-model="editBookings.customerEmail" type="email" placeholder="Nhập email" />
          </div>
          <div class="form-group">
            <label for="customerPassport">CMND/CCCD *</label>
            <input id="customerPassport" v-model="editBookings.customerPassport" type="text" required
              placeholder="Nhập CMND/CCCD" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4>Thông tin phòng</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="roomType">Loại phòng *</label>
            <select id="roomType" v-model="editBookings.roomTypeId" @change="onRoomTypeChange" required
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
            <select id="availableRooms" v-model="editBookings.roomId" required class="form-select"
              :disabled="!editBookings.roomTypeId">
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
            <input id="checkIn" v-model="editBookings.checkIn" type="datetime-local" required />
          </div>
          <template v-else>
            <div class="form-group">
              <label for="checkIn">Ngày nhận phòng *</label>
              <input id="checkIn" v-model="editBookings.checkIn" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label for="checkOut">Ngày trả phòng *</label>
              <input id="checkOut" v-model="editBookings.checkOut" type="datetime-local" required />
            </div>
          </template>
        </div>

        <div class="form-group" v-if="!isHourlyRental">
          <label>Số đêm: <strong>{{ countLastChange + bookingNightChange }}</strong></label>
        </div>
      </div>

      <div class="form-section" v-if="!isHourlyRental">
        <h4>Dịch vụ bổ sung</h4>
        <div class="services-selection">
          <div v-for="service in services" :key="service.id" class="service-item">
            <div class="service-info">
              <label class="service-checkbox">
                <input type="checkbox" :value="service.id" v-model="editBookings.selectedServices" />
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

      <div class="form-section cost-breakdown" v-if="isHourlyRental">
        <h4>Chi tiết chi phí</h4>
        <div class="cost-item">
          <span>Tiền phòng:</span>
          <span>{{ formatCurrency(roomCost) }}</span>
        </div>
        <div class="cost-item total">
          <span><strong>Tổng cộng:</strong></span>
          <span v-if="finalGrandTotal > 0" style="display: flex; flex-direction: column; align-items: flex-end;">
            <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">{{
              formatCurrency(grandTotal)
              }}</span>
            <strong style="color: #27ae60; font-size: 1.1em;">{{ formatCurrency(finalGrandTotal)
              }}</strong>
          </span>
          <span v-else><strong>{{ formatCurrency(grandTotal) }}</strong></span>
        </div>
      </div>

      <!-- CHI TIẾT PHÍ -->
      <div v-else>
        <EditBookingFee v-if="newCost > 0" :booking-detail="bookingDetail" :new-cost="newCost"
          :services-cost="servicesCost" :booking-night-change="bookingNightChange" :count-last-change="countLastChange"
          :grand-total="grandTotal" :final-grand-total="finalGrandTotal" :is-hourly-rental="isHourlyRental" />
        <EditBookingFeeNotNewCost v-else-if="newCost <= 0" :booking-detail="bookingDetail" :new-cost="newCost"
          :services-cost="servicesCost" :booking-night-change="bookingNightChange" :count-last-change="countLastChange"
          :grand-total="grandTotal" :final-grand-total="finalGrandTotal" :is-hourly-rental="isHourlyRental"
          :room-type-changed="roomTypeChanged" :selected-room-type="selectedRoomType" :booking-nights="bookingNights" />
      </div>


      <div class="modal-actions">
        <button type="button" @click="closeEditBookingModal" class="btn btn-outline">
          Hủy
        </button>
        <button type="submit" class="btn btn-primary">
          <FontAwesomeIcon :icon="['fas', 'save']" />
          Cập nhật đặt phòng
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import EditBookingFee from './EditBookingFee.vue'
import EditBookingFeeNotNewCost from './EditBookingFeeNotNewCost.vue'

// Props
const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'refresh'])

// Refs
const editBookingNameInput = ref(null)
const editBookings = ref({
  id: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerPassport: '',
  selectedServices: [],
  roomTypeId: '',
  roomId: '',
  checkIn: '',
  checkOut: '',
})
const bookingDetail = ref({})
const availableRooms = ref([])
const newCost = ref(0)
const finalGrandTotal = ref(0)
const isEdit = ref(false)
const roomTypes = ref([])
const services = ref([])
const originalRoomTypeId = ref(null) // Lưu room type gốc khi load lần đầu
const roomTypeChanged = ref(false) // Flag đánh dấu khi user đổi loại phòng

// Computed Properties
const selectedRoomType = computed(() => {
  console.log("đổi phòng: ", editBookings.value.roomTypeId);
  return roomTypes.value.find(rt => rt.id == editBookings.value.roomTypeId) || null
})

const isHourlyRental = computed(() => {
  const result = selectedRoomType.value?.type === 'hourly'
  console.log("isHourlyRental updated:", result, "roomType:", selectedRoomType.value?.name)
  return result
})

const roomCost = computed(() => {
  if (!isEdit.value || !bookingDetail.value.invoice) return 0

  // giờ
  if (isHourlyRental.value && (bookingDetail.value.invoice?.room_price ?? 0) > 0) {
    return bookingDetail.value.invoice?.room_price ?? 0
  } else if (isHourlyRental.value) {
    return bookingDetail.value.roomType?.base_price ?? 0
  }

  // ngày
  const invoiceRoomPrice = bookingDetail.value.invoice?.room_price ?? 0;
  if (invoiceRoomPrice > 0) {
    return invoiceRoomPrice
  }

  return (bookingDetail.value.roomType?.base_price ?? 0) * bookingNights.value
})

const servicesCost = computed(() => {
  if (isEdit.value && newCost.value > 0) {
    return editBookings.value.selectedServices.reduce((total, serviceId) => {
      const service = services.value.find(s => s.id == serviceId)
      return total + (service ? service.price : 0)
    }, 0)
  } else if (isEdit.value && newCost.value === 0) {
    // nếu thêm dịch vụ nhưng không thêm ngày, sẽ lấy số ngày từ ngày hiện tại đến ngày checkout nhân với giá dịch vụ
    const dateNow = new Date()
    const checkInDate = bookingDetail.value.booking?.check_in
    if (!checkInDate) return 0

    const dayDB = new Date(checkInDate)

    if (dayDB.getDate() < dateNow.getDate()) {
      const checkOutDate = bookingDetail.value.booking?.check_out
      if (!checkOutDate) return 0

      const checkOut = new Date(checkOutDate)
      const diffTime = checkOut.getDate() - dateNow.getDate()

      return editBookings.value.selectedServices.reduce((total, serviceId) => {
        const service = services.value.find(s => s.id == serviceId)
        return total + (service ? service.price : 0) * diffTime
      }, 0)
    }

    return editBookings.value.selectedServices.reduce((total, serviceId) => {
      const service = services.value.find(s => s.id == serviceId)
      return total + ((service ? service.price : 0) * (countLastChange.value + bookingNightChange.value))
    }, 0)
  }
  return 0
})

const subtotal = computed(() => {
  if (isEdit.value && newCost.value > 0) return roomCost.value + newCost.value
  return roomCost.value
})

const grandTotal = computed(() => {
  if (isEdit.value && bookingDetail.value.invoice && bookingDetail.value.booking) {
    if (editBookings.value.checkOut != bookingDetail.value.booking.check_out) {
      return (bookingDetail.value.invoice.grand_total ?? 0) + newCost.value + (servicesCost.value * bookingNightChange.value)
    } else {
      return (bookingDetail.value.invoice.grand_total ?? 0) + servicesCost.value
    }
  }
  return 0
})

const bookingNightChange = computed(() => {
  if (!isEdit.value || !bookingDetail.value.booking) return 0
  const checkIn = new Date(editBookings.value.checkOut.trim() == '' ? (bookingDetail.value.booking?.check_in ?? '') : (bookingDetail.value.booking?.check_out ?? ''))
  const checkOut = new Date(editBookings.value.checkOut.trim() == '' ? (bookingDetail.value.booking?.check_out ?? '') : editBookings.value.checkOut)

  // Normalize to date only (remove time component) for proper night calculation
  const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
  const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

  const diffTime = checkOutDate - checkInDate
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
})

const countLastChange = computed(() => {
  if (!isEdit.value || !bookingDetail.value.booking) return 0
  const checkIn = new Date(bookingDetail.value.booking?.check_in ?? '')
  const checkOut = new Date(bookingDetail.value.booking?.check_out ?? '')

  // Normalize to date only (remove time component) for proper night calculation
  const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
  const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

  const diffTime = checkOutDate - checkInDate
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
})

const bookingNights = computed(() => {
  if (!editBookings.value.checkIn || !editBookings.value.checkOut) return 0
  const checkIn = new Date(editBookings.value.checkIn)
  const checkOut = new Date(editBookings.value.checkOut)

  const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
  const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

  const diffTime = checkOutDate - checkInDate
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const calculateTimeDiff = (day1) => {
  // 1. Chuyển đổi sang Date để tính toán (nếu cần dùng hiệu số sau này)
  const dateNew = new Date(day1.replace(' ', 'T'));

  // 2. Định dạng ngày day1 (hoặc bất kỳ ngày nào) thành yyyy-mm-dd HH:mm
  const y = dateNew.getFullYear();
  const m = String(dateNew.getMonth() + 1).padStart(2, '0');
  const d = String(dateNew.getDate()).padStart(2, '0');
  const hh = String(dateNew.getHours()).padStart(2, '0');
  const mm = String(dateNew.getMinutes()).padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}`;
}

const fetchBookingDetail = async (bookingId) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/admin/bookings/${bookingId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching booking detail:', error)
  }
}

const fetchRoomTypes = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/admin/room-types')
    roomTypes.value = response.data
  } catch (error) {
    console.error('Error fetching room types:', error)
  }
}

const fetchServices = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/services')
    services.value = response.data
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

const onRoomTypeChange = async () => {
  if (editBookings.value.roomTypeId) {
    try {
      // Fetch room type details and available rooms using the show endpoint
      const response = await axios.get(`http://127.0.0.1:8000/api/rooms/${editBookings.value.roomTypeId}`)
      console.log('Room type response:', response.data)

      // Extract available rooms from the response
      if (response.data && response.data.available_rooms) {
        // Filter only available rooms
        availableRooms.value = response.data.available_rooms.filter(room =>
          room.status === 'available' || room.status === 'Available' || room.id == editBookings.value.roomId
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
        const allRoomsResponse = await axios.get('http://127.0.0.1:8000/api/admin/rooms')
        const allRooms = Array.isArray(allRoomsResponse.data) ? allRoomsResponse.data : allRoomsResponse.data.data || []

        // Filter rooms by room type and status
        availableRooms.value = allRooms.filter(room =>
          room.id_room_type == editBookings.value.roomTypeId &&
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
}

const closeEditBookingModal = () => {
  editBookings.value = {
    id: null,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerPassport: '',
    selectedServices: [],
    roomTypeId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
  }
  bookingDetail.value = {}
  availableRooms.value = []
  newCost.value = 0
  finalGrandTotal.value = 0
  isEdit.value = false
  emit('close')
}

const submitEditBooking = async () => {
  try {
    const amountTax = ((bookingNightChange.value * (bookingDetail.value.roomType?.base_price ?? 0)) * (bookingDetail.value.tax?.rate ?? 0) / 100)
    const booking_type = selectedRoomType.value.type
    const bookingData = {
      customer_name: editBookings.value.customerName.trim(),
      customer_phone: editBookings.value.customerPhone.trim(),
      customer_email: editBookings.value.customerEmail.trim() || null,
      customer_passport: editBookings.value.customerPassport.trim(),
      id_room: editBookings.value.roomId,
      check_out: calculateTimeDiff(editBookings.value.checkOut),
      tax_amount: amountTax,
      subtotal: subtotal.value,
      grand_total: grandTotal.value,
      service_charge: (servicesCost.value * bookingNightChange.value) || 0,
      booking_type: booking_type,
    }

    await axios.post(`http://127.0.0.1:8000/api/admin/update-booking/${editBookings.value.id}`, bookingData)

    emit('refresh')
    closeEditBookingModal()
  } catch (error) {
    console.log(error)
  }
}

const loadBookingData = async (bookingId) => {
  isEdit.value = true
  bookingDetail.value = await fetchBookingDetail(bookingId)
  if (bookingDetail.value) {
    editBookings.value.id = bookingDetail.value.booking.id
    editBookings.value.customerName = bookingDetail.value.customer.name
    editBookings.value.customerPhone = bookingDetail.value.customer.phone
    editBookings.value.customerEmail = bookingDetail.value.customer.email
    editBookings.value.customerPassport = bookingDetail.value.customer.passport
    editBookings.value.roomTypeId = bookingDetail.value.roomType.id
    editBookings.value.roomId = bookingDetail.value.room.id
    editBookings.value.checkIn = bookingDetail.value.booking.check_in
    editBookings.value.checkOut = bookingDetail.value.booking.check_out

    // Lưu room type gốc và reset flag
    originalRoomTypeId.value = bookingDetail.value.roomType.id
    roomTypeChanged.value = false

    // Gọi onRoomTypeChange 1 lần duy nhất khi load dữ liệu để lấy phòng hiện tại
    await onRoomTypeChange()
  }
}

// Watchers
watch(() => props.bookingId, async (newId) => {
  if (newId && props.showModal) {
    await loadBookingData(newId)
  }
}, { immediate: true })

watch(editBookings, (newValue) => {
  if (isEdit.value && bookingDetail.value.booking) {
    if (editBookings.value.checkOut != bookingDetail.value.booking.check_out) {
      newCost.value = (bookingNightChange.value * (bookingDetail.value.roomType?.base_price ?? 0)) + ((bookingNightChange.value * (bookingDetail.value.roomType?.base_price ?? 0)) * (bookingDetail.value.tax?.rate ?? 0) / 100)
    }
  }
}, { immediate: true, deep: true })

// Watcher riêng để theo dõi khi user đổi loại phòng
watch(() => editBookings.value.roomTypeId, (newRoomTypeId, oldRoomTypeId) => {
  // console.log('=== WATCHER TRIGGERED ===')
  // console.log('newRoomTypeId:', newRoomTypeId)
  // console.log('oldRoomTypeId:', oldRoomTypeId)
  // console.log('originalRoomTypeId.value:', originalRoomTypeId.value)
  // console.log('isEdit.value:', isEdit.value)

  if (isEdit.value && originalRoomTypeId.value && newRoomTypeId !== originalRoomTypeId.value) {
    console.log('✅ Room type changed from', oldRoomTypeId, 'to', newRoomTypeId)
    roomTypeChanged.value = true
  } else if (newRoomTypeId === originalRoomTypeId.value) {
    console.log("❌ Không thay đổi - về lại room type gốc");
    roomTypeChanged.value = false
  } else {
    console.log('⚠️ Điều kiện không match')
  }
})


// Lifecycle
onMounted(async () => {
  await fetchRoomTypes()
  await fetchServices()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
