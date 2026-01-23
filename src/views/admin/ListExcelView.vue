<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useExcelStore } from "../../stores/excel"
import { useRouter } from 'vue-router'
import { generateSlug } from "../../services/serve"
import ExcelList from '@/components/excel/ExcelList.vue'

const showAddExcelModal = ref(false)
const excelNameInput = ref<HTMLInputElement | null>(null)
// Mock data cho danh sách Excel
const isUploading = ref(false)
const excelName = ref('')
const excelStore = useExcelStore()
const errorMessage = ref<string | null>(null)
const router = useRouter()

console.log('excelStore: ', excelStore.name);

const openAddExcelModal = async () => {
  showAddExcelModal.value = true
  await nextTick()
  if (excelNameInput.value) excelNameInput.value.focus()
}

const submitAddExcel = async () => {
  errorMessage.value = null

  // Kiểm tra tên file rỗng
  if (excelName.value.trim() == '') {
    return errorMessage.value = "Vui lòng nhập tên file!"
  }

  // Kiểm tra ký tự đặc biệt (cho phép chữ cái Unicode bao gồm tiếng Việt, số, khoảng trắng, gạch ngang và gạch dưới)
  const specialCharPattern = /[^\p{L}\p{N}\s\-_]/gu
  if (specialCharPattern.test(excelName.value)) {
    return errorMessage.value = "Tên file không được chứa ký tự đặc biệt! Chỉ cho phép chữ, số, khoảng trắng, gạch ngang (-) và gạch dưới (_)"
  }

  excelStore.name = excelName.value
  excelStore.blank = true
  const slug = generateSlug(excelName.value)
  console.log('slug: ', slug);
  router.push({ name: 'excel-current', params: { slug } })
}

const closeAddExcelModal = () => {
  showAddExcelModal.value = false
  excelName.value = ''
  errorMessage.value = null
}
</script>

<template>
  <div class="excel-management">
    <div class="section-header">
      <button @click="openAddExcelModal" class="btn btn-primary">
        <FontAwesomeIcon :icon="['fas', 'plus']" />
        Thêm file Excel
      </button>
    </div>

    <ExcelList />

    <!-- Excel Files Pagination -->
  </div>

  <!-- Add Excel Modal -->
  <div v-if="showAddExcelModal" class="modal-overlay" @click="closeAddExcelModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Thêm file Excel mới</h3>
        <button @click="closeAddExcelModal" class="modal-close">
          <FontAwesomeIcon :icon="['fas', 'times']" />
        </button>
      </div>

      <form @submit.prevent="submitAddExcel" class="modal-form">
        <div class="form-group">
          <label for="excelName">Tên file *</label>
          <input ref="excelNameInput" id="excelName" v-model="excelName" type="text" placeholder="Nhập tên file"
            required />
        </div>

        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button type="button" @click="closeAddExcelModal" class="btn btn-outline">
            Hủy
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isUploading">
            <FontAwesomeIcon :icon="isUploading ? ['fas', 'spinner'] : ['fas', 'upload']" :spin="isUploading" />
            {{ isUploading ? 'Đang tạo...' : 'Tạo mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>



<style scoped>
@import '@/assets/admin-global.css';

.text-danger {
  color: #dc3545;
}
</style>
