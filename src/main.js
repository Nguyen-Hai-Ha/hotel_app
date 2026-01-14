import './assets/main.css'
import './assets/custom.css'
import './assets/layout-styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faTachometerAlt,
  faList,
  faBed,
  faCalendarCheck,
  faUserCheck,
  faUsers,
  faChevronRight,
  faSyncAlt,
  faUser,
  faChevronDown,
  faPlus,
  faEdit,
  faTrash,
  faDollarSign,
  faSignOutAlt,
  faCheck,
  faCheckDouble,
  faCheckCircle,
  faTimes,
  faSignInAlt,
  faBroom,
  faSave,
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faReceipt,
  faTag,
  faConciergeBell,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(
  faTachometerAlt,
  faList,
  faBed,
  faCalendarCheck,
  faUserCheck,
  faUsers,
  faChevronRight,
  faSyncAlt,
  faUser,
  faChevronDown,
  faPlus,
  faEdit,
  faTrash,
  faDollarSign,
  faSignOutAlt,
  faCheck,
  faCheckDouble,
  faCheckCircle,
  faTimes,
  faSignInAlt,
  faBroom,
  faSave,
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faReceipt,
  faTag,
  faConciergeBell,
  faUtensils,
)

// // Initialize EmailJS
// (function() {
//     emailjs.init({
//         publicKey: "DEe-YjtvqBUzfTvm3",
//     });
// })();

const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(router)
app.use(i18n)
app.mount('#app')
