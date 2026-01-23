<template>
    <div class="room-types-management">
        <div class="section-header">
            <button @click="openAddRoomTypeModal()" class="btn btn-primary">
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Thêm thể loại
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên thể loại</th>
                        <th>Mô tả</th>
                        <th>Hình ảnh</th>
                        <th>Giá cơ bản</th>
                        <th>Tính năng</th>
                        <th>Loại</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="roomTypes.length === 0">
                        <td colspan="6" style="text-align: center; color: #999;">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                    <tr v-for="roomType in paginatedRoomTypes" :key="roomType.id">
                        <td>{{ roomType.id || 'Không có' }}</td>
                        <td>{{ roomType.name || 'Không có' }}</td>
                        <td class="truncate-text" :title="roomType.description || 'Không có'">{{ roomType.description ||
                            'Không có' }}</td>
                        <td>
                            <div v-if="roomType.image" class="room-image">
                                <img :src="`${apiUrl}/hotelBE/public/` + roomType.image" alt="Room thumbnail"
                                    class="room-image">
                            </div>
                            <div v-else>Không có hình ảnh</div>
                        </td>
                        <td>{{ roomType.base_price ? formatCurrency(roomType.base_price) : 'Không có' }}</td>
                        <td>
                            <div v-if="roomType.feature && (Array.isArray(roomType.feature) ? roomType.feature.length > 0 : roomType.feature.trim() !== '')"
                                class="features-list">
                                <span
                                    v-for="feature in (Array.isArray(roomType.feature) ? roomType.feature : roomType.feature.split(',').map(f => f.trim()).filter(f => f !== ''))"
                                    :key="feature" class="feature-tag">
                                    {{ feature }}
                                </span>
                            </div>
                            <span v-else class="no-features">Không có</span>
                        </td>
                        <td>{{ roomType.type }}</td>
                        <td>
                            <button @click="editRoomType(roomType)" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'edit']" />
                            </button>
                            <button @click="deleteRoomType(roomType.id)" class="btn btn-sm btn-danger">
                                <FontAwesomeIcon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Room Types Pagination -->
        <div v-if="totalPagesRoomTypes > 1" class="pagination-container">
            <div class="pagination-info">
                Trang {{ currentPageRoomTypes }} / {{ totalPagesRoomTypes }} ({{ roomTypes.length }} thể loại)
            </div>
            <div class="pagination-controls">
                <button @click="goToFirstPage('roomTypes')" :disabled="currentPageRoomTypes === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-left']" />
                </button>
                <button @click="goToPreviousPage('roomTypes')" :disabled="currentPageRoomTypes === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-left']" />
                </button>
                <span class="page-numbers">
                    <button v-for="page in Math.min(5, totalPagesRoomTypes)" :key="page"
                        @click="changePage('roomTypes', page)"
                        :class="['btn', 'btn-sm', page === currentPageRoomTypes ? 'btn-primary' : 'btn-outline']">
                        {{ page }}
                    </button>
                </span>
                <button @click="goToNextPage('roomTypes')" :disabled="currentPageRoomTypes === totalPagesRoomTypes"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-right']" />
                </button>
                <button @click="goToLastPage('roomTypes')" :disabled="currentPageRoomTypes === totalPagesRoomTypes"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-right']" />
                </button>
            </div>
        </div>
    </div>

    <!-- Add Room Type Modal -->
    <div v-if="showAddRoomTypeModal" class="modal-overlay" @click="closeAddRoomTypeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm thể loại phòng mới</h3>
                <button @click="closeAddRoomTypeModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddRoomType" class="modal-form">
                <div class="form-group">
                    <label for="roomTypeName">Tên thể loại *</label>
                    <input ref="RoomtypesNameInput" id="roomTypeName" v-model="newRoomType.name" name="name" type="text"
                        required placeholder="Nhập tên thể loại phòng" />
                </div>

                <div class="form-group">
                    <label for="roomTypeDescription">Mô tả</label>
                    <textarea id="roomTypeDescription" v-model="newRoomType.description" name="description" rows="3"
                        placeholder="Nhập mô tả thể loại phòng"></textarea>
                </div>

                <div class="form-group">
                    <label for="roomTypePrice">Giá cơ bản (USD) *</label>
                    <input id="roomTypePrice" v-model="newRoomType.base_price" type="number" name="base_price" required
                        min="1" max="1000" step="0.01" placeholder="Nhập giá cơ bản (USD)" />
                </div>

                <div class="form-group">
                    <label for="roomTypeFeatures">Tính năng</label>
                    <div class="features-input">
                        <div class="feature-tags">
                            <span v-for="(feature, index) in newRoomType.feature" :key="index"
                                class="feature-tag removable">
                                {{ feature }}
                                <button type="button" @click="removeFeature(index)" class="remove-feature">
                                    <FontAwesomeIcon :icon="['fas', 'times']" />
                                </button>
                            </span>
                        </div>
                        <div class="add-feature">
                            <input v-model="newFeature" type="text" placeholder="Nhập tính năng và nhấn Enter"
                                @keyup.enter="addFeature" name="feature" />
                            <button type="button" @click="addFeature" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'plus']" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="RoomTypeTypes">Phòng thuê</label>
                    <select name="Types" id="types" class="form-select" autocomplete="off" v-model="newRoomType.type">
                        <option value="daily">Ngày</option>
                        <option value="hourly">Giờ</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="roomTypeImage">Hình ảnh phòng</label>
                    <input id="roomTypeImage" type="file" @change="handleImageUpload" accept="image/*"
                        class="form-file-input" />
                    <div v-if="newRoomType.imagePreview" class="image-preview">
                        <img :src="newRoomType.imagePreview" alt="Preview" />
                        <button type="button" @click="removeImage" class="remove-image-btn">
                            <FontAwesomeIcon :icon="['fas', 'times']" />
                        </button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddRoomTypeModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm thể loại
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Room Type Modal -->
    <div v-if="showEditRoomTypeModal" class="modal-overlay" @click="closeEditRoomTypeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Sửa thể loại phòng</h3>
                <button @click="closeEditRoomTypeModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitEditRoomType" class="modal-form">
                <div class="form-group">
                    <label for="editRoomTypeName">Tên thể loại *</label>
                    <input id="editRoomTypeName" v-model="editingRoomType.name" type="text" required
                        placeholder="Nhập tên thể loại phòng" />
                </div>

                <div class="form-group">
                    <label for="editRoomTypeDescription">Mô tả</label>
                    <textarea id="editRoomTypeDescription" v-model="editingRoomType.description" rows="3"
                        placeholder="Nhập mô tả thể loại phòng"></textarea>
                </div>

                <div class="form-group">
                    <label for="editRoomTypePrice">Giá cơ bản (VND) *</label>
                    <input id="editRoomTypePrice" v-model="editingRoomType.base_price" type="number" required min="1"
                        max="1000" step="0.01" placeholder="Nhập giá cơ bản" />
                </div>

                <div class="form-group">
                    <label for="editRoomTypeFeatures">Tính năng</label>
                    <div class="features-input">
                        <div class="feature-tags">
                            <span v-for="(feature, index) in editingRoomType.feature" :key="index"
                                class="feature-tag removable">
                                {{ feature }}
                                <button type="button" @click="removeEditFeature(index)" class="remove-feature">
                                    <FontAwesomeIcon :icon="['fas', 'times']" />
                                </button>
                            </span>
                        </div>
                        <div class="add-feature">
                            <input v-model="editNewFeature" type="text" placeholder="Nhập tính năng và nhấn Enter"
                                @keyup.enter="addEditFeature" />
                            <button type="button" @click="addEditFeature" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'plus']" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="RoomTypeTypes">Phòng thuê</label>
                    <select name="Types" id="types" class="form-select" autocomplete="off"
                        v-model="editingRoomType.type">
                        <option value="daily">Ngày</option>
                        <option value="hourly">Giờ</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="editRoomTypeImage">Hình ảnh phòng</label>
                    <input id="editRoomTypeImage" type="file" @change="handleEditImageUpload" accept="image/*"
                        class="form-file-input" />
                    <div v-if="editingRoomType.imagePreview" class="image-preview">
                        <img :src="editingRoomType.imagePreview" alt="Preview" />
                        <button type="button" @click="removeEditImage" class="remove-image-btn">
                            <FontAwesomeIcon :icon="['fas', 'times']" />
                        </button>
                    </div>
                    <div v-else-if="editingRoomType.image" class="current-image">
                        <p>Hình ảnh hiện tại:</p>
                        <img :src="`${apiUrl}/hotelBE/public/` + editingRoomType.image" alt="Current image" />
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeEditRoomTypeModal" class="btn btn-outline">
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

