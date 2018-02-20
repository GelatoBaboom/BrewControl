var chartCnf = {
	responsive: true,
	hoverMode: 'index',
	stacked: false,
	title: {
		display: true,
		text: 'Grafico de cantidad de enviados y apertura'
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
				label: "Cantidad enviados",
				data: [],
				borderColor: "#0368AE",
				lineTension: 0.3,
				fill: 'start',
				yAxisID: "y-axis-1",
			}
		]

	};
	function renderMainChart(data) {
		speedData.labels = data.labels;
		speedData.datasets[0].data = data.values;

		var lineChart = new Chart($("#speedChart"), {
				type: 'line',
				data: speedData,
				options: chartCnf
			});
	}
	$(document).ready(function () {
		var interval = setInterval(function () {
				if ($('#speedChart').length) {
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
					clearInterval(interval);
					//reiniciarlo en algun lado
				}
			}, 5000);
	});
