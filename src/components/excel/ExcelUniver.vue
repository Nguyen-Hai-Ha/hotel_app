<template>
  <div ref="container" class="univer-container" />
</template>

<script setup lang="ts">
import {
  Univer,
  UniverInstanceType,
  Workbook,
  LocaleType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/facade';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverUIPlugin } from '@univerjs/ui';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { zhCN, enUS } from 'univer:locales';

const { data, isUpdateData } = defineProps({
  // workbook data
  data: {
    type: Object,
    default: () => ({}),
  },
  isUpdateData: {
    type: Boolean,
    required: false,
    default: false
  }
});

const emits = defineEmits(['updateData'])

const univerRef = ref<Univer | null>(null);
const workbook = ref<Workbook | null>(null);
const container = ref<HTMLElement | null>(null);
const univerAPI = ref<FUniver | null>(null);

onMounted(() => {
  init(data);
});

onBeforeUnmount(() => {
  destroyUniver();
});

watch(() => isUpdateData, (newValue) => {
  if (newValue) {
    init(data)
    emits('updateData', false)
  }
})

/**
 * Initialize univer instance and workbook instance
 * @param data {IWorkbookData} document see https://univer.work/api/core/interfaces/IWorkbookData.html
 */
const init = (data = {}) => {
  const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.ZH_CN]: zhCN,
      [LocaleType.EN_US]: enUS,
    },
  });
  univerRef.value = univer;

  // core plugins
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin, {
    notExecuteFormula: false, // Phải để false để nó thực thi công thức
  });
  univer.registerPlugin(UniverUIPlugin, {
    container: container.value!,
  });

  // doc plugins
  univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
  });
  univer.registerPlugin(UniverDocsUIPlugin);

  // sheet plugins
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsUIPlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin);
  univer.registerPlugin(UniverSheetsNumfmtPlugin);

  // create workbook instance
  univer.createUnit(UniverInstanceType.UNIVER_SHEET, data);

  const api = FUniver.newAPI(univer);

  univerAPI.value = api;

  api.getActiveWorkbook()?.getActiveSheet();

  api.onCommandExecuted((command) => {
    // Nếu lệnh vừa chạy là Auto-Fill (kéo công thức) hoặc đổi giá trị
    if (
      command.id === 'sheet.command.auto-fill' ||
      command.id === 'sheet.command.set-range-values' ||
      command.id === 'sheet.command.set-numfmt-range-data'
    ) {
      const activeSheet = api.getActiveWorkbook()?.getActiveSheet();

      // Logic làm sạch dữ liệu: Nếu nhập số dưới dạng text -> chuyển về number để Fill Series hoạt động
      if (command.id === 'sheet.command.set-range-values') {
        const range = activeSheet?.getSelection()?.getActiveRange();
        if (range) {
          const value = range.getValue();
          // Kiểm tra nếu là chuỗi số hợp lệ và không rỗng
          if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
            // Ép về kiểu Number. Việc này sẽ trigger lại command này một lần nữa,
            // nhưng lần sau value sẽ là number nên không lặp vô hạn.
            range.setValue(Number(value));
          }
        }
      }

      // Ép hệ thống tính toán và cập nhật giao diện ngay lập tức
      try {
        api.executeCommand('sheet.command.set-calculate');
      } catch (error) {
        // console.warn('Command set-calculate not registered, skipping...');
      }
    }
  });
};

/**
 * Destroy univer instance and workbook instance
 */
const destroyUniver = () => {
  try {
    // Dispose of the univer instance
    if (univerRef.value) {
      univerRef.value.dispose();
    }
  } catch (error) {
    // Silently handle disposal errors to prevent navigation blocking
    // console.warn('Error during Univer disposal:', error);
  } finally {
    // Always clean up references
    univerRef.value = null;
    workbook.value = null;
    univerAPI.value = null;

    // Clear container content
    if (container.value) {
      container.value.innerHTML = '';
    }
  }
};

/**
 * Get workbook data
 */
/**
 * Get workbook data
 */
const getData = async () => {
  if (!univerAPI.value) {
    console.error('Univer API (Facade) chưa sẵn sàng');
    return null;
  }

  const activeWorkbook = univerAPI.value.getActiveWorkbook();
  if (!activeWorkbook) {
    console.error('Không tìm thấy workbook đang hoạt động');
    return null;
  }

  const activeSheet = activeWorkbook.getActiveSheet();
  if (!activeSheet) {
    console.error('Không tìm thấy sheet đang hoạt động');
    return null;
  }

  // BƯỚC QUAN TRỌNG: Force blur khỏi ô đang edit để commit công thức vào cellData
  // Cách: Execute command để set selection về ôkhác, trigger blur
  try {
    // Sử dụng command để set selection về A1
    await univerAPI.value.executeCommand('sheet.operation.set-selections', {
      selections: [{
        range: {
          startRow: 0,
          endRow: 0,
          startColumn: 0,
          endColumn: 0
        }
      }]
    });
    // Đợi một chút để editor đóng và commit dữ liệu
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.warn('Không thể set selection:', error);
  }

  // 1. Ép hệ thống tính toán lại để đẩy thuộc tính 'f' vào Snapshot
  try {
    await univerAPI.value.executeCommand('sheet.command.set-calculate');
  } catch (error) {
    // console.warn('Command set-calculate not registered, skipping...');
  }

  // 2. Tăng thời gian chờ lên một chút (ví dụ 500ms) 
  // để chắc chắn thuộc tính 'f' xuất hiện trong cellData hàng 4 ô 6
  await new Promise(resolve => setTimeout(resolve, 500));

  // Workbook của Facade API có hàm save() trả về IWorkbookData
  const snapshot = activeWorkbook.getSnapshot()

  // Kiểm tra log ở đây: Nếu thấy "f": "=sum(B5:F5)" mới là thành công
  console.log('Snapshot cuối cùng:', snapshot);
  return snapshot;
};

const forceCalculate = () => {
  if (!univerAPI.value) {
    console.warn('Univer API chưa sẵn sàng để tính toán');
    return;
  }

  // Lệnh thực thi tính toán lại
  try {
    univerAPI.value.executeCommand('sheet.command.set-calculate');
    console.log('Đã kích hoạt tính toán lại toàn bộ.');
  } catch (error) {
    console.warn('Command set-calculate not registered, skipping...');
  }
};

defineExpose({
  getData,
  forceCalculate
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.univer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Also hide the menubar */
:global(.univer-menubar) {
  display: none;
}
</style>
