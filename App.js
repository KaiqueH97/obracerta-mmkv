import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Login from './src/telas/login';
import Home from './src/telas/home';
import Projetos from './src/telas/projetos';
import Calcular from './src/telas/calcular';
import ProjetoDetalhes from './src/telas/projetodetalhes';
import Cadastro from './src/telas/cadastro';

function TelaTemporaria({ rota }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialCommunityIcons name="cone" size={64} color="#ea580c" />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>
        Tela de {rota} em construção
      </Text>
    </View>
  );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MenuPrincipal() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho padrão
        tabBarActiveTintColor: '#ea580c', // Cor Laranja do Obra Certa para a aba ativa
        tabBarInactiveTintColor: '#71717a', // Cor cinza para a aba inativa
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f4f4f5',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={Home} 
        options={{ 
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
        }} 
      />
      <Tab.Screen 
        name="ProjetosTab" 
        component={Projetos}
        options={{ 
          tabBarLabel: 'Projetos',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="folder-account" size={24} color={color} />
        }} 
      />
      <Tab.Screen 
        name="CalcularTab" 
        component={Calcular}
        options={{ 
          tabBarLabel: 'Calcular',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calculator" size={24} color={color} />
        }} 
      />
      <Tab.Screen 
        name="EquipeTab" 
        component={() => <TelaTemporaria rota="Equipe" />} 
        options={{ 
          tabBarLabel: 'Equipe',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={24} color={color} />
        }} 
      />
      <Tab.Screen 
        name="PerfilTab" 
        component={() => <TelaTemporaria rota="Perfil" />} 
        options={{ 
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
        {/* Tela de Entrada (Fora do Menu) */}
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />

        {/* --- TELA DE CADASTRO */}
        <Stack.Screen 
          name="Cadastro" 
          component={Cadastro} 
          options={{ headerShown: false }} 
        />
        
        {/* Entrou no sistema, carrega o Layout com o Menu de Rodapé! */}
        <Stack.Screen 
          name="Home" 
          component={MenuPrincipal} 
          options={{ headerShown: false }} 
        />

        {/* Tela de Projetos */}
        <Stack.Screen 
          name="Projetos" 
          component={Projetos} 
          options={{ title: 'Meus Projetos' }} 
        />

        {/* Tela de Calcular / Nova Medição */}
        <Stack.Screen 
          name="Calcular" 
          component={Calcular} 
          options={{ title: 'Nova Medição' }} 
        />

        <Stack.Screen 
          name="ProjetoDetalhes" 
          component={ProjetoDetalhes} 
          options={{ headerShown: false }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}