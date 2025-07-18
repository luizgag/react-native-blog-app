import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FormInput } from '../FormInput';

describe('FormInput', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label correctly', () => {
    const { getByText } = render(<FormInput {...defaultProps} />);
    
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders required indicator when required is true', () => {
    const { getByText } = render(
      <FormInput {...defaultProps} required />
    );
    
    expect(getByText('*')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <FormInput {...defaultProps} onChangeText={mockOnChangeText} />
    );
    
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'new text');
    
    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('displays error message when error prop is provided', () => {
    const { getByText } = render(
      <FormInput {...defaultProps} error="This field is required" />
    );
    
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('shows password toggle when showPasswordToggle is true', () => {
    const { getByLabelText } = render(
      <FormInput 
        {...defaultProps} 
        secureTextEntry 
        showPasswordToggle 
      />
    );
    
    expect(getByLabelText('Show password')).toBeTruthy();
  });

  it('toggles password visibility when password toggle is pressed', () => {
    const { getByLabelText } = render(
      <FormInput 
        {...defaultProps} 
        secureTextEntry 
        showPasswordToggle 
      />
    );
    
    const toggleButton = getByLabelText('Show password');
    fireEvent.press(toggleButton);
    
    expect(getByLabelText('Hide password')).toBeTruthy();
  });

  it('validates input with validation rules', async () => {
    const validationRules = [
      {
        test: (value: string) => value.length >= 3,
        message: 'Must be at least 3 characters',
      },
    ];
    
    const { getByDisplayValue, queryByText } = render(
      <FormInput 
        {...defaultProps} 
        validationRules={validationRules}
        realTimeValidation
      />
    );
    
    const input = getByDisplayValue('');
    
    // Type invalid text
    fireEvent.changeText(input, 'ab');
    
    await waitFor(() => {
      expect(queryByText('Must be at least 3 characters')).toBeTruthy();
    });
    
    // Type valid text
    fireEvent.changeText(input, 'abc');
    
    await waitFor(() => {
      expect(queryByText('Must be at least 3 characters')).toBeFalsy();
    });
  });

  it('shows validation icon when showValidationIcon is true', async () => {
    const validationRules = [
      {
        test: (value: string) => value.length >= 3,
        message: 'Must be at least 3 characters',
      },
    ];
    
    const { getByDisplayValue, getByText } = render(
      <FormInput 
        {...defaultProps} 
        validationRules={validationRules}
        showValidationIcon
        realTimeValidation
      />
    );
    
    const input = getByDisplayValue('');
    
    // Type valid text
    fireEvent.changeText(input, 'valid text');
    
    await waitFor(() => {
      expect(getByText('✅')).toBeTruthy();
    });
  });

  it('handles multiline input correctly', () => {
    const { getByDisplayValue } = render(
      <FormInput {...defaultProps} multiline />
    );
    
    const input = getByDisplayValue('');
    expect(input.props.multiline).toBe(true);
  });

  it('clears validation error when user starts typing', async () => {
    const { getByDisplayValue, queryByText } = render(
      <FormInput {...defaultProps} error="Initial error" />
    );
    
    const input = getByDisplayValue('');
    
    expect(queryByText('Initial error')).toBeTruthy();
    
    fireEvent.changeText(input, 'new text');
    
    await waitFor(() => {
      expect(queryByText('Initial error')).toBeFalsy();
    });
  });

  it('validates on blur when realTimeValidation is enabled', async () => {
    const validationRules = [
      {
        test: (value: string) => value.length >= 3,
        message: 'Must be at least 3 characters',
      },
    ];
    
    const { getByDisplayValue, queryByText } = render(
      <FormInput 
        {...defaultProps} 
        validationRules={validationRules}
        realTimeValidation
      />
    );
    
    const input = getByDisplayValue('');
    
    // Type invalid text but don't trigger real-time validation
    fireEvent.changeText(input, 'ab');
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(queryByText('Must be at least 3 characters')).toBeTruthy();
    });
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(
      <FormInput {...defaultProps} />
    );
    
    expect(getByLabelText('Test Label')).toBeTruthy();
  });

  it('has accessibility hint when there is an error', () => {
    const { getByLabelText } = render(
      <FormInput {...defaultProps} error="Test error" />
    );
    
    const input = getByLabelText('Test Label');
    expect(input.props.accessibilityHint).toBe('Error: Test error');
  });

  it('handles focus and blur events', () => {
    const { getByDisplayValue } = render(<FormInput {...defaultProps} />);
    
    const input = getByDisplayValue('');
    
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    // Should not throw any errors
    expect(input).toBeTruthy();
  });

  it('updates internal value when value prop changes', () => {
    const { rerender, getByDisplayValue } = render(
      <FormInput {...defaultProps} value="initial" />
    );
    
    expect(getByDisplayValue('initial')).toBeTruthy();
    
    rerender(<FormInput {...defaultProps} value="updated" />);
    
    expect(getByDisplayValue('updated')).toBeTruthy();
  });
});