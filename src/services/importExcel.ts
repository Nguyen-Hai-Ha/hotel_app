import * as ExcelJS from "exceljs";

export interface ExcelCellData {
  value: any;
  style?: {
    font?: {
      name?: string;
      size?: number;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      color?: string;
    };
    fill?: {
      type?: string;
      fgColor?: string;
      bgColor?: string;
    };
    alignment?: {
      horizontal?: string;
      vertical?: string;
      wrapText?: boolean;
    };
    border?: {
      top?: { style?: string; color?: string };
      bottom?: { style?: string; color?: string };
      left?: { style?: string; color?: string };
      right?: { style?: string; color?: string };
    };
    numFmt?: string;
  };
  isMerged?: boolean;
  mergeInfo?: {
    rowspan?: number;
    colspan?: number;
  };
  formula?: string;
}

export interface MergeRange {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

export interface ParsedExcelSheet {
  sheetName: string;
  cellData: ExcelCellData[][];
  mergeRanges: MergeRange[];
}

export interface ParsedExcelData {
  sheets: ParsedExcelSheet[];
}

/**
 * Chuyển màu ARGB từ ExcelJS sang hex
 */
const argbToHex = (argb?: string): string | undefined => {
  if (!argb) return undefined;
  // ARGB format: AARRGGBB, chúng ta bỏ alpha channel
  if (argb.length === 8) {
    return '#' + argb.substring(2);
  }
  return argb.startsWith('#') ? argb : '#' + argb;
};

/**
 * Format Date object thành HH:MM (24h format)
 */
const formatTimeToHHMM = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Chuyển đổi cell value sang string để hiển thị
 */
const formatCellValue = (value: any): string => {
  if (!value) return "";
  
  // Nếu là Date object, format thành HH:MM
  if (value instanceof Date) {
    return formatTimeToHHMM(value);
  }
  
  // Nếu là object có result (formula), lấy result
  if (typeof value === "object" && "result" in value) {
    const result = value.result;
    if (result instanceof Date) {
      return formatTimeToHHMM(result);
    }
    return result?.toString() || "";
  }
  
  return value.toString();
};

/**
 * Chuyển đổi file Excel thành dữ liệu với đầy đủ formatting cho TẤT CẢ các sheets
 * @param file File từ input
 * @returns Promise chứa mảng các sheets với cell data và merge ranges
 */
export const parseExcelFile = (file: File): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        console.log("workbook: ", workbook);
        console.log("Số lượng sheets: ", workbook.worksheets.length);

        const allSheets: ParsedExcelSheet[] = [];

        // Lặp qua TẤT CẢ các worksheets
        workbook.worksheets.forEach((worksheet) => {
          const data: ExcelCellData[][] = [];
          const mergeRanges: MergeRange[] = [];
          const mergedCells = new Map<string, { rowspan: number; colspan: number }>();

          if (worksheet) {
            // Xử lý merged cells
            worksheet.model.merges?.forEach((merge: string) => {
              const match = merge.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
              if (match) {
                const startCol = columnToNumber(match[1]);
                const startRow = parseInt(match[2]);
                const endCol = columnToNumber(match[3]);
                const endRow = parseInt(match[4]);
                
                const rowspan = endRow - startRow + 1;
                const colspan = endCol - startCol + 1;
                
                mergedCells.set(`${startRow}-${startCol}`, { rowspan, colspan });
                
                // Lưu merge range (0-indexed cho Univer)
                mergeRanges.push({
                  startRow: startRow - 1,
                  startColumn: startCol - 1,
                  endRow: endRow - 1,
                  endColumn: endCol - 1,
                });
              }
            });

            // Xác định kích thước thực tế của bảng
            const rowCount = worksheet.actualRowCount;
            const colCount = worksheet.actualColumnCount;

            for (let i = 1; i <= rowCount; i++) {
              const rowData: ExcelCellData[] = [];
              const row = worksheet.getRow(i);
              
              for (let j = 1; j <= colCount; j++) {
                const cell = row.getCell(j);
                
                // Lấy và format giá trị
                const cellData: ExcelCellData = {
                  value: formatCellValue(cell.value),
                };

                // Lấy style
                const cellStyle = cell.style;

                // Kiểm tra merged cell
                const mergeKey = `${i}-${j}`;
                if (mergedCells.has(mergeKey)) {
                  cellData.isMerged = true;
                  cellData.mergeInfo = mergedCells.get(mergeKey);
                }

                // Extract font styles
                if (cellStyle?.font) {
                  cellData.style = cellData.style || {};
                  cellData.style.font = {
                    name: cellStyle.font.name,
                    size: cellStyle.font.size,
                    bold: cellStyle.font.bold,
                    italic: cellStyle.font.italic,
                    underline: cellStyle.font.underline ? true : false,
                    color: argbToHex(cellStyle.font.color?.argb),
                  };
                }

                // Extract fill (background color)
                if (cellStyle?.fill && cellStyle.fill.type === 'pattern') {
                  cellData.style = cellData.style || {};
                  const fill = cellStyle.fill as ExcelJS.FillPattern;
                  cellData.style.fill = {
                    type: fill.pattern,
                    fgColor: argbToHex(fill.fgColor?.argb),
                    bgColor: argbToHex(fill.bgColor?.argb),
                  };
                }

                // Extract alignment
                if (cellStyle?.alignment) {
                  cellData.style = cellData.style || {};
                  cellData.style.alignment = {
                    horizontal: cellStyle.alignment.horizontal,
                    vertical: cellStyle.alignment.vertical,
                    wrapText: cellStyle.alignment.wrapText,
                  };
                }

                // Extract borders
                if (cellStyle?.border) {
                  cellData.style = cellData.style || {};
                  cellData.style.border = {
                    top: cellStyle.border.top ? {
                      style: cellStyle.border.top.style,
                      color: argbToHex(cellStyle.border.top.color?.argb)
                    } : undefined,
                    bottom: cellStyle.border.bottom ? {
                      style: cellStyle.border.bottom.style,
                      color: argbToHex(cellStyle.border.bottom.color?.argb)
                    } : undefined,
                    left: cellStyle.border.left ? {
                      style: cellStyle.border.left.style,
                      color: argbToHex(cellStyle.border.left.color?.argb)
                    } : undefined,
                    right: cellStyle.border.right ? {
                      style: cellStyle.border.right.style,
                      color: argbToHex(cellStyle.border.right.color?.argb)
                    } : undefined,
                  };
                }

                // Extract number format
                if (cellStyle?.numFmt) {
                  cellData.style = cellData.style || {};
                  cellData.style.numFmt = cellStyle.numFmt;
                }

                // Extract formula
                if (cell.formula) {
                   cellData.formula = cell.formula;
                }

                rowData.push(cellData);
              }
              data.push(rowData);
            }
          }
          
          // Thêm sheet vào mảng
          allSheets.push({
            sheetName: worksheet.name,
            cellData: data,
            mergeRanges: mergeRanges,
          });
        });
        
        resolve({
          sheets: allSheets,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Chuyển đổi column letter sang number (A=1, B=2, etc.)
 */
function columnToNumber(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result;
}
