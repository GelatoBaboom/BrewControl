requirejs.config({
	waitSeconds: 200,
    "baseUrl": "/",
    "paths": {
      "app": "../app",
      "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
      "vue": "/node_modules/vue/dist/vue",
      "vue-material": "/node_modules/vue-material/dist/vue-material",
	  "vue-resource": "//cdn.jsdelivr.net/vue.resource/1.0.3/vue-resource.min",
      "moment": "//cdn.jsdelivr.net/momentjs/2.17.0/moment-with-locales.min",
	  "polyfill": "//cdn.polyfill.io/v2/polyfill.min.js"
    }
});
requirejs (["polyfill", "vue", "vue-material","vue-resource"],
function(Polyfill, Vue, VueMaterial, VueResource ){
Vue.use(VueMaterial)

Vue.material.registerTheme({
  default: {
    primary: 'purple',
    accent: 'red'
  },
  green: {
    primary: 'green',
    accent: 'pink'
  },
  orange: {
    primary: 'orange',
    accent: 'green'
  },
})

new Vue({
  el: '#file-list'
})
})

