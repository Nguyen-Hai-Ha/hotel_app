import * as ExcelJS from "exceljs";

/**
 * Convert hex color to ARGB format for ExcelJS
 */
const hexToArgb = (hex?: string): string | undefined => {
  if (!hex) return undefined;
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.substring(1) : hex;
  // Add alpha channel (FF for fully opaque)
  return 'FF' + cleanHex.toUpperCase();
};

/**
 * Convert Univer border style number to ExcelJS border style string
 */
const convertBorderStyleToExcel = (style?: number): ExcelJS.BorderStyle => {
  const borderStyleMap: { [key: number]: ExcelJS.BorderStyle } = {
    1: 'thin',
    2: 'medium',
    3: 'thick',
    4: 'double',
    5: 'dotted',
    6: 'dashed',
  };
  return borderStyleMap[style || 1] || 'thin';
};

/**
 * Convert Univer horizontal alignment number to ExcelJS alignment string
 */
const convertHorizontalAlignToExcel = (align?: number): 'left' | 'center' | 'right' => {
  const alignMap: { [key: number]: 'left' | 'center' | 'right' } = {
    1: 'left',
    2: 'center',
    3: 'right',
  };
  return alignMap[align || 1] || 'left';
};

/**
 * Convert Univer vertical alignment number to ExcelJS alignment string
 */
const convertVerticalAlignToExcel = (align?: number): 'top' | 'middle' | 'bottom' => {
  const alignMap: { [key: number]: 'top' | 'middle' | 'bottom' } = {
    1: 'top',
    2: 'middle',
    3: 'bottom',
  };
  return alignMap[align || 2] || 'middle';
};

export const exportExcel = async (data: any) => {
  console.log("data: ", data);

  try {
    const workbook = new ExcelJS.Workbook();

    // Duyệt qua tất cả các sheet trong snapshot
    Object.keys(data.sheets).forEach((sheetId) => {
      const sheetSnapshot = data.sheets[sheetId];
      const worksheet = workbook.addWorksheet(sheetSnapshot.name);

      const cellData = sheetSnapshot.cellData;

      // Duyệt qua từng dòng và ô để đổ vào ExcelJS
      Object.keys(cellData).forEach((r) => {
        const rowIdx = parseInt(r) + 1; // ExcelJS bắt đầu từ 1
        const row = worksheet.getRow(rowIdx); // Get row object once
        
        Object.keys(cellData[r]).forEach((c) => {
          const colIdx = parseInt(c) + 1;
          const univerCell = cellData[r][c];

          if (univerCell) {
            const excelCell = row.getCell(colIdx); // Use row object
            
            // Set cell value
            if (univerCell.v !== undefined) {
              excelCell.value = univerCell.v;
            }

            // Apply styles if they exist
            if (univerCell.s) {
              const style = univerCell.s;
              const cellStyle: Partial<ExcelJS.Style> = {};
              let hasStyles = false;

              // Font styling
              const font: Partial<ExcelJS.Font> = {};
              if (style.bl !== undefined) {
                font.bold = style.bl === 1;
              }
              if (style.it !== undefined) {
                font.italic = style.it === 1;
              }
              if (style.ul) {
                font.underline = true;
              }
              if (style.fs) {
                font.size = style.fs;
              }
              if (style.ff) {
                font.name = style.ff;
              }
              if (style.cl?.rgb) {
                font.color = { argb: hexToArgb(style.cl.rgb) };
              }
              
              if (Object.keys(font).length > 0) {
                cellStyle.font = font;
                hasStyles = true;
              }

              // Background fill
              if (style.bg?.rgb) {
                cellStyle.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: hexToArgb(style.bg.rgb) },
                } as ExcelJS.Fill;
                hasStyles = true;
              }

              // Alignment
              const alignment: Partial<ExcelJS.Alignment> = {};
              if (style.ht !== undefined) {
                alignment.horizontal = convertHorizontalAlignToExcel(style.ht);
              }
              if (style.vt !== undefined) {
                alignment.vertical = convertVerticalAlignToExcel(style.vt);
              }
              if (style.tb !== undefined) {
                alignment.wrapText = style.tb === 1;
              }
              
              if (Object.keys(alignment).length > 0) {
                cellStyle.alignment = alignment;
                hasStyles = true;
              }

              // Borders - use direct ExcelJS format
              if (style.bd) {
                // Default black color for borders if not specified
                const defaultBorderColor = 'FF000000'; // Black
                
                // Build border object with proper ExcelJS structure
                const borderStyle: Partial<ExcelJS.Borders> = {};
                
                if (style.bd.t) {
                  borderStyle.top = {
                    style: convertBorderStyleToExcel(style.bd.t.s),
                    color: { argb: style.bd.t.cl?.rgb ? hexToArgb(style.bd.t.cl.rgb) : defaultBorderColor }
                  };
                }
                if (style.bd.b) {
                  borderStyle.bottom = {
                    style: convertBorderStyleToExcel(style.bd.b.s),
                    color: { argb: style.bd.b.cl?.rgb ? hexToArgb(style.bd.b.cl.rgb) : defaultBorderColor }
                  };
                }
                if (style.bd.l) {
                  borderStyle.left = {
                    style: convertBorderStyleToExcel(style.bd.l.s),
                    color: { argb: style.bd.l.cl?.rgb ? hexToArgb(style.bd.l.cl.rgb) : defaultBorderColor }
                  };
                }
                if (style.bd.r) {
                  borderStyle.right = {
                    style: convertBorderStyleToExcel(style.bd.r.s),
                    color: { argb: style.bd.r.cl?.rgb ? hexToArgb(style.bd.r.cl.rgb) : defaultBorderColor }
                  };
                }
                
                // Apply border directly to cell
                if (Object.keys(borderStyle).length > 0) {
                  excelCell.border = borderStyle;
                  console.log(`      ✓ Applied border directly to cell [${rowIdx},${colIdx}]:`, Object.keys(borderStyle));
                }
              }

              // Apply styles separately to ensure they're all saved
              if (Object.keys(font).length > 0) {
                excelCell.font = font;
                hasStyles = true;
              }
              
              if (cellStyle.fill) {
                excelCell.fill = cellStyle.fill;
                hasStyles = true;
              }
              
              if (cellStyle.alignment) {
                excelCell.alignment = cellStyle.alignment;
                hasStyles = true;
              }
              
              if (hasStyles) {
                const appliedStyles = [];
                if (excelCell.font && Object.keys(excelCell.font).length > 0) appliedStyles.push('font');
                if (excelCell.fill) appliedStyles.push('fill');
                if (excelCell.alignment) appliedStyles.push('alignment');
                if (excelCell.border) appliedStyles.push('border');
              }
            }
          }
        });
        
        // Commit row to ensure styles are saved
        row.commit();
      });

      // Xử lý Merge Cells nếu có
      if (sheetSnapshot.mergeData) {
        sheetSnapshot.mergeData.forEach((merge: any) => {
          worksheet.mergeCells(
            merge.startRow + 1,
            merge.startColumn + 1,
            merge.endRow + 1,
            merge.endColumn + 1,
          );
        });
      }
    });

    // Tạo Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Chuyển thành Blob để gửi đi
    const fileBlob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return fileBlob;
  } catch (error) {
    console.log(error);
  }
};
