import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"
import "./style.css"

// Import pages
import Home from "./pages/Home.vue"
import RestaurantDetail from "./pages/RestaurantDetail.vue"
import Favorites from "./pages/Favorites.vue"
import AdminDashboard from "./pages/AdminDashboard.vue"
import Login from "./pages/Login.vue"

import { supabase } from "./config/supabaseConfig"

// Router configuration
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    // Maintain scroll position on back/forward navigation
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to top on new page navigation
    return { top: 0 }
  },
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/restaurant/:id", name: "RestaurantDetail", component: RestaurantDetail },
    { path: "/favorites", name: "Favorites", component: Favorites },
    {
      path: "/admin",
      name: "AdminDashboard",
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: "/login", name: "Login", component: Login },
  ],
})

router.beforeEach(async (to, from, next) => {
  console.log("[v0] Router navigating from:", from.path, "to:", to.path)

  if (to.meta.requiresAuth) {
    // Get current session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user

    console.log("[v0] Current user in router guard:", user ? user.email : "not authenticated")

    if (!user) {
      console.log("[v0] No user, redirecting to home")
      next("/")
    } else if (to.meta.requiresAdmin) {
      // Check if user is admin
      const isAdmin = user.email && user.email.toLowerCase().includes("jesusinmiddlexstyve")
      console.log("[v0] Is admin:", isAdmin, "for email:", user.email)

      if (isAdmin) {
        console.log("[v0] Admin verified, allowing access to:", to.path)
        next()
      } else {
        console.log("[v0] Not admin, redirecting to home")
        next("/")
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount("#app")

