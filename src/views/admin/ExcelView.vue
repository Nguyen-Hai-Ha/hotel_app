<template>
  <div class="excel-view-container">
    <input type="file" name="excel" id="excel" @change="importExcel">
    <div class="excel-toolbar">
      <button @click="getData" title="print current workbook data to console">Get Data</button>
    </div>
    <ExcelUniver class="excel-sheet" ref="univerRef" @update-data="(is) => isUpdateData = is" :data="data"
      :is-update-data="isUpdateData" />
  </div>
</template>

<script setup lang="ts">
import ExcelUniver from '@/components/excel/ExcelUniver.vue';
import { DEFAULT_WORKBOOK_DATA } from '../../assets/default-workbook-data'
import { ref } from 'vue';
import { parseExcelFile } from "../../services/importExcel"
import { convertToDataUniver } from "../../services/serve"

const data = ref(DEFAULT_WORKBOOK_DATA);
const univerRef = ref<InstanceType<typeof ExcelUniver> | null>(null);
const isUpdateData = ref(false)

console.log('data: ', data.value.sheets['sheet-01']);

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
</script>

<style scoped>
.excel-view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.excel-toolbar {
  padding: 0;
}

.excel-sheet {
  /** The height of the Union uses the height of the parent container */
  flex: 1;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}
</style>
