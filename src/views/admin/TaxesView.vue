<template>
    <div class="taxes-management">
        <div class="section-header">
            <button @click="openAddTaxModal()" class="btn btn-primary">
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Thêm thuế
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên thuế</th>
                        <th>Tỷ lệ (%)</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="taxes.length === 0">
                        <td colspan="4" style="text-align: center; color: #999;">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                    <tr v-for="tax in taxes" :key="tax.id">
                        <td>{{ tax.id }}</td>
                        <td>{{ tax.name }}</td>
                        <td>{{ tax.rate }}%</td>
                        <td>
                            <button @click="editTax(tax)" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'edit']" />
                            </button>
                            <button @click="deleteTax(tax.id)" class="btn btn-sm btn-danger">
                                <FontAwesomeIcon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <!-- Add Tax Modal -->
    <div v-if="showAddTaxModal" class="modal-overlay" @click="closeAddTaxModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm thuế mới</h3>
                <button @click="closeAddTaxModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddTax" class="modal-form">
                <div class="form-group">
                    <label for="taxName">Tên thuế *</label>
                    <input ref="TaxNameInput" id="taxName" v-model="newTax.name" type="text" required
                        placeholder="Nhập tên thuế (VD: VAT, Thuế phòng)" />
                </div>

                <div class="form-group">
                    <label for="taxRate">Tỷ lệ thuế (%) *</label>
                    <input id="taxRate" v-model="newTax.rate" type="number" required min="0" max="100" step="0.01"
                        placeholder="Nhập tỷ lệ thuế (VD: 10)" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddTaxModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm thuế
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Tax Modal -->
    <div v-if="showEditTaxModal" class="modal-overlay" @click="closeEditTaxModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Sửa thông tin thuế</h3>
                <button @click="closeEditTaxModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitEditTax" class="modal-form">
                <div class="form-group">
                    <label for="editTaxName">Tên thuế *</label>
                    <input name="name" id="editTaxName" v-model="editingTax.name" type="text" required
                        placeholder="Nhập tên thuế" />
                </div>

                <div class="form-group">
                    <label for="editTaxRate">Tỷ lệ thuế (%) *</label>
                    <input name="rate" id="editTaxRate" v-model="editingTax.rate" type="number" required min="0"
                        max="100" step="0.01" placeholder="Nhập tỷ lệ thuế" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeEditTaxModal" class="btn btn-outline">
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
import { ref, onMounted, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const taxes = ref([])

const showAddTaxModal = ref(false)
const showEditTaxModal = ref(false)

const TaxNameInput = ref(null)

const openAddTaxModal = async () => {
    showAddTaxModal.value = true
    await nextTick()
    TaxNameInput.value?.focus()
}

const newTax = ref({
    name: '',
    rate: ''
})

const editingTax = ref({
    id: null,
    name: '',
    rate: ''
})

const fetchTaxes = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/taxes')
        taxes.value = response.data
    } catch (error) {
        console.error('Error fetching taxes:', error)
    }
}

const editTax = (tax) => {
    editingTax.value = {
        id: tax.id,
        name: tax.name,
        rate: tax.rate
    }
    showEditTaxModal.value = true
    nextTick(() => {
        const firstInput = document.getElementById('editTaxName')
        if (firstInput) {
            firstInput.focus()
        }
    })
}

const deleteTax = async (taxId) => {
    if (confirm('Bạn có chắc muốn xóa thuế này?')) {
        try {
            await axios.delete(`https://api.thesecret-hotel.com/api/taxes/${taxId}`)
            await fetchTaxes()

        } catch (error) {
            console.error('Error deleting tax:', error)
            console.error('Có lỗi xảy ra khi xóa thuế')
        }
    }
}

const closeAddTaxModal = () => {
    showAddTaxModal.value = false
    newTax.value = {
        name: '',
        rate: ''
    }
}

const closeEditTaxModal = () => {
    showEditTaxModal.value = false
    editingTax.value = {
        id: null,
        name: '',
        rate: ''
    }
}

const submitAddTax = async () => {
    try {
        if (!newTax.value.name || !newTax.value.rate) {
            console.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        const taxData = {
            name: newTax.value.name.trim(),
            rate: parseFloat(newTax.value.rate)
        }

        await axios.post('https://api.thesecret-hotel.com/api/taxes', taxData)
        await fetchTaxes()
        closeAddTaxModal()
    } catch (error) {
        console.error('Error adding tax:', error)
        console.error('Có lỗi xảy ra khi thêm thuế')
    }
}

const submitEditTax = async () => {
    try {
        if (!editingTax.value.name || !editingTax.value.rate) {
            console.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        const taxData = {
            name: editingTax.value.name.trim(),
            rate: parseFloat(editingTax.value.rate)
        }

        await axios.put(`https://api.thesecret-hotel.com/api/taxes/${editingTax.value.id}`, taxData)
        await fetchTaxes()
        closeEditTaxModal()
    } catch (error) {
        console.error('Error editing tax:', error)
        console.error('Có lỗi xảy ra khi cập nhật thuế')
    }
}

onMounted(() => {
    fetchTaxes()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
