define([], function () {
	return {
		template: '#homeTemplate',
		data: function () {
			return {
				config: {
					comport: '',
					availablePorts: [],
					refritemp: 0,
					refri_tol: 0
				},
				fermentadores: [],
				tanques: [],
				profiles: [],
				fermModel: {
					nombre: '',
					tanque: 0,
					perfil: 0,
					notas: ''
				},
				strs: {
					headerTitle: 'CONTROL DE FERMENTADORES'
				},
				fermSel: {
					id: 0,
					nombre: ''

				},
				alerta: {
					show: false,
					name: '',
					desc: ''
				},
				tempBancoFrio: 0,
				ready: true,
				viewList: true,
				viewListAchived: false,
				refreshInterval: null,
				profileUnWatch: null,
				selectedFerm: null,
				tanquesUnWatch: null

			}
		},
		watch: {
			'$route': function (to, from) {
				if (this.$route.params.view == 'archive') {
					this.getArchivedFerms();
				} else {
					this.getActiveFerms();
				}
			}
		},
		created: function () {
			if (this.$route.params.view == 'archive') {
				this.getArchivedFerms();
			} else {
				this.getActiveFerms();
			}
		},
		methods: {
			getArchivedFerms: function () {
				this.$router.push("/home/archive")
				this.viewList = false;
				this.viewListAchived = true;
				this.strs.headerTitle = 'HISTORIAL';

				this.getFerms(0);
				if (this.refreshInterval != null) {
					clearInterval(this.refreshInterval);
				}
				this.refreshInterval = setInterval(function () {

						this.getFerms(0);
						this.getBancoFrio();

					}
						.bind(this), 5000);

			},
			getActiveFerms: function () {
				this.$router.push("/")
				this.strs.headerTitle = 'CONTROL DE FERMENTADORES';
				this.viewList = true;
				this.viewListAchived = false;
				this.getFerms(1);
				if (this.refreshInterval != null) {
					clearInterval(this.refreshInterval);
				}
				this.refreshInterval = setInterval(function () {

						this.getFerms(1);
						this.getBancoFrio();

					}
						.bind(this), 5000);
			},
			getBancoFrio: function (active) {
				this.$http.get('/getBancoFrio.json?code=bf1').then(function (response) {
					this.tempBancoFrio = response.body.temperatura;
					return this.tempBancoFrio;
				}, function () {
					//error
				});
			},
			getFerms: function (active) {
				this.$http.get('/getFermData.json?activo=' + active).then(function (response) {
					this.fermentadores = response.body;
					return this.fermentadores;
				}, function () {
					//error
				});
			},
			getTanques: function () {
				this.$http.get('/getTanques.json').then(function (response) {
					this.tanques = response.body;
					return this.tanques;
				}, function () {
					//error
				});
			},
			manageFerm: function (argId, argAction) {
				this.$http.post('/manageFerm.json', JSON.stringify({
						id: argId,
						action: argAction
					})).then(function (reponse) {
					this.getTanques();
				}, function () {
					//error
				});

			},
			startNewFerm: function () {
				this.$router.push("/newferm");
			},
			viewFermentacion: function (argId) {
				console.log(window.location.hash.replace(/\/#\//i,''));
				this.$router.push("/ferm/" + argId + '/' + window.location.hash.replace(/#\//i,'').replace(/\//i,'-') );
			},
			editProfiles: function () {
				this.$router.push("/profiles");
			},
			editTanques: function () {
				this.$router.push("/tanques");
			},
			gimmeError: function (alerta, desc) {
				this.alerta.show = true;
				this.alerta.name = alerta;
				this.alerta.desc = desc;

			}

		}
	}
})
