import "./assets/main.css";
import "./assets/custom.css";
import "./assets/layout-styles.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// FontAwesome imports
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
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
  faCoins,
  faCalendarWeek,
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
  faFileExcel,
  faUpload,
  faSpinner,
  faFolderOpen,
  faDownload,
  faSun,
  faMoon,
  faClock,
  faMinus
} from "@fortawesome/free-solid-svg-icons";

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
  faCoins,
  faCalendarWeek,
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
  faFileExcel,
  faUpload,
  faSpinner,
  faFolderOpen,
  faDownload,
  faSun,
  faMoon,
  faClock,
  faMinus
);

// // Initialize EmailJS
// (function() {
//     emailjs.init({
//         publicKey: "DEe-YjtvqBUzfTvm3",
//     });
// })();

const pinia = createPinia();
const app = createApp(App);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.use(router);
app.use(i18n);

pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.mount("#app");
