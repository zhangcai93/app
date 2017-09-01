import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './App';
import Goods from 'components/goods/goods.vue';
import Ratings from 'components/ratings/ratings.vue';
import Seller from 'components/seller/seller.vue';

import 'common/stylus/index.styl';

Vue.use(VueRouter);
Vue.use(VueResource);

const app = Vue.extend(App);

const router = new VueRouter({
  linkActiveClass: 'active',  // 修改v-link-active默认值为active
});
router.map({
  '/goods': {
    component: Goods,
  },
  '/ratings': {
    component: Ratings,
  },
  '/seller': {
    component: Seller,
  },
});

router.start(app, '#app');
router.redirect({
  '/': '/goods',
});
