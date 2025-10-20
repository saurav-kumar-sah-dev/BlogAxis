/**
 * Reusable age validation utilities
 */

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - The birth date
 * @returns {number|null} - The calculated age or null if invalid
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Check if date is valid
  if (isNaN(birth.getTime())) return null;
  
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();
  
  // Adjust age if birthday hasn't occurred this year
  return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
};

/**
 * Validate minimum age requirement
 * @param {Date|string} birthDate - The birth date
 * @param {number} minAge - Minimum required age (default: 13)
 * @returns {object} - { isValid: boolean, age: number|null, error: string|null }
 */
const validateAge = (birthDate, minAge = 13) => {
  const age = calculateAge(birthDate);
  
  if (age === null) {
    return {
      isValid: false,
      age: null,
      error: 'Invalid date of birth'
    };
  }
  
  if (age < minAge) {
    return {
      isValid: false,
      age,
      error: `You must be at least ${minAge} years old to create an account`
    };
  }
  
  return {
    isValid: true,
    age,
    error: null
  };
};

/**
 * Get date restrictions for HTML date input
 * @param {number} minAge - Minimum required age (default: 13)
 * @returns {object} - { minDate: string, maxDate: string }
 */
const getDateRestrictions = (minAge = 13) => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  
  return {
    minDate: minDate.toISOString().split('T')[0],
    maxDate: maxDate.toISOString().split('T')[0]
  };
};

module.exports = {
  calculateAge,
  validateAge,
  getDateRestrictions
};
