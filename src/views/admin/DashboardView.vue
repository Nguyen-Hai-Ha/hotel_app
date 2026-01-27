<template>
    <div class="dashboard">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'bed']" />
                </div>
                <div class="stat-info">
                    <h3>{{ stats.totalRooms }}</h3>
                    <p>Tổng số phòng</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'calendar-check']" />
                </div>
                <div class="stat-info">
                    <h3>{{ stats.totalBookings }}</h3>
                    <p>Đặt phòng hôm nay</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'users']" />
                </div>
                <div class="stat-info">
                    <h3>{{ stats.totalUsers }}</h3>
                    <p>Người dùng</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'dollar-sign']" />
                </div>
                <div class="stat-info">
                    <h3>{{ formatCurrency(stats.totalRevenue) }}</h3>
                    <p>Doanh thu tháng</p>
                </div>
            </div>
        </div>

        <!-- <div class="stats-grid dashboard-secondary">
            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'coins']" />
                </div>
                <div class="stat-info">
                    <h3>{{ formatCurrency(revenue.today) }}</h3>
                    <p>Doanh thu hôm nay</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'calendar-week']" />
                </div>
                <div class="stat-info">
                    <h3>{{ formatCurrency(revenue.week) }}</h3>
                    <p>Doanh thu tuần này</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'sign-in-alt']" />
                </div>
                <div class="stat-info">
                    <h3>{{ checkCounts.checkIn }}</h3>
                    <p>Check-in hôm nay</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <FontAwesomeIcon :icon="['fas', 'sign-out-alt']" />
                </div>
                <div class="stat-info">
                    <h3>{{ checkCounts.checkOut }}</h3>
                    <p>Check-out hôm nay</p>
                </div>
            </div>
        </div> -->

        <div class="section-header dashboard-section-header">
            <h2>Doanh thu theo ngày (tháng {{ currentMonthLabel }})</h2>
            <button @click="handleExportExcel" :disabled="isExporting" class="btn btn-success btn-export">
                <FontAwesomeIcon :icon="['fas', isExporting ? 'spinner' : 'file-excel']" :spin="isExporting" />
                {{ isExporting ? 'Đang xuất...' : 'Xuất Excel' }}
            </button>
        </div>

        <div class="stat-card chart-card">
            <div class="line-chart">
                <svg class="line-chart-svg" viewBox="0 0 720 260" preserveAspectRatio="none"
                    @mousemove="handleChartHover" @mouseleave="hideTooltip">
                    <defs>
                        <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stop-color="#667eea" />
                            <stop offset="1" stop-color="#764ba2" />
                        </linearGradient>
                    </defs>

                    <line x1="52" y1="20" x2="52" y2="232" class="axis" />
                    <line x1="52" y1="232" x2="704" y2="232" class="axis" />

                    <text x="52" y="16" class="axis-label">{{ formatCompactCurrency(revenueAxisMax) }}$</text>
                    <text x="52" y="252" class="axis-label">0</text>

                    <!-- Revenue level grid lines -->
                    <g v-for="level in revenueLevels" :key="level.value" class="revenue-level">
                        <line :x1="52" :y1="level.y" :x2="704" :y2="level.y" class="level-line" />
                        <text :x="48" :y="level.y + 4" class="level-label">{{ formatCompactCurrency(level.value)
                        }}</text>
                    </g>

                    <!-- Chart area and line -->
                    <polyline v-if="areaPoints" :points="areaPoints" class="area" />
                    <polyline v-if="linePoints" :points="linePoints" class="line" />

                    <!-- Hover points -->
                    <circle v-for="(point, index) in hoverPoints" :key="index" :cx="point.x" :cy="point.y" r="4"
                        class="hover-point" />

                    <!-- Tooltip -->
                    <g v-if="tooltip.visible" class="chart-tooltip">
                        <rect :x="tooltip.x - 60" :y="tooltip.y - 50" width="120" height="42" rx="6"
                            class="tooltip-bg" />
                        <text :x="tooltip.x" :y="tooltip.y - 28" class="tooltip-date">{{ tooltip.date }}</text>
                        <text :x="tooltip.x" :y="tooltip.y - 12" class="tooltip-amount">{{ tooltip.amount }}</text>
                    </g>
                </svg>

                <div class="line-chart-legend">
                    <div class="legend-item">
                        <span class="legend-dot" />
                        <span>Doanh thu/ngày</span>
                    </div>
                    <div class="legend-item legend-total">
                        <span>Tổng tháng:</span>
                        <strong>{{ formatCurrency(revenue.month || 0) }}</strong>
                    </div>
                </div>

                <div class="line-chart-x">
                    <span v-for="t in xTicks" :key="t" class="x-tick">{{ t }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'
import { apiUrl } from '@/environment'
import dayjs from 'dayjs'
import { exportRevenueReport } from '@/utils/excelExport'

const stats = ref({
    totalRooms: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0
})

const revenue = ref({
    today: 0,
    week: 0,
    month: 0
})

const checkCounts = ref({
    checkIn: 0,
    checkOut: 0
})

const foodStats = ref([])
const foodSummary = ref({})

const BookingCustomer = ref([])

const dailyRevenueSeries = ref([])

const isExporting = ref(false)

const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    amount: ''
})

