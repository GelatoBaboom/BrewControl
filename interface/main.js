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
		  fermentadores:[],
		  tanques:[],
		  profiles:[],
		  fermModel:{nombre:'',tanque:0, perfil:0},
		  brand: 'LoLog',
		  brandDesc:'Cerveceria',
		  headerTitle:'CONTROL DE FERMENTADORES',
		  viewList:true,
		  viewAddNew:false,
		  refreshInterval:null
		  
	  }
	},
		created: function(){
			this.getActiveFerms();
			this.getTanques();
			this.getProfiles();
	},
	methods: {
		getArchivedFerms:function(){
			this.viewList = true;
			this.viewAddNew=false;
			this.getFerms(0);
			if(this.refreshInterval!=null)
			{
				clearInterval(this.refreshInterval);
			}
			this.refreshInterval =  setInterval(function(){
			
				this.getFerms(0);
			
			}.bind(this),5000);
			
		},
		getActiveFerms:function(){
			this.viewList = true;
			this.viewAddNew=false;
			this.getFerms(1);
			if(this.refreshInterval!=null)
			{
				clearInterval(this.refreshInterval);
			}
			this.refreshInterval =  setInterval(function(){
			
				this.getFerms(1);
			
			}.bind(this),5000);
		}, 
		getFerms:function(active){
			this.$http.get('/getFermData.json?activo='+active).then(function(response){
				this.fermentadores = response.body;
				return this.fermentadores;
			}, function(){ 
				//error 
			});
		},
		getTanques:function(){
			this.$http.get('/getTanques.json').then(function(response){
				this.tanques = response.body;
				return this.tanques;
			}, function(){ 
				//error 
			});
		},
		getProfiles:function(){
			this.$http.get('/getProfiles.json').then(function(response){
				this.profiles = response.body;
				return this.profiles;
			}, function(){ 
				//error 
			});
		},
		startNewFerm: function(){
			if(this.refreshInterval!=null)
			{
				clearInterval(this.refreshInterval);
				this.viewList=false;
				this.viewAddNew=true;
				
			}
			
			
		},
		createFerm:function(){
			this.viewList=true;
			this.viewAddNew=false;
			 this.$http.post('/createFerm.json', JSON.stringify(this.fermModel));
			
		}
	}
})
})
			
