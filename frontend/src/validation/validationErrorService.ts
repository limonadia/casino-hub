
export const validationErrorService = {
  getErrorMessage: (error: any): string => {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (error.key) {
      if (error.key === "required") return `${error.params.field} is required`;
      if (error.key === "invalidEmail") return `Please enter a valid email`;
      if (error.key === "minLength") return `Minimum length is ${error.params.length}`;
    }
    return "Invalid field";
  },
};

