requirejs.config({
	waitSeconds: 200,
	"baseUrl": "/",
	"paths": {
		"app": "../app",
		"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
		"vue": "/node_modules/vue/dist/vue",
		"vue-material": "/node_modules/vue-material/dist/vue-material",
		"vue-resource": "//cdn.jsdelivr.net/vue.resource/1.0.3/vue-resource.min",
		"vue-router": "/node_modules/vue-router/dist/vue-router",
		"moment": "//cdn.jsdelivr.net/momentjs/2.17.0/moment-with-locales.min",
		"polyfill": "//cdn.polyfill.io/v2/polyfill.min.js",
		"loadsh": "//unpkg.com/lodash@4.13.1/lodash.min",
		"chartRender": "/interface/chartRender",
		"chartjs": "/interface/chartjs/Chart.min",
		"scripting": "/interface/scripting",
		"homeComp": "/interface/homeComp",
		"fermComp": "/interface/fermComp",
		"profComp": "/interface/profComp",
		"newfermComp": "/interface/newfermComp",
		"tankComp": "/interface/tankComp"
	},
	"shim": {
		"chartRender": ["jquery", "chartjs"],
		"scripting": ["jquery"]

	}
});
requirejs(["polyfill", "vue", "vue-material", "vue-resource", "vue-router", "loadsh", "jquery", "chartRender", "scripting", "homeComp", "fermComp", "profComp", "newfermComp", "tankComp"],
	function (Polyfill, Vue, VueMaterial, VueResource, VueRouter, loadsh, jquery, chartRender, scripting, homeComp, fermComp, profComp, newfermComp, tankComp) {
	Vue.use(VueRouter)
	Vue.use(VueMaterial)
	Vue.use(VueResource)

	Vue.material.registerTheme({
	default: {
			primary: 'blue',
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

	
	var routes = [{
			path: '/',
			name: 'home',
			component: homeComp
		}, {
			path: '/home/:view',
			name: 'homeview',
			component: homeComp
		}, {
			path: '/ferm/:id',
			name: 'fermentacion',
			component: fermComp
		}, {
			path: '/profiles',
			name: 'profiles',
			component: profComp
		}, {
			path: '/newferm',
			name: 'newferm',
			component: newfermComp
		}, {
			path: '/tanques',
			name: 'tankComp',
			component: tankComp
		}

	]

	var router = new VueRouter({
			mode: 'hash',
			routes: routes
		});
	var app = new Vue({
			el: '#app',
			router: router
		});
	console.log("app", app)
})
