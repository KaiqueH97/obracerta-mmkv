import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Projetos({ navigation }) {
  const [projetos, setProjetos] = useState([]);
  const [novoProjeto, setNovoProjeto] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Estados para controlar Edição e Exclusão
  const [projetoEditando, setProjetoEditando] = useState(null);
  const [tituloEditado, setTituloEditado] = useState("");
  const [projetoConfirmarExclusao, setProjetoConfirmarExclusao] = useState(null);

  // 1. CARREGAR PROJETOS DO BANCO LOCAL
  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    try {
      const dados = await AsyncStorage.getItem('@meus_projetos');
      if (dados !== null) {
        setProjetos(JSON.parse(dados));
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar as obras.");
    } finally {
      setCarregando(false);
    }
  };

  // 2. CRIAR NOVO PROJETO
  const criarProjeto = async () => {
    if (!novoProjeto.trim()) {
      Alert.alert("Aviso", "Digite um nome para a obra.");
      return;
    }

    const novoObj = {
      id: Date.now().toString(), // Gera um ID único baseado na hora
      titulo: novoProjeto,
      criado_em: new Date().toISOString(),
    };

    try {
      const novaLista = [novoObj, ...projetos];
      await AsyncStorage.setItem('@meus_projetos', JSON.stringify(novaLista));
      setProjetos(novaLista);
      setNovoProjeto("");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a obra.");
    }
  };

  // 3. INICIAR EDIÇÃO
  const iniciarEdicao = (projeto) => {
    setProjetoEditando(projeto.id);
    setTituloEditado(projeto.titulo);
    setProjetoConfirmarExclusao(null); 
  };

  // 4. SALVAR EDIÇÃO
  const salvarEdicao = async (id) => {
    if (!tituloEditado.trim()) {
      Alert.alert("Aviso", "O nome da obra não pode ficar vazio.");
      return;
    }

    try {
      const listaAtualizada = projetos.map(p => 
        p.id === id ? { ...p, titulo: tituloEditado } : p
      );
      await AsyncStorage.setItem('@meus_projetos', JSON.stringify(listaAtualizada));
      setProjetos(listaAtualizada);
      setProjetoEditando(null);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível atualizar a obra.");
    }
  };

  // 5. CONFIRMAR EXCLUSÃO
  const confirmarExclusaoProjeto = async (id) => {
    try {
      const listaFiltrada = projetos.filter(p => p.id !== id);
      await AsyncStorage.setItem('@meus_projetos', JSON.stringify(listaFiltrada));
      setProjetos(listaFiltrada);
      setProjetoConfirmarExclusao(null);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível excluir a obra.");
    }
  };

  // Função auxiliar para formatar a data
  const formatarData = (dataIso) => {
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR');
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* NOVO TOPO: Tarja Preta */}
      <View style={styles.blackHeader}>
        <Text style={styles.headerTitle}>Meus Projetos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* FORMULÁRIO DE CRIAÇÃO */}
        <View style={styles.createCard}>
          <Text style={styles.cardDesc}>Gerencie e crie novas obras no sistema.</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Reforma da Cozinha..."
              value={novoProjeto}
              onChangeText={setNovoProjeto}
            />
            <TouchableOpacity 
              style={[styles.btnAdd, !novoProjeto.trim() && styles.btnDisabled]} 
              onPress={criarProjeto}
              disabled={!novoProjeto.trim()}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE PROJETOS */}
        {projetos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="domain" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhuma obra cadastrada ainda.</Text>
            <Text style={styles.emptySub}>Use o campo acima para criar seu primeiro projeto.</Text>
          </View>
        ) : (
          projetos.map((projeto) => (
            <View key={projeto.id} style={styles.projectCard}>
              
              {/* === MODO EDIÇÃO === */}
              {projetoEditando === projeto.id ? (
                <View style={styles.editMode}>
                  <TextInput
                    style={styles.inputEdit}
                    value={tituloEditado}
                    onChangeText={setTituloEditado}
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.btnCancel} onPress={() => setProjetoEditando(null)}>
                      <Text style={styles.btnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSave} onPress={() => salvarEdicao(projeto.id)}>
                      <Text style={styles.btnSaveText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : 
              
              /* === MODO CONFIRMAR EXCLUSÃO === */
              projetoConfirmarExclusao === projeto.id ? (
                <View style={styles.deleteMode}>
                  <Text style={styles.deleteWarning}>
                    A obra "{projeto.titulo}" será apagada. Confirmar?
                  </Text>
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.btnCancel} onPress={() => setProjetoConfirmarExclusao(null)}>
                      <Text style={styles.btnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnConfirmDelete} onPress={() => confirmarExclusaoProjeto(projeto.id)}>
                      <Text style={styles.btnSaveText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : 
              
              /* === MODO VISUALIZAÇÃO === */
              (
                <>
                  <View style={styles.projectInfoRow}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons name="domain" size={24} color="#ea580c" />
                    </View>
                    <View style={styles.projectTexts}>
                      <Text style={styles.projectTitle} numberOfLines={2}>{projeto.titulo}</Text>
                      <View style={styles.projectMeta}>
                        <MaterialCommunityIcons name="calendar" size={14} color="#71717a" />
                        <Text style={styles.metaText}>{formatarData(projeto.criado_em)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.projectActions}>
                    <View style={styles.actionIcons}>
                      <TouchableOpacity onPress={() => iniciarEdicao(projeto)} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#71717a" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setProjetoConfirmarExclusao(projeto.id)} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="trash-can" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* NAVEGAÇÃO PARA DETALHES (O antigo [id]) */}
                    <TouchableOpacity 
                      style={styles.btnOpen}
                      onPress={() => navigation.navigate('ProjetoDetalhes', { id: projeto.id, titulo: projeto.titulo })}
                    >
                      <Text style={styles.btnOpenText}>Abrir</Text>
                      <MaterialCommunityIcons name="arrow-right" size={18} color="#ea580c" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fafafa' },
  blackHeader: {
    backgroundColor: '#18181b',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#ea580c',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  
  createCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 24,
  },
  cardDesc: { color: '#71717a', marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  btnAdd: {
    backgroundColor: '#18181b',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyText: { fontSize: 18, color: '#71717a', fontWeight: 'bold', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#a1a1aa', textAlign: 'center', marginTop: 4 },
  
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 16,
    marginBottom: 12,
  },
  projectInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconBox: {
    backgroundColor: '#ffedd5',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectTexts: { flex: 1 },
  projectTitle: { fontSize: 16, fontWeight: 'bold', color: '#18181b' },
  projectMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 12, color: '#71717a' },
  
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingTop: 12,
  },
  actionIcons: { flexDirection: 'row', gap: 16 },
  iconBtn: { padding: 4 },
  btnOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffedd5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  btnOpenText: { color: '#ea580c', fontWeight: 'bold' },

  // Estilos de Edição/Exclusão
  editMode: { gap: 12 },
  inputEdit: {
    backgroundColor: '#ffedd5',
    borderWidth: 1,
    borderColor: '#fdba74',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editActions: { flexDirection: 'row', gap: 8 },
  btnCancel: {
    flex: 1, backgroundColor: '#f4f4f5', padding: 12, borderRadius: 8, alignItems: 'center'
  },
  btnCancelText: { color: '#52525b', fontWeight: 'bold' },
  btnSave: {
    flex: 1, backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center'
  },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
  deleteMode: { gap: 12 },
  deleteWarning: { color: '#ef4444', fontWeight: 'bold', textAlign: 'center' },
  btnConfirmDelete: {
    flex: 1, backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center'
  }
});