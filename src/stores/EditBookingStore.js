import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { apiUrl } from '@/environment'

export const useEditBookingStore = defineStore('edit-booking-modal', () => {
    // Refs
    const editBookingNameInput = ref(null)
    const editBookings = ref({
        id: null,
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerPassport: '',
        selectedServices: [],
        selectedTaxes: [],
        roomTypeId: '',
        roomId: '',
        roomNumber: '',
        checkIn: '',
        checkOut: '',
        roomPrice: 0
    })
    const bookingDetail = ref({})
    const availableRooms = ref([])
    const newCost = ref(0)
    const earlyCheckOutCost = ref(0)
    const newCostToChange = ref(0)
    const taxes = ref([])
    const finalGrandTotal = ref(0)
    const isEdit = ref(false)
    const roomTypes = ref([])
    const services = ref([])
    const originalRoomTypeId = ref(null) // Lưu room type gốc khi load lần đầu
    const roomTypeChanged = ref(false) // Flag đánh dấu khi user đổi loại phòng

    // Computed Properties
    const selectedRoomType = computed(() => {
        console.log("đổi phòng: ", editBookings.value.roomTypeId);
        return roomTypes.value.find(rt => rt.id == editBookings.value.roomTypeId) || null
    })

    const isHourlyRental = computed(() => {
        const result = selectedRoomType.value?.type === 'hourly'
        console.log("isHourlyRental updated:", result, "roomType:", selectedRoomType.value?.name)
        return result
    })

    // Số ngày đã ở (từ check_in đến hôm nay)
    const daysStayed = computed(() => {
        if (!bookingDetail.value.booking?.check_in) return 0
        const checkIn = new Date(bookingDetail.value.booking.check_in)
        const today = new Date()

        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const diffTime = todayDate - checkInDate
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
    })

    // Số ngày còn lại (từ hôm nay đến check_out)
    const daysRemaining = computed(() => {
        if (!editBookings.value.checkOut) return 0
        const today = new Date()
        const checkOut = new Date(editBookings.value.checkOut)

        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

        const diffTime = checkOutDate - todayDate
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
    })

    // Chi phí đã ở (giá cũ × số ngày đã ở)
    const oldRoomCostStayed = computed(() => {
        const oldPrice = bookingDetail.value.invoice?.room_price || bookingDetail.value.roomType?.base_price || 0
        return oldPrice * daysStayed.value
    })

    const bookingNightChange = computed(() => {
        if (!isEdit.value || !bookingDetail.value.booking) return 0
        const checkIn = new Date(editBookings.value.checkOut.trim() == '' ? (bookingDetail.value.booking?.check_in ?? '') : (bookingDetail.value.booking?.check_out ?? ''))
        const checkOut = new Date(editBookings.value.checkOut.trim() == '' ? (bookingDetail.value.booking?.check_out ?? '') : editBookings.value.checkOut)

        // Normalize to date only (remove time component) for proper night calculation
        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

        const diffTime = checkOutDate - checkInDate
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
    })

    // Số đêm tính từ check_in đến check_out trong form
    const bookingNights = computed(() => {
        if (!editBookings.value.checkIn || !editBookings.value.checkOut) return 0
        const checkIn = new Date(editBookings.value.checkIn)
        const checkOut = new Date(editBookings.value.checkOut)

        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

        const diffTime = checkOutDate - checkInDate
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
    })

    // Số đêm tính từ check_in đến check_out trong DB
    const countLastChange = computed(() => {
        if (!isEdit.value || !bookingDetail.value.booking) return 0
        const checkIn = new Date(bookingDetail.value.booking?.check_in ?? '')
        const checkOut = new Date(bookingDetail.value.booking?.check_out ?? '')

        // Normalize to date only (remove time component) for proper night calculation
        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())

        const diffTime = checkOutDate - checkInDate
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        return diffDays > 0 ? diffDays : 0
    })

    const roomCost = computed(() => {
        if (!isEdit.value || !bookingDetail.value.invoice) return 0

        // giờ
        if (isHourlyRental.value && (bookingDetail.value.invoice?.room_price ?? 0) > 0) {
            return bookingDetail.value.invoice?.room_price ?? 0
        } else if (isHourlyRental.value) {
            return bookingDetail.value.roomType?.base_price ?? 0
        }

        // ngày
        //Gia hạn thêm ngày
        if (isEdit.value && newCost.value > 0) {
            return newCost.value
        }

        // nếu đổi phòng từ ngày đầu và đổi phòng giữa chừng
        if (roomTypeChanged.value) {
            if (daysStayed.value == 0) {
                const newPrice = editBookings.value.roomPrice > 0
                    ? editBookings.value.roomPrice
                    : selectedRoomType.value?.base_price || 0
                return newPrice * bookingNights.value
            }
            return oldRoomCostStayed.value + newCostToChange.value
        }

        // nếu trả phòng sớm 
        if (earlyCheckOutCost.value > 0) {
            return earlyCheckOutCost.value
        }

        return (editBookings.value.roomPrice > 0 ? editBookings.value.roomPrice : bookingDetail.value.roomType.base_price) * bookingNights.value
    })

    const taxAmount = computed(() => {
        if (earlyCheckOutCost.value > 0) {
            return earlyCheckOutCost.value * bookingDetail.value.tax.rate / 100
        }

        if (newCost.value > 0) {
            return ((bookingNightChange.value * (bookingDetail.value.roomType?.base_price ?? 0)) * (bookingDetail.value.tax?.rate ?? 0) / 100)
        }

        if (roomTypeChanged.value && daysStayed.value > 0) {
            const oldTaxRate = bookingDetail.value.tax?.rate || 0
            const newTaxRate = editBookings.value.selectedTaxes.reduce((total, taxId) => {
                const tax = taxes.value.find(t => t.id == taxId)
                return tax ? tax.rate : 0
            }, 0)
            // Thuế cho phần đã ở (phòng cũ)
            const oldTax = oldRoomCostStayed.value * oldTaxRate / 100

            // Thuế cho phần còn lại (phòng mới)  
            const newTax = newCostToChange.value * newTaxRate / 100

            return oldTax + newTax
        }

        return editBookings.value.selectedTaxes.reduce((total, taxId) => {
            const tax = taxes.value.find(t => t.id == taxId)
            if (tax) {
                return total + ((editBookings.value.roomPrice > 0 ? editBookings.value.roomPrice : selectedRoomType.value?.base_price * bookingNights.value) * tax.rate / 100)
            }
            return total
        }, 0)
    })

    const servicesCost = computed(() => {
        if (isEdit.value && newCost.value > 0) {
            return editBookings.value.selectedServices.reduce((total, serviceId) => {
                const service = services.value.find(s => s.id == serviceId)
                return total + (service ? service.price : 0)
            }, 0)
        }

        if (isEdit.value && earlyCheckOutCost.value > 0) {
            // Check-out sớm: chỉ tính dịch vụ cho số ngày ĐÃ Ở
            // daysStayed = số ngày từ check_in đến hôm nay
            const ServiceChange = bookingDetail.value.invoice?.service_charge || 0
            const originalNight = countLastChange.value || 1

            return (ServiceChange / originalNight) * daysStayed.value
        }

        if (isEdit.value && roomTypeChanged.value) {
            return editBookings.value.selectedServices.reduce((total, serviceId) => {
                const service = services.value.find(s => s.id == serviceId)
                return total + (service ? service.price : 0) * bookingNights.value
            }, 0)
        }

        if (isEdit.value && newCost.value === 0) {
            // nếu thêm dịch vụ nhưng không thêm ngày, sẽ lấy số ngày từ ngày hiện tại đến ngày checkout nhân với giá dịch vụ
            const dateNow = new Date()
            const checkInDate = bookingDetail.value.booking?.check_in
            if (!checkInDate) return 0

            const dayDB = new Date(checkInDate)

            if (dayDB.getDate() < dateNow.getDate()) {
                const checkOutDate = bookingDetail.value.booking?.check_out
                if (!checkOutDate) return 0

                const checkOut = new Date(checkOutDate)
                const diffTime = checkOut.getDate() - dateNow.getDate()

                return editBookings.value.selectedServices.reduce((total, serviceId) => {
                    const service = services.value.find(s => s.id == serviceId)
                    return total + (service ? service.price : 0) * diffTime
                }, 0)
            }

            return editBookings.value.selectedServices.reduce((total, serviceId) => {
                const service = services.value.find(s => s.id == serviceId)
                return total + ((service ? service.price : 0) * (countLastChange.value + bookingNightChange.value))
            }, 0)
        }
        return 0
    })

    const subtotal = computed(() => {
        if (isEdit.value && newCost.value > 0) return roomCost.value
        if (isEdit.value && newCostToChange > 0) return roomCost.value + newCostToChange.value
        return roomCost.value
    })

    const grandTotal = computed(() => {
        if (isEdit.value && bookingDetail.value.invoice && bookingDetail.value.booking) {

            if (earlyCheckOutCost.value > 0) {
                return servicesCost.value + taxAmount.value + subtotal.value
            }

            if (editBookings.value.checkOut != bookingDetail.value.booking.check_out && newCost.value > 0) {
                return (bookingDetail.value.invoice.grand_total ?? 0) + subtotal.value + (servicesCost.value * bookingNightChange.value) + taxAmount.value
            } else if (roomTypeChanged.value) {
                return servicesCost.value + taxAmount.value + subtotal.value + bookingDetail.value.invoice?.service_charge
            } else {
                return (bookingDetail.value.invoice.grand_total ?? 0) + servicesCost.value
            }

        }
        return 0
    })

    // Actions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const calculateTimeDiff = (day1) => {
        const dateNew = new Date(day1.replace(' ', 'T'));
        const y = dateNew.getFullYear();
        const m = String(dateNew.getMonth() + 1).padStart(2, '0');
        const d = String(dateNew.getDate()).padStart(2, '0');
        const hh = String(dateNew.getHours()).padStart(2, '0');
        const mm = String(dateNew.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d} ${hh}:${mm}`;
    }

    const fetchBookingDetail = async (bookingId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/admin/bookings/${bookingId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching booking detail:', error)
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

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/services`)
            services.value = response.data
        } catch (error) {
            console.error('Error fetching services:', error)
        }
    },

        fetchTaxes = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/taxes')
                taxes.value = response.data
            } catch (error) {
                console.error('Error fetching taxes:', error)
            }
        }

    const onRoomTypeChange = async () => {
        if (editBookings.value.roomTypeId) {
            try {
                const response = await axios.get(`${apiUrl}/api/rooms/${editBookings.value.roomTypeId}`)
                if (response.data && response.data.available_rooms) {
                    availableRooms.value = response.data.available_rooms.filter(room =>
                        room.status === 'available' || room.status === 'Available' || room.id == editBookings.value.roomId || room.room_number == editBookings.value.roomNumber && room.status == 'checked_in'
                    )
                    const findSameNumber = availableRooms.value.find(room => room.room_number == editBookings.value.roomNumber)
                    if (findSameNumber) {
                        editBookings.value.roomId = findSameNumber.id
                    }
                } else {
                    availableRooms.value = []
                }
            } catch (error) {
                console.error('Error fetching available rooms:', error)
                try {
                    const allRoomsResponse = await axios.get(`${apiUrl}/api/admin/rooms`)
                    const allRooms = Array.isArray(allRoomsResponse.data) ? allRoomsResponse.data : allRoomsResponse.data.data || []
                    availableRooms.value = allRooms.filter(room =>
                        room.id_room_type == editBookings.value.roomTypeId &&
                        (room.status === 'available' || room.status === 'Available')
                    )
                } catch (fallbackError) {
                    availableRooms.value = []
                }
            }
        } else {
            availableRooms.value = []
        }
    }

    const resetStore = () => {
        editBookings.value = {
            id: null,
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            customerPassport: '',
            selectedServices: [],
            roomTypeId: '',
            roomId: '',
            checkIn: '',
            checkOut: '',
            roomPrice: 0
        }
        bookingDetail.value = {}
        availableRooms.value = []
        newCost.value = 0
        newCostToChange.value = 0
        finalGrandTotal.value = 0
        isEdit.value = false
        earlyCheckOutCost.value = 0
        roomTypeChanged.value = false
    }

    const submitEditBooking = async () => {
        try {
            const booking_type = selectedRoomType.value.type
            const bookingData = {
                customer_name: editBookings.value.customerName.trim(),
                customer_phone: editBookings.value.customerPhone.trim(),
                customer_email: editBookings.value.customerEmail?.trim() || null,
                customer_passport: editBookings.value.customerPassport.trim(),
                id_room: editBookings.value.roomId,
                room_number: editBookings.value.roomNumber,
                check_out: calculateTimeDiff(editBookings.value.checkOut),
                tax_amount: taxAmount.value,
                subtotal: subtotal.value,
                grand_total: grandTotal.value,
                service_charge: servicesCost.value || 0,
                booking_type: booking_type,
                room_price: editBookings.value.roomPrice,
            }

            await axios.post(`${apiUrl}/api/admin/update-booking/${editBookings.value.id}`, bookingData)
            resetStore()
            return true // Indicate success
        } catch (error) {
            console.log(error)
            return false
        }
    }

    const loadBookingData = async (bookingId) => {
        isEdit.value = true
        bookingDetail.value = await fetchBookingDetail(bookingId)
        if (bookingDetail.value) {
            editBookings.value.id = bookingDetail.value.booking.id
            editBookings.value.customerName = bookingDetail.value.customer.name
            editBookings.value.customerPhone = bookingDetail.value.customer.phone
            editBookings.value.customerEmail = bookingDetail.value.customer.email
            editBookings.value.customerPassport = bookingDetail.value.customer.passport
            editBookings.value.roomTypeId = bookingDetail.value.roomType.id
            editBookings.value.roomId = bookingDetail.value.room.id
            editBookings.value.roomNumber = bookingDetail.value.room.room_number
            editBookings.value.checkIn = bookingDetail.value.booking.check_in
            editBookings.value.checkOut = bookingDetail.value.booking.check_out
            editBookings.value.roomPrice = bookingDetail.value.invoice.room_price
            // Lưu room type gốc và reset flag
            originalRoomTypeId.value = bookingDetail.value.roomType.id
            roomTypeChanged.value = false

            // Gọi onRoomTypeChange 1 lần duy nhất khi load dữ liệu để lấy phòng hiện tại
            await onRoomTypeChange()
        }
    }

    // Watchers
    watch(editBookings, (newValue) => {
        if (isEdit.value && bookingDetail.value.booking) {
            const dateInput = new Date(editBookings.value.checkOut)
            const checkOutDate = new Date(bookingDetail.value.booking?.check_out)
            const checkInDate = new Date(bookingDetail.value.booking?.check_in)

            const iputDate = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate())
            const checkOutDateDB = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate())
            const checkInDateDB = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate())

            const dayDB = new Date(checkOutDate)

            if (checkOutDateDB.getTime() < iputDate.getTime()) {
                // Gia hạn thêm ngày
                newCost.value = (bookingNightChange.value * (bookingDetail.value.roomType?.base_price ?? 0))
            } else if (checkOutDateDB.getTime() > iputDate.getTime()) {
                // trả phòng sớm
                earlyCheckOutCost.value = daysStayed.value * (editBookings.value.roomPrice > 0 ? editBookings.value.roomPrice : bookingDetail.value.roomType?.base_price ?? 0)

            } else if (iputDate.getTime() > checkInDateDB.getTime() && roomTypeChanged.value) {
                // Đổi phòng giữa chừng
                // Chi phí phòng mới cho ngày còn lại
                if (editBookings.value?.roomPrice > 0) {
                    newCostToChange.value = (daysRemaining.value * (editBookings.value.roomPrice))
                } else {
                    newCostToChange.value = (daysRemaining.value * (bookingDetail.value.roomType?.base_price ?? 0))
                }
            }

        }
    }, { immediate: true, deep: true })

    // Watcher riêng để theo dõi khi user đổi loại phòng
    watch(() => editBookings.value.roomTypeId, (newRoomTypeId, oldRoomTypeId) => {
        if (isEdit.value && originalRoomTypeId.value && newRoomTypeId !== originalRoomTypeId.value) {
            console.log('✅ Room type changed from', oldRoomTypeId, 'to', newRoomTypeId)
            roomTypeChanged.value = true
        } else if (newRoomTypeId === originalRoomTypeId.value) {
            console.log("❌ Không thay đổi - về lại room type gốc");
            roomTypeChanged.value = false
        } else {
            console.log('⚠️ Điều kiện không match')
        }
    })

    return {
        // State
        editBookingNameInput,
        editBookings,
        bookingDetail,
        availableRooms,
        newCost,
        earlyCheckOutCost,
        newCostToChange,
        taxes,
        finalGrandTotal,
        isEdit,
        roomTypes,
        services,
        originalRoomTypeId,
        roomTypeChanged,

        // Computed
        selectedRoomType,
        isHourlyRental,
        daysStayed,
        daysRemaining,
        oldRoomCostStayed,
        bookingNightChange,
        bookingNights,
        countLastChange,
        roomCost,
        taxAmount,
        servicesCost,
        subtotal,
        grandTotal,

        // Methods
        formatCurrency,
        fetchBookingDetail,
        fetchRoomTypes,
        fetchServices,
        fetchTaxes,
        onRoomTypeChange,
        resetStore,
        submitEditBooking,
        loadBookingData
    }
})