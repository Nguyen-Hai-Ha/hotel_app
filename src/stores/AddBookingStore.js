import { defineStore } from 'pinia'
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { apiUrl } from '@/environment'

export const useAddBookingStore = defineStore('add-booking-modal', () => {
    const bookings = ref([])
    const services = ref([])
    const taxes = ref([])
    const foods = ref([])
    const roomTypes = ref([])
    const rooms = ref([])
    const selectedBookingId = ref(null)
    const selectedFoodItems = ref([])
    const rental = ref('daily')

    const showAddBookingModal = ref(false)
    const showAddFoodToBookingModal = ref(false)
    const showAddBookingForAdminModal = ref(false)

    const availableRooms = ref([])

    const itemsPerPage = 12
    const currentPageBookings = ref(1)
    const searchQuery = ref('')

    const BookingNameInput = ref(null)

    const openAddBookingModal = async () => {
        showAddBookingModal.value = true
        await nextTick()

        // Force focus with multiple attempts
        const focusInput = () => {
            const input = BookingNameInput.value
            if (input) {
                // Remove any selection on body
                window.getSelection()?.removeAllRanges()

                // Blur anything that's currently focused
                if (document.activeElement && document.activeElement !== input) {
                    document.activeElement.blur()
                }

                // Force click and focus
                input.click()
                input.focus()

                // Verify focus worked, if not try again
                if (document.activeElement !== input) {
                    requestAnimationFrame(() => {
                        input.focus()
                    })
                }
            }
        }

        // Try multiple times with increasing delays
        setTimeout(focusInput, 50)
        setTimeout(focusInput, 150)
        setTimeout(focusInput, 300)
    }

    const openAddBookingForAdmin = async () => {
        showAddBookingForAdminModal.value = true
    }

    const closeAddBookingForAdminModal = () => {
        showAddBookingForAdminModal.value = false
        availableRooms.value = []
    }

    const finalGrandTotal = ref(0)

    const newBooking = ref({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerPassport: '',
        roomTypeId: '',
        roomId: '',
        checkIn: '',
        checkOut: '',
        selectedServices: [],
        selectedTaxes: [],
        discount: '',
        roomPrice: ''
    })

    const newBookingForAdmin = ref({
        roomTypeId: '',
        roomId: '',
        checkIn: '',
    })

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const selectedRoomType = computed(() => {
        return roomTypes.value.find(rt => rt.id == newBooking.value.roomTypeId) || null
    })

    const bookingNights = computed(() => {
        if ((!newBooking.value.checkIn || !newBooking.value.checkOut)) return 0
        const checkIn = new Date(newBooking.value.checkIn)
        const checkOut = new Date(newBooking.value.checkOut)

        // Normalize to date only (remove time component) for proper night calculation
        // In hotel industry, nights = difference between dates, not rounded hours
        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

        const diffTime = checkOutDate - checkInDate
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
    })

    const clickChangeRental = () => {
        rental.value = rental.value === 'hourly' ? 'daily' : 'hourly'
        console.log(rental.value)
    }

    const isHourlyRental = computed(() => rental.value === 'hourly')

    const roomCost = computed(() => {
        if (isHourlyRental.value && newBooking.value.roomPrice > 0) {
            return newBooking.value.roomPrice
        } else if (isHourlyRental.value) {
            return selectedRoomType.value.price_hour
        } else if (newBooking.value.roomPrice > 0) {
            return newBooking.value.roomPrice * bookingNights.value
        } else {
            if (!selectedRoomType.value || !bookingNights.value) return 0
            return selectedRoomType.value.base_price * bookingNights.value
        }
    })

    const servicesCost = computed(() => {
        return newBooking.value.selectedServices.reduce((total, serviceId) => {
            const service = services.value.find(s => s.id == serviceId)
            return total + (service ? service.price : 0)
        }, 0)
    })

    const subtotal = computed(() => {
        return roomCost.value
    })

    const taxAmount = computed(() => {
        return newBooking.value.selectedTaxes.reduce((total, taxId) => {
            const tax = taxes.value.find(t => t.id == taxId)
            if (tax) {
                return total + (subtotal.value * tax.rate / 100)
            }
            return total
        }, 0)
    })

    const grandTotal = computed(() => {
        return subtotal.value + taxAmount.value + (servicesCost.value * bookingNights.value)
    })

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/admin/bookings`)
            bookings.value = response.data
        } catch (error) {
            console.error('Error fetching bookings:', error)
        }
    }

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/services`)
            services.value = response.data
        } catch (error) {
            console.error('Error fetching services:', error)
        }
    }

    const fetchFoods = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/foods`)
            foods.value = response.data
        } catch (error) {
            console.error('Error fetching foods:', error)
        }
    }

    const fetchRoomTypes = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/admin/room-types`)
            roomTypes.value = response.data
        } catch (error) {
            console.error('Error fetching room types:', error)
        }
    }

    const fetchTaxes = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/taxes`)
            taxes.value = response.data
        } catch (error) {
            console.error('Error fetching taxes:', error)
        }
    }

    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/admin/rooms`)
            rooms.value = response.data
            console.log('Admin rooms data:', rooms.value)
        } catch (error) {
            console.error('Error fetching rooms:', error)
        }
    }



    const changeBookingStatus = async (booking, newStatus) => {

        try {
            const formData = new FormData()
            formData.append('status', newStatus)
            const response = await fetch(`${apiUrl}/api/admin/change-status-booking/${booking.id}`, {
                method: 'POST',
                body: formData
            })
            if (response.status === 200) {
                await fetchBookings()
            } else {
                throw new Error('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating booking status:', error)
        }
    }

    const onRoomTypeChange = async () => {

        const roomTypeId = newBooking.value.roomTypeId || newBookingForAdmin.value.roomTypeId;

        if (roomTypeId) {
            try {
                // Fetch room type details and available rooms using the show endpoint
                const response = await axios.get(`${apiUrl}/api/rooms/${roomTypeId}`)
                console.log('Room type response:', response.data)

                // Extract available rooms from the response
                if (response.data && response.data.available_rooms) {
                    // Filter only available rooms
                    availableRooms.value = response.data.available_rooms.filter(room =>
                        room.status === 'available' || room.status === 'Available'
                    )
                } else {
                    console.warn('No available_rooms in response:', response.data)
                    availableRooms.value = []
                }

                console.log('Available rooms set to:', availableRooms.value)
            } catch (error) {
                console.error('Error fetching available rooms:', error)

                // Fallback: filter from all rooms using admin endpoint
                try {
                    console.log('Trying fallback: filtering from admin rooms')
                    const allRoomsResponse = await axios.get(`${apiUrl}/api/admin/rooms`)
                    const allRooms = Array.isArray(allRoomsResponse.data) ? allRoomsResponse.data : allRoomsResponse.data.data || []

                    // Filter rooms by room type and status
                    availableRooms.value = allRooms.filter(room =>
                        room.id_room_type == roomTypeId &&
                        (room.status === 'available' || room.status === 'Available')
                    )

                    console.log('Fallback available rooms:', availableRooms.value)
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError)
                    availableRooms.value = []
                }
            }
            newBooking.value.roomId = ''
        }
    }


    const closeAddBookingModal = () => {
        showAddBookingModal.value = false
        newBooking.value = {
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            roomTypeId: '',
            roomId: '',
            checkIn: '',
            checkOut: '',
            selectedServices: [],
            selectedTaxes: [],
            discount: ''
        },
            availableRooms.value = []
        finalGrandTotal.value = 0
    }

    const submitAddBooking = async () => {
        try {
            // Validate required fields
            if (rental.value === 'daily') {
                if (!newBooking.value.customerName || !newBooking.value.customerPhone ||
                    !newBooking.value.roomId || !newBooking.value.checkIn || !newBooking.value.checkOut
                    || !newBooking.value.customerPassport) {
                    alert('Vui lòng điền đầy đủ thông tin bắt buộc')
                    return
                }
            } else {
                if (!newBooking.value.customerName || !newBooking.value.customerPhone ||
                    !newBooking.value.roomId || !newBooking.value.checkIn
                    || !newBooking.value.customerPassport) {
                    alert('Vui lòng điền đầy đủ thông tin bắt buộc')
                    return
                }
            }

            // Validate dates
            const checkIn = new Date(newBooking.value.checkIn)
            const checkOut = new Date(newBooking.value.checkOut)
            if (checkOut <= checkIn) {
                console.error('Ngày trả phòng phải sau ngày nhận phòng')
                return
            }

            const effectiveGrandTotal = finalGrandTotal.value > 0 ? finalGrandTotal.value : grandTotal.value
            const discountAmount = grandTotal.value - effectiveGrandTotal

            // Prepare booking data
            const bookingData = {
                customer_name: newBooking.value.customerName.trim(),
                customer_phone: newBooking.value.customerPhone.trim(),
                customer_email: newBooking.value.customerEmail.trim() || null,
                customer_passport: newBooking.value.customerPassport.trim(),
                id_room: newBooking.value.roomId,
                check_in: newBooking.value.checkIn,
                check_out: newBooking.value.checkOut,
                tax_amount: taxAmount.value,
                subtotal: subtotal.value,
                grand_total: effectiveGrandTotal,
                discount_total: discountAmount,
                service_charge: (servicesCost.value * bookingNights.value) || 0,
                id_tax: newBooking.value.selectedTaxes.length > 0 ? String(newBooking.value.selectedTaxes[0]) : '1',
                status: 'check-in',
                id_user: '4',
                rental: rental.value,
                // booking_type: booking_type,
                room_price: newBooking.value.roomPrice || 0,
            }

            console.log('Sending booking data:', bookingData)

            const response = await axios.post(`${apiUrl}/api/admin/bookings`, bookingData)
            console.log('Success response:', response.data)

            await fetchBookings()
            await fetchRooms() // Refresh rooms to update availability
            closeAddBookingModal()

        } catch (error) {
            console.error('Error adding booking:', error)

            if (error.response) {
                console.error('Error response:', error.response.data)
                console.error('Error status:', error.response.status)

                if (error.response.status === 422) {
                    const validationErrors = error.response.data.errors || error.response.data
                    let errorMessage = 'Lỗi validation:\n'

                    if (typeof validationErrors === 'object') {
                        Object.keys(validationErrors).forEach(key => {
                            errorMessage += `- ${key}: ${validationErrors[key].join(', ')}\n`
                        })
                    } else {
                        errorMessage += JSON.stringify(validationErrors, null, 2)
                    }

                    console.error(errorMessage)
                } else {
                    console.error(`Lỗi: ${error.response.data.message || 'Không thể tạo đặt phòng'}`)
                }
            } else if (error.request) {
                console.error('Error request:', error.request)
                console.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
            } else {
                console.error('Error message:', error.message)
                console.error(`Lỗi: ${error.message}`)
            }
        }
    }



    const submitAddBookingAdmin = async () => {
        try {
            const booking = {
                id_room: newBookingForAdmin.value.roomId,
                customer_name: 'admin',
                customer_phone: '',
                customer_email: '',
                customer_passport: 'admin',
                check_in: newBookingForAdmin.value.checkIn,
                check_out: '',
                tax_amount: '0',
                subtotal: '0',
                grand_total: '0',
                discount_total: '0',
                service_charge: '0',
                id_tax: '1',
                status: 'success',
                id_user: '1',
                booking_type: 'daily'
            }

            const response = await axios.post(`${apiUrl}/api/admin/bookings`, booking)
            console.log('Success response:', response.data)

            await fetchBookings()
            await fetchRooms()
            closeAddBookingForAdminModal()

        } catch (error) {
            console.error('Error adding booking:', error)

            if (error.response) {
                console.error('Error response:', error.response.data)
                console.error('Error status:', error.response.status)

                if (error.response.status === 422) {
                    const validationErrors = error.response.data.errors || error.response.data
                    let errorMessage = 'Lỗi validation:\n'

                    if (typeof validationErrors === 'object') {
                        Object.keys(validationErrors).forEach(key => {
                            errorMessage += `- ${key}: ${validationErrors[key].join(', ')}\n`
                        })
                    } else {
                        errorMessage += JSON.stringify(validationErrors, null, 2)
                    }

                    console.error(errorMessage)
                } else {
                    console.error(`Lỗi: ${error.response.data.message || 'Không thể tạo đặt phòng'}`)
                }
            } else if (error.request) {
                console.error('Error request:', error.request)
                console.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
            } else {
                console.error('Error message:', error.message)
                console.error(`Lỗi: ${error.message}`)
            }
        }
    }

    const deleteBooking = async (bookingId) => {

        if (confirm('Bạn có chắc muốn xóa đặt phòng này?')) {
            try {
                await axios.delete(`${apiUrl}/api/admin/bookings/${bookingId}`)
                await fetchBookings()
            } catch (error) {
                console.error('Error deleting booking:', error)
            }
        }
    }

    const printThermalBill = async (bookingId) => {
        try {
            const api = `${apiUrl}/api/booking/` + bookingId + '/thermal-bill'
            const response = await fetch(api)
            const data = await response.json()

            if (data.success) {
                const printWindow = window.open('', '_blank', 'width=1000,height=1000')

                printWindow.document.write('<!DOCTYPE html>')
                printWindow.document.write('<html><head>')
                printWindow.document.write('<title>Hóa Đơn Khách Sạn</title>')
                printWindow.document.write('<meta charset="UTF-8">')
                printWindow.document.write('<style>')
                printWindow.document.write('body { font-family: monospace; font-size: 12px; margin: 20px; }')
                printWindow.document.write('.bill { white-space: pre-wrap; }')
                printWindow.document.write('@media print { body { margin: 0; } }')
                printWindow.document.write('</style>')
                printWindow.document.write('</head><body>')
                printWindow.document.write('<div class="bill">')
                printWindow.document.write(data.thermal_bill)
                printWindow.document.write('</div>')
                setTimeout(function () { printWindow.print(); }, 500)
                printWindow.document.write('</body></html>')

                printWindow.document.close()

            } else {
                throw new Error(data.error || 'Không thể tạo hóa đơn')
            }

        } catch (error) {
            console.error('Error printing thermal bill:', error)
        }
    }

    // Food to Booking Methods
    const addFoodToBooking = async (bookingId) => {
        selectedBookingId.value = bookingId

        try {
            // Fetch existing foods for this booking
            const response = await axios.get(`${apiUrl}/api/admin/booking/${bookingId}/foods`)
            const existingFoods = response.data.foods || []

            // Initialize food items with existing quantities or 0
            selectedFoodItems.value = foods.value.map(food => ({
                ...food,
                quantity: existingFoodMap[food.id] || 0,
                hasExisting: !!existingFoodMap[food.id] // Flag to indicate if food already exists
            }))

            showAddFoodToBookingModal.value = true
        } catch (error) {
            console.error('Error fetching booking foods:', error)
            // Fallback: Initialize with quantity 0
            selectedFoodItems.value = foods.value.map(food => ({
                ...food,
                quantity: 0,
                hasExisting: false
            }))
            showAddFoodToBookingModal.value = true
        }
    }

    const closeAddFoodToBookingModal = () => {
        showAddFoodToBookingModal.value = false
        selectedBookingId.value = null
        selectedFoodItems.value = []
    }

    const submitFoodToBooking = async () => {
        try {
            // Send all foods with their quantities (including 0 to delete)
            // Only send foods that have changed from their original state
            const foodsToUpdate = selectedFoodItems.value
                .filter(item => {
                    // Include items that either have quantity > 0 OR had existing quantity
                    return item.quantity > 0 || item.hasExisting
                })
                .map(item => ({
                    id_food: item.id,
                    amount: item.quantity
                }))

            if (foodsToUpdate.length === 0) {
                console.log('Không có thay đổi nào')
                closeAddFoodToBookingModal()
                return
            }

            const response = await axios.post(`${apiUrl}/api/admin/update-invoice-foods`, {
                id_booking: selectedBookingId.value,
                foods: foodsToUpdate
            })


            if (response.data.success) {
                console.log(`${response.data.message}\nTổng tiền thức ăn: ${formatCurrency(response.data.total_food_cost)}\nTổng hóa đơn mới: ${formatCurrency(response.data.new_grand_total)}`)
                await fetchBookings() // Refresh bookings to show updated total
                closeAddFoodToBookingModal()
            } else {
                console.log('Có lỗi xảy ra khi cập nhật thức ăn')
            }
        } catch (error) {
            console.error('Error updating food to booking:', error)
            console.log(`Lỗi: ${error.response?.data?.error || error.message}`)
        }
    }

    const applyDiscount = () => {
        const discountPercent = parseFloat(newBooking.value.discount) || 0

        if (discountPercent < 0 || discountPercent > 100) {
            console.log('Giảm giá phải từ 0% đến 100%')
            return
        }

        // Tính tổng tiền gốc (chưa giảm)
        const originalTotal = grandTotal.value

        // Tính grand total sau giảm giá và lưu vào finalGrandTotal
        finalGrandTotal.value = originalTotal * (1 - discountPercent / 100)

        console.log(`Giảm ${discountPercent}%: ${originalTotal} → ${finalGrandTotal.value}`)
    }

    // Filtered bookings based on search query
    const filteredBookings = computed(() => {
        if (!searchQuery.value.trim()) return bookings.value
        const query = searchQuery.value.toLowerCase().trim()
        return bookings.value.filter(booking => {
            const roomNumber = String(booking.room_number || '').toLowerCase()
            const customerName = String(booking.name || '').toLowerCase()
            return roomNumber.includes(query) || customerName.includes(query)
        })
    })

    const paginatedBookings = computed(() => {
        const start = (currentPageBookings.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredBookings.value.slice(start, end)
    })

    const totalPagesBookings = computed(() => {
        return Math.ceil(filteredBookings.value.length / itemsPerPage)
    })

    const changePage = (section, page) => {
        if (section === 'bookings' && page >= 1 && page <= totalPagesBookings.value) {
            currentPageBookings.value = page
        }
    }

    const goToFirstPage = (section) => {
        if (section === 'bookings') {
            changePage(section, 1)
        }
    }

    const goToLastPage = (section) => {
        if (section === 'bookings') {
            changePage(section, totalPagesBookings.value)
        }
    }

    const goToPreviousPage = (section) => {
        if (section === 'bookings') {
            changePage(section, currentPageBookings.value - 1)
        }
    }

    const goToNextPage = (section) => {
        if (section === 'bookings') {
            changePage(section, currentPageBookings.value + 1)
        }
    }


    return {
        //state
        bookings,
        services,
        taxes,
        foods,
        roomTypes,
        rooms,
        selectedBookingId,
        selectedFoodItems,
        rental,
        showAddBookingModal,
        showAddFoodToBookingModal,
        showAddBookingForAdminModal,
        availableRooms,
        itemsPerPage,
        currentPageBookings,
        searchQuery,
        BookingNameInput,
        finalGrandTotal,

        // computed
        selectedRoomType,
        bookingNights,
        isHourlyRental,
        roomCost,
        servicesCost,
        subtotal,
        taxAmount,
        grandTotal,
        filteredBookings,
        paginatedBookings,
        totalPagesBookings,

        // fetch & method
        openAddBookingModal,
        openAddBookingForAdmin,
        closeAddBookingForAdminModal,
        formatCurrency,
        formatDate,
        clickChangeRental,
        fetchBookings,
        fetchServices,
        fetchFoods,
        fetchRoomTypes,
        fetchTaxes,
        fetchRooms,
        changeBookingStatus,
        deleteBooking,
        printThermalBill,
        addFoodToBooking,
        closeAddFoodToBookingModal,
        submitFoodToBooking,
        applyDiscount,
        changePage,
        goToFirstPage,
        goToLastPage,
        goToPreviousPage,
        goToNextPage
    }
})