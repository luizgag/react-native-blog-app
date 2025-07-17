import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PostCard } from '../PostCard';
import { Post } from '../../types';

const mockPost: Post = {
  id: 1,
  title: 'Test Post',
  content: 'This is a test post content',
  author: 'Test Author',
  createdAt: '2023-01-01T00:00:00Z',
};

describe('PostCard', () => {
  it('renders post information correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <PostCard post={mockPost} onPress={mockOnPress} />
    );

    expect(getByText('Test Post')).toBeTruthy();
    expect(getByText('By Test Author')).toBeTruthy();
    expect(getByText('This is a test post content')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <PostCard post={mockPost} onPress={mockOnPress} />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledWith(mockPost);
  });
});