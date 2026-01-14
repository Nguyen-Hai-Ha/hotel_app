<template>
  <div class="language-switcher">
    <div class="current-language" @click="toggleDropdown" :class="{ 'active': isOpen }">
      <span class="flag">{{ getCurrentFlag() }}</span>
      <span class="language-name">{{ getCurrentLanguageName() }}</span>
      <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': isOpen }"></i>
    </div>
    
    <!-- Backdrop for mobile -->
    <div v-if="isOpen" class="backdrop" @click="closeDropdown"></div>
    
    <div class="language-dropdown" :class="{ 'show': isOpen }">
      <div class="dropdown-header">
        <button class="close-btn" @click="closeDropdown">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="language-list">
        <div 
          v-for="lang in languages" 
          :key="lang.code"
          class="language-option"
          :class="{ 'active': currentLocale === lang.code }"
          @click.stop="changeLanguage(lang.code)"
        >
          <span class="flag">{{ lang.flag }}</span>
          <div class="language-info">
            <span class="name">{{ lang.name }}</span>
            <span class="native-name">{{ lang.nativeName }}</span>
          </div>
          <i v-if="currentLocale === lang.code" class="fas fa-check check-icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LanguageSwitcher',
  setup() {
    const { locale } = useI18n()
    const isOpen = ref(false)
    
    const languages = [
      { 
        code: 'en', 
        name: 'English', 
        nativeName: 'English',
        flag: '🇺🇸' 
      },
      { 
        code: 'vi', 
        name: 'Vietnamese', 
        nativeName: 'Tiếng Việt',
        flag: '🇻🇳' 
      },
      { 
        code: 'km', 
        name: 'Cambodian', 
        nativeName: 'ភាសាខ្មែរ',
        flag: '🇰🇭' 
      },
      { 
        code: 'zh', 
        name: 'Chinese', 
        nativeName: '中文',
        flag: '🇨🇳' 
      }
    ]
    
    const currentLocale = computed(() => locale.value)
    
    const getCurrentFlag = () => {
      const current = languages.find(lang => lang.code === currentLocale.value)
      return current ? current.flag : '🇺🇸'
    }
    
    const getCurrentLanguageName = () => {
      const current = languages.find(lang => lang.code === currentLocale.value)
      return current ? current.nativeName : 'English'
    }
    
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }
    
    const closeDropdown = () => {
      isOpen.value = false
    }
    
    const changeLanguage = (langCode) => {
      locale.value = langCode
      localStorage.setItem('hotel-language', langCode)
      isOpen.value = false
    }
    
    const handleClickOutside = (event) => {
      // Add a small delay to ensure changeLanguage executes first
      setTimeout(() => {
        if (!event.target.closest('.language-switcher')) {
          isOpen.value = false
        }
      }, 10)
    }
    
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        isOpen.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    })
    
    return {
      isOpen,
      languages,
      currentLocale,
      getCurrentFlag,
      getCurrentLanguageName,
      toggleDropdown,
      closeDropdown,
      changeLanguage
    }
  }
}
</script>

<style scoped>
.language-switcher {
  position: relative;
  z-index: 1000;
}

.current-language {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 30px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  border: 2px solid rgba(255, 107, 53, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.current-language:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 107, 53, 0.1) 100%);
  border-color: rgba(255, 107, 53, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.2);
}

.current-language.active {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%);
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-1px);
}

.flag {
  font-size: 1.4rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.language-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  flex: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dropdown-icon {
  color: #ff6b35;
  font-size: 0.9rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* .backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
} */

@keyframes fadeIn {
  to { opacity: 1; }
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-15px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: 280px;
}

.language-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.dropdown-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
}

.dropdown-title {
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: #ff6b35;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  transform: scale(1.1);
}

.language-list {
  padding: 8px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}

.language-option:last-child {
  margin-bottom: 0;
}

.language-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.language-option:hover::before {
  opacity: 1;
}

.language-option:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}

.language-option.active {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 107, 53, 0.1) 100%);
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.language-option.active::before {
  opacity: 0;
}

.language-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.language-option .name {
  color: #e5e7eb;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.2;
}

.language-option .native-name {
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 400;
}

.language-option.active .name {
  color: #fff;
}

.language-option.active .native-name {
  color: #ff6b35;
}

.check-icon {
  color: #ff6b35;
  font-size: 1rem;
  animation: checkmark 0.3s ease-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Desktop Styles */
@media (min-width: 1025px) {
  .current-language {
    min-width: 160px;
  }
  
  .language-name {
    font-size: 1rem;
  }
  
  .language-dropdown {
    min-width: 320px;
  }
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .current-language {
    min-width: 130px;
    padding: 10px 14px;
  }
  
  .language-name {
    font-size: 0.9rem;
  }
  
  .language-dropdown {
    min-width: 260px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .current-language {
    min-width: 110px;
    padding: 8px 12px;
    gap: 8px;
  }
  
  .language-name {
    font-size: 10px;
  }
  
  .flag {
    font-size: 12px;
  }
  
  .language-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 20px 20px 0 0;
    transform: translateY(100%);
    min-width: auto;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .language-dropdown.show {
    transform: translateY(0);
  }
  
  .dropdown-header {
    display: flex;
  }
  
  .language-list {
    padding: 12px;
    max-height: calc(70vh - 60px);
    overflow-y: auto;
  }
  
  .language-option {
    padding: 16px 20px;
    margin-bottom: 6px;
  }
  
  .language-option .name {
    font-size: 1rem;
  }
  
  .language-option .native-name {
    font-size: 0.9rem;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .current-language {
    min-width: 100px;
    padding: 6px 10px;
    gap: 6px;
    position: fixed;
    left: 5px;  
    top: 15px; 
    border: 0;
    background: none;
  }
  
  .language-name {
    font-size: 10px;
  }
  
  .flag {
    font-size: 12px;
  }
  
  .dropdown-icon {
    font-size: 0.8rem;
  }
  
  .language-option {
    padding: 14px 16px;
  }
  
  .language-option .name {
    font-size: 0.95rem;
  }
  
  .language-option .native-name {
    font-size: 0.85rem;
  }
}

/* Dark theme enhancements */
@media (prefers-color-scheme: dark) {
  .language-dropdown {
    background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%);
    border-color: #2a2a2a;
  }
  
  .language-option .name {
    color: #f3f4f6;
  }
  
  .language-option .native-name {
    color: #a1a1aa;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .current-language,
  .language-dropdown,
  .language-option,
  .dropdown-icon {
    transition: none;
  }
  
  .backdrop {
    animation: none;
  }
  
  .check-icon {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .current-language {
    border-width: 3px;
    border-color: #ff6b35;
  }
  
  .language-dropdown {
    border-width: 2px;
    border-color: #ff6b35;
  }
  
  .language-option.active {
    border-width: 2px;
    border-color: #ff6b35;
  }
}
</style>
