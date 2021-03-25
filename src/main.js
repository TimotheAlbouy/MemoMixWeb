import Vue from 'vue';
import { VBHover, VBToggle } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App.vue';

Vue.directive('b-hover', VBHover);
Vue.directive('b-toggle', VBToggle);

new Vue({
  el: '#app',
  render: h => h(App)
});
