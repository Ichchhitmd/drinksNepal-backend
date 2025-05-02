import axios from "axios";
import logger from "../configs/logger.config.js";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_URL = process.env.GOOGLE_MAPS_API_URL;

const fetchDistanceAndTime = async (origin, destination) => {
  try {
    const response = await axios.get(GOOGLE_MAPS_API_URL, {
      params: {
        units: "metric",
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const data = response.data;

    if (data.rows[0].elements[0].status === "OK") {
      const { distance, duration } = data.rows[0].elements[0];
      return {
        distance: distance.text,
        duration: duration.text,
      };
    } else {
      logger.error(
        "Error fetching distance and time:",
        data.rows[0].elements[0].status
      );
      return { distance: null, duration: null };
    }
  } catch (error) {
    logger.info("Error fetching distance and me form google api:", error);
    return { distance: null, duration: null };
  }
};

export default { fetchDistanceAndTime };
