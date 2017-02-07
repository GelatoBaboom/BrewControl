define([], function (){
	return {
	name:'fermItem_'+this.id,
	template: '#fermItemTemplate',
	props: ['id','nombre_fermentacion','tanque_code', 'tanque_descripcion', 'total_hours', 'duration'],
	data: function(){
		return {
			message: 'ok'
		}
	},
	created: function(){
		console.log(this.nombre_fermentacion);
	},
	beforeDestroy: function(){
	},
	methods: {
		
	},
	watch: {
		
	}
}})