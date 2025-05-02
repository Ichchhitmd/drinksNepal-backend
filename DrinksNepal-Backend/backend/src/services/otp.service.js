import axios from "axios";
import logger from "../configs/logger.config.js";

/**
 * Sends SMS using Sparrow SMS API
 * @param {string} phoneNumber - The recipient's phone number (10 digits)
 * @param {string} message - The message to be sent
 * @returns {Promise<boolean>} True if SMS was sent successfully, false otherwise
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    console.log(process.env.SPARROW_SMS_API_URL, process.env.SPARROW_SMS_TOKEN);
    const response = await axios.post(process.env.SPARROW_SMS_API_URL, {
      token: process.env.SPARROW_SMS_TOKEN,
      from: "Demo",
      to: phoneNumber,
      text: message,
    });

    if (response.status === 200) {
      logger.info(`SMS sent successfully to ${phoneNumber}`);
      return true;
    } else {
      logger.error(
        `Failed to send SMS to ${phoneNumber}. Status: ${response.status}`
      );
      return false;
    }
  } catch (error) {
    logger.error(`Error sending SMS to ${phoneNumber}: ${error.message}`);
    return false;
  }
};

export default {
  sendSMS,
};
