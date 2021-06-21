import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

// Home
router.addRoute({
  path: '/',
  name: 'home',
  component: () => import('./view/index.vue'),
})

// Posts
router.addRoute({
  path: '/post/:pid',
  alias: ['/p/:pid'],
  name: 'post-view',
  component: () => import('./view/post/view.vue'),
})

// User
router.addRoute({
  path: '/user/:uid',
  name: 'users',
  component: () => import('./view/user.vue'),
})

// Search
router.addRoute({
  path: '/search',
  name: 'search-index-redirect',
  component: () => import('./view/search.vue'),
})

// About
router.addRoute({
  path: '/about',
  name: 'about-us',
  component: () => import('./view/about.vue'),
})

// 404
router.addRoute({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('./view/404.vue'),
})

export { router }
