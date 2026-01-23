<template>
    <div class="rooms-management">
        <div class="section-header">
            <button @click="openAddRoomModal" class="btn btn-primary">
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Thêm phòng
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Số phòng</th>
                        <th>Loại phòng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="room in paginatedRooms" :key="room.id">
                        <td>{{ room.id }}</td>
                        <td>{{ room.room_number }}</td>
                        <td>
                            <span v-if="room.room_type">{{ room.room_type }}</span>
                            <span v-else class="no-data">Không có</span>
                        </td>
                        <td>
                            <span :class="getRoomStatusClass(room.status)">
                                {{ getRoomStatusText(room.status) }}
                            </span>
                        </td>

                        <td>
                            <button @click="editRoom(room)" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'edit']" />
                            </button>
                            <button @click="deleteRoom(room.id)" class="btn btn-sm btn-danger">
                                <FontAwesomeIcon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Rooms Pagination -->
        <div v-if="totalPagesRooms > 1" class="pagination-container">
            <div class="pagination-info">
                Trang {{ currentPageRooms }} / {{ totalPagesRooms }} ({{ rooms.length }} phòng)
            </div>
            <div class="pagination-controls">
                <button @click="goToFirstPage('rooms')" :disabled="currentPageRooms === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-left']" />
                </button>
                <button @click="goToPreviousPage('rooms')" :disabled="currentPageRooms === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-left']" />
                </button>
                <span class="page-numbers">
                    <button v-for="page in pageNumbersRooms" :key="page" @click="changePage('rooms', page)"
                        :class="['btn', 'btn-sm', page === currentPageRooms ? 'btn-primary' : 'btn-outline']">
                        {{ page }}
                    </button>
                </span>
                <button @click="goToNextPage('rooms')" :disabled="currentPageRooms === totalPagesRooms"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-right']" />
                </button>
                <button @click="goToLastPage('rooms')" :disabled="currentPageRooms === totalPagesRooms"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-right']" />
                </button>
            </div>
        </div>
    </div>

    <!-- Add Room Modal -->
    <div v-if="showAddRoomModal" class="modal-overlay" @click="closeAddRoomModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm phòng mới</h3>
                <button @click="closeAddRoomModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddRoom" class="modal-form">
                <div class="form-group">
                    <label for="roomNumber">Số phòng *</label>
                    <input ref="RoomNumberInput" id="roomNumber" v-model="newRoom.room_number" type="text" required
                        placeholder="Nhập số phòng (VD: 101, A101)" />
                </div>

                <div class="form-group">
                    <label for="roomType">Loại phòng *</label>
                    <select id="roomType" v-model.number="newRoom.room_type_id" required class="form-select">
                        <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">
                            {{ roomType.name }} - {{ formatCurrency(roomType.base_price) }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="roomStatus">Trạng thái *</label>
                    <select id="roomStatus" v-model="newRoom.status" required class="form-select">
                        <option value="available">Còn trống</option>
                        <option value="occupied">Đã thuê</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddRoomModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm phòng
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Room Modal -->
    <div v-if="showEditRoomModal" class="modal-overlay" @click="closeEditRoomModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Sửa thông tin phòng</h3>
                <button @click="closeEditRoomModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitEditRoom" class="modal-form">
                <div class="form-group">
                    <label for="editRoomNumber">Số phòng *</label>
                    <input id="editRoomNumber" v-model="editingRoom.room_number" type="text" required
                        placeholder="Nhập số phòng" />
                </div>

                <div class="form-group">
                    <label for="editRoomType">Loại phòng *</label>
                    <select id="editRoomType" v-model="editingRoom.room_type_id" required class="form-select">
                        <option v-for="roomType in roomTypes" :key="roomType.id" :value="roomType.id">
                            {{ roomType.name }} - {{ formatCurrency(roomType.base_price) }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="editRoomStatus">Trạng thái *</label>
                    <select id="editRoomStatus" v-model="editingRoom.status" required class="form-select">
                        <option value="available">Còn trống</option>
                        <option value="occupied">Đã thuê</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeEditRoomModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
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
import { apiUrl } from '@/environment'

const RoomNumberInput = ref(null)

const rooms = ref([])
const roomTypes = ref([])
const newRoom = ref({
    room_number: '',
    room_type_id: '',
    status: 'available',
})
const editingRoom = ref({
    id: null,
    room_number: '',
    room_type_id: '',
    status: '',
})
const showAddRoomModal = ref(false)
const showEditRoomModal = ref(false)

const itemsPerPage = ref(10)
const currentPageRooms = ref(1)


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0)
}

const getRoomStatusText = (status) => {
    const texts = {
        'available': 'Còn trống',
        'occupied': 'Đã thuê',
        'checked_in': 'Đã check-in',
        'checked_out': 'Đã check-out',
        'maintenance': 'Bảo trì'
    }
    return texts[status] || status
}

const getRoomStatusClass = (status) => {
    const classes = {
        'available': 'status-available',
        'occupied': 'status-occupied',
        'checked_in': 'status-checked-in',
        'checked_out': 'status-checked-out',
        'maintenance': 'status-maintenance'
    }
    return classes[status] || 'status-default'
}

