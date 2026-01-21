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
  univer.registerPlugin(UniverFormulaEnginePlugin);
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

  // create workbook instance
  univer.createUnit(UniverInstanceType.UNIVER_SHEET, data);

  const api = FUniver.newAPI(univer);

  univerAPI.value = api;

  api.getActiveWorkbook()?.getActiveSheet();
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
const getData = () => {
  if (!univerAPI.value) {
    console.error('Univer API (Facade) chưa sẵn sàng');
    return null;
  }

  const activeWorkbook = univerAPI.value.getActiveWorkbook();
  if (!activeWorkbook) {
    console.error('Không tìm thấy workbook đang hoạt động');
    return null;
  }

  // Workbook của Facade API có hàm save() trả về IWorkbookData
  const snapshot = activeWorkbook.getSnapshot()
  console.log('Snapshot dữ liệu:', snapshot);
  return snapshot;
};

defineExpose({
  getData,
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
