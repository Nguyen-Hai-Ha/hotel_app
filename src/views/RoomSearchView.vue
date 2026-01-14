<template>
  <div class="search-results-page">
    <div class="container">
      <div class="row">
        <div class="col-md-3">
          <div class="filters-sidebar">
            <h3>Lọc theo</h3>
            <div class="filter-group">
              <h4>Giá mỗi đêm</h4>
              <input type="range" min="50" max="1000" step="10" class="price-slider">
              <div class="price-range">
                <span>$50</span>
                <span>$1000</span>
              </div>
            </div>
            <div class="filter-group">
              <h4>Hạng sao</h4>
              <div class="star-rating">
                <button class="star-btn">1 ⭐</button>
                <button class="star-btn">2 ⭐</button>
                <button class="star-btn">3 ⭐</button>
                <button class="star-btn active">4 ⭐</button>
                <button class="star-btn">5 ⭐</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-9">
          <div class="results-list">
            <h2>Kết quả cho "Việt Nam"</h2>
            <div class="hotel-card" v-for="hotel in hotels" :key="hotel.id">
              <div class="row no-gutters">
                <div class="col-md-4">
                  <!-- <img :src="hotel.imageUrl" :alt="hotel.name" class="hotel-image"> -->
                </div>
                <div class="col-md-8">
                  <div class="hotel-details">
                    <h3>{{ hotel.name }}</h3>
                    <p class="location">{{ hotel.location }}</p>
                    <div class="rating">
                      <span class="score">{{ hotel.rating }}</span>
                      <span>Tuyệt vời</span>
                    </div>
                    <div class="price-section">
                      <p class="price">${{ hotel.price }}</p>
                      <router-link :to="'/room/' + hotel.id" class="details-btn">Xem chi tiết</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomSearchView',
  data() {
    return {
      hotels: [
        { id: 1, name: 'The Grand Ho Tram Strip', location: 'Vung Tau', rating: 9.1, price: 150, imageUrl: 'https://pix6.agoda.net/geo/city/17190/1_17190_02.jpg?ca=6&ce=1&s=345x345&ar=1x1' },
        { id: 2, name: 'InterContinental Danang Sun Peninsula Resort', location: 'Da Nang', rating: 9.5, price: 450, imageUrl: 'https://pix6.agoda.net/geo/city/16440/1_16440_02.jpg?ca=6&ce=1&s=345x345&ar=1x1' },
        { id: 3, name: 'Sofitel Legend Metropole Hanoi', location: 'Hanoi', rating: 9.3, price: 300, imageUrl: 'https://pix6.agoda.net/geo/city/2758/065f4f2c9fa263611ab65239ecbeaff7.jpg?ce=0&s=345x345&ar=1x1' }
      ]
    };
  }
};
</script>

<style scoped>
.search-results-page {
  padding: 2rem 0;
  background-color: #f8f7f9;
}

.filters-sidebar {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-group {
  margin-bottom: 2rem;
}

.price-slider {
  width: 100%;
}

.price-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
}

.star-rating {
  display: flex;
  gap: 5px;
}

.star-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.star-btn.active {
  background: #d2720d;
  color: white;
  border-color: #d2720d;
}

.hotel-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.hotel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hotel-details {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0.5rem;
}

.score {
  background: #d2720d;
  color: white;
  padding: 5px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.price-section {
  text-align: right;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #d43f3a;
}

.details-btn {
  background: #d2720d;
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 4px;
}
</style>
