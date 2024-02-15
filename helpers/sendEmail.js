import mailgun from "mailgun-js";
import "dotenv/config";

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;

const mg = mailgun({ apiKey, domain });

const sendEmail = async (data) => {
  const message = {
    from: "Easy Contacts <alice.bondarenko@gmail.com>",
    ...data,
  };

  mg.messages().send(message, (error, body) => {
    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Email sent successfully:", body);
    }
  });
};

export default sendEmail;
