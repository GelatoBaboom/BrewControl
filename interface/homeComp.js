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
				viewFerm: false,
				viewProfiles: false,
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
				this.getProfiles();
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
			this.getProfiles();
			this.getConfigs();
			this.getPorts();

		},
		methods: {
			getArchivedFerms: function () {
				this.$router.push("/archive")
				this.viewList = false;
				this.viewListAchived = true;
				this.viewAddNew = false;
				this.viewFerm = false;
				this.viewProfiles = false;
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
				this.viewFerm = false;
				this.viewProfiles = false;
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
			getInactiveTanks: function () {
				console.log(this.tanques);
				return this.tanques.filter(function (t) {
					return t.inUse == 0
				})
			},
			getProfiles: function () {
				this.$http.get('/getProfiles.json').then(function (response) {
					this.profiles = response.body;
					return this.profiles;
				}, function () {
					//error
				});
			},
			startNewFerm: function () {
				if (this.refreshInterval != null) {
					this.strs.headerTitle = 'NUEVA FERMENTACI�N';
					clearInterval(this.refreshInterval);
					this.viewList = false;
					this.viewListAchived = false;
					this.viewAddNew = true;
					this.viewFerm = false;
					this.viewProfiles = false;
					this.viewTanques = false;

				}

			},
			createFerm: function () {
				this.viewList = true;
				this.viewListAchived = false;
				this.viewAddNew = false;
				this.viewFerm = false;
				this.viewProfiles = false;
				this.viewTanques = false;
				this.getTanques();
				this.$http.post('/createFerm.json', JSON.stringify(this.fermModel)).then(function (reponse) {
					this.fermModel = {
						nombre: '',
						tanque: 0,
						perfil: 0,
						notas: ''
					};
				}, function () {
					//error
				});
				this.getActiveFerms();
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
				this.$router.push("/ferm/" + argId)
			},
			editProfiles: function () {
				this.strs.headerTitle = 'PERFILES';
				this.viewList = false;
				this.viewListAchived = false;
				this.viewAddNew = false;
				this.viewFerm = false;
				this.viewProfiles = true;
				this.viewTanques = false;
				this.attachWatchToProfiles();
				var viewUnwatch = this.$watch('viewProfiles', function () {
						this.profileUnWatch();
						viewUnwatch();
					}, {
						deep: true
					});
			},
			attachWatchToProfiles: function () {
				console.log('attach!');
				this.profileUnWatch = this.$watch('profiles', _.debounce(function (nVal, oVal) {
							this.$http.post('/profUpdate.json', JSON.stringify(nVal)).then(function (reponse) {}, function () { /*error*/
							});

						}, 2000), {
						deep: true
					});

			},
			deleteMapPoint: function (argProfId, argMapId) {
				for (var i = 0; i < this.profiles.length; i++) {
					if (this.profiles[i].id == argProfId) {
						for (var ii = 0; ii < this.profiles[i].mapa.length; ii++) {
							if (this.profiles[i].mapa[ii].id == argMapId) {
								var context = this;
								this.profiles[i].mapa[ii].delete  = true;
								this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function (reponse) {
									setTimeout(function () {
										context.getProfiles();
									}, 1000);

								}, function () { /*error*/
								});
							}
						}
					}
				}
			},
			createMapPoint: function (argProfId) {
				this.profileUnWatch();
				for (var i = 0; i < this.profiles.length; i++) {
					if (this.profiles[i].id == argProfId) {
						var context = this;
						var prf = {
							id: 0,
							tempFrom: 0,
							tempTo: 0,
							temp: 0,
							tolerancia: 0,
							insert: true
						}
						this.profiles[i].mapa.push(prf);
						this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function (reponse) {
							setTimeout(function () {
								context.getProfiles();
								//reattach watch to profiles
								context.attachWatchToProfiles();
							}, 2000);
						}, function () {});

					}
				}

			},
			deleteProf: function (argProfId) {
				if (confirm('�Estas seguro de borrar este perfil?')) {
					for (var i = 0; i < this.profiles.length; i++) {
						if (this.profiles[i].id == argProfId) {
							var context = this;
							this.profiles[i].delete  = true;
							this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function (reponse) {
								setTimeout(function () {
									context.getProfiles();
								}, 1000);

							}, function () { /*error*/
							});
						}
					}
				}
			},
			createProfile: function () {
				this.profileUnWatch();
				var context = this;
				var prf = {
					id: 0,
					nombre: '',
					duration: 0,
					mapa: [],
					insert: true
				}
				this.profiles.push(prf);
				this.$http.post('/profUpdate.json', JSON.stringify(this.profiles)).then(function (reponse) {
					setTimeout(function () {
						context.getProfiles();
						//reattach watch to profiles
						context.attachWatchToProfiles();
					}, 1000);
				}, function () {});
			},
			editTanques: function () {
				this.strs.headerTitle = 'TANQUES FERMENTADORES';
				this.viewList = false;
				this.viewListAchived = false;
				this.viewAddNew = false;
				this.viewFerm = false;
				this.viewProfiles = false;
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
				if (confirm('�Estas seguro de borrar este tanque?')) {
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
					console.log(response.body);
					this.config.comport = response.body.comport;
					this.config.refritemp = response.body.refritemp;
					this.config.refri_tol = response.body.refri_tol;

				}, function () {
					//error
				});

			},
			getPorts: function () {
				this.$http.get('/getPorts.json').then(function (response) {
					console.log(response.body);
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
