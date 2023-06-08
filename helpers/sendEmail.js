const Mailjet = require("node-mailjet");
require("dotenv").config();

const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE, MJ_SENDER_EMAIL } = process.env;

const mailjet = new Mailjet({
  apiKey: MJ_APIKEY_PUBLIC,
  apiSecret: MJ_APIKEY_PRIVATE,
});

// const data = {
//   to: "",
//   subject: "",
//   html: "",
// };

const sendEmail = async (data) => {
  await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: MJ_SENDER_EMAIL,
        },
        To: [
          {
            Email: data.to,
          },
        ],
        Subject: data.subject,
        TextPart: "Привіт. Ми тестуємо надсилання листів!",
        HTMLPart: data.html,
      },
    ],
  });

  request
    .then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.log(err.statusCode);
    });
  return true;
};

module.exports = sendEmail;
