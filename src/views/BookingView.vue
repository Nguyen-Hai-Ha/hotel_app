<template>
  <div class="booking-page">
    <div class="booking-container">
      <div class="main-content">
        <!-- <div class="steps">
          <div class="step is-complete">1. Chọn phòng</div>
          <div class="step is-complete">2. Tiện ích bổ sung</div>
          <div class="step is-active">3. Thông tin của bạn</div>
          <div class="step">4. Thanh toán</div>
        </div> -->

        <div class="headline">
          <h1>{{ $t('checkout.title') }}</h1>
          <p>{{ $t('checkout.subtitle') }}</p>
        </div>

        <section class="panel">
          <header class="panel-header">
            <h2>{{ $t('checkout.contact.header') }}</h2>
            <span class="sub">{{ $t('checkout.contact.sub') }}</span>
          </header>

          <form @submit.prevent="onSubmit">
            <div class="form-row">
              <div class="form-group">
                <label for="first-name">{{ $t('checkout.labels.fullName') }}</label>
                <input v-model.trim="form.firstName" type="text" id="first-name" name="name"
                  :placeholder="$t('checkout.placeholders.fullName')" autocomplete="given-name">
                <small v-if="errors.firstName" class="error">{{ errors.firstName }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">{{ $t('checkout.labels.email') }}</label>
                <input v-model.trim="form.email" type="email" id="email" name="email" autocomplete="email">
                <small v-if="errors.email" class="error">{{ errors.email }}</small>
              </div>
              <div class="form-group">
                <label for="phone">{{ $t('checkout.labels.phone') }}</label>
                <input v-model.trim="form.phone" type="tel" id="phone" name="phone"
                  :placeholder="$t('checkout.placeholders.phone')" autocomplete="tel">
                <small v-if="errors.phone" class="error">{{ errors.phone }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="country">{{ $t('checkout.labels.country') }}</label>
                <select v-model="form.country" id="country" name="country">
                  <option value="">{{ $t('checkout.labels.selectCountry') }}</option>
                  <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="requests">{{ $t('checkout.labels.address') }}</label>
                <input v-model.trim="form.requests" name="address" type="text" id="requests" placeholder="">
                <small v-if="errors.requests" class="error">{{ errors.requests }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="note">{{ $t('checkout.labels.note') }}</label>
                <input v-model.trim="form.note" type="text" id="note" name="note"
                  :placeholder="$t('checkout.placeholders.note')">
              </div>
            </div>
            <input type="date" name="checkin" hidden :value="formatDateForAPI(summary.checkIn)">
            <input type="date" name="checkout" hidden :value="formatDateForAPI(summary.checkOut)">
            <input type="date" name="id_room" hidden :value="summary.selectedRoomId">
            <input type="date" name="number_room" hidden :value="summary.selectedRoomNumber">
            <input type="text" name="grandtotal" hidden :value="totalPrice">
            <input type="text" name="subtotal" hidden :value="summary.priceRoom">
            <input type="text" name="discounttotal" hidden :value="(summary.discount || 0)">
            <input type="text" name="status" hidden :value="statusText">

          </form>
        </section>

        <section class="panel">
          <header class="panel-header">
            <h2>{{ $t('checkout.payment.header') }}</h2>
            <span class="sub">{{ $t('checkout.payment.sub') }}</span>
          </header>

          <div class="payment-options">
            <label class="radio-card">
              <input type="radio" name="payMethod" value="card" v-model="form.paymentMethod">
              <div class="content">
                <div class="title">{{ $t('checkout.payment.cardTitle') }}</div>
                <div class="desc">{{ $t('checkout.payment.cardDesc') }}</div>
              </div>
            </label>
            <label class="radio-card">
              <input type="radio" name="payMethod" value="later" v-model="form.paymentMethod">
              <div class="content">
                <div class="title">{{ $t('checkout.payment.hotelTitle') }}</div>
                <div class="desc">{{ $t('checkout.payment.hotelDesc') }}</div>
              </div>
            </label>
          </div>

          <div class="card-fields" v-if="form.paymentMethod === 'card'">
            <div class="form-row">
              <div class="form-group">
                <label for="cardNumber">{{ $t('checkout.cardFields.number') }}</label>
                <input v-model.trim="form.cardNumber" id="cardNumber" inputmode="numeric"
                  placeholder="1234 5678 9012 3456">
                <small v-if="errors.cardNumber" class="error"></small>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="cardName">{{ $t('checkout.cardFields.name') }}</label>
                <input v-model.trim="form.cardName" id="cardName" placeholder="NGUYEN VAN A">
                <small v-if="errors.cardName" class="error"></small>
              </div>
              <div class="form-group">
                <label for="expiry">{{ $t('checkout.cardFields.expiry') }}</label>
                <input v-model.trim="form.expiry" id="expiry" placeholder="MM/YY" maxlength="5">
                <small v-if="errors.expiry" class="error"></small>
              </div>
              <div class="form-group">
                <label for="cvc">{{ $t('checkout.cardFields.cvc') }}</label>
                <input v-model.trim="form.cvc" id="cvc" placeholder="123" maxlength="4">
                <small v-if="errors.cvc" class="error"></small>
              </div>
            </div>
          </div>

          <!-- <div class="policy">
            <p>Nhấn "Hoàn tất đặt phòng" nghĩa là bạn đồng ý với điều khoản và chính sách huỷ.</p>
          </div> -->

          <div class="actions" v-if="form.paymentMethod === 'card'">
            <button class="btn btn-primary" @click="onSubmit">
              {{ $t('checkout.actions.completeBooking') }}
            </button>
          </div>
          <div class="actions" v-else>
            <button class="btn btn-primary" name="redirect" @click="makedeposit">
              {{ $t('checkout.actions.makeDeposit') }}
            </button>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <h2>{{ $t('checkout.policy.header') }}</h2>
          </header>
          <ul class="bullets">
            <!-- <li>Huỷ miễn phí trước 23:59 ngày {{ policy.freeCancelUntil }}.</li> -->
            <li>Nhận phòng: {{ policy.checkIn }}, Trả phòng: {{ policy.checkOut }}.</li>
          </ul>
        </section>
      </div>

      <aside class="sidebar">
        <div class="booking-summary sticky">
          <div class="hotel-meta">
            <img :src="'/images/' + summary.roomImg" class="thumb" alt="Room thumbnail">
            <div>
              <h3 class="hotel-name">{{ summary.roomName || $t('checkout.sidebar.selectedRoomFallback') }} - {{
                summary.selectedRoomNumber }}</h3>
              <div class="badge">{{ $t('checkout.sidebar.badge') }}</div>
            </div>
          </div>

          <div class="dates">
            <div>
              <div class="label">{{ $t('checkout.dates.checkIn') }}</div>
              <div class="value">{{ summary.checkIn }}</div>
            </div>
            <div>
              <div class="label">{{ $t('checkout.dates.checkOut') }}</div>
              <div class="value">{{ summary.checkOut }}</div>
            </div>
            <div>
              <div class="label">{{ $t('checkout.dates.stayLength') }}</div>
              <div class="value">{{ summary.nights }} {{ $t('checkout.dates.nights') }}</div>
            </div>
          </div>

          <div class="coupon">
            <input v-model.trim="couponCode" :placeholder="$t('checkout.coupon.placeholder')">
            <button class="btn btn-outline" @click="applyCoupon">{{ $t('checkout.coupon.apply') }}</button>
          </div>

          <div class="price-details">
            <div class="row">
              <span>{{ $t('checkout.pricing.roomPrice') }}</span>
              <span>{{ money(summary.priceRoom) }}</span>
            </div>
            <div class="row">
              <span>{{ $t('checkout.pricing.servicePerDay') }}</span>
              <span>{{ money(summary.service) }}</span>
            </div>
            <div class="row">
              <span>{{ $t('checkout.pricing.taxes') }}</span>
              <span>{{ money(summary.priceTax) }}</span>
            </div>
            <div class="row" v-if="summary.discount > 0">
              <span>{{ $t('checkout.pricing.discount') }}</span>
              <span class="discount" v-if="promotion.type === 'fixed'">-{{ money(summary.discount) }}</span>
              <span class="discount" v-else>-{{ summary.discount }}%</span>
            </div>
            <hr>
            <div class="row total" v-if="form.paymentMethod === 'card'">
              <span>{{ $t('checkout.pricing.total') }}</span>
              <span>{{ money(totalPrice) }}</span>
            </div>
            <div class="row total" v-else>
              <span>{{ $t('checkout.pricing.deposit30') }}</span>
              <span>{{ money((totalPrice) * (30 / 100)) }}</span>
            </div>
          </div>
          <div class="QR-code">

            <img src="/images/QR.jpg" alt="" width="200" height="200">
            <p>{{ $t('checkout.qr.note') }}</p>
            <p v-if="form.paymentMethod === 'card'">{{ $t('checkout.qr.cardText', summary.selectedRoomNumber + '-' +
              summary.roomName) }}</p>
            <p v-else>{{ $t('checkout.qr.depositText', summary.selectedRoomNumber + '-' + summary.roomName) }}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { apiUrl } from '@/environment'

export default {
  name: 'Booking',
  setup() {
    const route = useRoute()
    const router = useRouter()


    // State
    const IduserToken = JSON.parse(localStorage.getItem('user'))
    const Iduser = IduserToken ? IduserToken.id : null

    const summary = ref({
      roomName: route.query.roomName || '',
      roomImg: route.query.roomImg || '',
      selectedRoomId: route.query.selectedRoomId || '',
      selectedRoomNumber: route.query.selectedRoomNumber || '',
      checkIn: '',
      checkOut: '',
      service: parseInt(route.query.service) || 0,
      nights: 0,
      priceRoom: parseInt(route.query.priceRoom) || 0,
      priceTax: parseInt(route.query.priceTax) || 0,
      discount: parseInt(route.query.discount) || 0,
    })

    const countries = ref([])
    const policy = ref({
      freeCancelUntil: '',
      checkIn: '',
      checkOut: ''
    })
    const form = ref({
      firstName: '',
      email: '',
      phone: '',
      country: '',
      requests: '',
      note: '',
      number_room: route.query.selectedRoomNumber || '',
      id_room: route.query.selectedRoomId || '',
      paymentMethod: 'later',
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: '',
      id_user: Iduser
    })
    const errors = ref({})
    const couponCode = ref('')

    // Promotion
    const promotion = ref({
      type: 'percentage',
      value: 0
    })

    // Taxes
    const tax = ref([])
    const loading = ref(false)

    // ✅ Trạng thái thanh toán theo phương thức
    const statusText = computed(() => form.value.paymentMethod === 'card' ? 'success' : 'deposited')

    // ✅ Tổng giá
    const totalPrice = computed(() => {
      const subtotal = summary.value.priceRoom + summary.value.priceTax + (summary.value.service * summary.value.nights)
      if (promotion.value.type === "fixed") {
        return Math.max(0, subtotal - summary.value.discount)
      } else {
        return Math.max(0, subtotal * (1 - summary.value.discount / 100))
      }
    })

    // ✅ Format tiền
    const money = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    // ✅ Format ngày để hiển thị
    const formatDateForDisplay = (date) => {
      const days = ['Chủ nhật', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']
      const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6',
        'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12']
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    // ✅ Format ngày để gửi API
    const formatDateForAPI = (dateStr) => {
      const months = {
        'Thg 1': '01', 'Thg 2': '02', 'Thg 3': '03', 'Thg 4': '04',
        'Thg 5': '05', 'Thg 6': '06', 'Thg 7': '07', 'Thg 8': '08',
        'Thg 9': '09', 'Thg 10': '10', 'Thg 11': '11', 'Thg 12': '12'
      }
      const match = dateStr.match(/(\d+)\s+Thg\s+(\d+)\s+(\d+)/)
      if (match) {
        const [, day, month, year] = match
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      return ''
    }

    // ✅ Lấy ngày từ query URL
    const updateDatesFromQuery = () => {
      const query = route.query
      if (query.checkin && query.checkout) {
        const checkInDate = new Date(query.checkin)
        const checkOutDate = new Date(query.checkout)
        summary.value.checkIn = formatDateForDisplay(checkInDate)
        summary.value.checkOut = formatDateForDisplay(checkOutDate)

        const diffTime = checkOutDate - checkInDate
        summary.value.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Update policy display fields
        policy.value.checkIn = summary.value.checkIn
        policy.value.checkOut = summary.value.checkOut
        const freeCancelDate = new Date(checkInDate)
        freeCancelDate.setDate(freeCancelDate.getDate() - 1)
        policy.value.freeCancelUntil = formatDateForDisplay(freeCancelDate)
      }
    }

    // ✅ Lấy danh sách quốc gia
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
        const data = await res.json()
        countries.value = (data || [])
          .map(it => ({
            code: it.cca2,
            name: it?.name?.common || it?.name?.official || ''
          }))
          .filter(c => c.code && c.name)
          .sort((a, b) => a.name.localeCompare(b.name, 'vi'))

        if (!countries.value.find(c => c.code === form.value.country)) {
          form.value.country = ''
        }
      } catch (e) {
        countries.value = [
          { code: 'VN', name: 'Việt Nam' },
          { code: 'US', name: 'United States' },
          { code: 'JP', name: 'Japan' },
          { code: 'FR', name: 'France' }
        ]
      }
    }

    // Mounted
    onMounted(async () => {
      fetchCountries()

      updateDatesFromQuery()
      try {
        loading.value = true
        const response = await axios.get(`${apiUrl}/api/taxes`)
        tax.value = Array.isArray(response.data) ? response.data : []
        const rate = tax.value.length ? Number(tax.value[0].rate) || 0 : 0
        const id_tax = tax.value.length ? tax.value[0].id : null
        summary.value.priceTax = (summary.value.priceRoom) * (rate / 100)
        summary.value.id_tax = id_tax
      } catch (error) {
        console.error('Error fetching taxes:', error)
      } finally {
        loading.value = false
      }
    })

    // ✅ Validate form
    const validate = () => {
      const errs = {}
      if (!form.value.firstName) errs.firstName = 'Vui lòng nhập họ và tên'
      if (!form.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errs.email = 'Email không hợp lệ'
      if (!form.value.phone || !/^\d{9,10}$/.test(form.value.phone)) errs.phone = 'Số điện thoại phải có 9-10 chữ số'
      if (!form.value.country) errs.country = 'Vui lòng chọn quốc gia'
      if (!form.value.requests) errs.requests = 'Vui lòng nhập địa chỉ'
      if (form.value.paymentMethod === 'card') {
        if (!/^\d{12,19}$/.test(form.value.cardNumber.replace(/\s/g, ''))) errs.cardNumber = 'Số thẻ không hợp lệ'
        if (!form.value.cardName) errs.cardName = 'Vui lòng nhập tên in trên thẻ'
        if (!/^\d{2}\/\d{2}$/.test(form.value.expiry)) errs.expiry = 'MM/YY'
        if (!/^\d{3,4}$/.test(form.value.cvc)) errs.cvc = 'CVC không hợp lệ'
      }
      errors.value = errs
      return Object.keys(errs).length === 0
    }

    // ✅ Gửi API đặt phòng
    const onSubmit = async () => {
      if (!validate()) return
      try {
        const formData = new FormData()
        formData.append('name', form.value.firstName)
        formData.append('email', form.value.email)
        formData.append('phone', form.value.phone)
        formData.append('country', form.value.country)
        formData.append('address', form.value.requests)
        formData.append('note', form.value.note)
        formData.append('number_room', form.value.number_room)
        formData.append('id_room', form.value.id_room)
        formData.append('checkin', formatDateForAPI(summary.value.checkIn))
        formData.append('checkout', formatDateForAPI(summary.value.checkOut))
        formData.append('status', statusText.value)
        formData.append('subtotal', summary.value.priceRoom)
        formData.append('grandtotal', totalPrice.value)
        formData.append('discounttotal', summary.value.discount)
        formData.append('id_user', form.value.id_user)
        formData.append('amount_tax', summary.value.priceTax)
        formData.append('id_tax', summary.value.id_tax)
        formData.append('service_charge', (summary.value.service * summary.value.nights).toString() || 0)
        const response = await fetch(`${apiUrl}/api/bookings`, {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const ct = response.headers.get('content-type') || ''
          const result = ct.includes('application/json') ? await response.json() : { message: await response.text() }
          if (result && result.booking && result.booking.id) {
            alert('Đặt phòng thành công! Mã đặt phòng: ' + result.booking.id);
          } else {
            alert('Đặt phòng thành công!')
          }
          resetForm()
          router.push({ name: 'Home' })
        } else {
          const ct = response.headers.get('content-type') || ''
          const err = ct.includes('application/json') ? await response.json() : { message: await response.text() }
          alert('Lỗi: ' + (err.message || 'Có lỗi xảy ra khi đặt phòng'))
        }
      } catch (error) {
        console.error('API Error:', error)
        alert('Lỗi kết nối: Không thể kết nối đến máy chủ')
      }
    }

    // ✅ Tạo đơn hàng tạm và chuyển đến trang thanh toán
    // ✅ Tạo QR code
    const makedeposit = async () => {
      if (!validate()) return

      try {
        // Create FormData for booking temp
        const formData = new FormData();
        formData.append('name', form.value.firstName);
        formData.append('email', form.value.email);
        formData.append('phone', form.value.phone);
        formData.append('country', form.value.country);
        formData.append('address', form.value.requests);
        formData.append('note', form.value.note);
        formData.append('number_room', form.value.number_room);
        formData.append('id_room', form.value.id_room);
        formData.append('checkin', formatDateForAPI(summary.value.checkIn));
        formData.append('checkout', formatDateForAPI(summary.value.checkOut));
        formData.append('status', statusText.value);
        formData.append('subtotal', summary.value.priceRoom.toString());
        formData.append('grandtotal', (totalPrice.value).toString());
        formData.append('discounttotal', summary.value.discount.toString());
        formData.append('id_user', form.value.id_user ? form.value.id_user.toString() : '');
        formData.append('amount_tax', summary.value.priceTax.toString());
        formData.append('id_tax', summary.value.id_tax ? summary.value.id_tax.toString() : '');
        formData.append('service_charge', (summary.value.service * summary.value.nights).toString() || 0);

        // Bước 1: Gửi dữ liệu booking để tạo một bản ghi tạm thời
        const tempResponse = await axios.post(`${apiUrl}/api/bookings/temp`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const tempBookingId = tempResponse.data.bookingId;

        // Bước 2: Sử dụng ID tạm thời để gọi API VNPay
        const paymentFormData = new FormData();
        paymentFormData.append('amount', (totalPrice.value * 0.3).toString());
        paymentFormData.append('bookingId', tempBookingId);
        console.log(tempBookingId);

        const paymentResponse = await axios.post(`${apiUrl}/api/payments`, paymentFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (paymentResponse.data.payment_url) {
          window.location.href = paymentResponse.data.payment_url;
        } else {
          alert('Lỗi: Không thể tạo liên kết thanh toán');
        }
      } catch (error) {
        console.error('API Error:', error);
        if (error.response) {
          // Log chi tiết lỗi validation nếu có
          console.error('Validation errors:', error.response.data);
          if (error.response.data.message) {
            alert('Lỗi: ' + error.response.data.message);
          } else {
            alert('Lỗi: Dữ liệu không hợp lệ, vui lòng kiểm tra lại');
          }
        } else {
          alert('Lỗi kết nối: Không thể kết nối đến máy chủ');
        }
      }
    };
    // ✅ Reset form
    const resetForm = () => {
      form.value = {
        firstName: '',
        email: '',
        phone: '',
        country: '',
        requests: '',
        note: '',
        paymentMethod: 'later',
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvc: ''
      }
      errors.value = {}
    }

    // ✅ Coupon
    const applyCoupon = async () => {
      if (!couponCode.value.trim()) {
        alert('Vui lòng nhập mã giảm giá')
        return
      }

      try {
        const response = await axios.get(`${apiUrl}/api/promotions`)
        const promotions = response.data

        const foundPromotion = promotions.find(p => p.code === couponCode.value.trim())
        if (foundPromotion) {
          const now = new Date()
          const validFrom = new Date(foundPromotion.valid_from)
          const validTo = new Date(foundPromotion.valid_to)

          // Kiểm tra ngày hiệu lực
          if (now >= validFrom && now <= validTo) {
            // Kiểm tra số tiền tối thiểu
            if (summary.value.priceRoom >= foundPromotion.min_amount) {
              promotion.value.type = foundPromotion.type
              promotion.value.value = foundPromotion.discount
              summary.value.discount = foundPromotion.discount
              alert(`Áp dụng mã giảm giá thành công! Giảm ${foundPromotion.discount}${foundPromotion.type === 'percentage' ? '%' : '$'}`)
            } else {
              alert(`Mã giảm giá yêu cầu đơn hàng tối thiểu ${foundPromotion.min_amount}$`)
              summary.value.discount = 0
              promotion.value.value = 0
            }
          } else {
            alert('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực')
            summary.value.discount = 0
            promotion.value.value = 0
          }
        } else {
          alert('Mã giảm giá không tồn tại')
          summary.value.discount = 0
          promotion.value.value = 0
        }
      } catch (error) {
        console.error('Error applying coupon:', error)
        alert('Có lỗi xảy ra khi áp dụng mã giảm giá')
        summary.value.discount = 0
        promotion.value.value = 0
      }
    }

    return {
      summary, totalPrice, money,
      form, errors, countries,
      couponCode, applyCoupon, promotion,
      onSubmit,
      formatDateForAPI,
      policy,
      statusText,
      makedeposit,
      Iduser
    }
  }
}
</script>

<style scoped>
.booking-page {
  background-color: #1f1f1f;
  padding: 5rem 1rem 1rem;
  min-height: 100vh;
  color: #f3f4f6;
}

.booking-container {
  display: flex;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.main-content {
  flex: 2;
  margin-top: 80px;
  background: #2a2a2a;
  padding: 1rem;
  margin: 0;
  border-radius: 8px;
  box-shadow: var(--booking-shadow);
}

.sidebar {
  flex: 1.2;
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.step {
  background: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  text-align: center;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.step.is-active {
  background: var(--booking-blue);
  color: white;
}

.step.is-complete {
  background: #2a2a2a;
  color: #e5e7eb;
  border-color: var(--booking-blue);
}

.headline h1 {
  color: #ffffff;
  margin-bottom: 0.15rem;
  font-size: 1.4rem;
  font-weight: 700;
}

.headline p {
  color: #e5e7eb;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
}

.QR-code {
  margin-top: 1rem;
  text-align: center;
  margin-bottom: 0px;
}

.panel {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  color: #f3f4f6;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.6rem;
}

.panel-header h2 {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
}

.panel-header .sub {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-group {
  flex: 1;
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background-color: #1f1f1f;
  color: #f3f4f6;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.form-group input::placeholder {
  color: #9ca3af;
}

.form-group select {
  color-scheme: dark;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--booking-blue);
  box-shadow: 0 0 0 3px rgba(18, 86, 153, 0.25);
}

.error {
  color: #d93025;
  margin-top: 0.35rem;
  display: block;
}

.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.radio-card {
  border: 1px solid #3a3a3a;
  background: #1f1f1f;
  border-radius: 12px;
  padding: 0.6rem 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  cursor: pointer;
}

.radio-card input {
  accent-color: var(--booking-blue);
}

.radio-card .title {
  font-weight: 700;
  color: #ffffff;
}

.radio-card .desc {
  color: #cbd5e1;
  font-size: 0.95rem;
}

.policy {
  color: #cbd5e1;
  margin-top: 0.25rem;
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.6rem;
}

.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--booking-blue);
  color: #fff;
}

.btn-primary:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  border-color: #3a3a3a;
  color: #e5e7eb;
}

.btn-outline {
  background: transparent;
  border-color: #206ab5;
  color: #206ab5;
}

.booking-summary {
  background: #2a2a2a;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--booking-shadow);
  border: 1px solid #3a3a3a;
  color: #f3f4f6;
}

.sticky {
  position: sticky;
  top: 96px;
  z-index: 0;
}

.hotel-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.hotel-meta .thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
}

.hotel-name {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.room-name {
  color: #cbd5e1;
  font-size: 0.95rem;
}

.badge {
  display: inline-block;
  background: #e7f5ec;
  color: #1a7f37;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.dates {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #1f1f1f;
  border-radius: 8px;
}

.dates .label {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.dates .value {
  color: #e5e7eb;
  font-weight: 600;
  font-size: 0.95rem;
}

.coupon {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.coupon input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #1f1f1f;
  color: #f3f4f6;
  font-size: 0.9rem;
}

.price-details {
  margin-top: 1rem;
  padding: 1rem;
  background: #1f1f1f;
  border-radius: 8px;
}

.price-details .row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  color: #e5e7eb;
  font-size: 0.95rem;
}

.price-details .row.total {
  font-weight: 800;
  color: #ffffff;
  font-size: 1.1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #3a3a3a;
}

.price-details .discount {
  color: #1a7f37;
}

.price-details hr {
  border: none;
  border-top: 1px solid #3a3a3a;
  margin: 1rem 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .booking-container {
    flex-direction: column;
    padding: 1rem;
  }

  .sticky {
    position: static;
    margin-top: 2rem;
  }

  .main-content {
    margin-right: 0;
  }

  .headline h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .panel {
    padding: 1.25rem;
  }

  .headline h1 {
    font-size: 1.5rem;
  }

  .headline p {
    font-size: 0.9rem;
  }

  .panel-header h2 {
    font-size: 1.3rem;
  }

  .dates {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .hotel-meta {
    flex-direction: column;
    text-align: center;
  }

  .hotel-meta .thumb {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .payment-options {
    grid-template-columns: 1fr;
  }

  .steps {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .radio-card {
    padding: 0.75rem;
  }

  .radio-card .desc {
    font-size: 0.85rem;
  }

  .price-details .row {
    font-size: 0.9rem;
  }

  .price-details .row.total {
    font-size: 1rem;
  }

  .btn {
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