const currentMonthLabel = computed(() => dayjs().format('MM/YYYY'))

const revenueAxisMax = computed(() => {
    const max = dailyRevenueSeries.value.reduce((m, d) => Math.max(m, d.amount || 0), 0)
    if (max <= 0) return 0
    const pow = Math.pow(10, Math.floor(Math.log10(max)))
    const step = pow / 2
    return Math.ceil(max / step) * step
})

const revenueLevels = computed(() => {
    const max = revenueAxisMax.value
    if (max <= 0) return []

    const levels = []
    const numLevels = 4 // Số lượng đường kẻ ngang

    for (let i = 1; i <= numLevels; i++) {
        const value = (max / (numLevels + 1)) * i
        const y = 20 + (1 - value / max) * 212 // 212 = innerH (260 - 20 - 28)
        levels.push({ value, y })
    }

    return levels
})

const hoverPoints = computed(() => {
    if (!tooltip.value.visible) return []

    const series = dailyRevenueSeries.value
    const W = 720
    const H = 260
    const left = 52
    const top = 20
    const innerW = W - left - 16
    const innerH = H - top - 28
    const denom = Math.max(1, series.length - 1)
    const max = revenueAxisMax.value > 0 ? revenueAxisMax.value : 1

    // Find closest point
    const mouseX = tooltip.value.x
    let closestIndex = 0
    let minDist = Infinity

    series.forEach((d, i) => {
        const x = left + (i / denom) * innerW
        const dist = Math.abs(x - mouseX)
        if (dist < minDist) {
            minDist = dist
            closestIndex = i
        }
    })

    const x = left + (closestIndex / denom) * innerW
    const y = top + (1 - (series[closestIndex].amount || 0) / max) * innerH

    return [{ x, y }]
})

const formatCompactCurrency = (amount) => {
    const n = Number(amount || 0)
    if (!Number.isFinite(n)) return '0'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return `${Math.round(n)}`
}

