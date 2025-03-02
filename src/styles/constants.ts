/**
 * Style constants for the Afkar application
 * These values should be used consistently across the application
 */

// Colors
export const colors = {
  // Main brand colors
  brand: {
    primary: "#212280", // Primary brand color - deep blue
    secondary: "#6A55FF", // Secondary brand color - purple
    secondaryHover: "#5a47e0", // Hover state for secondary color
  },
  
  // Gradients
  gradients: {
    brandGradient: "linear-gradient(45deg, #6A55FF 0%, #475467 100%)",
    blueGradient: "linear-gradient(344.17deg, #00A6FF 4.22%, #80DDFF 85.61%)",
    purpleGradient: "linear-gradient(326.99deg, #6A55FF -1.86%, #C3B4FF 79.66%)",
  },
  
  // UI Colors
  ui: {
    white: "#FFFFFF",
    background: "#F6F6FA", // Light gray background
    yellow: "#FEC84B", // Warning/accent yellow
  },
  
  // Text colors (Gray scale)
  text: {
    primary: "#101828", // Gray 900 - Primary text
    secondary: "#344054", // Gray 700 - Secondary text
    tertiary: "#475467", // Gray 600 - Tertiary text
    muted: "#667085", // Gray 500 - Muted text
  },
  
  // Border colors
  border: {
    light: "#D0D5DD", // Gray 300 - Light border
  },
};

// Typography
export const typography = {
  fontFamily: "'Inter', sans-serif",
  
  // Font weights
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  
  // Heading sizes
  heading: {
    xs: {
      fontSize: "18px",
      lineHeight: "28px",
    },
    sm: {
      fontSize: "24px",
      lineHeight: "32px",
    },
    md: {
      fontSize: "30px",
      lineHeight: "38px",
    },
    lg: {
      fontSize: "36px",
      lineHeight: "44px",
    },
    xl: {
      fontSize: "60px",
      lineHeight: "72px",
      letterSpacing: "-0.02em",
    },
  },
  
  // Text sizes
  text: {
    xs: {
      fontSize: "12px",
      lineHeight: "18px",
    },
    sm: {
      fontSize: "14px",
      lineHeight: "20px",
    },
    md: {
      fontSize: "16px",
      lineHeight: "24px",
    },
    lg: {
      fontSize: "18px",
      lineHeight: "28px",
    },
  },
};

// Spacing
export const spacing = {
  unit: 4, // Base unit in pixels
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

// Border radius
export const borderRadius = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "18px", // Used for buttons in the design
  full: "200px", // For avatars/circles
};

// Shadows
export const shadows = {
  xs: "0px 1px 2px rgba(16, 24, 40, 0.05)",
  sm: "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
  md: "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
  lg: "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
};

// Layout
export const layout = {
  maxContentWidth: "1440px",
  formWidth: "360px",
  sectionWidth: "720px",
};

// Common component styles as Tailwind classes
export const componentStyles = {
  button: {
    primary: "bg-[#6A55FF] hover:bg-[#5a47e0] text-white py-4 px-7 rounded-[18px] font-semibold shadow-xs",
    secondary: "bg-white border border-[#D0D5DD] text-[#344054] py-4 px-4 rounded-[18px] font-semibold shadow-xs",
    icon: "flex items-center justify-center gap-2",
  },
  input: {
    base: "w-full rounded-[8px] border border-[#D0D5DD] py-[10px] px-[14px] shadow-xs",
    label: "text-sm font-medium text-[#344054]",
    placeholder: "text-[#667085]",
  },
  form: {
    container: "space-y-5",
    fieldGroup: "space-y-1.5",
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  componentStyles,
}; 