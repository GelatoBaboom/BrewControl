requirejs.config({
	waitSeconds: 200,
    "baseUrl": "/",
    "paths": {
      "app": "../app",
      "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
      "vue": "/node_modules/vue/dist/vue",
	  "fermItemjs": "interface/fermItem",
      "vue-material": "/node_modules/vue-material/dist/vue-material",
	  "vue-resource": "//cdn.jsdelivr.net/vue.resource/1.0.3/vue-resource.min",
      "moment": "//cdn.jsdelivr.net/momentjs/2.17.0/moment-with-locales.min",
	  "polyfill": "//cdn.polyfill.io/v2/polyfill.min.js"
    }
});
requirejs (["polyfill", "vue", "vue-material","vue-resource","fermItemjs"],
function(Polyfill, Vue, VueMaterial, VueResource, fermItemjs ){
Vue.use(VueMaterial)
Vue.use(VueResource)

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
Vue.component("fermItem", fermItemjs)

new Vue({
	el: '#file-list',
	data : function(){
	  return{
		  fermentadores:[]
	  }
	},
		created: function(){
			this.getActiveFerms();
	},
	methods: {
		getActiveFerms:function(){
			this.$http.get('/getFermData.json').then(function(response){
				this.fermentadores = response.body;
				return this.fermentadores;
				/*for(var i = 0; i < d.length; i++){
					var t = d[i];
					console.log(t);*/
				
			}, function(){ 
				//error 
			});
		}
	}
})
})
