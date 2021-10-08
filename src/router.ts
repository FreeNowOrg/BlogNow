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
  path: '/post/:uuid',
  alias: ['/p/:uuid'],
  name: 'post',
  component: () => import('./view/post.vue'),
})

// User
router.addRoute({
  path: '/auth',
  alias: ['/login'],
  name: 'auth',
  component: () => import('./view/auth.vue'),
})

// router.addRoute({
//   path: '/user/:uuid',
//   name: 'user',
//   component: () => import('./view/user.vue'),
// })

// Search
// router.addRoute({
//   path: '/search',
//   name: 'search-index-redirect',
//   component: () => import('./view/search.vue'),
// })

// 404
router.addRoute({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('./view/404.vue'),
})

export { router }
