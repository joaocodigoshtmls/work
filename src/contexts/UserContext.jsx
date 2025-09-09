import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState({
    id: '',
    nome: '',
    email: '',
    full_name: '',
    phone: '',
    cpf: '',
    profile_picture: '',
    photoURL: '',
    role: 'Usuário',
    source: 'local'
  });

  // Função para atualizar foto de perfil
  const updateProfilePicture = (newProfilePictureUrl) => {
    console.log('🔄 Context: Atualizando foto de perfil para:', newProfilePictureUrl);
    
    setUsuario(prev => {
      const updatedUser = {
        ...prev,
        profile_picture: newProfilePictureUrl,
        photoURL: newProfilePictureUrl
      };

      // Atualiza também no localStorage
      try {
        const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
        storedUser.profile_picture = newProfilePictureUrl;
        storedUser.photoURL = newProfilePictureUrl;
        localStorage.setItem("usuario", JSON.stringify(storedUser));
        console.log('✅ Context: localStorage atualizado com nova foto');
      } catch (error) {
        console.error('❌ Context: Erro ao atualizar localStorage:', error);
      }

      return updatedUser;
    });

    // Força uma re-renderização global emitindo um evento personalizado
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: { profilePicture: newProfilePictureUrl } 
    }));
  };

  // Função para atualizar dados completos do usuário
  const updateUser = (userData) => {
    setUsuario(prev => ({
      ...prev,
      ...userData
    }));
  };

  // Carrega dados do localStorage ao inicializar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("usuario");
        console.log('🔍 Context: Carregando usuário do localStorage:', storedUser);
        
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          const userData = JSON.parse(storedUser);
          console.log('✅ Context: Dados do usuário carregados:', userData);
          
          setUsuario(prev => ({
            ...prev,
            ...userData,
            nome: userData.nome || userData.full_name || userData.email?.split('@')[0] || '',
            photoURL: userData.profile_picture || userData.photoURL || userData.foto || ''
          }));
        }
      } catch (error) {
        console.error('❌ Context: Erro ao carregar usuário do localStorage:', error);
      }
    };

    loadUserFromStorage();

    // Escuta mudanças no localStorage de outras abas/janelas
    const handleStorageChange = (e) => {
      if (e.key === 'usuario') {
        console.log('🔄 Context: localStorage alterado em outra aba');
        loadUserFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    usuario,
    setUsuario,
    updateProfilePicture,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
