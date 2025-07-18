import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';

// Mock timers for debounce testing
jest.useFakeTimers();

describe('SearchBar', () => {
  const defaultProps = {
    onSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('renders with default placeholder', () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
    
    expect(getByPlaceholderText('Search posts...')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar {...defaultProps} placeholder="Custom placeholder" />
    );
    
    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('renders with initial value', () => {
    const { getByDisplayValue } = render(
      <SearchBar {...defaultProps} initialValue="initial search" />
    );
    
    expect(getByDisplayValue('initial search')).toBeTruthy();
  });

  it('updates search term when text changes', () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
    
    const input = getByPlaceholderText('Search posts...');
    fireEvent.changeText(input, 'test search');
    
    expect(input.props.value).toBe('test search');
  });

  it('shows clear button when there is text', () => {
    const { getByPlaceholderText, getByLabelText } = render(
      <SearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    fireEvent.changeText(input, 'test');
    
    expect(getByLabelText('Clear search')).toBeTruthy();
  });

  it('hides clear button when there is no text', () => {
    const { getByPlaceholderText, queryByLabelText } = render(
      <SearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    fireEvent.changeText(input, '');
    
    expect(queryByLabelText('Clear search')).toBeFalsy();
  });

  it('clears text when clear button is pressed', () => {
    const { getByPlaceholderText, getByLabelText } = render(
      <SearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    fireEvent.changeText(input, 'test');
    
    const clearButton = getByLabelText('Clear search');
    fireEvent.press(clearButton);
    
    expect(input.props.value).toBe('');
  });

  it('debounces search calls with default delay', async () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={mockOnSearch} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    
    // Type multiple characters quickly
    fireEvent.changeText(input, 't');
    fireEvent.changeText(input, 'te');
    fireEvent.changeText(input, 'tes');
    fireEvent.changeText(input, 'test');
    
    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time by default debounce delay (300ms)
    jest.advanceTimersByTime(300);
    
    // Should have called onSearch once with the final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('debounces search calls with custom delay', async () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={mockOnSearch} debounceMs={500} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    fireEvent.changeText(input, 'test');
    
    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time by less than custom delay
    jest.advanceTimersByTime(400);
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time by custom delay
    jest.advanceTimersByTime(100);
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('calls onSearch immediately with initial value', () => {
    const mockOnSearch = jest.fn();
    render(
      <SearchBar onSearch={mockOnSearch} initialValue="initial" />
    );
    
    // Fast-forward to trigger initial debounced call
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith('initial');
  });

  it('cancels previous debounced call when new text is entered', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={mockOnSearch} debounceMs={300} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    
    // Type first text
    fireEvent.changeText(input, 'first');
    
    // Wait almost the full debounce time
    jest.advanceTimersByTime(250);
    
    // Type new text before debounce completes
    fireEvent.changeText(input, 'second');
    
    // Complete the original debounce time
    jest.advanceTimersByTime(50);
    
    // Should not have called with 'first'
    expect(mockOnSearch).not.toHaveBeenCalledWith('first');
    
    // Complete the new debounce time
    jest.advanceTimersByTime(300);
    
    // Should have called with 'second'
    expect(mockOnSearch).toHaveBeenCalledWith('second');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility properties', () => {
    const { getByLabelText, getByPlaceholderText } = render(
      <SearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    expect(input.props.accessibilityLabel).toBe('Search posts');
    expect(input.props.accessibilityHint).toBe('Enter keywords to search for posts');
    expect(input.props.accessibilityRole).toBe('search');
    
    // Add text to show clear button
    fireEvent.changeText(input, 'test');
    
    const clearButton = getByLabelText('Clear search');
    expect(clearButton.props.accessibilityHint).toBe('Tap to clear search text');
    expect(clearButton.props.accessibilityRole).toBe('button');
  });

  it('handles empty search correctly', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={mockOnSearch} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    
    // Type text then clear it
    fireEvent.changeText(input, 'test');
    fireEvent.changeText(input, '');
    
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenLastCalledWith('');
  });

  it('handles rapid text changes correctly', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={mockOnSearch} debounceMs={100} />
    );
    
    const input = getByPlaceholderText('Search posts...');
    
    // Simulate rapid typing
    const searchTerms = ['a', 'ab', 'abc', 'abcd', 'abcde'];
    searchTerms.forEach(term => {
      fireEvent.changeText(input, term);
      jest.advanceTimersByTime(50); // Less than debounce time
    });
    
    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Complete the debounce time
    jest.advanceTimersByTime(100);
    
    // Should have called onSearch once with the final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('abcde');
  });
});