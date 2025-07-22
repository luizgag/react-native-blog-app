import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Animated,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  validationRules?: ValidationRule[];
  showValidationIcon?: boolean;
  realTimeValidation?: boolean;
}

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  multiline = false,
  secureTextEntry = false,
  showPasswordToggle = false,
  validationRules = [],
  showValidationIcon = true,
  realTimeValidation = true,
  value,
  onChangeText,
  style,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const [validationError, setValidationError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const shakeAnimation = new Animated.Value(0);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  // Real-time validation
  useEffect(() => {
    if (realTimeValidation && validationRules.length > 0 && internalValue) {
      validateInput(internalValue);
    } else if (!internalValue) {
      setValidationError('');
      setIsValid(null);
    }
  }, [internalValue, validationRules, realTimeValidation]);

  const validateInput = (inputValue: string) => {
    for (const rule of validationRules) {
      if (!rule.test(inputValue)) {
        setValidationError(rule.message);
        setIsValid(false);
        return false;
      }
    }
    setValidationError('');
    setIsValid(true);
    return true;
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validate on blur if real-time validation is enabled
    if (realTimeValidation && validationRules.length > 0 && internalValue) {
      validateInput(internalValue);
    }
  };

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    // Clear validation error when user starts typing
    if (error || validationError) {
      setValidationError('');
      setIsValid(null);
    }
  };

  const getInputStyle = () => {
    const baseStyle: any[] = [styles.input];
    
    if (multiline) {
      baseStyle.push(styles.multilineInput);
    }
    
    const currentError = error || validationError;
    if (currentError) {
      baseStyle.push(styles.inputError);
    } else if (isValid === true && showValidationIcon) {
      baseStyle.push(styles.inputValid);
    } else if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getValidationIcon = () => {
    if (!showValidationIcon || isValid === null) return null;
    
    return (
      <View style={styles.validationIcon}>
        <Text style={styles.validationIconText}>
          {isValid ? '✅' : '❌'}
        </Text>
      </View>
    );
  };

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;
  const displayError = error || validationError;

  // Trigger shake animation when there's an error
  useEffect(() => {
    if (displayError) {
      shakeInput();
    }
  }, [displayError]);

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnimation }] }
      ]}
    >
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          {...textInputProps}
          value={internalValue}
          onChangeText={handleChangeText}
          style={getInputStyle()}
          secureTextEntry={actualSecureTextEntry}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          accessibilityHint={displayError ? `Error: ${displayError}` : undefined}
        />
        
        {getValidationIcon()}
        
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
            accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityRole="button"
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {displayError && (
        <Animated.Text
          style={[styles.errorText, { opacity: displayError ? 1 : 0 }]}
          accessibilityLabel={`Error: ${displayError}`}
          accessibilityRole="alert"
        >
          {displayError}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#E53E3E',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
    minHeight: 44, // Accessibility: minimum touch target
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#E53E3E',
    borderWidth: 2,
  },
  inputValid: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  validationIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationIconText: {
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    minWidth: 44, // Accessibility: minimum touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: '#E53E3E',
    marginTop: 4,
    marginLeft: 4,
  },
});