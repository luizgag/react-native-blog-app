import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formValidationSchemas } from '../utils/validation';

type EditPostScreenNavigationProp = StackNavigationProp<MainStackParamList, 'EditPost'>;
type EditPostScreenRouteProp = RouteProp<MainStackParamList, 'EditPost'>;

interface Props {
  navigation: EditPostScreenNavigationProp;
  route: EditPostScreenRouteProp;
}

interface FormData {
  title: string;
  content: string;
  author: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  author?: string;
}

export const EditPostScreen: React.FC<Props> = ({ navigation, route }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const { 
    currentPost, 
    isLoading, 
    error: postsError, 
    actions: postsActions 
  } = usePosts();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    author: '',
  });
  
  const [originalData, setOriginalData] = useState<FormData>({
    title: '',
    content: '',
    author: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch post data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchPost = async () => {
        try {
          await postsActions.fetchPost(postId);
        } catch (error) {
          // Error is handled by the context
        }
      };

      fetchPost();

      return () => {
        // Cleanup when screen loses focus
        postsActions.clearCurrentPost();
      };
    }, [postId, postsActions])
  );

  // Initialize form data when post is loaded
  useEffect(() => {
    if (currentPost && currentPost.id === postId && !isInitialized) {
      const initialData = {
        title: currentPost.title,
        content: currentPost.content,
        author: currentPost.author,
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setIsInitialized(true);
    }
  }, [currentPost, postId, isInitialized]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters long';
    } else if (formData.content.trim().length > 10000) {
      newErrors.content = 'Content must be less than 10,000 characters';
    }

    // Author validation
    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    } else if (formData.author.trim().length < 2) {
      newErrors.author = 'Author name must be at least 2 characters long';
    } else if (formData.author.trim().length > 100) {
      newErrors.author = 'Author name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const hasChanges = (): boolean => {
    return (
      formData.title.trim() !== originalData.title.trim() ||
      formData.content.trim() !== originalData.content.trim() ||
      formData.author.trim() !== originalData.author.trim()
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      showInfo('No changes were made to the post.', 'No Changes');
      return;
    }

    setIsSubmitting(true);

    try {
      await postsActions.updatePost(postId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
      });

      // Show success message
      showSuccess('Post updated successfully!', 'Success');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Failed to update post. Please try again.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="You must be logged in to edit posts." />
      </View>
    );
  }

  if (isLoading && !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (postsError && !currentPost) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message={postsError} 
          onRetry={() => postsActions.fetchPost(postId)}
        />
      </View>
    );
  }

  if (!currentPost && !isLoading) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Post not found." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Post</Text>
          <Text style={styles.subtitle}>
            Update your post content and information
          </Text>
        </View>

        {postsError && (
          <View style={styles.errorMessage}>
            <ErrorMessage message={postsError} />
          </View>
        )}

        <View style={styles.form}>
          <FormInput
            label="Title"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            error={errors.title}
            required
            placeholder="Enter post title..."
            maxLength={200}
            validationRules={formValidationSchemas.createPost.title}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Post title"
            accessibilityHint="Enter a descriptive title for your post"
          />

          <FormInput
            label="Author"
            value={formData.author}
            onChangeText={(value) => handleInputChange('author', value)}
            error={errors.author}
            required
            placeholder="Enter author name..."
            maxLength={100}
            validationRules={formValidationSchemas.createPost.author}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Author name"
            accessibilityHint="Enter the name of the post author"
          />

          <FormInput
            label="Content"
            value={formData.content}
            onChangeText={(value) => handleInputChange('content', value)}
            error={errors.content}
            required
            multiline
            placeholder="Write your post content here..."
            maxLength={10000}
            validationRules={formValidationSchemas.createPost.content}
            realTimeValidation={true}
            showValidationIcon={false}
            accessibilityLabel="Post content"
            accessibilityHint="Enter the main content of your post"
            style={styles.contentInput}
          />

          <Text style={styles.characterCount}>
            {formData.content.length}/10,000 characters
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel post editing"
            accessibilityHint="Discard changes and go back"
          />
          
          <ActionButton
            title="Update Post"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !hasChanges()}
            style={styles.submitButton}
            accessibilityLabel="Update post"
            accessibilityHint="Save changes to the post"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  errorMessage: {
    marginBottom: 16,
  },
  form: {
    marginBottom: 32,
  },
  contentInput: {
    minHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});