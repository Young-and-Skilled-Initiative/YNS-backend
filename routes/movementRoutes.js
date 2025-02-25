const express = require("express");
const { joinMovement } = require("../controller/movementController");


const router = express.Router();

router.post("/join-movement", joinMovement);

module.exports = router;