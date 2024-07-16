import { createRouter,createWebHistory,type RouteRecordRaw } from "vue-router";
//createRouter创建路由实例
//history 是路由模式，hash模式，history模式
//createWebHistory()是开启history模式
//createWebHashHistory()是开启hash模式
const routes = [
    {
        path: '/',
        name: 'Home',
        component:() => import('../views/HomePage/index.vue')
    },
    {
        path: '/Edit',
        name: 'Edit',
        component:() => import('../views/Edit/index.vue')
    }
] as RouteRecordRaw[]
const router = createRouter({
    history :createWebHistory(),
    routes:routes
})
export default router