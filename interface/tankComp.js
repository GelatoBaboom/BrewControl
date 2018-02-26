define([], function () {
	return {
		template: '#tankTemplate',
		data: function () {
			return {
				config: {
					comport: '',
					availablePorts: [],
					refritemp: 0,
					refri_tol: 0
				},
				tanques: [],
				strs: {
					headerTitle: 'TANQUES FERMENTADORES'
				},
				tanquesUnWatch: null,
				unwatchConfig: null

			}
		},
		watch: {},
		created: function () {
			this.getTanques();
			this.editTanques();
			this.getConfigs();
			this.getPorts();
		},
		methods: {
			getTanques: function () {
				this.$http.get('/getTanques.json').then(function (response) {
					this.tanques = response.body;
					return this.tanques;
				}, function () {
					//error
				});
			},
			editTanques: function () {
				this.strs.headerTitle = 'TANQUES FERMENTADORES';
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
				this.unwatchConfig = this.$watch('config', _.debounce(function (nVal, oVal) {
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
