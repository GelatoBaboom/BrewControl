define([], function () {
	return {
		template: '#profTemplate',
		data: function () {
			return {
				profiles: [],
				strs: {
					headerTitle: 'PERFILES'
				},
				profileUnWatch: null
			}
		},
		watch: {
			'$route': function (to, from) {
				// if (this.$route.params.view == 'archive') {
				// this.getArchivedFerms();
				// } else {
				// this.getActiveFerms();
				// }

			}
		},
		created: function () {
			this.getProfiles();
			this.editProfiles();
		},
		methods: {
			getProfiles: function () {
				this.$http.get('/getProfiles.json').then(function (response) {
					this.profiles = response.body;
					return this.profiles;
				}, function () {
					//error
				});
			},
			editProfiles: function () {
				this.strs.headerTitle = 'PERFILES';
				this.attachWatchToProfiles();
			},
			attachWatchToProfiles: function () {
				this.profileUnWatch = this.$watch('profiles', _.debounce(function (nVal, oVal) {
							this.$http.post('/profUpdate.json', JSON.stringify(nVal)).then(function (reponse) {}, function () { /*error*/
							});

						}, 2000), {
						deep: true
					});

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
			},
			createProfile: function () {
				this.profileUnWatch();
				var context = this;
				var prf = {
					id: 0,
					nombre: 'Nuevo',
					duration: 0,
					mapa: [],
					insert: true
				}
				//this.profiles.push(prf);
				this.$http.post('/profUpdateSingle.json', JSON.stringify(prf)).then(function (reponse) {
					setTimeout(function () {
						context.getProfiles();
						//reattach watch to profiles
						context.attachWatchToProfiles();
					}, 1000);
				}, function () {});
			}

		}
	}
})
