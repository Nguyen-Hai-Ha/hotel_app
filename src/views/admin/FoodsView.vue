<template>
    <div class="foods-management">
        <div class="section-header">
            <button @click="openAddFoodModal" class="btn btn-primary">
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Thêm thức ăn
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên thức ăn</th>
                        <th>Giá (USD)</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="foods.length === 0">
                        <td colspan="4" style="text-align: center; color: #999;">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                    <tr v-for="food in paginatedFoods" :key="food.id">
                        <td>{{ food.id }}</td>
                        <td>{{ food.name }}</td>
                        <td>{{ formatCurrency(food.price) }}</td>
                        <td>
                            <button @click="editFood(food)" class="btn btn-sm btn-outline">
                                <FontAwesomeIcon :icon="['fas', 'edit']" />
                            </button>
                            <button @click="deleteFood(food.id)" class="btn btn-sm btn-danger">
                                <FontAwesomeIcon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Foods Pagination -->
        <div v-if="totalPagesFoods > 1" class="pagination-container">
            <div class="pagination-info">
                Trang {{ currentPageFoods }} / {{ totalPagesFoods }} ({{ foods.length }} thức ăn)
            </div>
            <div class="pagination-controls">
                <button @click="goToFirstPage('foods')" :disabled="currentPageFoods === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-left']" />
                </button>
                <button @click="goToPreviousPage('foods')" :disabled="currentPageFoods === 1"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-left']" />
                </button>
                <span class="page-numbers">
                    <button v-for="page in Math.min(5, totalPagesFoods)" :key="page" @click="changePage('foods', page)"
                        :class="['btn', 'btn-sm', page === currentPageFoods ? 'btn-primary' : 'btn-outline']">
                        {{ page }}
                    </button>
                </span>
                <button @click="goToNextPage('foods')" :disabled="currentPageFoods === totalPagesFoods"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-right']" />
                </button>
                <button @click="goToLastPage('foods')" :disabled="currentPageFoods === totalPagesFoods"
                    class="btn btn-sm btn-outline">
                    <FontAwesomeIcon :icon="['fas', 'angle-double-right']" />
                </button>
            </div>
        </div>
    </div>

    <!-- Add Food Modal -->
    <div v-if="showAddFoodModal" class="modal-overlay" @click="closeAddFoodModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm thức ăn mới</h3>
                <button @click="closeAddFoodModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitAddFood" class="modal-form">
                <div class="form-group">
                    <label for="foodName">Tên thức ăn *</label>
                    <input ref="foodNameInput" id="foodName" v-model="newFood.name" type="text" required
                        placeholder="Nhập tên thức ăn" />
                </div>

                <div class="form-group">
                    <label for="foodPrice">Giá (USD) *</label>
                    <input id="foodPrice" v-model="newFood.price" type="number" required min="0" step="0.01"
                        placeholder="Nhập giá thức ăn" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeAddFoodModal" class="btn btn-outline">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <FontAwesomeIcon :icon="['fas', 'save']" />
                        Thêm thức ăn
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Food Modal -->
    <div v-if="showEditFoodModal" class="modal-overlay" @click="closeEditFoodModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Sửa thông tin thức ăn</h3>
                <button @click="closeEditFoodModal" class="modal-close">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
            </div>

            <form @submit.prevent="submitEditFood" class="modal-form">
                <div class="form-group">
                    <label for="editFoodName">Tên thức ăn *</label>
                    <input id="editFoodName" v-model="editingFood.name" type="text" required
                        placeholder="Nhập tên thức ăn" />
                </div>

                <div class="form-group">
                    <label for="editFoodPrice">Giá (USD) *</label>
                    <input id="editFoodPrice" v-model="editingFood.price" type="number" required min="0" step="0.01"
                        placeholder="Nhập giá thức ăn" />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeEditFoodModal" class="btn btn-outline">
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
import { ref, nextTick, onMounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

const foods = ref([])

const newFood = ref({
    name: '',
    price: ''
})

const editingFood = ref({
    id: null,
    name: '',
    price: ''
})

const itemsPerPage = 12

const showAddFoodModal = ref(false)
const showEditFoodModal = ref(false)
const foodNameInput = ref(null)

const currentPageFoods = ref(1)

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const fetchFoods = async () => {
    try {
        const response = await axios.get('https://api.thesecret-hotel.com/api/foods')
        foods.value = response.data
    } catch (error) {
        console.error('Error fetching foods:', error)
    }
}

const openAddFoodModal = async () => {
    showAddFoodModal.value = true
    await nextTick()
    foodNameInput.value?.focus()
}

const editFood = (food) => {
    editingFood.value = {
        id: food.id,
        name: food.name,
        price: food.price
    }
    showEditFoodModal.value = true

    nextTick(() => {
        const firstInput = document.getElementById('editFoodName')
        if (firstInput) {
            firstInput.focus()
        }
    })
}

const addFood = async () => {
    try {
        const response = await axios.post('https://api.thesecret-hotel.com/api/foods', {
            name: newFood.value.name,
            price: newFood.value.price
        })

        if (response.data.success) {
            console.log(response.data.message || 'Thêm thức ăn thành công!')
            await fetchFoods()
            closeAddFoodModal()
        } else {
            console.log('Có lỗi xảy ra khi thêm thức ăn')
        }
    } catch (error) {
        console.error('Error adding food:', error)
        console.log(`Lỗi khi thêm thức ăn: ${error.response?.data?.error || error.message}`)
    }
}

const updateFood = async () => {
    try {
        const response = await axios.put(`https://api.thesecret-hotel.com/api/foods/${editingFood.value.id}`, {
            name: editingFood.value.name,
            price: parseFloat(editingFood.value.price)
        })

        if (response.data.success) {
            console.log(response.data.message || 'Cập nhật thức ăn thành công!')
            await fetchFoods()
            closeEditFoodModal()
        } else {
            console.log('Có lỗi xảy ra khi cập nhật thức ăn')
        }
    } catch (error) {
        console.error('Error updating food:', error)
        console.log(`Lỗi khi cập nhật thức ăn: ${error.response?.data?.error || error.message}`)
    }
}

const submitAddFood = async () => {
    await addFood()
}

const submitEditFood = async () => {
    await updateFood()
}

const deleteFood = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa thức ăn này?')) {
        try {
            const response = await axios.delete(`https://api.thesecret-hotel.com/api/foods/${id}`)

            if (response.data.success) {
                console.log(response.data.message || 'Xóa thức ăn thành công!')
                await fetchFoods()
            } else {
                console.log('Có lỗi xảy ra khi xóa thức ăn')
            }
        } catch (error) {
            console.error('Error deleting food:', error)
            console.log(`Lỗi khi xóa thức ăn: ${error.response?.data?.error || error.message}`)
        }
    }
}

const closeEditFoodModal = () => {
    showEditFoodModal.value = false
    editingFood.value = {
        id: null,
        name: '',
        price: ''
    }
}

const closeAddFoodModal = () => {
    showAddFoodModal.value = false
    newFood.value = {
        name: '',
        price: ''
    }
}

const paginatedFoods = computed(() => {
    const start = (currentPageFoods.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return foods.value.slice(start, end)
})

const totalPagesFoods = computed(() => {
    return Math.ceil(foods.value.length / itemsPerPage)
})

const changePage = (section, page) => {
    if (section === 'foods' && page >= 1 && page <= totalPagesFoods.value) {
        currentPageFoods.value = page
    }
}

const goToFirstPage = (section) => {
    if (section === 'foods') {
        changePage(section, 1)
    }
}

const goToLastPage = (section) => {
    if (section === 'foods') {
        changePage(section, totalPagesFoods.value)
    }
}

const goToPreviousPage = (section) => {
    if (section === 'foods') {
        changePage(section, currentPageFoods.value - 1)
    }
}

const goToNextPage = (section) => {
    if (section === 'foods') {
        changePage(section, currentPageFoods.value + 1)
    }
}

onMounted(() => {
    fetchFoods()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';
</style>
