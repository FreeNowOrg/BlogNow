import { createApp } from 'vue'
import * as Cookies from 'js-cookie'

// Create App
import App from './App.vue'
const app = createApp(App)

// Router
import { router } from './router'
app.use(router)

// Style
import './styles/index.sass'

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

// @ts-ignore
window.Cookies = Cookies.default || Cookies
