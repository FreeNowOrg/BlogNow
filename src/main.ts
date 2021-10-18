import { createApp } from 'vue'
import Cookies from 'js-cookie'
import { SITE_ENV } from './config'

// Create App
import App from './App.vue'
const app = createApp(App)

// Router
import { router } from './router'
app.use(router)

// Style
import './styles/index.sass'

// Inject axios
import axios from 'axios'
axios.interceptors.request.use(
  (req) => {
    if (SITE_ENV !== 'prod') {
      req.headers = req.headers || {}
      try {
        req.headers.authorization = window.Cookies.get('BLOG_NOW_TOKEN') || ''
        console.info('[Axios]', 'Request with local token')
      } catch (err) {
        console.warn('[Axios]', 'Inject error', err)
      }
    }
    return req
  },
  (e) => Promise.reject(e)
)

// Icon
import { Icon } from '@vicons/utils'
app.component('Icon', Icon)

// ExternamLink
import ExternamLink from './components/ExternalLink.vue'
app.component('ELink', ExternamLink)

// LazyLoad
import Lazyload from './components/Lazyload.vue'
app.component('Lazyload', Lazyload)

// Placeholder
import Placeholder from './components/Placeholder.vue'
app.component('Placeholder', Placeholder)

// highlightjs
import hljs from 'highlight.js'

// Editor
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
// Editor theme
import createHljsTheme from '@kangc/v-md-editor/lib/theme/hljs'
const baseTheme = createHljsTheme({ Hljs: hljs })
// Editor Plugins
import createTipPlugin from '@kangc/v-md-editor/lib/plugins/tip/index'
import '@kangc/v-md-editor/lib/plugins/tip/tip.css'
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css'

VMdEditor.vMdParser.theme(baseTheme)
VMdEditor.use(createTipPlugin())
VMdEditor.use(createEmojiPlugin())
app.use(VMdEditor)

// Mount
app.mount('#app')
document.body?.setAttribute('data-env', SITE_ENV)
window.Cookies = Cookies
