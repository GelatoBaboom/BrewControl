define([], function () {
	return {
		template: '#fermTemplate',
		data: function () {
			return {
				strs: {
					headerTitle: 'CONTROL DE FERMENTADORES'
				},
				urlback: '/',
				fermSel: {
					id: 0,
					nombre: ''

				},
				tempBancoFrio: 0,
				selectedFerm: null

			}
		},
		created: function () {
			this.viewFermentacion(this.$route.params.id);
			//this.urlback =  '/'+this.$route.params.returl.replace(/\-/i,'/')			;
			console.log(this.$route.path.replace(/\/ferm\/\d?\//i,'').replace(/\-/i,'/'));
			this.urlback =  '/'+this.$route.path.replace(/\/ferm\/\d?\//i,'').replace(/\-/i,'/');
		},
		methods: {

			viewFermentacion: function (argId) {
				this.fermSel.id = argId;
				this.$http.get('/getFermDataById.json?id=' + argId).then(function (response) {
					this.selectedFerm = response.body;

					//watch
					var unwatchFerm = this.$watch('selectedFerm', _.debounce(function (nVal, oVal) {
								nVal.action = 'update';
								this.$http.post('/manageFerm.json', JSON.stringify(nVal)).then(function (reponse) {}, function () { /*error*/
								});
							}, 500), {
							deep: true
						});
					var viewUnwatch = this.$watch('viewFerm', function () {
							unwatchFerm();
							viewUnwatch();
						}, {
							deep: true
						});

				}, function () {
					//error
				});

			}
		}
	}
})
