<script setup lang="ts">
import ExcelJS from 'exceljs';

const importExcel = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const buffer = event.target?.result as ArrayBuffer;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
    const cellData: any = {};

    // Duyệt qua từng ô trong Excel và đưa vào Univer
    worksheet?.eachRow((row, rowNumber) => {
      cellData[rowNumber - 1] = {};
      row.eachCell((cell, colNumber) => {
        cellData[rowNumber - 1][colNumber - 1] = {
          v: cell.value?.toString(), // Giá trị hiển thị
          s: null // Bạn có thể thêm style ở đây nếu muốn
        };
      });
    });
  };

  reader.readAsArrayBuffer(file);
};
</script>
<template>
  <div></div>
</template>
<style scoped></style>
