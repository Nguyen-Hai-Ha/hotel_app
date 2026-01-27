import ExcelJS from 'exceljs'
import dayjs from 'dayjs'
import * as FileSaver from 'file-saver'

/**
 * Xuất báo cáo doanh thu ra file Excel với style đẹp
 * @param {Object} data - Dữ liệu báo cáo
 */
export async function exportRevenueReport(data) {
    try {
        const { revenue, checkCounts, dailyRevenueSeries, stats, foodStatsRes, foodSummary, BookingCustomer } = data

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Hotel Admin Panel'
        workbook.created = new Date()
        workbook.properties.date1904 = true

        // ==========================================
        // SHEET 1: TỔNG QUAN
        // ==========================================
        const ws1 = workbook.addWorksheet('Tổng quan', {
            views: [{ showGridLines: false }]
        })

        // Title styling
        const titleRow = ws1.addRow(['BÁO CÁO DOANH THU KHÁCH SẠN'])
        titleRow.font = { name: 'Arial', family: 4, size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
        titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
        titleRow.height = 30

        // Merge cells for title
        ws1.mergeCells('A1:C1')

        // Background color for title
        ws1.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' } // Blue color
        }

        // Meta info
        ws1.addRow(['Thời gian xuất:', dayjs().format('DD/MM/YYYY HH:mm:ss')])
        ws1.addRow(['Tháng báo cáo:', dayjs().format('MM/YYYY')])
        ws1.addRow([]) // Empty row

        // Section: CHỈ SỐ TỔNG QUAN
        addSectionHeader(ws1, 'CHỈ SỐ TỔNG QUAN')

        const overviewData = [
            ['Chỉ số', 'Giá trị', 'Ghi chú'],
            ['Doanh thu hôm nay', revenue.today],
            ['Doanh thu tuần này', revenue.week],
            ['Doanh thu tháng này', stats.totalRevenue || revenue.month] // Use stats.totalRevenue for accuracy
        ]

        addTableData(ws1, overviewData)
        ws1.addRow([])

        // Section: KHÁCH HÀNG
        addSectionHeader(ws1, 'THỐNG KÊ KHÁCH HÀNG')
        const customerData = [
            ['Chỉ số', 'Số lượng', 'Ghi chú'],
            ['Check-in hôm nay', checkCounts.checkIn, 'lượt'],
            ['Check-out hôm nay', checkCounts.checkOut, 'lượt']
        ]   
        addTableData(ws1, customerData)
        ws1.addRow([])

        // Section: HỆ THỐNG
        addSectionHeader(ws1, 'THÔNG TIN HỆ THỐNG')
        const systemData = [
            ['Chỉ số', 'Số lượng', 'Ghi chú'],
            ['Tổng số phòng', stats.totalRooms || 0, 'phòng'],
            ['Tổng người dùng', stats.totalUsers || 0, 'người'],
            ['Đặt phòng hôm nay', stats.totalBookings || 0, 'đơn']
        ]
        addTableData(ws1, systemData)

        // Column widths
        ws1.getColumn(1).width = 25
        ws1.getColumn(2).width = 20
        ws1.getColumn(3).width = 15

        // ==========================================
        // SHEET 2: CHI TIẾT THEO NGÀY
        // ==========================================
        const ws2 = workbook.addWorksheet('Chi tiết theo ngày', {
            views: [{ state: 'frozen', ySplit: 1 }]
        })

        // Header Style
        const headerRow = ws2.addRow(['Ngày', 'Doanh thu', 'So sánh TB (%)', 'Xu hướng'])
        headerRow.height = 25

        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        })

        // Data calculation
        const avgRevenue = dailyRevenueSeries.reduce((sum, d) => sum + (d.amount || 0), 0) / (dailyRevenueSeries.length || 1)

        dailyRevenueSeries.forEach(day => {
            const amount = day.amount || 0
            const percentDiff = avgRevenue > 0 ? ((amount - avgRevenue) / avgRevenue * 100).toFixed(1) : '0.0'
            const trend = amount > avgRevenue ? 'Cao' : amount < avgRevenue ? 'Thấp' : 'TB'

            const row = ws2.addRow([
                day.label, // Ngày
                amount,    // Doanh thu
                Number(percentDiff) / 100, // % (Excel format)
                trend      // Xu hướng
            ])

            // Conditional formatting for Trend
            const trendCell = row.getCell(4)
            if (trend === 'Cao') {
                trendCell.font = { color: { argb: 'FF00B050' }, bold: true } // Green
            } else if (trend === 'Thấp') {
                trendCell.font = { color: { argb: 'FFFF0000' } } // Red
            }

            // Number formatting
            row.getCell(2).numFmt = '"$"#,##0.00' // Currency
            row.getCell(3).numFmt = '0.0%'         // Percent

            // Borders
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                    left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                    bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                    right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
                }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
            })
        })

        // Summary Row
        const summaryRowIndex = dailyRevenueSeries.length + 3
        ws2.getCell(`B${summaryRowIndex}`).value = 'Trung Bình 1 ngày:'
        ws2.getCell(`B${summaryRowIndex}`).font = { bold: true }
        ws2.getCell(`B${summaryRowIndex}`).alignment = { horizontal: 'right' }

        ws2.getCell(`B${summaryRowIndex + 1}`).value = 'TỔNG CỘNG:'
        ws2.getCell(`B${summaryRowIndex + 1}`).font = { bold: true }
        ws2.getCell(`B${summaryRowIndex + 1}`).alignment = { horizontal: 'right' }

        ws2.getCell(`C${summaryRowIndex}`).value = avgRevenue
        ws2.getCell(`C${summaryRowIndex}`).numFmt = '"$"#,##0.00'
        ws2.getCell(`C${summaryRowIndex}`).font = { bold: true, color: { argb: 'FF4472C4' } }

        ws2.getCell(`C${summaryRowIndex + 1}`).value = revenue.month
        ws2.getCell(`C${summaryRowIndex + 1}`).numFmt = '"$"#,##0.00'
        ws2.getCell(`C${summaryRowIndex + 1}`).font = { bold: true, color: { argb: 'FF4472C4' } }

        // Column widths
        ws2.getColumn(1).width = 15
        ws2.getColumn(2).width = 20
        ws2.getColumn(3).width = 18
        ws2.getColumn(4).width = 15

        // SHEET BÁO CÁO THỰC ĂN
        const ws3 = workbook.addWorksheet('Báo cáo thức ăn', {
            views: [{ state: 'frozen', ySplit: 1 }]
        })
        const FoodHeaderRow = ws3.addRow(['STT', 'Tên', 'Số lượng', 'Đơn giá ($)', 'Thành tiền ($)'])
        FoodHeaderRow.height = 25

        FoodHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        })

        foodStatsRes.forEach((item, index) => {
            const row = ws3.addRow([
                index + 1,
                item.name,
                item.quantity,
                item.unitPrice,
                item.total
            ])
        })
        ws3.addRow([])

        // Summary: Total Sold
        const soldRow = ws3.addRow(['', 'Tổng số lượng đã bán:', foodSummary.totalItemsSold])
        soldRow.getCell(2).font = { bold: true }
        soldRow.getCell(2).alignment = { horizontal: 'right' }
        soldRow.getCell(3).font = { bold: true }
        soldRow.getCell(3).alignment = { horizontal: 'center' }

        // Summary: Total Revenue
        const revenueRow = ws3.addRow(['', 'Tổng doanh thu:', foodSummary.totalRevenue])
        revenueRow.getCell(2).font = { bold: true }
        revenueRow.getCell(2).alignment = { horizontal: 'right' }
        // Merge label cells for better look if needed, but here just column 2 is fine as it is wide enough or overflow

        const totalCell = revenueRow.getCell(3) // Column E (Thành tiền)
        totalCell.numFmt = '"$"#,##0.00'
        totalCell.font = { bold: true, color: { argb: 'FF4472C4' }, size: 12 }

        ws3.getColumn(1).width = 10
        ws3.getColumn(2).width = 25
        ws3.getColumn(3).width = 15
        ws3.getColumn(4).width = 15
        ws3.getColumn(5).width = 20

        // SHEET BÁO CÁO HÓA ĐƠN
        const ws4 = workbook.addWorksheet('Báo cáo hóa đơn', {
            views: [{ state: 'frozen', ySplit: 1 }]
        })
        const InvoiceHeaderRow = ws4.addRow(['STT', 'Khách hàng', 'Loại phòng', 'Số phòng', 'Ngày thuê', 'Ngày trả', 'Số đêm', 'Giảm giá', 'Thuế', 'Phụ thu', 'Chi tiết dịch vụ (thức ăn)', 'Tiền dịch vụ ($)', 'Tổng tiền', 'Ghi chú'])
        InvoiceHeaderRow.height = 25

        InvoiceHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        })

        BookingCustomer.forEach((item, index) => {
            const row = ws4.addRow([
                index + 1,
                item.name,
                item.roomTypeName || item.RoomTypeName || '',
                item.room_number,
                item.check_in,
                item.check_out,
                item.total,
                item.discount_total,
                item.tax_amount,
                item.sub_charge,
                item.food_items.map((food) => `${food.quantity} ${food.food_name}`).join(', '),
                item.food_total,
                item.grand_total
            ])
        })
        ws4.getColumn(1).width = 10
        ws4.getColumn(2).width = 25
        ws4.getColumn(3).width = 35
        ws4.getColumn(4).width = 15
        ws4.getColumn(5).width = 20
        ws4.getColumn(6).width = 20
        ws4.getColumn(7).width = 20
        ws4.getColumn(8).width = 20
        ws4.getColumn(9).width = 20
        ws4.getColumn(10).width = 20
        ws4.getColumn(11).width = 20
        ws4.getColumn(12).width = 20
        ws4.getColumn(13).width = 20

        // Export file buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Create Blob and Save
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const fileName = `BaoCaoDoanhThu_${dayjs().format('YYYY-MM')}.xlsx`

        FileSaver.saveAs(blob, fileName)

        return {
            success: true,
            fileName: fileName
        }

    } catch (error) {
        console.error('Error exporting Excel with ExcelJS:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Helper: Add styled section header
 */
function addSectionHeader(ws, title) {
    const row = ws.addRow([title])
    row.font = { bold: true, color: { argb: 'FF4472C4' }, size: 12 }
    row.getCell(1).alignment = { horizontal: 'left' }
    ws.mergeCells(`A${row.number}:C${row.number}`)

    // Bottom border
    row.getCell(1).border = { bottom: { style: 'medium', color: { argb: 'FF4472C4' } } }
}

/**
 * Helper: Add styled data table
 */
function addTableData(ws, dataArray) {
    // Header row
    const headers = dataArray[0]
    const headerRow = ws.addRow(headers)

    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FF2D3748' } }
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF7FAFC' } // Light gray
        }
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E0' } } }
    })

    // Data rows
    for (let i = 1; i < dataArray.length; i++) {
        const rowData = dataArray[i]
        const row = ws.addRow(rowData)

        // Currency formatting for 2nd column if it's a number
        if (typeof rowData[1] === 'number') {
            // Basic number format, custom logic can be improved
            if (headers[1].includes('Giá trị') || headers[1].includes('Doanh thu')) {
                row.getCell(2).numFmt = '"$"#,##0.00'
            }
        }

        row.eachCell((cell, colNumber) => {
            cell.border = { bottom: { style: 'dotted', color: { argb: 'FFCCCCCC' } } }
            // Align values to left as requested, except for header (handled above)
            if (colNumber === 2) {
                cell.alignment = { horizontal: 'left' }
            }
        })
    }
}
