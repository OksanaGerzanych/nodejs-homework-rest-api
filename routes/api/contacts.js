const express = require("express");
const { isValidId } = require("../../middlewares");

const contactsController = require("../../controllers/contacts");

const router = express.Router();

router.get("/", contactsController.getAllContacts);

router.get("/:id", isValidId, contactsController.getContactById);

router.post("/", contactsController.addContact);

router.delete("/:id", isValidId, contactsController.removeContact);

router.put("/:id", isValidId, contactsController.updateContact);

router.patch(
  "/:id/favorite",
  isValidId,
  contactsController.updateStatusContact
);

module.exports = router;
