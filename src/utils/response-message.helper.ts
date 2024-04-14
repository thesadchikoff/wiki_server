const responseMessage = (
  isSuccess: boolean,
  title: string,
  description: string,
) => {
  return {
    success: isSuccess,
    message: {
      title,
      description,
    },
  };
};

export default responseMessage;
