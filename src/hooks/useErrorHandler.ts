import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ErrorState {
  hasError: boolean;
  error: string | null;
  isLoading: boolean;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isLoading: false
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error caught:', error);
    
    let errorMessage = customMessage || 'Ocorreu um erro inesperado';
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = 'Você não tem permissão para esta ação.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = 'Recurso não encontrado.';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      } else {
        errorMessage = error.message || errorMessage;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setErrorState({
      hasError: true,
      error: errorMessage,
      isLoading: false
    });
    
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isLoading: false
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setErrorState(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    customErrorMessage?: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      clearError();
      
      const result = await asyncFunction();
      setLoading(false);
      return result;
    } catch (error) {
      handleError(error, customErrorMessage);
      setLoading(false);
      return null;
    }
  }, [handleError, clearError, setLoading]);

  return {
    ...errorState,
    handleError,
    clearError,
    setLoading,
    executeWithErrorHandling
  };
};
