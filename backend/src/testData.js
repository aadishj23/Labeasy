// Assuming Express and Prisma Client are already set up
const express = require("express");
const router = express.Router();
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const { auth } = require('./middleware/auth');

// Route to fetch all customer tests ordered from a specific lab
router.get("/fetchcustomertests", auth, async (req, res) => {
	try {
		// Extract the lab_id from query parameters (assuming each lab has a unique ID)
		const {labId} = req.query;

		if (!labId) {
			return res.status(400).json({error: "Lab ID is required"});
		}

		// Fetch all tests ordered by users from the specified lab
		const customerTests = await prisma.userTest.findMany({
			where: {
				lab_id: labId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				test: {
					select: {
						id: true,
						test_name: true,
						test_description: true,
					},
				},
				lab: {
					select: {
						id: true,
						lab_name: true,
					},
				},
			},
		});

		// Respond with the data
		res.status(200).json(customerTests);
	} catch (error) {
		console.error("Error fetching customer tests:", error);
		res.status(500).json({error: "An error occurred while fetching customer tests"});
	}
});

// Route for a user to buy a test
router.post("/buytest", auth, async (req, res) => {
	try {
		// Extract user ID, lab ID, test ID, and test price from request body
		const {userId, labId, testId, testPrice} = req.body;

		// Validate required fields
		if (!userId || !labId || !testId || !testPrice) {
			return res.status(400).json({error: "userId, labId, testId, and testPrice are required"});
		}

		// Check if the user has already bought this test from this lab
		const existingOrder = await prisma.userTest.findUnique({
			where: {
				user_id_test_id_lab_id: {
					user_id: userId,
					test_id: testId,
					lab_id: labId,
				},
			},
		});

		if (existingOrder) {
			return res.status(400).json({error: "This test has already been purchased from this lab by the user"});
		}

		// Create a new UserTest record
		const userTest = await prisma.userTest.create({
			data: {
				user_id: userId,
				lab_id: labId,
				test_id: testId,
				test_price: testPrice,
			},
		});

		// Respond with the newly created order
		res.status(201).json({
			message: "Test purchased successfully",
			userTest,
		});
	} catch (error) {
		console.error("Error purchasing test:", error);
		res.status(500).json({error: "An error occurred while purchasing the test"});
	}
});

module.exports = router;
