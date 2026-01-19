<template>
    <div class="promotions-management">
        <div class="section-header">
            <button @click="openAddPromotionModal" class="btn btn-primary">
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Thêm mã giảm giá
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mã giảm giá</th>
                        <th>Loại</th>
                        <th>Giảm giá</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Số tiền tối thiểu</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="promotions.length === 0">
                        <td colspan="9" style="text-align: center; color: #999;">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                    <tr v-for="promotion in paginatedPromotions" :key="promotion.id">
                        <td>{{ promotion.id }}</td>
                        <td>
                            <span class="promotion-code">{{ promotion.code }}</span>
                        </td>
                        <td>{{ promotion.type }}</td>
                        <td v-if="promotion.type === 'percentage'">{{ promotion.discount }}%</td>
                        <td v-else>{{ formatCurrency(promotion.discount) }}</td>
                        <td>{{ formatDate(promotion.valid_from) }}</td>
                        <td>{{ formatDate(promotion.valid_to) }}</td>
                        <td>{{ formatCurrency(promotion.min_amount) }}</td>
                        <td>
                            <span :class="getPromotionStatus(promotion).class">
                                {{ getPromotionStatus(promotion).text }}
                            </span>
                        </td>
                        <td>
                            <button @click="editPromotion(promotion)" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'edit']" />
                            </button>
                            <button @click="deletePromotion(promotion.id)" class="btn btn-sm btn-danger">
                                <FontAwesomeIcon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Promotions Pagination -->
        <div v-if="totalPagesPromotions > 1" class="pagination-container">
            <div class="pagination-info">
                Trang {{ currentPagePromotions }} / {{ totalPagesPromotions }} ({{ promotions.length }} mã giảm giá)
            </div>
            <div class="pagination-controls">
                <button @click="goToFirstPage('promotions')" :disabled="currentPagePromotions === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-left']" />
                </button>
                <button @click="goToPreviousPage('promotions')" :disabled="currentPagePromotions === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-left']" />
                </button>
                <span class="page-numbers">
                    <button v-for="page in Math.min(5, totalPagesPromotions)" :key="page"
                        @click="changePage('promotions', page)"
                        :class="['btn', 'btn-sm', page === currentPagePromotions ? 'btn-primary' : 'btn-outline']">
                        {{ page }}
                    </button>
                </span>
                <button @click="goToNextPage('promotions')" :disabled="currentPagePromotions === totalPagesPromotions"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-right']" />
                </button>
                <button @click="goToLastPage('promotions')" :disabled="currentPagePromotions === totalPagesPromotions"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-right']" />
                </button>
            </div>
        </div>
    </div>

    <!-- Add Promotion Modal -->
    <div v-if="showAddPromotionModal" class="modal-overlay" @click="closeAddPromotionModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm mã giảm giá mới</h3>
                <button @click="closeAddPromotionModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddPromotion" class="modal-form">
                <div class="form-group">
                    <label for="promotionCode">Mã giảm giá *</label>
                    <input ref="PromotionCodeInput" id="promotionCode" v-model="newPromotion.code" type="text" required
                        placeholder="Nhập mã giảm giá (VD: SUMMER2024)" />
                </div>

                <div class="form-group">
                    <label for="promotionType">Loại *</label>
                    <select id="promotionType" v-model="newPromotion.type" required class="form-select">
                        <option value="percentage">percentage</option>
                        <option value="fixed">fixed</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="promotionDiscount">Giảm giá (%) *</label>
                    <input id="promotionDiscount" v-model="newPromotion.discount" type="number" required min="0"
                        max="100" step="0.01" placeholder="Nhập % giảm giá" />
                </div>

                <div class="form-group">
                    <label for="promotionValidFrom">Ngày bắt đầu *</label>
                    <input id="promotionValidFrom" v-model="newPromotion.valid_from" type="date" required />
                </div>

                <div class="form-group">
                    <label for="promotionValidTo">Ngày kết thúc *</label>
                    <input id="promotionValidTo" v-model="newPromotion.valid_to" type="date" required />
                </div>

                <div class="form-group">
                    <label for="promotionMinAmount">Số tiền tối thiểu (USD) *</label>
                    <input id="promotionMinAmount" v-model="newPromotion.min_amount" type="number" required min="0"
                        step="0.01" placeholder="Nhập số tiền tối thiểu" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddPromotionModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm mã giảm giá
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Promotion Modal -->
    <div v-if="showEditPromotionModal" class="modal-overlay" @click="closeEditPromotionModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Sửa mã giảm giá</h3>
                <button @click="closeEditPromotionModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitEditPromotion" class="modal-form">
                <div class="form-group">
                    <label for="editPromotionCode">Mã giảm giá *</label>
                    <input id="editPromotionCode" v-model="editingPromotion.code" type="text" required
                        placeholder="Nhập mã giảm giá" />
                </div>

                <div class="form-group">
                    <label for="editPromotionType">Loại *</label>
                    <select id="editPromotionType" v-model="editingPromotion.type" required class="form-select">
                        <option value="percentage">percentage</option>
                        <option value="fixed">fixed</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="editPromotionDiscount">Giảm giá (%) *</label>
                    <input id="editPromotionDiscount" v-model="editingPromotion.discount" type="number" required min="0"
                        max="100" step="0.01" placeholder="Nhập % giảm giá" />
                </div>

                <div class="form-group">
                    <label for="editPromotionValidFrom">Ngày bắt đầu *</label>
                    <input id="editPromotionValidFrom" v-model="editingPromotion.valid_from" type="date" required />
                </div>

                <div class="form-group">
                    <label for="editPromotionValidTo">Ngày kết thúc *</label>
                    <input id="editPromotionValidTo" v-model="editingPromotion.valid_to" type="date" required />
                </div>

                <div class="form-group">
                    <label for="editPromotionMinAmount">Số tiền tối thiểu (USD) *</label>
                    <input id="editPromotionMinAmount" v-model="editingPromotion.min_amount" type="number" required
                        min="0" step="0.01" placeholder="Nhập số tiền tối thiểu" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeEditPromotionModal" class="btn btn-outline">
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const promotions = ref([])
const newPromotion = ref({
    code: '',
    type: 'percentage',
    discount: '',
    valid_from: '',
    valid_to: '',
    min_amount: ''
})

