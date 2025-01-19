import BlogTheme from '@sugarat/theme'

// 自定义样式重载
import './style.scss'
import {Theme} from "vitepress";
import LibPopover from "./components/LibPopover.vue";

// 自定义主题色
// import './user-theme.css'

/** @type {import('vitepress').Theme} */
export default {
    extends: BlogTheme,
    enhanceApp({ app }) {
        // 注册自定义全局组件
        app.component('LibPopover', LibPopover)
    }
} satisfies Theme
