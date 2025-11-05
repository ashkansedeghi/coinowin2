import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ModalState {
  title?: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
}

interface UIContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: number) => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant }]);
    const clear = () => dismissToast(id);
    if (typeof window !== 'undefined') {
      window.setTimeout(clear, 3000);
    } else {
      setTimeout(clear, 3000);
    }
  }, [dismissToast]);

  const openModal = useCallback((next: ModalState) => {
    setModal(next);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      openModal,
      closeModal
    }),
    [showToast, dismissToast, openModal, closeModal]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      {Boolean(toasts.length) && (
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map(toast => (
            <div key={toast.id} className="toast" data-variant={toast.variant}>
              <span>{toast.message}</span>
              <button type="button" className="btn btn-muted" onClick={() => dismissToast(toast.id)} aria-label="Close notification">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            className="modal-shell"
            onClick={event => event.stopPropagation()}
          >
            {modal.title && (
              <header>
                <h2 style={{ margin: 0 }}>{modal.title}</h2>
                <button type="button" className="btn" onClick={closeModal} aria-label="Close">
                  ×
                </button>
              </header>
            )}
            <div>{modal.content}</div>
            {modal.actions && <footer>{modal.actions}</footer>}
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};
