import type { ICellData, IStyleData, BooleanNumber } from "@univerjs/core";
import type { ExcelCellData, ParsedExcelData } from "./importExcel";
import slugify from "slugify";

// Định nghĩa lại interface cho rõ ràng
interface IWorkbookCellData {
  [row: string]: {
    [column: string]: ICellData;
  };
}

/**
 * Chuyển đổi border style từ Excel sang Univer
 */
const convertBorderStyle = (style?: string): number => {
  if (!style) return 0;
  const borderStyleMap: { [key: string]: number } = {
    thin: 1,
    medium: 2,
    thick: 3,
    double: 4,
    dotted: 5,
    dashed: 6,
  };
  return borderStyleMap[style] || 1;
};

/**
 * Chuyển đổi horizontal alignment từ Excel sang Univer
 */
const convertHorizontalAlign = (align?: string): number => {
  const alignMap: { [key: string]: number } = {
    left: 1,
    center: 2,
    right: 3,
  };
  return alignMap[align || "left"] || 1;
};

/**
 * Chuyển đổi vertical alignment từ Excel sang Univer
 */
const convertVerticalAlign = (align?: string): number => {
  const alignMap: { [key: string]: number } = {
    top: 1,
    middle: 2,
    bottom: 3,
  };
  return alignMap[align || "middle"] || 2;
};

/**
 * Convert parsed Excel data với styling thành cấu trúc cellData của Univer
 * @param parsedData Parsed Excel data với cell data và merge ranges
 */
export const convertToDataUniver = (parsedData: ParsedExcelData): IWorkbookCellData => {
  const result: IWorkbookCellData = {};
  const data = parsedData.cellData;

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const column: { [key: string]: ICellData } = {};

    for (let colIndex = 0; colIndex < data[rowIndex].length; colIndex++) {
      const excelCell = data[rowIndex][colIndex];

      // Tạo cell data cơ bản
      const cellData: ICellData = {
        v: excelCell.value?.toString() || "",
      };

      // Xử lý style nếu có
      if (excelCell.style) {
        const style = excelCell.style;
        const univerStyle: Partial<IStyleData> = {};

        // Font styling
        if (style.font) {
          if (style.font.bold !== undefined) {
            univerStyle.bl = style.font.bold ? 1 : 0;
          }
          if (style.font.italic !== undefined) {
            univerStyle.it = style.font.italic ? 1 : 0;
          }
          if (style.font.size) {
            univerStyle.fs = style.font.size;
          }
          if (style.font.name) {
            univerStyle.ff = style.font.name;
          }
          if (style.font.color) {
            univerStyle.cl = {
              rgb: style.font.color,
            };
          }
          if (style.font.underline) {
            univerStyle.ul = {
              s: 1, // single underline
            };
          }
        }

        // Background fill
        if (style.fill?.fgColor) {
          univerStyle.bg = {
            rgb: style.fill.fgColor,
          };
        }

        // Alignment
        if (style.alignment) {
          if (style.alignment.horizontal) {
            univerStyle.ht = convertHorizontalAlign(style.alignment.horizontal);
          }
          if (style.alignment.vertical) {
            univerStyle.vt = convertVerticalAlign(style.alignment.vertical);
          }
          if (style.alignment.wrapText) {
            univerStyle.tb = style.alignment.wrapText ? 1 : 0;
          }
        }

        // Borders
        if (style.border) {
          const borderData: any = {};

          if (style.border.top) {
            borderData.t = {
              s: convertBorderStyle(style.border.top.style),
              cl: style.border.top.color ? { rgb: style.border.top.color } : undefined,
            };
          }
          if (style.border.bottom) {
            borderData.b = {
              s: convertBorderStyle(style.border.bottom.style),
              cl: style.border.bottom.color ? { rgb: style.border.bottom.color } : undefined,
            };
          }
          if (style.border.left) {
            borderData.l = {
              s: convertBorderStyle(style.border.left.style),
              cl: style.border.left.color ? { rgb: style.border.left.color } : undefined,
            };
          }
          if (style.border.right) {
            borderData.r = {
              s: convertBorderStyle(style.border.right.style),
              cl: style.border.right.color ? { rgb: style.border.right.color } : undefined,
            };
          }

          if (Object.keys(borderData).length > 0) {
            univerStyle.bd = borderData;
          }
        }

        // Apply style to cell if any
        if (Object.keys(univerStyle).length > 0) {
          cellData.s = univerStyle as IStyleData;
        }
      }

      // TODO: Xử lý merged cells
      // Univer handles merged cells differently - need to use worksheet.mergeRange() API
      // For now, we'll just add the cell data without merge info
      // if (excelCell.isMerged && excelCell.mergeInfo) {
      //   // Merged cells need to be handled separately via Univer API
      //   // Example: worksheet.mergeRange(startRow, startCol, endRow, endCol)
      // }

      column[colIndex.toString()] = cellData;
    }

    // Thêm dòng vào result
    if (Object.keys(column).length > 0) {
      result[rowIndex.toString()] = column;
    }
  }

  return result;
};

export const generateSlug = (string: string, replacement: string = "-") => {
  return slugify(string, {
    replacement, // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    locale: "vi", // language code of the locale to use
  });
};
