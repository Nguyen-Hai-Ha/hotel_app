<script setup lang="ts">
import ExcelUniver from '@/components/excel/ExcelUniver.vue';
import { DEFAULT_WORKBOOK_DATA } from '../../assets/default-workbook-data'
import { ref } from 'vue';
import { parseExcelFile } from "../../services/importExcel"
import { convertToDataUniver } from "../../services/serve"
import { useExcelStore } from '@/stores/excel';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import InputName from '@/components/excel/InputName.vue';

const data = ref(DEFAULT_WORKBOOK_DATA);
const univerRef = ref<InstanceType<typeof ExcelUniver> | null>(null);
const isUpdateData = ref(false)
const excelStore = useExcelStore()
const router = useRouter()

console.log('data: ', data.value.sheets['sheet-01']);
console.log('excelStore: ', excelStore.name);

// có thể bổ sung thêm chức năng vẫn cho vào nhưng
// tồn tại 2 trường hợp là tạo mới và lấy từ backend
if (!excelStore.name) router.push({ name: 'excel' })

const importExcel = async (e: Event) => {
  const element = e.target as HTMLInputElement
  const fileList: FileList | null = element.files

  console.log('fileList: ', fileList);

  if (!fileList || fileList.length === 0) return console.log('Bị chặn');

  try {
    const result = await parseExcelFile(fileList[0])
    console.log('result: ', result);
    console.log('convertToDataUniver: ', convertToDataUniver(result));

    const univerData = convertToDataUniver(result)
    data.value.sheets['sheet-01'].cellData = univerData

    // Apply merged cells
    if (result.mergeRanges && result.mergeRanges.length > 0) {
      // Type assertion because mergeData exists in Univer but not in default type
      (data.value.sheets['sheet-01'] as any).mergeData = result.mergeRanges.map(range => ({
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
      }));
      console.log('Applied merge ranges:', (data.value.sheets['sheet-01'] as any).mergeData);
    }

    console.log(`data.value.sheets['sheet-01'].cellData: `, data.value.sheets['sheet-01'].cellData)
    isUpdateData.value = true
  } catch (error) {
    console.log(error);
  }
}

const getData = () => {
  if (univerRef.value) {
    const result = univerRef.value.getData();
    console.log('Dữ liệu lấy được:', result);
    // console.log(JSON.stringify(result, null, 2));
  } else {
    console.warn('univerRef chưa sẵn sàng');
  }
}

onBeforeRouteLeave(() => {
  excelStore.name = null
})
</script>

<template>
  <div class="excel-view-container">
    <!-- START INPUT FILE -->
    <div class="excel-toolbar">
      <!-- LEFT -->
      <div class="toolbar-left">
        <InputName />
      </div>

      <!-- RIGHT -->
      <div class="toolbar-right">
        <label for="excel" class="upload-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Tải lên</span>
        </label>
        <input type="file" name="excel" id="excel" @change="importExcel" accept=".xlsx,.xls">

        <button @click="getData" class="action-btn" title="print current workbook data to console">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span>Lưu</span>
        </button>
      </div>
    </div>
    <!-- END INPUT FILE -->

    <ExcelUniver class="excel-sheet" ref="univerRef" @update-data="(is) => isUpdateData = is" :data="data"
      :is-update-data="isUpdateData" />
  </div>
</template>

<style scoped>
.excel-view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.excel-toolbar {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.toolbar-left {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Hide default file input */
#excel {
  display: none;
}

/* Custom Upload Button */
.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  color: #667eea;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.upload-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.upload-btn:hover::before {
  left: 100%;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.upload-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-btn svg {
  transition: transform 0.3s ease;
}

.upload-btn:hover svg {
  transform: translateY(-3px);
}

/* Action Button */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.5s, height 0.5s;
}

.action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.action-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn svg,
.action-btn span {
  position: relative;
  z-index: 1;
}

.action-btn svg {
  transition: transform 0.3s ease;
}

.action-btn:hover svg {
  transform: scale(1.1) rotate(5deg);
}

.excel-sheet {
  /** The height of the Union uses the height of the parent container */
  flex: 1;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
</style>
