import { defineStore } from "pinia";

export const useExcelStore = defineStore("excel", {
  state: () => ({
    name: null as null | string,
    nameList: [] as string[],
  }),
  persist: true,
});
