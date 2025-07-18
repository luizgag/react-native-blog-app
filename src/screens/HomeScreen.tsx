import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation';
import { usePosts } from '../context/PostsContext';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Post } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    posts,
    searchResults,
    searchQuery,
    isLoading,
    isSearching,
    error,
    actions: {
      fetchPosts,
      searchPosts,
      clearError,
      setSearchQuery,
    },
  } = usePosts();

  const [refreshing, setRefreshing] = useState(false);
  const { isOnline } = useNetworkStatus();

  // Fetch posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchPosts();
      } catch (error) {
        // Error is handled by context
        console.log('Failed to load posts:', error);
      }
    };

    loadPosts();
  }, [fetchPosts]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
    } catch (error) {
      // Error is handled by context
      console.log('Failed to refresh posts:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPosts]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        await searchPosts(query.trim());
      } catch (error) {
        // Error is handled by context
        console.log('Search failed:', error);
      }
    }
  }, [searchPosts, setSearchQuery]);

  // Handle post selection
  const handlePostPress = useCallback((post: Post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  }, [navigation]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    clearError();
    try {
      await fetchPosts();
    } catch (error) {
      // Error is handled by context
      console.log('Retry failed:', error);
    }
  }, [fetchPosts, clearError]);

  // Determine which posts to display
  const displayPosts = searchQuery.trim() ? searchResults : posts;
  const showLoading = isLoading && !refreshing;
  const showSearching = isSearching && searchQuery.trim();

  // Render post item
  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard post={item} onPress={handlePostPress} />
  ), [handlePostPress]);

  // Render empty state
  const renderEmptyComponent = useCallback(() => {
    if (showLoading || showSearching) {
      return null;
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No posts found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No posts available</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new content
          </Text>
        </View>
      );
    }

    return null;
  }, [showLoading, showSearching, searchQuery, searchResults.length, posts.length]);

  // Show error state
  if (error && !refreshing) {
    const errorMessage = !isOnline 
      ? 'You appear to be offline. Please check your internet connection and try again.'
      : error;
    
    return (
      <View style={styles.container}>
        <SearchBar
          onSearch={handleSearch}
          initialValue={searchQuery}
        />
        {!isOnline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>You are currently offline</Text>
          </View>
        )}
        <ErrorMessage
          message={errorMessage}
          onRetry={isOnline ? handleRetry : undefined}
          retryText={isOnline ? "Try Again" : "Retry when online"}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        onSearch={handleSearch}
        initialValue={searchQuery}
      />
      
      {showLoading && (
        <LoadingSpinner message="Loading posts..." />
      )}
      
      {showSearching && (
        <View style={styles.searchingContainer}>
          <LoadingSpinner size="small" message="Searching..." />
        </View>
      )}
      
      <FlatList
        data={displayPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Posts list"
        accessibilityHint="Swipe down to refresh posts"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  searchingContainer: {
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  offlineIndicator: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 6,
  },
  offlineText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});