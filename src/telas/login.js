import AuthLayout from '../components/AuthLayout';
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from "react-native";
import { storage } from '../storage/storage'; // Importando a instância do MMKV

// Função utilitária para os alertas funcionarem tanto no celular quanto no navegador
const mostrarAlerta = (titulo, mensagem) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState("user@obracerta.com");
  const [senha, setSenha] = useState("obra123");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !senha) {
      mostrarAlerta("Atenção", "Por favor, preencha e-mail e senha.");
      return;
    }

    setCarregando(true);

    try {
      // Mantemos o setTimeout para simular o tempo de carregamento visual
      setTimeout(() => {
        
        // DEPOIS (MMKV): Código síncrono, sem async/await
        storage.set('@usuario_email', email.trim());
        
        setCarregando(false);
        
        // Pula para a tela Home (limpando o histórico para não voltar pro login)
        navigation.replace('Home');
      }, 1500); 
      
    } catch (_error) {
      setCarregando(false);
      mostrarAlerta("Erro", "Não foi possível realizar o login.");
    }
  };

  return (
    <AuthLayout>
      <View style={styles.card}>
        <Text style={styles.title}>Obra Certa</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!carregando}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite sua senha"
              secureTextEntry={true}
              editable={!carregando}
            />
          </View>

          <TouchableOpacity
            style={[styles.btnSubmit, carregando && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnSubmitText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => mostrarAlerta('Em breve', 'Tela de recuperação em construção')}>
              <Text style={styles.linkText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.textGray}>Não tem uma conta? </Text>
              {/* Agora navega de verdade para a tela de Cadastro */}
              <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.linkRegister}>Cadastre-se aqui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    color: '#ea580c',
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 18,
    color: '#000',
    backgroundColor: '#fff',
  },
  btnSubmit: {
    width: '100%',
    backgroundColor: '#ea580c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  textGray: {
    color: '#4b5563',
    fontSize: 16,
  },
  linkRegister: {
    color: '#ea580c',
    fontWeight: 'bold',
    fontSize: 16,
  }
});