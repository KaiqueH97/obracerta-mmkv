import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Home({ navigation }) {
  // Dados fixos apenas para visualização do Front-end (Mock)
  const metricas = {
    obrasAtivas: 2,
    tarefasConcluidas: 18,
    tarefasPendentes: 3,
    custoTotal: '15.450,00'
  };

  const projetos = [
    { id: '1', titulo: 'Reforma Escola Municipal', status: 'Em andamento' },
    { id: '2', titulo: 'Construção Anexo Fatec', status: 'Em andamento' }
  ];

  return (
    <View style={styles.container}>
      
      {/* NOVO TOPO: Tarja Preta com Capacete */}
      <View style={styles.blackHeader}>
        <MaterialCommunityIcons name="hard-hat" size={32} color="#ea580c" />
        <Text style={styles.headerBrand}>
          Obra <Text style={styles.headerBrandHighlight}>Certa</Text>
        </Text>
      </View>

      {/* 
        O contentContainerStyle é o segredo para o ScrollView rolar! 
        Ele aplica o padding por dentro do conteúdo, permitindo chegar até o fim.
      */}
      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Saudação */}
        <View style={styles.greeting}>
          <Text style={styles.title}>Resumo da Obra</Text>
          <Text style={styles.subtitle}>Veja o status dos seus canteiros hoje.</Text>
        </View>

        {/* ACESSO RÁPIDO */}
        <View style={styles.quickAccess}>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#ea580c' }]}
            onPress={() => navigation.navigate('CalcularTab')}
          >
            {/* Ícone de Calculadora adicionado aqui */}
            <MaterialCommunityIcons name="calculator" size={24} color="#fff" />
            <Text style={styles.btnText}>Nova Medição</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#27272a' }]}
            onPress={() => navigation.navigate('ProjetosTab')}
          >
            <MaterialCommunityIcons name="folder-account" size={24} color="#fff" />
            <Text style={styles.btnText}>Meus Projetos</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS DE MÉTRICAS */}
        <View style={styles.gridContainer}>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}>
              <MaterialCommunityIcons name="domain" size={24} color="#2563eb" />
            </View>
            <Text style={styles.cardLabel}>Obras Ativas</Text>
            <Text style={styles.cardValue}>{metricas.obrasAtivas}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#d1fae5' }]}>
              <MaterialCommunityIcons name="check-decagram" size={24} color="#059669" />
            </View>
            <Text style={styles.cardLabel}>Tarefas OK</Text>
            <Text style={styles.cardValue}>{metricas.tarefasConcluidas}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#ffedd5' }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ea580c" />
            </View>
            <Text style={styles.cardLabel}>Pendentes</Text>
            <Text style={[styles.cardValue, { color: '#ea580c' }]}>{metricas.tarefasPendentes}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#f3e8ff' }]}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#9333ea" />
            </View>
            <Text style={styles.cardLabel}>Custo Materiais</Text>
            <Text style={styles.cardValue}>R$ {metricas.custoTotal}</Text>
          </View>
        </View>

        {/* LISTA DE PROJETOS RECENTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projetos Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projetos')}>
              <Text style={styles.linkText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {projetos.map((projeto) => (
            <View key={projeto.id} style={styles.projectItem}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{projeto.titulo}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{projeto.status}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.openBtn}>
                <Text style={styles.openBtnText}>Abrir</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#ea580c" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa', // Fundo de toda a tela
  },
  blackHeader: {
    backgroundColor: '#18181b', // Preto escuro/chumbo
    paddingTop: 50, // Espaço para não ficar embaixo do relógio do celular
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#ea580c', // Detalhe laranja embaixo da tarja
  },
  headerBrand: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  headerBrandHighlight: {
    color: '#ea580c', // Laranja Obra Certa
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60, // Esse espaço no final faz o ScrollView não travar!
  },
  greeting: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18181b',
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 4,
  },
  quickAccess: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    marginBottom: 16,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#18181b',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
  },
  linkText: {
    color: '#ea580c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: 'bold',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openBtnText: {
    color: '#ea580c',
    fontWeight: '600',
    fontSize: 14,
  }
});