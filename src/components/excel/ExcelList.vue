<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useExcelStore } from "@/stores/excel"
import { generateSlug } from "@/services/serve"
import { useRouter } from 'vue-router';
import axios from 'axios';
import { apiUrl } from '@/environment';

interface Excel {
  id: number | string
  name: string
  slug: string
}

const excelFiles = ref<Excel[]>([])

const excelStore = useExcelStore()
const router = useRouter()

const editExcel = (excel: Excel) => {
  excelStore.name = excel.name
  excelStore.id = excel.id
  const slug = generateSlug(excel.name)
  router.push({ name: 'excel-current', params: { slug } })
}

const deleteExcel = (id: number | string) => {
  if (confirm('Bạn có chắc chắn muốn xóa file Excel này?')) {
    const index = excelFiles.value.findIndex(f => f.id === id)
    if (index !== -1) {
      excelFiles.value.splice(index, 1)
      console.log('Đã xóa file Excel ID:', id)
    }
  }
}

const downloadExcel = async (excel: Excel) => {
  try {
    // 1. Gọi API với responseType là blob
    const res = await axios.get(`${apiUrl}/api/admin/excel/download/${excel.id}`, {
      responseType: 'blob'
    });

    // 2. Tạo một URL tạm thời cho Blob đó
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);

    // 3. Tạo một thẻ <a> ẩn để giả lập việc click download
    const link = document.createElement('a');
    link.href = url;

    // Đặt tên file khi tải về
    link.setAttribute('download', `${excel.name}.xlsx`);

    // 4. Gắn thẻ <a> vào document và click
    document.body.appendChild(link);
    link.click();

    // 5. Dọn dẹp: Xóa thẻ <a> và giải phóng bộ nhớ URL
    link.parentNode!.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Lỗi khi tải file:', error);
  }
}

const getList = async () => {
  try {
    const res = await axios.get(`${apiUrl}/api/admin/excel`)
    excelFiles.value = res.data.data
  } catch (error) {
    console.log(error);
  }
}

onMounted(async () => {
  await getList()
})
</script>
<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Tên file</th>
          <th style="width: 260px; text-align: center;">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="excelFiles.length === 0">
          <td colspan="2" style="text-align: center; color: #999;">
            Chưa có file Excel nào
          </td>
        </tr>
        <tr v-else v-for="excel in excelFiles" :key="excel.id">
          <td>
            <div class="file-name-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>{{ excel.name }}</span>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              <button @click="editExcel(excel)" class="btn btn-edit" title="Mở file">
                <FontAwesomeIcon :icon="['fas', 'folder-open']" />
              </button>
              <button @click="downloadExcel(excel)" class="btn btn-download" title="Tải về">
                <FontAwesomeIcon :icon="['fas', 'download']" />
              </button>
              <button @click="deleteExcel(excel.id)" class="btn btn-delete" title="Xóa file">
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
@import '@/assets/admin-global.css';

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.file-name-cell svg {
  color: #667eea;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-edit,
.btn-download,
.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-edit:active,
.btn-download:active,
.btn-delete:active {
  transform: translateY(0);
}
</style>
