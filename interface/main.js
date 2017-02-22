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
	  "polyfill": "//cdn.polyfill.io/v2/polyfill.min.js",
	  "loadsh":"//unpkg.com/lodash@4.13.1/lodash.min"
	  
	}
});
requirejs (["polyfill", "vue", "vue-material","vue-resource","loadsh"],
function(Polyfill, Vue, VueMaterial, VueResource,loadsh ){
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

new Vue({
	el: '#file-list',
	data : function(){
	  return{
		  fermentadores:[],
		  tanques:[],
		  profiles:[],
		  fermModel:{nombre:'',tanque:0, perfil:0},
		  strs:{
			brand: 'LoLog',
			brandDesc:'Cerveceria',
			headerTitle:'CONTROL DE FERMENTADORES'
		  },
		  fermSel:{
			id:0,
			nombre: ''
			
		  },
		  viewList:true,
		  viewAddNew:false,
		  viewListAchived:false,
		  viewFerm:false,
		  viewProfiles:false,
		  viewTanques:false,
		  refreshInterval:null,
		  profileUnWatch:null,
		  selectedFerm:null,
		  tanquesUnWatch:null
		  
		  
	  }
	},
	created: function(){
			this.getActiveFerms();
			this.getTanques();
			this.getProfiles();
			
	},
	methods: {
		getArchivedFerms:function(){
			this.viewList = false;
			this.viewListAchived = true;
			this.viewAddNew=false;
			this.viewFerm = false;
			this.viewProfiles=false;
			this.viewTanques=false;
			
						
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
			this.viewListAchived = false;
			this.viewAddNew=false;
			this.viewFerm = false;
			this.viewProfiles=false;
			this.viewTanques=false;
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
		getInactiveTanks:function(){
			console.log(this.tanques);
			return this.tanques.filter(function (t) {return t.inUse == 0})
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
				this.viewListAchived = false;
				this.viewAddNew=true;
				this.viewFerm = false;
				this.viewProfiles=false;
				this.viewTanques=false;
				
			}
			
			
		},
		createFerm:function(){
			this.viewList=true;
			this.viewListAchived = false;
			this.viewAddNew=false;
			this.viewFerm = false;
			this.viewProfiles=false;
			this.viewTanques=false;
			this.getTanques();
			this.$http.post('/createFerm.json', JSON.stringify(this.fermModel)).then(function(reponse){
				this.fermModel = {nombre:'',tanque:0, perfil:0};
			}, function(){ 
				//error 
			});
			this.getActiveFerms();
		},
		manageFerm:function(argId, argAction){
			this.$http.post('/manageFerm.json', JSON.stringify({id:argId,action:argAction})).then(function(reponse){
				this.getTanques();
			}, function(){ 
				//error 
			});
			this.refreshInterval();
			
		},
		viewFermentacion:function(argId){
			this.fermSel.id = argId;
			this.$http.get('/getFermDataById.json?id='+argId).then(function(response){
				this.selectedFerm = response.body;
				this.viewList=false;
				this.viewListAchived = false;
				this.viewAddNew=false;
				this.viewFerm = true;
				this.viewProfiles=false;
				this.viewTanques=false;
			}, function(){ 
				//error 
			});
			
			
			
			
		},
		editProfiles:function(){
			this.viewList=false;
			this.viewListAchived = false;
			this.viewAddNew=false;
			this.viewFerm = false;
			this.viewProfiles=true;
			this.viewTanques=false;
			this.attachWatchToProfiles();
			var viewUnwatch = this.$watch('viewProfiles',function(){
				console.log('detach!');
				this.profileUnWatch();
				viewUnwatch();
			},{
				deep: true
			});
		},
		attachWatchToProfiles:function(){
			console.log('attach!');
			this.profileUnWatch =  this.$watch('profiles',_.debounce(function(nVal,oVal){
				this.$http.post('/profUpdate.json', JSON.stringify(nVal)).then(function(reponse){}, function(){ /*error*/});
				
			},500),{
				deep: true
			});
			
			
		},
		deleteMapPoint:function(argProfId, argMapId){
			for(var i = 0; i < this.profiles.length; i++){
				if(this.profiles[i].id == argProfId)
				{
					for(var ii = 0; ii < this.profiles[i].mapa.length; ii++){
						if(this.profiles[i].mapa[ii].id == argMapId)
						{
							var context = this;
							this.profiles[i].mapa[ii].delete = true;
							this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function(reponse){
								setTimeout(function(){	context.getProfiles();},1000);
								
							}, function(){ /*error*/});
						}
					}
				}
			}
		},
		createMapPoint:function(argProfId){
			this.profileUnWatch();
			for(var i = 0; i < this.profiles.length; i++){
				if(this.profiles[i].id == argProfId)
				{
					var context = this;
					var prf = {
						id:0,
						tempFrom:0,
						tempTo:0,
						temp:0,
						tolerancia:0,
						insert:true
					}
					this.profiles[i].mapa.push(prf);
					this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function(reponse){
						setTimeout(function(){	
							context.getProfiles();
							//reattach watch to profiles
							context.attachWatchToProfiles();
						},2000);
					}, function(){ });  
					
				}
			}
			
		},
		deleteProf:function(argProfId){
			for(var i = 0; i < this.profiles.length; i++){
				if(this.profiles[i].id == argProfId)
				{
					var context = this;
					this.profiles[i].delete = true;
					this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function(reponse){
						setTimeout(function(){	context.getProfiles();},1000);
						
					}, function(){ /*error*/});
				}
			}
		},
		createProfile:function(){
			this.profileUnWatch();
			var context = this;
			var prf = {
				id:0,
				nombre:'',
				duration:0,
				mapa:[],
				insert:true
			}
			this.profiles.push(prf);
			this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function(reponse){
				setTimeout(function(){	
					context.getProfiles();
					//reattach watch to profiles
					context.attachWatchToProfiles();
				},1000);
			}, function(){ });  
		},
		editTanques:function(){
			this.viewList=false;
			this.viewListAchived = false;
			this.viewAddNew=false;
			this.viewFerm = false;
			this.viewProfiles=false;
			this.viewTanques=true;
			
			this.attachWatchToTanques();
			var viewUnwatch = this.$watch('viewTanques',function(){
				this.tanquesUnWatch();
				viewUnwatch();
			},{
				deep: true
			});
			
			
		},
		attachWatchToTanques: function(){
			this.tanquesUnWatch =  this.$watch('tanques',_.debounce(function(nVal,oVal){
				this.$http.post('/tankUpdate.json', JSON.stringify(nVal)).then(function(reponse){}, function(){ /*error*/});
				
			},500),{
				deep: true
			});
			
		},
		createTank: function(){
			this.tanquesUnWatch();
			var context = this;
			var tk = {
				id:0,
				descripcion:'',
				code:'',
				cal:0,
				insert:true
			}
			this.tanques.push(tk);
			this.$http.post('/tankUpdate.json', JSON.stringify(this.tanques)).then(function(reponse){
				setTimeout(function(){	
					context.getTanques();
					//reattach watch to profiles
					context.attachWatchToTanques();
				},1000);
			}, function(){ });  
			
		},
		deleteTank:function(argTankId){
			for(var i = 0; i < this.tanques.length; i++){
				if(this.tanques[i].id == argTankId)
				{
					var context = this;
					this.tanques[i].delete = true;
					this.$http.post('/tankUpdate.json', JSON.stringify(this.tanques)).then(function(reponse){
						setTimeout(function(){	context.getTanques();},1000);
						
					}, function(){ /*error*/});
				}
			}
		},
		
	}
})
})
