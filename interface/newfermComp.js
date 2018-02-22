define([], function () {
	return {
		template: '#newfermTemplate',
		data: function () {
			return {
				tanques: [],
				profiles: [],
				fermModel: {
					nombre: '',
					tanque: 0,
					perfil: 0,
					notas: ''
				},
				strs: {
					headerTitle: 'NUEVA FERMENTACIÓN'
				}
			}
		},
		watch: {},
		created: function () {
			this.getTanques();
			this.getProfiles();
		},
		methods: {
			createFerm: function () {
				this.viewList = true;
				this.viewListAchived = false;
				this.viewAddNew = false;
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
				this.$router.push("/");
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
			}
		}
	}
})
