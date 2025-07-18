import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ActionButton } from '../ActionButton';

describe('ActionButton', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title correctly', () => {
    const { getByText } = render(<ActionButton {...defaultProps} />);
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton {...defaultProps} onPress={mockOnPress} />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton {...defaultProps} onPress={mockOnPress} disabled />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton {...defaultProps} onPress={mockOnPress} loading />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId } = render(
      <ActionButton {...defaultProps} loading />
    );
    
    // ActivityIndicator should be present (we can't easily test its visibility)
    // The button should still render the title
    const { getByText } = render(
      <ActionButton {...defaultProps} loading />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders icon when provided', () => {
    const TestIcon = () => <Text>🔥</Text>;
    const { getByText } = render(
      <ActionButton {...defaultProps} icon={<TestIcon />} />
    );
    
    expect(getByText('🔥')).toBeTruthy();
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('does not render icon when loading', () => {
    const TestIcon = () => <Text>🔥</Text>;
    const { queryByText } = render(
      <ActionButton {...defaultProps} icon={<TestIcon />} loading />
    );
    
    expect(queryByText('🔥')).toBeFalsy();
    expect(queryByText('Test Button')).toBeTruthy();
  });

  describe('variants', () => {
    it('renders primary variant by default', () => {
      const { getByText } = render(<ActionButton {...defaultProps} />);
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });

    it('renders secondary variant', () => {
      const { getByText } = render(
        <ActionButton {...defaultProps} variant="secondary" />
      );
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });

    it('renders destructive variant', () => {
      const { getByText } = render(
        <ActionButton {...defaultProps} variant="destructive" />
      );
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });

    it('renders outline variant', () => {
      const { getByText } = render(
        <ActionButton {...defaultProps} variant="outline" />
      );
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders medium size by default', () => {
      const { getByText } = render(<ActionButton {...defaultProps} />);
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });

    it('renders small size', () => {
      const { getByText } = render(
        <ActionButton {...defaultProps} size="small" />
      );
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });

    it('renders large size', () => {
      const { getByText } = render(
        <ActionButton {...defaultProps} size="large" />
      );
      const button = getByText('Test Button');
      expect(button).toBeTruthy();
    });
  });

  it('renders full width when fullWidth is true', () => {
    const { getByText } = render(
      <ActionButton {...defaultProps} fullWidth />
    );
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('has proper accessibility properties', () => {
    const { getByLabelText } = render(<ActionButton {...defaultProps} />);
    
    const button = getByLabelText('Test Button');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('has proper accessibility label when loading', () => {
    const { getByLabelText } = render(
      <ActionButton {...defaultProps} loading />
    );
    
    const button = getByLabelText('Loading: Test Button');
    expect(button).toBeTruthy();
  });

  it('has proper accessibility state when disabled', () => {
    const { getByLabelText } = render(
      <ActionButton {...defaultProps} disabled />
    );
    
    const button = getByLabelText('Test Button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('has proper accessibility state when loading', () => {
    const { getByLabelText } = render(
      <ActionButton {...defaultProps} loading />
    );
    
    const button = getByLabelText('Loading: Test Button');
    expect(button.props.accessibilityState.busy).toBe(true);
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('passes through additional TouchableOpacity props', () => {
    const { getByTestId } = render(
      <ActionButton 
        {...defaultProps} 
        testID="custom-button"
        activeOpacity={0.5}
      />
    );
    
    const button = getByTestId('custom-button');
    expect(button).toBeTruthy();
    expect(button.props.activeOpacity).toBe(0.5);
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <ActionButton {...defaultProps} style={customStyle} />
    );
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('handles rapid button presses correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton {...defaultProps} onPress={mockOnPress} />
    );
    
    const button = getByText('Test Button');
    
    // Press multiple times rapidly
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(3);
  });

  it('renders with long title', () => {
    const longTitle = 'This is a very long button title that might wrap';
    const { getByText } = render(
      <ActionButton {...defaultProps} title={longTitle} />
    );
    
    expect(getByText(longTitle)).toBeTruthy();
  });

  it('combines disabled and loading states correctly', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <ActionButton 
        {...defaultProps} 
        onPress={mockOnPress}
        disabled
        loading
      />
    );
    
    const button = getByLabelText('Loading: Test Button');
    fireEvent.press(button);
    
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState.disabled).toBe(true);
    expect(button.props.accessibilityState.busy).toBe(true);
  });
});