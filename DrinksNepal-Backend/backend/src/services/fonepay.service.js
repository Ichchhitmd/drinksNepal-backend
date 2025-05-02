import axios from "axios";
import crypto from "crypto";
import xml2js from "xml2js";
import logger from "../configs/logger.config.js";
import HttpError from "../error/custom.error.js";

/**
 * Generate payment details for Fonepay integration
 * @param {Object} order - The order object
 * @returns {Object} Payment details including process URL and payment data
 */
const generatePaymentDetails = (order) => {
  const date = new Date().toLocaleDateString("en-US");
  const paymentData = {
    RU: `${process.env.SITE_URL}/api/payment/verify/`,
    PID: process.env.FONEPAY_MERCHANT_ID,
    PRN: order.orderId,
    AMT: order.totalAmount.toFixed(1),
    CRN: "NPR",
    DT: date,
    R1: `Order-${order.orderId}`,
    R2: `User-${order.user}`,
    MD: "P",
  };

  // Generate DV (verification hash)
  const dvString = `${paymentData.PID},${paymentData.MD},${paymentData.PRN},${paymentData.AMT},${paymentData.CRN},${paymentData.DT},${paymentData.R1},${paymentData.R2},${paymentData.RU}`;

  const hmac = crypto.createHmac("sha512", process.env.FONEPAY_SECRET_KEY);
  hmac.update(dvString);
  paymentData.DV = hmac.digest("hex");

  return {
    processUrl: `${process.env.FONEPAY_API_URL}api/merchantRequest`,
    paymentData,
  };
};

/**
 * Verify payment status with Fonepay
 * @param {string} transactionId - Unique transaction ID
 * @param {string} prn - Payment reference number
 * @param {string} bid - Bank ID
 * @param {number} amount - Transaction amount
 * @returns {Promise<Object>} Verification result
 */
const verifyPayment = async (UID, prn, bid, amount) => {
  const verificationData = {
    PRN: prn,
    PID: process.env.FONEPAY_MERCHANT_ID,
    BID: bid || "",
    AMT: amount.toString(),
    UID: UID,
  };

  // Generate verification hash
  const dvString = `${verificationData.PID},${verificationData.AMT},${verificationData.PRN},${verificationData.BID},${verificationData.UID}`;

  const hmac = crypto.createHmac("sha512", process.env.FONEPAY_SECRET_KEY);
  hmac.update(dvString);
  verificationData.DV = hmac.digest("hex");

  try {
    const verifyUrl = `${process.env.FONEPAY_API_URL}api/merchantRequest/verificationMerchant`;
    const response = await axios.get(verifyUrl, { params: verificationData });

    if (response.status === 200) {
      try {
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);

        logger.info(`Fonepay verification response: ${JSON.stringify(result)}`);

        if (result && result.response) {
          return result.response;
        }

        throw new HttpError(400, "Invalid response format");
      } catch (error) {
        logger.error(`XML parsing error: ${error.message}`);
        throw new HttpError(500, "Failed to parse XML response");
      }
    }

    throw new HttpError(400, "Verification failed");
  } catch (error) {
    logger.error(`Fonepay verification error: ${error.message}`);
    throw new HttpError(error.status || 500, error.message);
  }
};

export default {
  generatePaymentDetails,
  verifyPayment,
};
