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
				viewAddNew: false,
				viewListAchived: false,
				viewTanques: false,
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
				this.getTanques();
				this.getConfigs();
				this.getPorts();
			}
		},
		created: function () {
			if (this.$route.params.view == 'archive') {
				this.getArchivedFerms();
			} else {
				this.getActiveFerms();
			}
			this.getTanques();
			this.getConfigs();
			this.getPorts();

		},
		methods: {
			getArchivedFerms: function () {
				this.$router.push("/home/archive")
				this.viewList = false;
				this.viewListAchived = true;
				this.viewAddNew = false;
				this.viewTanques = false;
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
				this.viewAddNew = false;
				this.viewTanques = false;
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
			startNewFerm: function () {
				this.$router.push("/newferm");
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
			viewFermentacion: function (argId) {
				this.$router.push("/ferm/" + argId);
			},
			editProfiles: function () {
				this.$router.push("/profiles");
			},
			editTanques: function () {
				this.strs.headerTitle = 'TANQUES FERMENTADORES';
				this.viewList = false;
				this.viewListAchived = false;
				this.viewAddNew = false;
				this.viewTanques = true;
				//watch tanks
				this.attachWatchToTanques();
				var viewUnwatch = this.$watch('viewTanques', function () {
						this.tanquesUnWatch();
						unwatchConfig();
						viewUnwatch();
					}, {
						deep: true
					});
				//watch configs
				var unwatchConfig = this.$watch('config', _.debounce(function (nVal, oVal) {
							this.$http.post('/updateConfigs.json', JSON.stringify(nVal)).then(function (reponse) {}, function () { /*error*/
							});
						}, 500), {
						deep: true
					});

			},
			attachWatchToTanques: function () {
				this.tanquesUnWatch = this.$watch('tanques', _.debounce(function (nVal, oVal) {
							this.$http.post('/tankUpdate.json', JSON.stringify(nVal)).then(function (reponse) {}, function () { /*error*/
							});

						}, 500), {
						deep: true
					});

			},
			createTank: function () {
				this.tanquesUnWatch();
				var context = this;
				var tk = {
					id: 0,
					descripcion: '',
					code: '',
					cal: 0,
					insert: true
				}
				this.tanques.push(tk);
				this.$http.post('/tankUpdate.json', JSON.stringify(this.tanques)).then(function (reponse) {
					setTimeout(function () {
						context.getTanques();
						//reattach watch to profiles
						context.attachWatchToTanques();
					}, 1000);
				}, function () {});

			},
			deleteTank: function (argTankId) {
				if (confirm('¿Estas seguro de borrar este tanque?')) {
					for (var i = 0; i < this.tanques.length; i++) {
						if (this.tanques[i].id == argTankId) {
							var context = this;
							this.tanques[i].delete  = true;
							this.$http.post('/tankUpdate.json', JSON.stringify(this.tanques)).then(function (reponse) {
								setTimeout(function () {
									context.getTanques();
								}, 1000);

							}, function () { /*error*/
							});
						}
					}
				}
			},
			getConfigs: function () {
				this.$http.get('/getConfigs.json').then(function (response) {
					this.config.comport = response.body.comport;
					this.config.refritemp = response.body.refritemp;
					this.config.refri_tol = response.body.refri_tol;

				}, function () {
					//error
				});

			},
			getPorts: function () {
				this.$http.get('/getPorts.json').then(function (response) {
					this.config.availablePorts = response.body;
				}, function () {
					//error
				});

			},
			gimmeError: function (alerta, desc) {
				this.alerta.show = true;
				this.alerta.name = alerta;
				this.alerta.desc = desc;

			}

		}
	}
})
