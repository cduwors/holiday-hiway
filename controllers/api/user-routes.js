const router = require("express").Router();
const { User } = require("../../models");
const withAuth = require("../../utils/auth");

// GET /api/users
router.get("/", (req, res) => {
	// Access our User model and run .findAll() method)
	User.findAll({
		attributes: { exclude: ["password"] },
	})
		.then((dbUserData) => res.json(dbUserData))
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// GET /api/users/1
router.get("/:id", (req, res) => {
	User.findOne({
		attributes: { exclude: ["password"] },
		where: {
			id: req.params.id,
		},
	})
		.then((dbUserData) => {
			if (!dbUserData) {
				res.status(404).json({ message: "No user found with this id" });
				return;
			}
			res.json(dbUserData);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// POST /api/users
router.post("/", (req, res) => {
	console.log(req.body);
	User.create({
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
	})
		.then((dbUserData) => {
			req.session.save(() => {
				// declare session variables
				req.session.user_id = dbUserData.dataValues.id;
				req.session.username = dbUserData.dataValues.username;
				req.session.loggedIn = true;

				res.json({ user: dbUserData, message: "You are now logged in!" });
			});
		})

		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// PUT /api/users/1
router.put("/:id", withAuth, (req, res) => {
	User.update(req.body, {
		individualHooks: true,
		where: {
			id: req.params.id,
		},
	})
		.then((dbUserData) => {
			if (!dbUserData[0]) {
				res.status(404).json({ message: "No user found with this id" });
				return;
			}
			res.json(dbUserData);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// DELETE /api/users/1
router.delete("/:id", withAuth, (req, res) => {
	User.destroy({
		where: {
			id: req.params.id,
		},
	})
		.then((dbUserData) => {
			if (!dbUserData) {
				res.status(404).json({ message: "No user found with this id" });
				return;
			}
			res.json(dbUserData);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

router.post("/login", (req, res) => {
	User.findOne({
		where: {
			email: req.body.email,
		},
	}).then((dbUserData) => {
		if (!dbUserData) {
			res.status(400).json({ message: "No user with that email address!" });
			return;
		}

		const validPassword = dbUserData.checkPassword(req.body.password);

		if (!validPassword) {
			res.status(400).json({ message: "Incorrect password!" });
			return;
		}

		req.session.save(() => {
			// declare session variables
			req.session.user_id = dbUserData.id;
			req.session.username = dbUserData.username;
			req.session.loggedIn = true;

			res.json({ user: dbUserData, message: "You are now logged in!" });
		});
	});
});

module.exports = router;
