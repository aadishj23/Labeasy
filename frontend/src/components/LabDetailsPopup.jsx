import {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {FaStar, FaTimes, FaShoppingCart} from "react-icons/fa";

function LabDetailsPopup({testId, testName, onClose, labsdata}) {
	const [selectedLabs, setSelectedLabs] = useState([]);

	useEffect(() => {
		const existingCart = JSON.parse(localStorage.getItem("cart")) || {cartItems: []};
		const labIdsInCart = existingCart.cartItems.filter((item) => item.testId === testId).map((item) => item.labId);
		setSelectedLabs(labIdsInCart);
	}, [testId]);

	const handleAddToCart = (lab) => {
		const cartItem = {
			testId,
			testName,
			labId: lab.lab_id,
			labName: lab.lab_name,
			price: 0.8 * lab.test_price,
		};

		const existingCart = JSON.parse(localStorage.getItem("cart")) || {cartItems: []};
		if (!existingCart.cartItems.some((item) => item.testId === testId && item.labId === lab.lab_id)) {
			existingCart.cartItems.push(cartItem);
			localStorage.setItem("cart", JSON.stringify(existingCart));
			setSelectedLabs((prevSelectedLabs) => [...prevSelectedLabs, lab.lab_id]);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
				<button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
					<FaTimes className="w-6 h-6" />
				</button>

				<h2 className="text-2xl font-bold mb-4">{testName}</h2>
				<p className="text-gray-600 mb-6">Compare prices from different labs</p>

				<div className="space-y-4">
					{labsdata.map((lab) => {
						const randomRating = (Math.floor(Math.random() * (48 - 39 + 1)) + 39) / 10;
						const randomReviewCount = Math.floor(Math.random() * (125 - 75 + 1)) + 75;
						return (
							<div key={lab.lab_id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="font-bold text-lg">{lab.lab_name}</h3>
										<p className="text-gray-600 text-sm">Delhi</p>
										<div className="flex items-center mt-1">
											<div className="flex items-center bg-green-100 px-2 py-1 rounded">
												<span className="text-green-700 font-bold mr-1">{randomRating.toFixed(1)}</span>
												<FaStar className="text-green-700 w-4 h-4" />
											</div>
											<span className="text-gray-500 text-sm ml-2">({randomReviewCount} reviews)</span>
										</div>
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold">₹{0.8 * lab.test_price}</div>
										<div className="text-gray-500 line-through text-sm">₹{lab.test_price}</div>
										<div className="text-green-600 text-sm font-semibold">20% off</div>
									</div>
								</div>

								<div className="mt-4 flex items-center justify-between">
									<div className="text-gray-600">
										<span className="font-semibold">Report in: 12 hours</span>
									</div>
									<button
										onClick={() => handleAddToCart(lab)}
										disabled={selectedLabs.includes(lab.lab_id)}
										className={`flex items-center px-4 py-2 rounded ${
											selectedLabs.includes(lab.lab_id)
												? "bg-gray-400 cursor-not-allowed"
												: "bg-blue-600 hover:bg-blue-700"
										} text-white`}>
										<FaShoppingCart className="mr-2" />
										{selectedLabs.includes(lab.lab_id) ? "Added to Cart" : "Add to Cart"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

LabDetailsPopup.propTypes = {
	testId: PropTypes.string.isRequired,
	testName: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	labsdata: PropTypes.arrayOf(
		PropTypes.shape({
			lab_id: PropTypes.string.isRequired,
			lab_name: PropTypes.string.isRequired,
			test_price: PropTypes.number.isRequired,
		}),
	).isRequired,
};

export default LabDetailsPopup;
