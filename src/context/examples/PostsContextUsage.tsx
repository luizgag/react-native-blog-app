import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert, StyleSheet } from 'react-native';
import { 
  usePosts, 
  usePostsState, 
  usePostsActions, 
  usePostsSearch, 
  usePostsCrud,
  PostsProvider 
} from '../index';
import { Post } from '../../types';

/**
 * Example components demonstrating how to use the PostsContext and related hooks
 * This file serves as documentation and can be used for manual testing
 */

// Example 1: Using the main usePosts hook
export const PostsListExample: React.FC = () => {
  const { posts, isLoading, error, actions } = usePosts();

  useEffect(() => {
    // Fetch posts when component mounts
    actions.fetchPosts().catch(() => {
      // Error is handled by context
    });
  }, [actions]);

  const handleRefresh = async () => {
    try {
      await actions.fetchPosts();
      Alert.alert('Success', 'Posts refreshed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh posts');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts do Blog</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Clear Error" onPress={actions.clearError} />
        </View>
      )}
      
      <Button title="Refresh Posts" onPress={handleRefresh} />
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        style={styles.list}
      />
    </View>
  );
};

// Example 2: Using usePostsState for read-only access
export const PostsStatsExample: React.FC = () => {
  const { posts, isLoading, searchResults, searchQuery } = usePostsState();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts Statistics</Text>
      <Text>Total Posts: {posts.length}</Text>
      <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text>Search Query: {searchQuery || 'None'}</Text>
      <Text>Search Results: {searchResults.length}</Text>
    </View>
  );
};

// Example 3: Using usePostsActions for action-only access
export const PostActionsExample: React.FC = () => {
  const { fetchPosts, clearError } = usePostsActions();

  const handleFetchPosts = async () => {
    try {
      await fetchPosts();
      Alert.alert('Success', 'Posts fetched successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch posts');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Actions</Text>
      <View style={styles.buttonContainer}>
        <Button title="Fetch Posts" onPress={handleFetchPosts} />
        <Button title="Clear Error" onPress={clearError} />
      </View>
    </View>
  );
};

// Example 4: Using usePostsSearch for search functionality
export const PostsSearchExample: React.FC = () => {
  const { 
    searchResults, 
    searchQuery, 
    isSearching, 
    error,
    handleSearchQueryChange, 
    clearSearch 
  } = usePostsSearch(500); // 500ms debounce

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Posts</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search posts..."
        value={searchQuery}
        onChangeText={handleSearchQueryChange}
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Clear Search" onPress={clearSearch} />
      </View>
      
      {isSearching && <Text>Searching...</Text>}
      
      {error && (
        <Text style={styles.errorText}>Search Error: {error}</Text>
      )}
      
      <Text style={styles.subtitle}>
        Search Results ({searchResults.length})
      </Text>
      
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        style={styles.list}
      />
    </View>
  );
};

// Example 5: Using usePostsCrud for CRUD operations
export const PostsCrudExample: React.FC = () => {
  const { createPost, updatePost, deletePost, error, isLoading } = usePostsCrud();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await createPost({ title, content, author });
    
    if (result.success) {
      Alert.alert('Success', 'Post created successfully!');
      setTitle('');
      setContent('');
      setAuthor('');
    } else {
      Alert.alert('Error', result.error || 'Failed to create post');
    }
  };

  const handleUpdatePost = async () => {
    const result = await updatePost(1, { title: 'Updated Title' });
    
    if (result.success) {
      Alert.alert('Success', 'Post updated successfully!');
    } else {
      Alert.alert('Error', result.error || 'Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePost(1);
            
            if (result.success) {
              Alert.alert('Success', 'Post deleted successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Post</Text>
      
      {error && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Post title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Author name"
        value={author}
        onChangeText={setAuthor}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Post content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Creating..." : "Create Post"} 
          onPress={handleCreatePost}
          disabled={isLoading}
        />
        <Button 
          title="Update Post #1" 
          onPress={handleUpdatePost}
          disabled={isLoading}
        />
        <Button 
          title="Delete Post #1" 
          onPress={handleDeletePost}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

// Example 6: Post detail view with current post
export const PostDetailExample: React.FC = () => {
  const { currentPost, isLoading, error, actions } = usePosts();

  const handleFetchPost = async (id: number) => {
    try {
      await actions.fetchPost(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch post');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Detail</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Load Post #1" onPress={() => handleFetchPost(1)} />
        <Button title="Load Post #2" onPress={() => handleFetchPost(2)} />
        <Button title="Clear Post" onPress={actions.clearCurrentPost} />
      </View>
      
      {isLoading && <Text>Loading post...</Text>}
      
      {error && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
      
      {currentPost ? (
        <View style={styles.postDetail}>
          <Text style={styles.postTitle}>{currentPost.title}</Text>
          <Text style={styles.postAuthor}>By: {currentPost.author}</Text>
          <Text style={styles.postContent}>{currentPost.content}</Text>
          {currentPost.createdAt && (
            <Text style={styles.postDate}>
              Created: {new Date(currentPost.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      ) : (
        <Text>No post selected</Text>
      )}
    </View>
  );
};

// Helper component for rendering individual posts
const PostItem: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <View style={styles.postItem}>
      <Text style={styles.postItemTitle}>{post.title}</Text>
      <Text style={styles.postItemAuthor}>By: {post.author}</Text>
      <Text style={styles.postItemContent} numberOfLines={2}>
        {post.content}
      </Text>
    </View>
  );
};

// Example 7: Complete app wrapper showing how to use PostsProvider
export const AppWithPostsExample: React.FC = () => {
  return (
    <PostsProvider>
      <View style={{ flex: 1 }}>
        <PostsListExample />
        <PostsStatsExample />
        <PostsSearchExample />
        <PostsCrudExample />
        <PostDetailExample />
      </View>
    </PostsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  list: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  postItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  postItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postItemAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  postItemContent: {
    fontSize: 14,
    color: '#333',
  },
  postDetail: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
});