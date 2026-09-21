import { createRouter, createWebHashHistory } from 'vue-router';

import MainLayout from '../layouts/MainLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import TesterView from '../views/TesterView.vue';
import CommunityView from '../views/CommunityView.vue';
import EditorView from '../views/EditorView.vue';
import LoginView from '../pages/LoginView.vue';
import SignupView from '../pages/SignupView.vue';
import SettingsView from '../views/SettingsView.vue';
import BuilderView from '../views/BuilderView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard', icon: 'pi pi-table', componentName: 'DashboardView' }
      },
      {
        path: 'database',
        name: 'Database',
        component: () => import('../views/DatabaseView.vue'),
        meta: { title: 'Database', icon: 'pi pi-database', componentName: 'DatabaseView' }
      },
      {
        path: 'tester',
        name: 'Tester',
        component: TesterView,
        meta: { title: 'API Tester', icon: 'pi pi-bolt', componentName: 'TesterView' }
      },
      {
        path: 'community',
        name: 'Community',
        component: CommunityView,
        meta: { title: 'Community', icon: 'pi pi-users', componentName: 'CommunityView' }
      },
      {
        path: 'builder',
        name: 'Builder',
        component: BuilderView,
        meta: { title: 'AI Builder', icon: 'pi pi-box', componentName: 'BuilderView' }
      },
      {
        path: 'global-settings',
        name: 'GlobalSettings',
        component: SettingsView,
        meta: { title: 'Settings', icon: 'pi pi-cog', componentName: 'SettingsView' }
      }
    ]
  },
  {
    path: '/editor',
    name: 'Editor',
    component: EditorView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  next();
});

export default router;
