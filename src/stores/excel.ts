import { defineStore } from "pinia";

export const useExcelStore = defineStore("excel", {
  state: () => ({
    name: null as null | string,
    id: null as null | string | number,
    blank: false, // dùng để kiểm tra tạo file mới hay chọn file có sẵn
  }),
  persist: true,
});