const roomTypes = ref([])

const showAddRoomTypeModal = ref(false)
const showEditRoomTypeModal = ref(false)

const RoomtypesNameInput = ref(null)

// New Room Type Data
const newRoomType = ref({
    name: '',
    description: '',
    base_price: '',
    feature: [],
    type: 'daily',
    image: '',
    imageFile: null,
    imagePreview: '',
})

const newFeature = ref('')

// Editing Room Type Data
const editingRoomType = ref({
    id: null,
    name: '',
    description: '',
    base_price: '',
    feature: [],
    type: 'daily',
    image: '',
    imageFile: null,
    imagePreview: '',
})

const editNewFeature = ref('')

const itemsPerPage = 12
const currentPageRoomTypes = ref(1)

const paginatedRoomTypes = computed(() => {
    const start = (currentPageRoomTypes.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return roomTypes.value.slice(start, end)
})

const totalPagesRoomTypes = computed(() => {
    return Math.ceil(roomTypes.value.length / itemsPerPage)
})

const changePage = (section, page) => {
    if (section === 'roomTypes' && page >= 1 && page <= totalPagesRoomTypes.value) {
        currentPageRoomTypes.value = page
    }
}

const goToFirstPage = (section) => {
    if (section === 'roomTypes') {
        changePage(section, 1)
    }
}

const goToLastPage = (section) => {
    if (section === 'roomTypes') {
        changePage(section, totalPagesRoomTypes.value)
    }
}

const goToPreviousPage = (section) => {
    if (section === 'roomTypes') {
        changePage(section, currentPageRoomTypes.value - 1)
    }
}

const goToNextPage = (section) => {
    if (section === 'roomTypes') {
        changePage(section, currentPageRoomTypes.value + 1)
    }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const fetchRoomTypes = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/admin/room-types`)
        roomTypes.value = response.data
    } catch (error) {
        console.error('Error fetching room types:', error)
    }
}

const openAddRoomTypeModal = async () => {
    showAddRoomTypeModal.value = true
    await nextTick()
    RoomtypesNameInput.value.focus()
}

// New Room Type Modal Methods
const addFeature = () => {
    if (newFeature.value.trim() && !newRoomType.value.feature.includes(newFeature.value.trim())) {
        newRoomType.value.feature.push(newFeature.value.trim())
        newFeature.value = ''
    }
}

const removeFeature = (index) => {
    newRoomType.value.feature.splice(index, 1)
}

const closeAddRoomTypeModal = () => {
    showAddRoomTypeModal.value = false
    newRoomType.value = {
        name: '',
        description: '',
        base_price: '',
        feature: [],
        type: 'daily',
        image: '',
        imageFile: null,
        imagePreview: '',
    }
    newFeature.value = ''
}

const submitAddRoomType = async () => {
    try {
        // Validate required fields
        if (!newRoomType.value.name || !newRoomType.value.base_price) {
            console.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        // Prepare data for API - send features as array
        const formData = new FormData()
        formData.append('name', newRoomType.value.name.trim())
        formData.append('description', newRoomType.value.description.trim() || '')
        formData.append('base_price', parseInt(newRoomType.value.base_price) || 0)

        // Append features as array - each element separately
        const features = newRoomType.value.feature.filter(f => f.trim() !== '')
        if (features.length > 0) {
            features.forEach((feature, index) => {
                formData.append(`feature[${index}]`, feature)
            })
        } else {
            formData.append('feature', JSON.stringify([]))
        }

        formData.append('type', newRoomType.value.type || 'daily')

        // Only append image if a file is selected
        if (newRoomType.value.imageFile) {
            formData.append('image', newRoomType.value.imageFile)
        }

        console.log('Sending room type data:', formData)

        const response = await axios.post(`${apiUrl}/api/room_types`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log('Success response:', response.data)

        await fetchRoomTypes()
        closeAddRoomTypeModal()

        // Show success message
    } catch (error) {
        console.error('Error adding room type:', error)

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

            } else {
                console.error(`Lỗi: ${error.response.data.message || 'Không thể thêm thể loại phòng'}`)
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

// Edit Room Type Modal Methods
const addEditFeature = () => {
    if (editNewFeature.value.trim() && !editingRoomType.value.feature.includes(editNewFeature.value.trim())) {
        editingRoomType.value.feature.push(editNewFeature.value.trim())
        editNewFeature.value = ''
    }
}

const removeEditFeature = (index) => {
    editingRoomType.value.feature.splice(index, 1)
}

const closeEditRoomTypeModal = () => {
    showEditRoomTypeModal.value = false
    editingRoomType.value = {
        id: null,
        name: '',
        description: '',
        base_price: '',
        feature: [],
        type: 'daily',
        image: '',
        imageFile: null,
        imagePreview: '',
    }
    editNewFeature.value = ''
}

// Edit Room Modal Methods
const handleEditImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        editingRoomType.value.imageFile = file
        editingRoomType.value.imagePreview = URL.createObjectURL(file)
    }
}

const removeEditImage = () => {
    editingRoomType.value.imageFile = null
    editingRoomType.value.imagePreview = ''
    // Reset file input
    const fileInput = document.getElementById('editRoomTypeImage')
    if (fileInput) fileInput.value = ''
}

const submitEditRoomType = async () => {
    try {
        // Validate required fields
        if (!editingRoomType.value.name || !editingRoomType.value.base_price) {
            console.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        // Prepare data for API - send features as array

        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('name', editingRoomType.value.name.trim())
        formData.append('description', editingRoomType.value.description.trim() || '')
        formData.append('base_price', parseInt(editingRoomType.value.base_price) || 0)

        // Append features as array - each element separately
        const features = editingRoomType.value.feature.filter(f => f.trim() !== '')
        if (features.length > 0) {
            features.forEach((feature, index) => {
                formData.append(`feature[${index}]`, feature)
            })
        } else {
            formData.append('feature', JSON.stringify([]))
        }

        formData.append('type', editingRoomType.value.type)

        // Only append image if a new file is selected
        if (editingRoomType.value.imageFile) {
            formData.append('image', editingRoomType.value.imageFile)
        }

        console.log('Sending edit room type data:', formData)

        const response = await axios.post(`${apiUrl}/api/room_types/${editingRoomType.value.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log('Success response:', response.data)

        await fetchRoomTypes()
        closeEditRoomTypeModal()

        // Show success message
    } catch (error) {
        console.error('Error editing room type:', error)

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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật thể loại phòng'}`)
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

// New Room Modal Methods
const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        newRoomType.value.imageFile = file
        newRoomType.value.imagePreview = URL.createObjectURL(file)
    }
}

const removeImage = () => {
    newRoomType.value.imageFile = null
    newRoomType.value.imagePreview = ''
    // Reset file input
    const fileInput = document.getElementById('roomTypeImage')
    if (fileInput) fileInput.value = ''
}

const normalizeRoomTypeType = (type) => {
    if (!type) return 'daily'
    if (type.toLowerCase() === 'daily') return 'daily'
    return type
}

const editRoomType = (roomType) => {
    editingRoomType.value = {
        id: roomType.id,
        name: roomType.name,
        description: roomType.description,
        base_price: roomType.base_price,
        feature: parseFeatures(roomType.feature),
        type: normalizeRoomTypeType(roomType.type),
        image: roomType.image,
        imageFile: null,
        imagePreview: null
    }
    showEditRoomTypeModal.value = true

    nextTick(() => {
        const firstInput = document.getElementById('editRoomTypeName')
        if (firstInput) {
            firstInput.focus()
        }
    })
}

const deleteRoomType = async (roomTypeId) => {
    if (confirm('Bạn có chắc muốn xóa thể loại phòng này?')) {
        try {
            await axios.delete(`${apiUrl}/api/room_types/${roomTypeId}`)
            await fetchRoomTypes()
        } catch (error) {
            console.error('Error deleting room type:', error)
        }
    }
}

const parseFeatures = (featureString) => {
    if (!featureString) return []
    if (Array.isArray(featureString)) return featureString
    return featureString.split(',').map(f => f.trim()).filter(f => f !== '')
}

onMounted(() => {
    fetchRoomTypes()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
