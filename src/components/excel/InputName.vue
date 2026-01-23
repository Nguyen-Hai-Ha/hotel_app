<script setup lang="ts">
import { ref } from 'vue';
import { useExcelStore } from '@/stores/excel';

const isEditingName = ref(false)
const editedName = ref('')
const editNameError = ref<string | null>(null)
const excelStore = useExcelStore()

// Filename editing functions
const startEditingName = () => {
  if (!excelStore.name) return
  editedName.value = excelStore.name
  isEditingName.value = true
  editNameError.value = null
}

const cancelEditingName = () => {
  isEditingName.value = false
  editedName.value = ''
  editNameError.value = null
}

const saveEditedName = () => {
  editNameError.value = null

  // Kiểm tra tên file rỗng
  if (editedName.value.trim() === '') {
    return editNameError.value = "Vui lòng nhập tên file!"
  }

  // Kiểm tra ký tự đặc biệt (cho phép chữ cái Unicode bao gồm tiếng Việt, số, khoảng trắng, gạch ngang và gạch dưới)
  const specialCharPattern = /[^\p{L}\p{N}\s\-_]/gu
  if (specialCharPattern.test(editedName.value)) {
    return editNameError.value = "Tên file không được chứa ký tự đặc biệt! Chỉ cho phép chữ, số, khoảng trắng, gạch ngang (-) và gạch dưới (_)"
  }

  // Lưu tên mới
  excelStore.name = editedName.value
  isEditingName.value = false
  editedName.value = ''
  console.log('Tên file đã được cập nhật:', excelStore.name)
}
</script>
<template>
  <div v-if="isEditingName" class="file-info-edit">
    <input v-model="editedName" type="text" class="file-name-input" placeholder="Nhập tên file"
      @keyup.enter="saveEditedName" @keyup.esc="cancelEditingName" autofocus>
    <div class="edit-actions">
      <button @click="saveEditedName" class="btn-save" title="Lưu (Enter)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
      <button @click="cancelEditingName" class="btn-cancel" title="Hủy (Esc)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>

  <!-- Display Mode -->
  <div v-else>
    <div class="file-info" v-if="excelStore.name" @click="startEditingName">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span class="file-name">{{ excelStore.name }}</span>
      <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    </div>
    <div class="file-info placeholder" v-else>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
      <span class="file-name">Chưa có file nào được tải lên</span>
    </div>
  </div>
  <p v-if="editNameError" class="edit-error">{{ editNameError }}</p>
</template>
<style scoped>
/* File Info Display */
.file-info {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  color: white;
  transition: all 0.3s ease;
}

.file-info.placeholder {
  opacity: 0.7;
  font-style: italic;
}

.file-info svg {
  flex-shrink: 0;
  opacity: 0.9;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

/* Editable file info */
.file-info:not(.placeholder) {
  cursor: pointer;
  position: relative;
}

.file-info:not(.placeholder):hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}

.file-info:hover .edit-icon {
  opacity: 0.8;
}

/* File Info Edit Mode */
.file-info-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name-input {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  min-width: 300px;
  outline: none;
  transition: all 0.3s ease;
}

.file-name-input:focus {
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.file-name-input::placeholder {
  color: #999;
}

.edit-actions {
  display: flex;
  gap: 6px;
}

.btn-save,
.btn-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.btn-save:hover {
  background: rgba(34, 197, 94, 1);
  transform: scale(1.05);
}

.btn-cancel {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.btn-cancel:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.05);
}

.edit-error {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  font-size: 13px;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
