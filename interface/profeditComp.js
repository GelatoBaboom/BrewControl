define([], function () {
	return {
		template: '#profeditTemplate',
		data: function () {
			return {
				profiles: [],
				strs: {
					headerTitle: 'PERFILES'
				},
				profile: {
					id: 0,
					nombre: '',
					duration: 0,
					mapa: []
				},
				profileUnWatch: null
			}
		},
		watch: {
			'this.profile': function (newval) {
				console.log(newval);

			}
		},
		created: function () {
			this.profile.id = this.$route.params.id;
			this.getProfiles();
		},
		methods: {
			getProfiles: function () {
				this.$http.get('/getProfiles.json').then(function (response) {
					this.profiles = response.body;
					this.profile = this.getProfileById(this.$route.params.id);
					console.log(this.profile);
					this.editProfiles();
					return this.profiles;
				}, function () {
					//error
				});
			},
			getProfileById: function (id) {
				var el = this.profiles.filter(function (t) {
						return t.id == id
					})[0];
				return {
					id: el.id,
					nombre: el.nombre,
					duration: el.duration,
					mapa: el.mapa
				}
			},
			editProfiles: function () {
				this.strs.headerTitle = 'PERFILES';
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

		}
	}
})
