var chartCnf = {
	responsive: true,
	hoverMode: 'index',
	stacked: false,
	title: {
		display: true,
		text: 'Grafico de temperatura'
	},
	scales: {
		yAxes: [{
				type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
				display: true,
				position: "left",
				id: "y-axis-1",
			}
		],
	}
};
var speedData = {
	labels: [],
	datasets: [{
			label: "Temperatura",
			data: [],
			borderColor: "#0368AE",
			lineTension: 0.3,
			fill: 'start',
			yAxisID: "y-axis-1",
		}, {
			label: "Temperatura a alcanzar",
			data: [],
			borderColor: "#26B99A",
			lineTension: 0.3,
			fill: 'start',
			yAxisID: "y-axis-1"
		}
	]

};
var graphRendered = false;
function renderMainChart(data) {
	speedData.labels = data.labels;
	speedData.datasets[0].data = data.values;
	speedData.datasets[1].data = data.valuesExp;

	var lineChart = new Chart($("#speedChart"), {
			type: 'line',
			data: speedData,
			options: chartCnf
		});
	graphRendered = true;
}
$(document).ready(function () {
	var interval = setInterval(function () {
			if ($('#speedChart').length) {
				if (!graphRendered) {
					$.ajax({
						type: 'GET',
						dataType: "json",
						url: '/getFermGraphData.json?id=' + $('#fermValId').val(),
						processData: true,
						async: false,
						success: function (resp) {
							renderMainChart(resp);
						}
					});

				}
			} else {
				graphRendered = false;
			}
		},
			5000);
});
