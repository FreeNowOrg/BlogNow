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

// Archive
router.addRoute({
  path: '/archives',
  name: 'archives',
  alias: ['/archive'],
  component: () => import('./view/archives.vue'),
})

// Post
router.addRoute({
  path: '/post/:uuid',
  name: 'post',
  component: () => import('./view/post.vue'),
})
router.addRoute({
  path: '/pid/:pid',
  name: 'post-pid',
  component: () => import('./view/post.vue'),
})
router.addRoute({
  path: '/-/:slug',
  name: 'post-slug',
  component: () => import('./view/post.vue'),
})

// Post edit
router.addRoute({
  path: '/post/:uuid/edit',
  name: 'post-edit',
  component: () => import('./view/post-edit.vue'),
})
router.addRoute({
  path: '/post/new',
  name: 'post-create',
  component: () => import('./view/post-edit.vue'),
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
