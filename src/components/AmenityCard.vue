<template>
  <div class="amenity-card">
    <i :class="amenity.icon"></i>
    <h3>{{ amenity.name }}</h3>
    <p>{{ amenity.description }}</p>
  </div>
</template>

<script>
export default {
  name: 'AmenityCard',
  props: {
    amenity: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.amenity-card {
  background: var(--vt-c-black-soft);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.amenity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.amenity-card i {
  font-size: 2.5rem;
  color: var(--booking-blue);
  margin-bottom: 1rem;
}

.amenity-card h3 {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.amenity-card p {
  color: #999;
  line-height: 1.6;
  margin: 0;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .amenity-card {
    padding: 1.75rem;
  }

  .amenity-card i {
    font-size: 2.25rem;
  }

  .amenity-card h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .amenity-card {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    text-align: left;
    align-items: center;
  }

  .amenity-card i {
    font-size: 2rem;
    margin: 0;
    grid-row: span 2;
  }

  .amenity-card h3 {
    margin: 0;
  }

  .amenity-card p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .amenity-card {
    padding: 1.25rem;
    gap: 0.75rem;
  }

  .amenity-card i {
    font-size: 1.75rem;
  }

  .amenity-card h3 {
    font-size: 1.1rem;
  }

  .amenity-card p {
    font-size: 0.85rem;
    line-height: 1.5;
  }
}
</style>