export const validateRegistration = (formData) => {
    const errors = {};
  
    // First Name validation
    if (!formData.first_name || formData.first_name.trim() === '') {
      errors.first_name = 'First name is required';
    }
  
    // Last Name validation
    if (!formData.last_name || formData.last_name.trim() === '') {
      errors.last_name = 'Last name is required';
    }
  
    // Username validation
    if (!formData.username || formData.username.trim() === '') {
      errors.username = 'Username is required';
    }
  
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
  
    // Password validation
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  
    // Mobile validation
    const mobileRegex = /^[0-9]{10,12}$/;
    if (!formData.mobile || !mobileRegex.test(formData.mobile)) {
      errors.mobile = 'Valid mobile number is required';
    }
  
    // CNIC validation (Pakistani CNIC format)
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    if (!formData.cnic || !cnicRegex.test(formData.cnic)) {
      errors.cnic = 'Valid CNIC is required (Format: XXXXX-XXXXXXX-X)';
    }
  
    return errors;
  };