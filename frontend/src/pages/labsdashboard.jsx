import React, {useEffect, useState} from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import axios from "axios";
import {FaChevronDown, FaEdit, FaTrash} from "react-icons/fa";

function Labsdashboard() {
	const [labTests, setLabTests] = useState([]);
	const [tests, setTests] = useState([]);
	const [formData, setFormData] = useState({
		testName: "",
		price: "",
	});

	const getTestsData = async () => {
		try {
			const response = await axios({
				url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tests/gettests`,
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
				},
			});
			setTests(response.data.tests);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getTestsData();
	}, []);

	const gettests = async () => {
		try {
			const response = await axios({
				url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tests/gettestsforlab`,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
				},
			});
			setLabTests(response.data.tests);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		gettests();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios({
				url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tests/addlabtest`,
				method: "POST",
				data: JSON.stringify({
					test_name: formData.testName,
					test_price: formData.price,
				}),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
				},
			});
			gettests();
			setFormData({
				testName: "",
				price: "",
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};

	const handleDelete = async (id) => {
		try {
			const newTests = await axios({
				url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tests/deletelabtest/${id}`,
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
				},
			});
			gettests();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<div className="bg-black">
				<Navbar />
				<div className="pt-[8rem] pb-8">
					<div className="max-w-7xl mx-auto px-4">
						<h1 className="text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text animate-gradient-x relative mb-12">
							DASHBOARD
						</h1>
					</div>
					<div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
						<h2 className="text-2xl font-bold text-white mb-6">Add New Test</h2>
						<form className="space-y-6" onSubmit={handleSubmit}>
							<div>
								<label htmlFor="testName" className="block text-gray-300 mb-2">
									Test Name
								</label>
								<div className="relative">
									<select
										id="testName"
										value={formData.testName}
										onChange={handleChange}
										className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
										required>
										<option value="" disabled>
											Select a test
										</option>
										{tests.map((test, index) => (
											<option key={index} value={test.test_name}>
												{test.test_name}
											</option>
										))}
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
										<FaChevronDown className="h-4 w-4" />
									</div>
								</div>
							</div>

							<div>
								<label htmlFor="price" className="block text-gray-300 mb-2">
									Price (₹)
								</label>
								<input
									type="number"
									id="price"
									value={formData.price}
									onChange={handleChange}
									className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
									placeholder="Enter test price"
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-200">
								Add Test
							</button>
						</form>
					</div>

					{labTests.length > 0 && (
						<div className="max-w-2xl mx-auto mt-8 bg-gray-900 p-8 rounded-lg shadow-lg">
							<h2 className="text-2xl font-bold text-white mb-6">Added Tests</h2>
							<div className="space-y-4">
								{labTests.map((test, index) => (
									<div key={index} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
										<div>
											<h3 className="text-white font-semibold">{test.test_name}</h3>
											<p className="text-gray-300 mt-1">₹{test.test_price}</p>
										</div>
										<div className="flex space-x-2">
											<button
												className="p-2 text-red-500 hover:text-red-400"
												onClick={() => handleDelete(test.test_id)}>
												<FaTrash />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
				<Footer />
			</div>
		</>
	);
}

export default Labsdashboard;
