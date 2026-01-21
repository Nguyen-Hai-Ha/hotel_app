import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";
import { isAdminOnlyMode } from "../config";
import HomeView from "../views/HomeView.vue";
import RoomsView from "../views/RoomsView.vue";
import ContactView from "../views/ContactView.vue";
import RoomDetailView from "../views/RoomDetailView.vue"; // Import RoomDetailView
import BookingView from "../views/BookingView.vue";
import QRPaymentView from "../views/QRPaymentView.vue";
import PaymentSuccessView from "../views/PaymentSuccessView.vue";
import InformationView from "../views/InformationView.vue";
import LoginAdminView from "../views/LoginAdmin.vue";
import ExcelView from "@/views/admin/ExcelView.vue";

// Define all routes
const allRoutes = [
  {
    path: "/",
    redirect: "/login-admin",
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    meta: { userRoute: true },
  },
  {
    path: "/rooms",
    name: "Rooms",
    component: RoomsView,
    meta: { userRoute: true },
  },

  {
    path: "/contact",
    name: "Contact",
    component: ContactView,
    meta: { userRoute: true },
  },
  {
    path: "/room/:id", // Route for RoomDetailView with an ID parameter
    name: "RoomDetail",
    component: RoomDetailView,
    props: true, // Pass route params as props to the component
    meta: { userRoute: true },
  },
  {
    path: "/booking/:id",
    name: "Booking",
    component: BookingView,
    meta: { userRoute: true },
  },
  {
    path: "/qr-payment",
    name: "QRPayment",
    component: QRPaymentView,
    meta: { userRoute: true },
  },
  {
    path: "/payment-success",
    name: "PaymentSuccess",
    component: PaymentSuccessView,
    meta: { userRoute: true },
  },
  {
    path: "/admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    redirect: "/admin/dashboard",
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("../views/admin/DashboardView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "room-types",
        name: "AdminRoomTypes",
        component: () => import("../views/admin/RoomTypesView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "rooms",
        name: "AdminRooms",
        component: () => import("../views/admin/RoomsView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "bookings",
        name: "AdminBookings",
        component: () => import("../views/admin/BookingsView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "customers",
        name: "AdminCustomers",
        component: () => import("../views/admin/CustomersView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/UsersView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "taxes",
        name: "AdminTaxes",
        component: () => import("../views/admin/TaxesView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "promotions",
        name: "AdminPromotions",
        component: () => import("../views/admin/PromotionsView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "services",
        name: "AdminServices",
        component: () => import("../views/admin/ServicesView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "foods",
        name: "AdminFoods",
        component: () => import("../views/admin/FoodsView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "excel",
        name: "Excel",
        component: ExcelView,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/information",
    name: "Information",
    component: InformationView,
    meta: { userRoute: true },
  },
  {
    path: "/login-admin",
    name: "LoginAdmin",
    component: LoginAdminView,
  },
];

// Filter routes based on admin-only mode
const routes = isAdminOnlyMode() ? allRoutes.filter((route) => !route.meta?.userRoute) : allRoutes;

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Reset body height and overflow
  document.body.style.height = "auto";
  document.body.style.overflow = "auto";

  // Check admin authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const adminToken = localStorage.getItem("admin_token");
    const adminData = localStorage.getItem("admin_data");

    if (!adminToken || !adminData) {
      // No admin credentials, redirect to login
      next("/login-admin");
      return;
    }

    try {
      const admin = JSON.parse(adminData);

      // Check if route requires admin role (id_role === 1)
      if (to.matched.some((record) => record.meta.requiresAdmin)) {
        if (admin.id_role !== 1) {
          // Not an admin, redirect to dashboard
          next("/admin/dashboard");
          return;
        }
      }

      // Check general admin access (role 1 or 2)
      if (admin.id_role !== 1 && admin.id_role !== 2) {
        // Not an admin, redirect to login
        next("/login-admin");
        return;
      }
    } catch (error) {
      // Invalid admin data, redirect to login
      console.error("Invalid admin data:", error);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_data");
      next("/login-admin");
      return;
    }
  }

  // Auto-redirect from home to login-admin if already logged in
  if (to.name === "LoginAdmin") {
    const adminToken = localStorage.getItem("admin_token");
    const adminData = localStorage.getItem("admin_data");

    if (adminToken && adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.id_role === 1 || admin.id_role === 2) {
          // Already logged in as admin, redirect to admin panel
          next("/admin");
          return;
        }
      } catch (error) {
        console.error("Invalid admin data:", error);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
      }
    }
  }

  next();
});

export default router;