const fetchRooms = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/admin/rooms`)
        rooms.value = response.data
        console.log('Admin rooms data:', rooms.value)
    } catch (error) {
        console.error('Error fetching rooms:', error)
    }
}

const fetchRoomDetail = async (roomId) => {
    try {
        const response = await axios.get(`${apiUrl}/api/admin/rooms/${roomId}`)
        return response.data
    } catch (error) {
        console.error('Error fetching room detail:', error)
        return null
    }
}

const closeAddRoomModal = () => {
    showAddRoomModal.value = false
    newRoom.value = {
        room_number: '',
        room_type_id: roomTypes.value.length > 0 ? roomTypes.value[0].id : '',
        status: 'available',
    }
}

const submitAddRoom = async () => {
    try {
        // Validate required fields
        console.log("value: ", newRoom.value);

        if (!newRoom.value.room_number || !newRoom.value.room_type_id || !newRoom.value.status) {
            console.log('Validation failed: Missing required fields')
            return
        }

        // Prepare FormData for file upload
        const formData = new FormData()
        formData.append('room_number', newRoom.value.room_number.trim())
        formData.append('id_room_type', newRoom.value.room_type_id.toString())
        formData.append('status', newRoom.value.status)

        console.log('Sending room data with FormData')

        const response = await axios.post(`${apiUrl}/api/admin/rooms`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log('Success response:', response.data)

        await fetchRooms()
        closeAddRoomModal()

        // Show success message
    } catch (error) {
        console.error('Error adding room:', error)

        // Show detailed error information
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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể thêm phòng'}`)
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

const openAddRoomModal = async () => {
    showAddRoomModal.value = true
    await nextTick()
    RoomNumberInput.value?.focus()
}

const closeEditRoomModal = () => {
    showEditRoomModal.value = false
    editingRoom.value = {
        id: null,
        room_number: '',
        room_type_id: '',
        status: 'available',
    }
}

const submitEditRoom = async () => {
    try {
        // Validate required fields
        if (!editingRoom.value.room_number || !editingRoom.value.room_type_id || !editingRoom.value.status) {
            console.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        // Prepare FormData for file upload
        const formData = new FormData()
        formData.append('room_number', editingRoom.value.room_number.trim())
        formData.append('id_room_type', editingRoom.value.room_type_id.toString())
        formData.append('status', editingRoom.value.status)

        console.log('Sending edit room data with FormData')

        const response = await axios.post(`${apiUrl}/api/admin/rooms/${editingRoom.value.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log('Success response:', response.data)

        await fetchRooms()
        closeEditRoomModal()

        // Show success message
    } catch (error) {
        console.error('Error editing room:', error)

        // Show detailed error information
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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật phòng'}`)
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
const editRoom = async (room) => {
    const roomDetail = await fetchRoomDetail(room.id)
    console.log("room detail:" + roomDetail)
    if (roomDetail) {
        editingRoom.value.id = roomDetail.id
        editingRoom.value.room_number = roomDetail.room_number
        editingRoom.value.room_type_id = roomDetail.id_room_type
        editingRoom.value.status = roomDetail.status
        console.log("room detail:" + editingRoom.value)
        showEditRoomModal.value = true
        nextTick(() => {
            const firstInput = document.getElementById('editRoomNumber')
            if (firstInput) {
                firstInput.focus()
            }
        })
    }
}

const deleteRoom = async (roomId) => {
    if (confirm('Bạn có chắc muốn xóa phòng này?')) {
        try {
            await axios.delete(`${apiUrl}/api/rooms/${roomId}`)
            await fetchRooms()
        } catch (error) {
            console.error('Error deleting room:', error)
        }
    }
}

const paginatedRooms = computed(() => {
    const start = (currentPageRooms.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return rooms.value.slice(start, end)
})

const totalPagesRooms = computed(() => {
    return Math.ceil(rooms.value.length / itemsPerPage.value)
})

const pageNumbersRooms = computed(() => {
    const total = totalPagesRooms.value
    if (!total) return []
    const windowSize = 5
    if (total <= windowSize) {
        return Array.from({ length: total }, (_, index) => index + 1)
    }

    const halfWindow = Math.floor(windowSize / 2)
    let start = currentPageRooms.value - halfWindow
    let end = currentPageRooms.value + halfWindow

    if (start < 1) {
        start = 1
        end = windowSize
    }

    if (end > total) {
        end = total
        start = total - windowSize + 1
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const changePage = (section, page) => {
    if (section === 'rooms' && page >= 1 && page <= totalPagesRooms.value) {
        currentPageRooms.value = page
    }
}

const goToFirstPage = (section) => {
    if (section === 'rooms') {
        changePage(section, 1)
    }
}

const goToLastPage = (section) => {
    if (section === 'rooms') {
        changePage(section, totalPagesRooms.value)
    }
}

const goToPreviousPage = (section) => {
    if (section === 'rooms') {
        changePage(section, currentPageRooms.value - 1)
    }
}

const goToNextPage = (section) => {
    if (section === 'rooms') {
        changePage(section, currentPageRooms.value + 1)
    }
}

const fetchRoomTypes = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/admin/room-types`)
        roomTypes.value = response.data
    } catch (error) {
        console.error('Error fetching room types:', error)
    }
}

onMounted(() => {
    fetchRooms()
    fetchRoomTypes()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
