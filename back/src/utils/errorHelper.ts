const errorHelper = {
    error: (statusCode: number, message: string) => {
      return {
        statusCode,
        message,
      };
    },
  };
  
  export { errorHelper };