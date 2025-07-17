import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  PostCard,
  SearchBar,
  LoadingSpinner,
  ErrorMessage,
  FormInput,
  ConfirmDialog,
  ActionButton,
} from './index';
import { Post } from '../types';

const samplePost: Post = {
  id: 1,
  title: 'Sample Blog Post',
  content: 'This is a sample blog post content to demonstrate the PostCard component.',
  author: 'John Doe',
  createdAt: '2023-01-01T00:00:00Z',
};

export const ComponentDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePostPress = (post: Post) => {
    console.log('Post pressed:', post.title);
  };

  const handleRetry = () => {
    console.log('Retry pressed');
  };

  const handleConfirm = () => {
    setShowDialog(false);
    console.log('Confirmed');
  };

  const handleCancel = () => {
    setShowDialog(false);
    console.log('Cancelled');
  };

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <PostCard post={samplePost} onPress={handlePostPress} />
      </View>

      <View style={styles.section}>
        <SearchBar onSearch={handleSearch} />
      </View>

      <View style={styles.section}>
        <LoadingSpinner message="Loading posts..." />
      </View>

      <View style={styles.section}>
        <ErrorMessage
          message="Failed to load posts"
          onRetry={handleRetry}
          type="error"
        />
      </View>

      <View style={styles.section}>
        <FormInput
          label="Email"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter your email"
          required
        />
      </View>

      <View style={styles.section}>
        <ActionButton
          title="Primary Button"
          onPress={handleButtonPress}
          loading={loading}
        />
        <ActionButton
          title="Secondary Button"
          variant="secondary"
          onPress={() => console.log('Secondary pressed')}
          style={styles.buttonSpacing}
        />
        <ActionButton
          title="Show Dialog"
          variant="destructive"
          onPress={() => setShowDialog(true)}
          style={styles.buttonSpacing}
        />
      </View>

      <ConfirmDialog
        visible={showDialog}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        destructive
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginVertical: 16,
  },
  buttonSpacing: {
    marginTop: 12,
  },
});