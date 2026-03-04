/**
 * Domain validation utility for custom domain configuration
 * Supports fully qualified domain names with dots (e.g., www.example.org)
 */

export interface DomainValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validates a custom domain name
 * @param domain - The domain name to validate
 * @returns Validation result with isValid flag and user-facing message
 */
export function validateCustomDomain(domain: string): DomainValidationResult {
  // Trim whitespace
  const trimmedDomain = domain.trim();

  // Check if empty
  if (!trimmedDomain) {
    return {
      isValid: false,
      message: 'Domain name cannot be empty. Example: www.example.org',
    };
  }

  // Check length (5-253 characters for FQDN)
  if (trimmedDomain.length < 5) {
    return {
      isValid: false,
      message: 'Domain name must be at least 5 characters long. Example: www.example.org',
    };
  }

  if (trimmedDomain.length > 253) {
    return {
      isValid: false,
      message: 'Domain name must not exceed 253 characters.',
    };
  }

  // Check for valid domain format (labels separated by dots)
  // Each label must:
  // - Start and end with alphanumeric character
  // - Contain only alphanumeric characters and hyphens
  // - Be 1-63 characters long
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

  if (!domainRegex.test(trimmedDomain)) {
    return {
      isValid: false,
      message: 'Invalid domain format. Domain must contain only letters, numbers, hyphens, and dots. Labels cannot start or end with hyphens. Example: www.example.org',
    };
  }

  // Check that domain has at least one dot (TLD required)
  if (!trimmedDomain.includes('.')) {
    return {
      isValid: false,
      message: 'Domain must include a top-level domain (TLD). Example: www.example.org',
    };
  }

  // Check for consecutive dots
  if (trimmedDomain.includes('..')) {
    return {
      isValid: false,
      message: 'Domain cannot contain consecutive dots.',
    };
  }

  // Check that domain doesn't start or end with dot or hyphen
  if (/^[.-]|[.-]$/.test(trimmedDomain)) {
    return {
      isValid: false,
      message: 'Domain cannot start or end with a dot or hyphen.',
    };
  }

  // All checks passed
  return {
    isValid: true,
    message: 'Valid domain name.',
  };
}

/**
 * Normalizes a domain name by converting to lowercase and trimming
 * @param domain - The domain name to normalize
 * @returns Normalized domain name
 */
export function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase();
}
