<template>
  <section class="contact-section">
    <div class="container">
      <h2 class="section-title">{{ $t('contact.title') }}</h2>
      <div class="contact-content">
        <div class="contact-info">
          <h3>{{ $t('contact.subtitle') }}</h3>
          <p><i class="fas fa-map-marker-alt"></i> 123 Luxury Street, City, Country</p>
          <p><i class="fas fa-phone"></i> +1 (555) 123-4567</p>
          <p><i class="fas fa-envelope"></i> info@thesecret-hotel.com</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-linkedin-in"></i></a>
          </div>
        </div>
        <div class="contact-form">
          <form id="contact-form" method="POST">
          <div class="form-group">
            <input type="text" id="from_name" :placeholder="$t('contact.name') + ' *'" required>
          </div>
          <div class="form-group">
            <input type="phone" id="from_phone" :placeholder="$t('contact.phone') + ' *'" required>
          </div>
          <div class="form-group">
            <input type="email" id="from_email" :placeholder="$t('contact.email')">
          </div>
          <div class="form-group">
            <textarea id="message" :placeholder="$t('contact.message')" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">{{ $t('contact.sendMessage') }}</button>
        </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { onMounted } from 'vue';

export default {
  name: 'ContactView',
  setup() {
    onMounted(() => {
      const contactFormElement = document.getElementById('contact-form');
      if (contactFormElement) {
        contactFormElement.addEventListener('submit', function(event) {
          event.preventDefault();

          emailjs.send("service_xnw1apq", "template_c2pf69e", {
            from_name: document.getElementById('from_name').value,
            from_phone: document.getElementById('from_phone').value,
            from_email: document.getElementById('from_email').value,
            message: document.getElementById('message').value,
          })
          .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('Cảm ơn bạn đã gửi thông tin. Chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.');
            contactFormElement.reset(); // Reset form using the element reference
          }, function(error) {
            console.log('FAILED...', error);
            alert('Gửi thông tin thất bại. Vui lòng thử lại.');
          });
        });
      }
    });

    return {}; // No reactive data or methods are exposed directly for template use for this form
  },    
};
</script>

<style scoped>
/* Styles are handled by layout-styles.css */
</style>
