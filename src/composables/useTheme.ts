import { ref, watch, onMounted } from 'vue'

// Global theme state
const isDarkMode = ref(false)

// Initialize theme from localStorage
const initTheme = () => {
    const savedTheme = localStorage.getItem('admin_theme')
    if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark'
    } else {
        // Check system preference
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
}

// Apply theme to document
const applyTheme = () => {
    const adminLayout = document.querySelector('.admin-layout')
    if (adminLayout) {
        if (isDarkMode.value) {
            adminLayout.classList.add('dark-mode')
        } else {
            adminLayout.classList.remove('dark-mode')
        }
    }
    // Also apply to body for modal overlays
    if (isDarkMode.value) {
        document.body.classList.add('admin-dark-mode')
    } else {
        document.body.classList.remove('admin-dark-mode')
    }
}

// Toggle theme
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('admin_theme', isDarkMode.value ? 'dark' : 'light')
    applyTheme()
}

// Watch for changes
watch(isDarkMode, () => {
    applyTheme()
})

export function useTheme() {
    onMounted(() => {
        initTheme()
    })

    return {
        isDarkMode,
        toggleTheme,
        initTheme
    }
}
