<template>
    <div class="services-management">
        <div class="section-header">
            <button @click="openAddServiceModal" class="btn btn-primary">
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Thêm dịch vụ
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên dịch vụ</th>
                        <th>Mô tả</th>
                        <th>Giá (USD)</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="services.length === 0">
                        <td colspan="5" style="text-align: center; color: #999;">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                    <tr v-for="service in paginatedServices" :key="service.id">
                        <td>{{ service.id }}</td>
                        <td>{{ service.name }}</td>
                        <td>{{ service.description }}</td>
                        <td>{{ formatCurrency(service.price) }}</td>
                        <td>
                            <button @click="editService(service)" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'edit']" />
                            </button>
                            <button @click="deleteService(service.id)" class="btn btn-sm btn-danger">
                                <FontAwesomeIcon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Services Pagination -->
        <div v-if="totalPagesServices > 1" class="pagination-container">
            <div class="pagination-info">
                Trang {{ currentPageServices }} / {{ totalPagesServices }} ({{ services.length }} dịch vụ)
            </div>
            <div class="pagination-controls">
                <button @click="goToFirstPage('services')" :disabled="currentPageServices === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-left']" />
                </button>
                <button @click="goToPreviousPage('services')" :disabled="currentPageServices === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-left']" />
                </button>
                <span class="page-numbers">
                    <button v-for="page in Math.min(5, totalPagesServices)" :key="page"
                        @click="changePage('services', page)"
                        :class="['btn', 'btn-sm', page === currentPageServices ? 'btn-primary' : 'btn-outline']">
                        {{ page }}
                    </button>
                </span>
                <button @click="goToNextPage('services')" :disabled="currentPageServices === totalPagesServices"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-right']" />
                </button>
                <button @click="goToLastPage('services')" :disabled="currentPageServices === totalPagesServices"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-right']" />
                </button>
            </div>
        </div>
    </div>

    <!-- Add Service Modal -->
    <div v-if="showAddServiceModal" class="modal-overlay" @click="closeAddServiceModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm dịch vụ mới</h3>
                <button @click="closeAddServiceModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddService" class="modal-form">
                <div class="form-group">
                    <label for="serviceName">Tên dịch vụ *</label>
                    <input ref="ServiceNameInput" id="serviceName" v-model="newService.name" type="text" required
                        placeholder="Nhập tên dịch vụ" />
                </div>

                <div class="form-group">
                    <label for="servicePrice">Giá (USD) *</label>
                    <input id="servicePrice" v-model="newService.price" type="number" required min="0" step="0.01"
                        placeholder="Nhập giá dịch vụ" />
                </div>

                <div class="form-group">
                    <label for="serviceDescription">Mô tả *</label>
                    <textarea id="serviceDescription" v-model="newService.description" rows="3" required
                        placeholder="Nhập mô tả dịch vụ"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddServiceModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm dịch vụ
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Service Modal -->
    <div v-if="showEditServiceModal" class="modal-overlay" @click="closeEditServiceModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Sửa thông tin dịch vụ</h3>
                <button @click="closeEditServiceModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitEditService" class="modal-form">
                <div class="form-group">
                    <label for="editServiceName">Tên dịch vụ *</label>
                    <input id="editServiceName" v-model="editingService.name" type="text" required
                        placeholder="Nhập tên dịch vụ" />
                </div>

                <div class="form-group">
                    <label for="editServicePrice">Giá (USD) *</label>
                    <input id="editServicePrice" v-model="editingService.price" type="number" required min="0"
                        step="0.01" placeholder="Nhập giá dịch vụ" />
                </div>

                <div class="form-group">
                    <label for="editServiceDescription">Mô tả *</label>
                    <textarea id="editServiceDescription" v-model="editingService.description" rows="3" required
                        placeholder="Nhập mô tả dịch vụ"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeEditServiceModal" class="btn btn-outline">
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const services = ref([])
const itemsPerPage = 12
const currentPageServices = ref(1)
const ServiceNameInput = ref('')

const showAddServiceModal = ref(false)
const showEditServiceModal = ref(false)

const newService = ref({
    name: '',
    price: '',
    description: ''
})

const editingService = ref({
    id: null,
    name: '',
    price: '',
    description: ''
})

const paginatedServices = computed(() => {
    const start = (currentPageServices.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return services.value.slice(start, end)
})

const totalPagesServices = computed(() => {
    return Math.ceil(services.value.length / itemsPerPage)
})

const openAddServiceModal = async () => {
    showAddServiceModal.value = true
    await nextTick()
    ServiceNameInput.value.focus()
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0)
}

const fetchServices = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/services')
        services.value = response.data
    } catch (error) {
        console.error('Error fetching services:', error)
    }
}

const editService = (service) => {
    editingService.value = {
        id: service.id,
        name: service.name,
        price: service.price,
        description: service.description
    }
    showEditServiceModal.value = true
    nextTick(() => {
        const firstInput = document.getElementById('editServiceName')
        if (firstInput) {
            firstInput.focus()
        }
    })
}

const deleteService = async (serviceId) => {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/services/${serviceId}`)
            await fetchServices()
        } catch (error) {
            console.error('Error deleting service:', error)
            console.error('Có lỗi xảy ra khi xóa dịch vụ')
        }
    }
}

const closeAddServiceModal = () => {
    showAddServiceModal.value = false
    newService.value = {
        name: '',
        price: '',
        description: ''
    }
}

const closeEditServiceModal = () => {
    showEditServiceModal.value = false
    editingService.value = {
        id: null,
        name: '',
        price: '',
        description: ''
    }
}

const submitAddService = async () => {
    try {
        if (!newService.value.name || !newService.value.price || !newService.value.description) {
            console.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        const serviceData = {
            name: newService.value.name.trim(),
            price: parseFloat(newService.value.price),
            description: newService.value.description.trim()
        }

        console.log('Sending add service data:', serviceData)

        const response = await axios.post('http://127.0.0.1:8000/api/services', serviceData)
        console.log('Success response:', response.data)

        await fetchServices()
        closeAddServiceModal()
    } catch (error) {
        console.error('Error adding service:', error)

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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể thêm dịch vụ'}`)
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

const submitEditService = async () => {
    try {
        if (!editingService.value.name || !editingService.value.price || !editingService.value.description) {
            console.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        const serviceData = {
            name: editingService.value.name.trim(),
            price: parseFloat(editingService.value.price),
            description: editingService.value.description.trim()
        }

        console.log('Sending edit service data:', serviceData)

        const response = await axios.put(`http://127.0.0.1:8000/api/services/${editingService.value.id}`, serviceData)
        console.log('Success response:', response.data)

        await fetchServices()
        closeEditServiceModal()
    } catch (error) {
        console.error('Error editing service:', error)

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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật dịch vụ'}`)
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

const changePage = (section, page) => {
    if (section === 'services' && page >= 1 && page <= totalPagesServices.value) {
        currentPageServices.value = page
    }
}

const goToFirstPage = (section) => {
    if (section === 'services') {
        changePage(section, 1)
    }
}

const goToLastPage = (section) => {
    if (section === 'services') {
        changePage(section, totalPagesServices.value)
    }
}

const goToPreviousPage = (section) => {
    if (section === 'services') {
        changePage(section, currentPageServices.value - 1)
    }
}

const goToNextPage = (section) => {
    if (section === 'services') {
        changePage(section, currentPageServices.value + 1)
    }
}

onMounted(() => {
    fetchServices()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
