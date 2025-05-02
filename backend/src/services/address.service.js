import logger from "../configs/logger.config.js";
import HttpError from "../error/custom.error.js";
import { User } from "../models/models.js";

const createAddress = async (
  userId,
  longitude,
  latitude,
  addressDetails,
  isDefault
) => {
  if (!userId || !longitude || !latitude || !addressDetails) {
    logger.error("Missing required fields for creating address");
    throw new HttpError(400, "Missing required fields");
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.error(`User not found with ID: ${userId}`);
    throw new HttpError(404, "User not found");
  }

  const newAddress = {
    longitude,
    latitude,
    addressDetails,
    isDefault: isDefault || false,
  };

  if (isDefault) {
    // Set all other addresses to non-default
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  user.addresses.push(newAddress);
  await user.save();

  // Get the newly created address with its ID
  const createdAddress = user.addresses[user.addresses.length - 1];
  return {
    _id: createdAddress._id,
    longitude: createdAddress.longitude,
    latitude: createdAddress.latitude,
    addressDetails: createdAddress.addressDetails,
    isDefault: createdAddress.isDefault,
  };
};

const getAddresses = async (userId) => {
  const user = await User.findById(userId).select("addresses");
  if (!user) {
    logger.error(`User not found with ID: ${userId}`);
    throw new HttpError(404, "User not found");
  }

  const defaultAddresses = user.addresses.filter(
    (address) => address.isDefault
  );
  const nonDefaultAddresses = user.addresses.filter(
    (address) => !address.isDefault
  );

  return [...defaultAddresses, ...nonDefaultAddresses];
};

const updateAddress = async (userId, addressId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    logger.error(`User not found with ID: ${userId}`);
    throw new HttpError(404, "User not found");
  }

  const addressIndex = user.addresses.findIndex(
    (address) => address._id.toString() === addressId
  );

  if (addressIndex === -1) {
    logger.error(`Address not found with ID: ${addressId} for user: ${userId}`);
    throw new HttpError(404, "Address not found");
  }

  // Only update the fields provided in updateData
  Object.keys(updateData).forEach((key) => {
    if (key in user.addresses[addressIndex]) {
      user.addresses[addressIndex][key] = updateData[key];
    }
  });

  if (updateData.isDefault) {
    user.addresses.forEach((address, index) => {
      if (index !== addressIndex) {
        address.isDefault = false;
      }
    });
  }

  await user.save();

  return user.addresses[addressIndex];
};

const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    logger.error(`User not found with ID: ${userId}`);
    throw new HttpError(404, "User not found");
  }

  const addressIndex = user.addresses.findIndex(
    (address) => address._id.toString() === addressId
  );

  if (addressIndex === -1) {
    logger.error(`Address not found with ID: ${addressId} for user: ${userId}`);
    throw new HttpError(404, "Address not found");
  }

  const deletedAddress = user.addresses[addressIndex];
  user.addresses.splice(addressIndex, 1);

  if (deletedAddress.isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return user;
};

export default {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
