<template>
  <div class="about-container">
    <div class="about-content">
      <h1>About Our Hotel</h1>
      <p>
        Welcome to The Grand Hotel, where luxury meets comfort. Since our establishment in 2005, we have been dedicated to providing our guests with an exceptional experience. Our hotel is located in the heart of the city, offering breathtaking views and easy access to major attractions.
      </p>
      <p>
        Our mission is to provide unparalleled hospitality and create lasting memories for our guests. We offer a wide range of amenities, including a world-class spa, a gourmet restaurant, and state-of-the-art fitness facilities. Whether you are here for business or leisure, our team is committed to making your stay perfect.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
};
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: left;
}

.about-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.about-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}
</style>