const editingPromotion = ref({
    id: null,
    code: '',
    type: 'percentage',
    discount: '',
    valid_from: '',
    valid_to: '',
    min_amount: ''
})

const itemsPerPage = 12

const showAddPromotionModal = ref(false)
const showEditPromotionModal = ref(false)

const currentPagePromotions = ref(1)

const PromotionCodeInput = ref(null)

const openAddPromotionModal = async () => {
    showAddPromotionModal.value = true
    await nextTick()
    PromotionCodeInput.value?.focus()
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('vi-VN')
}

const fetchPromotions = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/promotions')
        promotions.value = response.data
    } catch (error) {
        console.error('Error fetching promotions:', error)
    }
}

const editPromotion = (promotion) => {
    editingPromotion.value = {
        id: promotion.id,
        code: promotion.code,
        type: promotion.type,
        discount: promotion.discount,
        valid_from: promotion.valid_from,
        valid_to: promotion.valid_to,
        min_amount: promotion.min_amount
    }
    showEditPromotionModal.value = true

    nextTick(() => {
        const firstInput = document.getElementById('editPromotionCode')
        if (firstInput) {
            firstInput.focus()
        }
    })
}

const deletePromotion = async (promotionId) => {
    if (confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/promotions/${promotionId}`)
            await fetchPromotions()
        } catch (error) {
            console.error('Error deleting promotion:', error)
            console.error('Có lỗi xảy ra khi xóa mã giảm giá')
        }
    }
}

const closeAddPromotionModal = () => {
    showAddPromotionModal.value = false
    newPromotion.value = {
        code: '',
        type: 'percentage',
        discount: '',
        valid_from: '',
        valid_to: '',
        min_amount: ''
    }
}

const closeEditPromotionModal = () => {
    showEditPromotionModal.value = false
    editingPromotion.value = {
        id: null,
        code: '',
        type: 'percentage',
        discount: '',
        valid_from: '',
        valid_to: '',
        min_amount: ''
    }
}

const submitAddPromotion = async () => {
    try {
        if (!newPromotion.value.code || !newPromotion.value.discount || !newPromotion.value.valid_from || !newPromotion.value.valid_to || !newPromotion.value.min_amount) {
            console.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        const promotionData = {
            code: newPromotion.value.code.trim(),
            type: newPromotion.value.type,
            discount: parseFloat(newPromotion.value.discount),
            valid_from: newPromotion.value.valid_from,
            valid_to: newPromotion.value.valid_to,
            min_amount: parseFloat(newPromotion.value.min_amount)
        }

        console.log('Sending add promotion data:', promotionData)

        const response = await axios.post('http://127.0.0.1:8000/api/promotions', promotionData)
        console.log('Success response:', response.data)

        await fetchPromotions()
        closeAddPromotionModal()
    } catch (error) {
        console.error('Error adding promotion:', error)

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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể thêm mã giảm giá'}`)
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

const submitEditPromotion = async () => {
    try {
        if (!editingPromotion.value.code || !editingPromotion.value.discount || !editingPromotion.value.valid_from || !editingPromotion.value.valid_to || !editingPromotion.value.min_amount) {
            console.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        const promotionData = {
            code: editingPromotion.value.code.trim(),
            type: editingPromotion.value.type,
            discount: parseFloat(editingPromotion.value.discount),
            valid_from: editingPromotion.value.valid_from,
            valid_to: editingPromotion.value.valid_to,
            min_amount: parseFloat(editingPromotion.value.min_amount)
        }

        console.log('Sending edit promotion data:', promotionData)

        const response = await axios.put(`http://127.0.0.1:8000/api/promotions/${editingPromotion.value.id}`, promotionData)
        console.log('Success response:', response.data)

        await fetchPromotions()
        closeEditPromotionModal()
    } catch (error) {
        console.error('Error editing promotion:', error)

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
                console.error(`Lỗi: ${error.response.data.message || 'Không thể cập nhật mã giảm giá'}`)
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

const getPromotionStatus = (promotion) => {
    const now = new Date()
    const validFrom = new Date(promotion.valid_from)
    const validTo = new Date(promotion.valid_to)

    if (now < validFrom) {
        return { text: 'Chưa bắt đầu', class: 'status-pending' }
    } else if (now > validTo) {
        return { text: 'Đã hết hạn', class: 'status-expired' }
    } else {
        return { text: 'Đang hoạt động', class: 'status-active' }
    }
}

const paginatedPromotions = computed(() => {
    const start = (currentPagePromotions.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return promotions.value.slice(start, end)
})

const totalPagesPromotions = computed(() => {
    return Math.ceil(promotions.value.length / itemsPerPage)
})

const changePage = (section, page) => {
    if (section === 'promotions' && page >= 1 && page <= totalPagesPromotions.value) {
        currentPagePromotions.value = page
    }
}

const goToFirstPage = (section) => {
    if (section === 'promotions') {
        changePage(section, 1)
    }
}

const goToLastPage = (section) => {
    if (section === 'promotions') {
        changePage(section, totalPagesPromotions.value)
    }
}

const goToPreviousPage = (section) => {
    if (section === 'promotions') {
        changePage(section, currentPagePromotions.value - 1)
    }
}

const goToNextPage = (section) => {
    if (section === 'promotions') {
        changePage(section, currentPagePromotions.value + 1)
    }
}


onMounted(() => {
    fetchPromotions()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
