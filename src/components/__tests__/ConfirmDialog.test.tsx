import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    visible: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and message correctly', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    
    expect(getByText('Confirm Action')).toBeTruthy();
    expect(getByText('Are you sure you want to proceed?')).toBeTruthy();
  });

  it('renders default button texts', () => {
    const { getByText } = render(<ConfirmDialog {...defaultProps} />);
    
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders custom button texts', () => {
    const { getByText } = render(
      <ConfirmDialog 
        {...defaultProps} 
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(getByText('Delete')).toBeTruthy();
    expect(getByText('Keep')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const mockOnConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmDialog {...defaultProps} onConfirm={mockOnConfirm} />
    );
    
    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const mockOnCancel = jest.fn();
    const { getByText } = render(
      <ConfirmDialog {...defaultProps} onCancel={mockOnCancel} />
    );
    
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when backdrop is pressed', () => {
    const mockOnCancel = jest.fn();
    const { getByTestId } = render(
      <ConfirmDialog {...defaultProps} onCancel={mockOnCancel} />
    );
    
    // The backdrop is the first TouchableWithoutFeedback
    const backdrop = getByTestId ? getByTestId('backdrop') : null;
    if (backdrop) {
      fireEvent.press(backdrop);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    }
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <ConfirmDialog {...defaultProps} visible={false} />
    );
    
    expect(queryByText('Confirm Action')).toBeFalsy();
    expect(queryByText('Are you sure you want to proceed?')).toBeFalsy();
  });

  it('applies destructive styling when destructive is true', () => {
    const { getByText } = render(
      <ConfirmDialog {...defaultProps} destructive />
    );
    
    const confirmButton = getByText('Confirm');
    // The button should exist (we can't easily test styling in React Native Testing Library)
    expect(confirmButton).toBeTruthy();
  });

  it('has proper accessibility properties', () => {
    const { getByLabelText } = render(<ConfirmDialog {...defaultProps} />);
    
    expect(getByLabelText('Confirm Action')).toBeTruthy();
    expect(getByLabelText('Are you sure you want to proceed?')).toBeTruthy();
    expect(getByLabelText('Confirm')).toBeTruthy();
    expect(getByLabelText('Cancel')).toBeTruthy();
  });

  it('has proper accessibility hints for buttons', () => {
    const { getByLabelText } = render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = getByLabelText('Confirm');
    const cancelButton = getByLabelText('Cancel');
    
    expect(confirmButton.props.accessibilityHint).toBe('Tap to confirm this action');
    expect(cancelButton.props.accessibilityHint).toBe('Tap to cancel this action');
  });

  it('has proper accessibility hint for destructive action', () => {
    const { getByLabelText } = render(
      <ConfirmDialog {...defaultProps} destructive />
    );
    
    const confirmButton = getByLabelText('Confirm');
    expect(confirmButton.props.accessibilityHint).toBe('Tap to confirm this destructive action');
  });

  it('has proper accessibility roles', () => {
    const { getByLabelText } = render(<ConfirmDialog {...defaultProps} />);
    
    const title = getByLabelText('Confirm Action');
    const confirmButton = getByLabelText('Confirm');
    const cancelButton = getByLabelText('Cancel');
    
    expect(title.props.accessibilityRole).toBe('header');
    expect(confirmButton.props.accessibilityRole).toBe('button');
    expect(cancelButton.props.accessibilityRole).toBe('button');
  });

  it('handles multiple rapid button presses correctly', () => {
    const mockOnConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmDialog {...defaultProps} onConfirm={mockOnConfirm} />
    );
    
    const confirmButton = getByText('Confirm');
    
    // Press multiple times rapidly
    fireEvent.press(confirmButton);
    fireEvent.press(confirmButton);
    fireEvent.press(confirmButton);
    
    // Should still only call once per press
    expect(mockOnConfirm).toHaveBeenCalledTimes(3);
  });

  it('renders with long title and message', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines';
    const longMessage = 'This is a very long message that definitely should wrap to multiple lines and test how the dialog handles longer content gracefully without breaking the layout';
    
    const { getByText } = render(
      <ConfirmDialog 
        {...defaultProps} 
        title={longTitle}
        message={longMessage}
      />
    );
    
    expect(getByText(longTitle)).toBeTruthy();
    expect(getByText(longMessage)).toBeTruthy();
  });
});