const buildLinePoints = (series, maxValue) => {
    const W = 720
    const H = 260
    const left = 52
    const right = 16
    const top = 20
    const bottom = 28
    const innerW = W - left - right
    const innerH = H - top - bottom
    const n = series.length
    if (!n) return ''
    const denom = Math.max(1, n - 1)
    const max = maxValue > 0 ? maxValue : 1
    const points = series.map((d, i) => {
        const x = left + (i / denom) * innerW
        const y = top + (1 - (d.amount || 0) / max) * innerH
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    return points.join(' ')
}

const linePoints = computed(() => {
    return buildLinePoints(dailyRevenueSeries.value, revenueAxisMax.value)
})

const areaPoints = computed(() => {
    const series = dailyRevenueSeries.value
    if (!series.length) return ''
    const W = 720
    const H = 260
    const left = 52
    const right = 16
    const top = 20
    const bottom = 28
    const innerW = W - left - right
    const innerH = H - top - bottom
    const denom = Math.max(1, series.length - 1)
    const max = revenueAxisMax.value > 0 ? revenueAxisMax.value : 1
    const yBase = top + innerH
    const pts = series.map((d, i) => {
        const x = left + (i / denom) * innerW
        const y = top + (1 - (d.amount || 0) / max) * innerH
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    const firstX = left
    const lastX = left + innerW
    return `${firstX},${yBase} ${pts.join(' ')} ${lastX},${yBase}`
})

const xTicks = computed(() => {
    const series = dailyRevenueSeries.value
    if (!series.length) return []
    const days = series.length
    const ticks = [1]
    if (days >= 7) ticks.push(7)
    if (days >= 14) ticks.push(14)
    if (days >= 21) ticks.push(21)
    if (days >= 28) ticks.push(28)
    if (!ticks.includes(days)) ticks.push(days)
    return ticks.map(d => String(d))
})

const handleChartHover = (event) => {
    const svg = event.currentTarget
    const rect = svg.getBoundingClientRect()
    const svgX = (event.clientX - rect.left) * (720 / rect.width)
    const svgY = (event.clientY - rect.top) * (260 / rect.height)

    // Check if within chart area
    if (svgX < 52 || svgX > 704 || svgY < 20 || svgY > 232) {
        hideTooltip()
        return
    }

    const series = dailyRevenueSeries.value
    if (!series.length) return

    const left = 52
    const innerW = 704 - 52
    const denom = Math.max(1, series.length - 1)

    // Find closest data point
    let closestIndex = 0
    let minDist = Infinity

    series.forEach((d, i) => {
        const x = left + (i / denom) * innerW
        const dist = Math.abs(x - svgX)
        if (dist < minDist) {
            minDist = dist
            closestIndex = i
        }
    })

    const dataPoint = series[closestIndex]
    const pointX = left + (closestIndex / denom) * innerW

    tooltip.value = {
        visible: true,
        x: pointX,
        y: svgY < 100 ? svgY + 60 : svgY - 40,
        date: dataPoint.label,
        amount: formatCurrency(dataPoint.amount)
    }
}

const hideTooltip = () => {
    tooltip.value.visible = false
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const fetchStats = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/admin/stats`)
        stats.value = response.data
    } catch (error) {
        console.error('Error fetching stats:', error)
    }
}

const getCheckInValue = (b) => {
    return b?.check_in || b?.checkin_date || b?.checkIn || b?.checkin || b?.check_in_date || null
}

const getCheckOutValue = (b) => {
    return b?.check_out || b?.checkout_date || b?.checkOut || b?.checkout || b?.check_out_date || null
}

const getRevenueDateValue = (b) => {
    return getCheckOutValue(b) || b?.updated_at || b?.created_at || getCheckInValue(b) || null
}

const getRevenueAmount = (b) => {
    const raw = b?.grand_total ?? 0
    const n = Number(raw)
    return Number.isFinite(n) ? n : 0
}

const isCancelled = (b) => {
    const s = String(b?.status || b?.payment_status || '').toLowerCase()
    return s === 'cancelled' || s === 'canceled'
}

const isCompletedForRevenue = (b) => {
    const s = String(b?.status || b?.payment_status || '').toLowerCase()
    if (!s) return true
    return s === 'done' || s === 'success' || s === 'checked_out'
}

const handleExportExcel = async () => {
    try {
        isExporting.value = true

        const exportData = {
            revenue: revenue.value,
            checkCounts: checkCounts.value,
            dailyRevenueSeries: dailyRevenueSeries.value,
            stats: stats.value,
            foodStatsRes: foodStats.value,
            foodSummary: foodSummary.value,
            BookingCustomer: BookingCustomer.value
        }
        console.log(exportData)

        const result = await exportRevenueReport(exportData)

        if (result.success) {
            alert(`✅ Xuất báo cáo thành công!\nFile đã được lưu: ${result.fileName}`)
        } else {
            alert(`❌ Lỗi xuất báo cáo: ${result.error}`)
        }
    } catch (error) {
        console.error('Export error:', error)
        alert(`❌ Lỗi: ${error.message}`)
    } finally {
        isExporting.value = false
    }
}

const buildDashboardAnalytics = async () => {
    try {
        const [bookingsRes, roomsRes, foodStatsRes, bookingsCustomerRes] = await Promise.all([
            axios.get(`${apiUrl}/api/admin/bookings`),
            axios.get(`${apiUrl}/api/admin/rooms`),
            axios.get(`${apiUrl}/api/admin/food-stats`),
            axios.get(`${apiUrl}/api/admin/bookings-customer`)
        ])

        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
        const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : []
        if (foodStatsRes.data && Array.isArray(foodStatsRes.data.items)) {
            foodStats.value = foodStatsRes.data.items
            foodSummary.value = foodStatsRes.data.summary
        } else if (Array.isArray(foodStatsRes.data)) {
            foodStats.value = foodStatsRes.data
            foodSummary.value = foodStatsRes.data.summary
        } else {
            foodStats.value = []
        }
        BookingCustomer.value = bookingsCustomerRes.data
        const totalRooms = stats.value.totalRooms || rooms.length || 0

        const todayStart = dayjs().startOf('day')
        const weekStart = dayjs().startOf('week')
        const monthStart = dayjs().startOf('month')
        const daysInMonth = monthStart.daysInMonth()

        let revenueToday = 0
        let revenueWeek = 0
        let revenueMonth = 0
        let checkInToday = 0
        let checkOutToday = 0

        const dailyTotals = Array.from({ length: daysInMonth }, () => 0)

        for (const b of bookings) {
            if (isCancelled(b)) continue

            const checkInRaw = getCheckInValue(b)
            const checkOutRaw = getCheckOutValue(b)
            const checkIn = checkInRaw ? dayjs(checkInRaw) : null
            const checkOut = checkOutRaw ? dayjs(checkOutRaw) : null

            if (checkIn && checkIn.isValid() && checkIn.isSame(todayStart, 'day')) {
                checkInToday += 1
            }
            if (checkOut && checkOut.isValid() && checkOut.isSame(todayStart, 'day')) {
                checkOutToday += 1
            }

            if (!isCompletedForRevenue(b)) continue

            const revenueDateRaw = getRevenueDateValue(b)
            const revenueDate = revenueDateRaw ? dayjs(revenueDateRaw) : null
            if (!revenueDate || !revenueDate.isValid()) continue

            const amount = getRevenueAmount(b)
            if (!amount) continue

            if (revenueDate.isSame(todayStart, 'day')) revenueToday += amount
            if (!revenueDate.isBefore(weekStart, 'day')) revenueWeek += amount
            if (revenueDate.isSame(monthStart, 'month')) revenueMonth += amount

            if (revenueDate.isSame(monthStart, 'month')) {
                const idx = revenueDate.date() - 1
                if (idx >= 0 && idx < dailyTotals.length) dailyTotals[idx] += amount
            }
        }

        revenue.value = {
            today: revenueToday,
            week: revenueWeek,
            month: revenueMonth
        }
        checkCounts.value = {
            checkIn: checkInToday,
            checkOut: checkOutToday
        }

        dailyRevenueSeries.value = dailyTotals.map((amount, idx) => {
            const date = monthStart.add(idx, 'day')
            return {
                key: date.format('YYYY-MM-DD'),
                day: idx + 1,
                label: date.format('DD/MM'),
                amount
            }
        })
    } catch (error) {
        console.error('Error building dashboard analytics:', error)
    }
}

onMounted(() => {
    fetchStats()
    buildDashboardAnalytics()
})
</script>

<style scoped>
@import '@/assets/admin-global.css';

.dashboard-secondary {
    margin-top: 1rem;
}

.dashboard-section-header {
    margin-top: 1.5rem;
}

.chart-card {
    padding: 1rem;
}

.line-chart {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.line-chart-svg {
    width: 100%;
    height: 220px;
}

.axis {
    stroke: rgba(148, 163, 184, 0.35);
    stroke-width: 1;
}

.axis-label {
    fill: var(--admin-muted);
    font-size: 12px;
}

.line {
    fill: none;
    stroke: url(#revLine);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.area {
    fill: rgba(102, 126, 234, 0.14);
    stroke: none;
}

.line-chart-legend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--admin-muted);
    font-size: 0.875rem;
}

.legend-total {
    color: var(--admin-text);
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.line-chart-x {
    display: flex;
    justify-content: space-between;
    color: var(--admin-muted);
    font-size: 0.75rem;
}

.x-tick {
    min-width: 24px;
}

/* Revenue level lines */
.level-line {
    stroke: rgba(148, 163, 184, 0.2);
    stroke-width: 1;
    stroke-dasharray: 4 3;
}

.level-label {
    fill: var(--admin-muted);
    font-size: 10px;
    text-anchor: end;
    opacity: 0.7;
}

/* Tooltip styles */
.chart-tooltip {
    pointer-events: none;
}

.tooltip-bg {
    fill: rgba(45, 55, 72, 0.95);
    stroke: rgba(102, 126, 234, 0.6);
    stroke-width: 1.5;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.tooltip-date {
    fill: rgba(255, 255, 255, 0.85);
    font-size: 11px;
    font-weight: 500;
    text-anchor: middle;
}

.tooltip-amount {
    fill: #ffffff;
    font-size: 13px;
    font-weight: 700;
    text-anchor: middle;
}

/* Hover points */
.hover-point {
    fill: #667eea;
    stroke: #ffffff;
    stroke-width: 2;
    filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.5));
}

.line-chart-svg {
    cursor: crosshair;
}

/* Export button */
.btn-export {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-export:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
