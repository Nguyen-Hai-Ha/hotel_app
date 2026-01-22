<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useExcelStore } from "@/stores/excel"
import { generateSlug } from "@/services/serve"
import { useRouter } from 'vue-router';

const excelFiles = ref([
    { id: 1, name: 'Báo cáo tháng 1' },
    { id: 2, name: 'Dữ liệu khách hàng 2024' },
    { id: 3, name: 'Thống kê doanh thu Q1' },
])

const excelStore = useExcelStore()
const router = useRouter()

const editExcel = (excel: { id: number, name: string }) => {
    excelStore.name = excel.name
    const slug = generateSlug(excel.name)
    router.push({ name: 'excel-current', params: { slug } })
}

const deleteExcel = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa file Excel này?')) {
        const index = excelFiles.value.findIndex(f => f.id === id)
        if (index !== -1) {
            excelFiles.value.splice(index, 1)
            console.log('Đã xóa file Excel ID:', id)
        }
    }
}

const downloadExcel = (excel: { id: number, name: string }) => {
    // TODO: Implement actual download logic
    console.log('Tải về file:', excel.name)
    // Temporary: Show alert for demo
    alert(`Đang tải về file: ${excel.name}`)
}
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
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
