<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img :src="logoSrc" alt="The Secret Hotel Logo" class="footer-logo-img"/>
          <p>The Secret Hotels, unforgettable experiences. Book your perfect stay with us.</p>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <div class="footer-links">
            <router-link to="/">Home</router-link>
            <router-link to="/rooms">Rooms</router-link>
            <router-link to="/contact">Contact</router-link>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Services</h4>
          <div class="footer-links">
            <a href="#">Room Booking</a>
            <a href="#">Spa & Wellness</a>
            <a href="#">Restaurant</a>
            <a href="#">Events</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Connect With Us</h4>
          <div class="footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          </div>
          <div class="contact-info">
            <p><i class="fas fa-phone"></i> +1 (555) 123-4567</p>
            <p><i class="fas fa-envelope"></i> info@thesecret-hotel.com</p>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">      
        <div class="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
        <span class="footer-bottom-text">&copy; 2025 The Secret Hotel. All rights reserved.</span>
      </div>
    </div>
  </footer>
</template>

<script>
import logoImage from '/images/logo.png';

export default {
  name: 'Footer',
  data() {
    return {
      logoSrc: logoImage
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: var(--vt-c-black);
  padding: 60px 20px 30px;
  margin-top: 50px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .footer {
    padding: 40px 20px 20px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-logo-img {
    width: 100px;
  }

  .footer-section {
    text-align: center;
  }

  .footer-social {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .footer-bottom-links {
    justify-content: center;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 30px 15px 15px;
  }

  .footer-content {
    gap: 25px;
  }

  .footer-section h4 {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .footer-links a {
    font-size: 0.9rem;
  }

  .footer-bottom {
    font-size: 0.9rem;
  }

  .footer-bottom-links {
    flex-wrap: wrap;
  }
}

.footer-logo {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.footer-logo-img {
  width: 120px;
  height: auto;
}

.footer-logo h3 {
  color: var(--booking-blue);
  font-size: 1.5rem;
  margin: 0;
}

.footer-logo p {
  color: #ccc;
  line-height: 1.6;
}

.footer-section h4 {
  color: var(--booking-blue);
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: var(--booking-blue);
}

.footer-social {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.footer-social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--vt-c-black-mute);
  border-radius: 50%;
  color: var(--booking-blue);
  transition: all 0.3s ease;
  text-decoration: none;
}

.footer-social a:hover {
  background-color: var(--booking-blue);
  color: #fff;
  transform: translateY(-3px);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-info p {
  color: #ccc;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.contact-info i {
  color: var(--booking-blue);
  width: 16px;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid var(--vt-c-divider-dark-1);
  color: #777;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.footer-bottom-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.footer-bottom-text{
  justify-content: center;
  width: 100%;
}
.footer-bottom-links a {
  color: #777;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: var(--booking-blue);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .footer {
    padding: 40px 15px 90px; /* Added bottom padding for fixed navigation */
    margin-top: 30px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 35px;
    text-align: center;
  }
  
  .footer-logo {
    align-items: center;
  }

  .footer-logo-img {
    width: 100px;
  }
  
  .footer-logo p {
    font-size: 0.95rem;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .footer-section {
    position: relative;
  }
  
  .footer-section::after {
    content: '';
    position: absolute;
    bottom: -17px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background: rgba(255, 107, 53, 0.3);
    border-radius: 1px;
  }
  
  .footer-section:last-child::after {
    display: none;
  }
  
  .footer-links a {
    padding: 8px 0;
  }
  
  .footer-social {
    justify-content: center;
  }
  
  .footer-social a {
    width: 45px;
    height: 45px;
  }
  
  .contact-info {
    align-items: center;
  }
  
  .contact-info p {
    font-size: 1rem;
  }
  
  .footer-bottom {
    gap: 20px;
    margin-top: 20px;
    padding-top: 20px;
  }
  
  .footer-bottom-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    width: 100%;
  }
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .footer {
    padding: 50px 30px 30px;
  }
  
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px 30px;
  }
  
  .footer-logo {
    grid-column: 1 / -1;
    text-align: center;
    align-items: center;
  }
  
  .footer-logo p {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .footer-section h4 {
    font-size: 1.3rem;
  }
  
  .footer-links a {
    font-size: 1rem;
  }
  
  .footer-social a {
    width: 42px;
    height: 42px;
  }
}
</style>
