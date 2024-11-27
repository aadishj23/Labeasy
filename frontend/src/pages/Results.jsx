import React, {useEffect, useRef} from "react";
import Chart from "chart.js/auto";
import { loggedin } from "../store/atoms/loggedin";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useRecoilValue } from "recoil";

const Results = () => {

	const isLoggedIn = useRecoilValue(loggedin);

	if (!isLoggedIn) {
		return (
		  <div className="bg-black min-h-screen flex flex-col justify-center">
			<Navbar />
			<div className="pt-20 pb-10 px-4 md:px-8 text-white text-center">
			  <h1>Please log in to see the test results.</h1>
			</div>
		  </div>
		);
	  }

	const chartRef = useRef(null);
	const generateData = () => {
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const data = [];
		let value = 77.5; // Midpoint of 75 and 80

		// Generate past values with a random variation within 75 and 80
		for (let i = 11; i >= 0; i--) {
			const variation = (Math.random() - 0.5) * 2; // Variation between -1 and +1
			value = Math.max(75, Math.min(80, value + variation)); // Keep within 75 and 80
			data.unshift({x: months[i], y: Math.round(value * 10) / 10}); // Round to 1 decimal
		}

		// Add current value
		data.push({x: "Current", y: 77.5}); // Set a representative current value

		return data;
	};

	// Initialize chart
	useEffect(() => {
		const ctx = chartRef.current.getContext("2d");
		const hFactorChart = new Chart(ctx, {
			type: "line",
			data: {
				datasets: [
					{
						label: "H-Factor",
						data: generateData(),
						borderColor: "rgb(75, 192, 192)",
						tension: 0.3,
						fill: false,
					},
				],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: "H-Factor Trend Over Past Year",
						color: "white",
						font: {size: 16},
					},
					legend: {labels: {color: "white"}},
				},
				scales: {
					y: {
						beginAtZero: false,
						grid: {color: "rgba(255, 255, 255, 0.1)"},
						ticks: {color: "white"},
					},
					x: {
						grid: {color: "rgba(255, 255, 255, 0.1)"},
						ticks: {color: "white"},
					},
				},
			},
		});

		// Cleanup function to prevent memory leaks
		return () => hFactorChart.destroy();
	}, []);

	return (
		<div className="bg-black min-h-screen">
			<Navbar />

			<div className="pt-20 pb-10 px-4 md:px-8">
				<div className="max-w-7xl mx-auto px-4">
					<h1 className="text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text animate-gradient-x relative mb-12">
						RESULTS
					</h1>
				</div>
					<div className="max-w-6xl mx-auto bg-gray-900 rounded-lg p-6 mb-8">
						<canvas ref={chartRef} id="hFactorChart"></canvas>
					</div>

					<div className="max-w-6xl mx-auto bg-gray-900 rounded-lg p-6">
						<div className="grid grid-cols-3 gap-4 text-white font-semibold mb-4 text-center">
							<div>Test Name</div>
							<div>Report Link</div>
							<div>Test Date</div>
						</div>

						<div className="space-y-4">
							{[
								{
									name: "Liver Function Test",
									link: "https://drive.google.com/file/d/1Mgccp4JaQAR0VKQGhjjdxdPb7W9Nwo3R/view?usp=sharing",
									date: "2024-6-15",
								},
								{
									name: "Leucocytes Test",
									link: "https://drive.google.com/file/d/1AEeJK8IylqJ0_Eq2cVW_bVIvbIeOvg40/view?usp=sharing",
									date: "2024-8-10",
								},
								{
									name: "Complete Haemogram Test",
									link: "https://drive.google.com/file/d/1YUdWe27UtC0kSgZrKMNyWL_4hqGcABJn/view?usp=sharing",
									date: "2024-10-05",
								},
							].map((test, index) => (
								<div
									key={index}
									className="grid grid-cols-3 gap-4 text-gray-300 text-center items-center bg-gray-800 p-4 rounded">
									<div>{test.name}</div>
									<div>
										<a
											href={test.link}
											target="_blank"
											className="text-blue-400 hover:text-blue-300"
											rel="noopener noreferrer">
											View Report
										</a>
									</div>
									<div>{test.date}</div>
								</div>
							))}
						</div>
					</div>
			</div>

			<Footer />
		</div>
	);
};

export default Results;
