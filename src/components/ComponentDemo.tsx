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
  title: 'Post de Blog de Exemplo',
  content: 'Este é um conteúdo de post de blog de exemplo para demonstrar o componente PostCard.',
  author: 'João Silva',
  author_id: 1,
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
        <LoadingSpinner message="Carregando posts..." />
      </View>

      <View style={styles.section}>
        <ErrorMessage
          message="Falha ao carregar posts"
          onRetry={handleRetry}
          type="error"
        />
      </View>

      <View style={styles.section}>
        <FormInput
          label="Email"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Digite seu email"
          required
        />
      </View>

      <View style={styles.section}>
        <ActionButton
          title="Botão Primário"
          onPress={handleButtonPress}
          loading={loading}
        />
        <ActionButton
          title="Botão Secundário"
          variant="secondary"
          onPress={() => console.log('Secondary pressed')}
          style={styles.buttonSpacing}
        />
        <ActionButton
          title="Mostrar Diálogo"
          variant="destructive"
          onPress={() => setShowDialog(true)}
          style={styles.buttonSpacing}
        />
      </View>

      <ConfirmDialog
        visible={showDialog}
        title="Excluir Post"
        message="Tem certeza de que deseja excluir este post? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
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