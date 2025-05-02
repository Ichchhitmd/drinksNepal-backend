const responseDTO = (status, message, data = null, error = undefined) => {
  const response = {
    status,
    message,
    // Include 'data' only if it's not null
    ...(data !== null && { data }),
    // Include 'error' only if it's defined
    ...(error !== null && { error }),
  };

  return response;
};

export default responseDTO;
