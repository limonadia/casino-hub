
export const validationService = {

  requiredValidator: (value: string, field: string) => {
    return value && value.trim() !== ""
      ? null
      : { key: "required", params: { field } };
  },

  emailValidator: (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value)
      ? null
      : { key: "invalidEmail", params: {} };
  },

  minLengthValidator: (value: string, length: number) => {
    return value && value.length >= length
      ? null
      : { key: "minLength", params: { length } };
  },
  
    phoneValidator: (value: string) => {
      const phonePattern = /^[0-9]{10}$/;
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return emailPattern.test(value) || phonePattern.test(value) || "error_invalid_phone";
    },
  
    maxLengthValidator: (value: string | any[], length: number) => {
      return value && value.length <= length || { key: "error_max_length", params: { length } };
    },
  
    passwordValidators: {
      lowerCase: (value: string) => /[a-z]/.test(value) || "error_lowercase_password",
      upperCase: (value: string) => /[A-Z]/.test(value) || "error_uppercase_password",
      symbol: (value: string) => /[@$!%*?&]/.test(value) || "error_special_character_password",
      number: (value: string) => /\d/.test(value) || "error_number_password",
      length: (value: string | any[]) => value?.length >= 8 || "error_length_password"
    }
  };


  