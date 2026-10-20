import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProjetoDetalhes({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { compact } = useResponsiveLayout();
  // Pega o ID e o Título passados pela tela de Projetos
  const { id, titulo } = route.params;

  const [abaAtiva, setAbaAtiva] = useState('materiais'); // materiais | caixa | tarefas
  const [carregando, setCarregando] = useState(true);

  // Estados dos Dados
  const [materiais, setMateriais] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  // Estados dos Formulários
  const [novaTarefa, setNovaTarefa] = useState('');
  const [nomeMaterial, setNomeMaterial] = useState('');
  const [qtdMaterial, setQtdMaterial] = useState('');
  const [custoMaterial, setCustoMaterial] = useState('');

  const [tipoTransacao, setTipoTransacao] = useState('RECEBIMENTO');
  const [descTransacao, setDescTransacao] = useState('');
  const [valorTransacao, setValorTransacao] = useState('');

  // Chaves dinâmicas para o AsyncStorage (separadas por projeto)
  const keyMateriais = `@materiais_${id}`;
  const keyTarefas = `@tarefas_${id}`;
  const keyCaixa = `@caixa_${id}`;

  useEffect(() => {
    const carregarDadosDaObra = async () => {
      try {
        const [dadosMat, dadosTar, dadosCai] = await Promise.all([
          AsyncStorage.getItem(keyMateriais),
          AsyncStorage.getItem(keyTarefas),
          AsyncStorage.getItem(keyCaixa)
        ]);

        if (dadosMat) setMateriais(JSON.parse(dadosMat));
        if (dadosTar) setTarefas(JSON.parse(dadosTar));
        if (dadosCai) setTransacoes(JSON.parse(dadosCai));
      } catch (_e) {
        Alert.alert('Erro', 'Não foi possível carregar os dados desta obra.');
      } finally {
        setCarregando(false);
      }
    };
    carregarDadosDaObra();
  }, [keyMateriais, keyTarefas, keyCaixa]);

  /* ================== MATERIAIS ================== */
  const adicionarMaterial = async () => {
    if (!nomeMaterial || !qtdMaterial || !custoMaterial) {
      Alert.alert('Aviso', 'Preencha todos os campos do material.');
      return;
    }

    const novoItem = {
      id: Date.now().toString(),
      nome: nomeMaterial,
      quantidade: qtdMaterial,
      preco_total: parseFloat(custoMaterial.replace(',', '.'))
    };

    const novaLista = [novoItem, ...materiais];
    setMateriais(novaLista);
    await AsyncStorage.setItem(keyMateriais, JSON.stringify(novaLista));

    setNomeMaterial('');
    setQtdMaterial('');
    setCustoMaterial('');
  };

  const excluirMaterial = async (idMaterial) => {
    const novaLista = materiais.filter(m => m.id !== idMaterial);
    setMateriais(novaLista);
    await AsyncStorage.setItem(keyMateriais, JSON.stringify(novaLista));
  };

  /* ================== TAREFAS ================== */
  const adicionarTarefa = async () => {
    if (!novaTarefa.trim()) return;

    const novaTar = { id: Date.now().toString(), nome: novaTarefa, concluida: false };
    const novaLista = [...tarefas, novaTar];

    setTarefas(novaLista);
    await AsyncStorage.setItem(keyTarefas, JSON.stringify(novaLista));
    setNovaTarefa('');
  };

  const alternarConclusaoTarefa = async (idTarefa) => {
    const novaLista = tarefas.map(t =>
      t.id === idTarefa ? { ...t, concluida: !t.concluida } : t
    );
    setTarefas(novaLista);
    await AsyncStorage.setItem(keyTarefas, JSON.stringify(novaLista));
  };

  /* ================== CAIXA ================== */
  const registrarTransacao = async () => {
    if (!descTransacao || !valorTransacao) {
      Alert.alert('Aviso', 'Preencha a descrição e o valor.');
      return;
    }

    const novaTrans = {
      id: Date.now().toString(),
      tipo: tipoTransacao,
      descricao: descTransacao,
      valor: parseFloat(valorTransacao.replace(',', '.'))
    };

    const novaLista = [novaTrans, ...transacoes];
    setTransacoes(novaLista);
    await AsyncStorage.setItem(keyCaixa, JSON.stringify(novaLista));

    setDescTransacao('');
    setValorTransacao('');
  };

  const excluirTransacao = async (idTransacao) => {
    const novaLista = transacoes.filter(t => t.id !== idTransacao);
    setTransacoes(novaLista);
    await AsyncStorage.setItem(keyCaixa, JSON.stringify(novaLista));
  };

  /* ================== CÁLCULOS E WHATSAPP ================== */
  const custoTotalMateriais = materiais.reduce((acc, item) => acc + (item.preco_total || 0), 0);
  const totalRecebido = transacoes.filter(t => t.tipo === 'RECEBIMENTO').reduce((acc, item) => acc + item.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'PAGAMENTO').reduce((acc, item) => acc + item.valor, 0);
  const lucroAtual = totalRecebido - custoTotalMateriais - totalSaidas;

  const solicitarOrcamentoWhatsApp = () => {
    let texto = `*Obra Certa* 👷‍♂️\nRelatório de Materiais: *${titulo}*\n\n`;
    materiais.forEach(m => { texto += `▪️ ${m.nome} - Qtd: ${m.quantidade}\n`; });
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(texto)}`);
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

      {/* HEADER DA OBRA */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#18181b" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.tituloObra} numberOfLines={1}>{titulo}</Text>
          <Text style={styles.subTitulo}>Gestão completa do canteiro</Text>
        </View>
      </View>

      {/* DASHBOARD FINANCEIRO */}
      <View style={[styles.dashGrid, compact && { flexDirection: 'column' }]}>
        <View style={styles.dashCard}>
          <Text style={styles.dashLabel}>Entradas</Text>
          <Text style={styles.dashValuePos}>R$ {totalRecebido.toFixed(2)}</Text>
        </View>
        <View style={styles.dashCard}>
          <Text style={styles.dashLabel}>Lucro Atual</Text>
          <Text style={[styles.dashValue, lucroAtual < 0 && styles.dashValueNeg]}>
            R$ {lucroAtual.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* MENU DE ABAS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, compact && { flexDirection: 'column' }, abaAtiva === 'materiais' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('materiais')}
        >
          <MaterialCommunityIcons name="cart-outline" size={20} color={abaAtiva === 'materiais' ? '#ea580c' : '#71717a'} />
          <Text style={[styles.tabText, abaAtiva === 'materiais' && {color: '#ea580c'}]}>Orçamento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, compact && { flexDirection: 'column' }, abaAtiva === 'caixa' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('caixa')}
        >
          <MaterialCommunityIcons name="wallet-outline" size={20} color={abaAtiva === 'caixa' ? '#10b981' : '#71717a'} />
          <Text style={[styles.tabText, abaAtiva === 'caixa' && {color: '#10b981'}]}>Caixa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, compact && { flexDirection: 'column' }, abaAtiva === 'tarefas' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('tarefas')}
        >
          <MaterialCommunityIcons name="checkbox-marked-outline" size={20} color={abaAtiva === 'tarefas' ? '#2563eb' : '#71717a'} />
          <Text style={[styles.tabText, abaAtiva === 'tarefas' && {color: '#2563eb'}]}>Tarefas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrollArea}>

        {/* ================= CONTEÚDO: MATERIAIS ================= */}
        {abaAtiva === 'materiais' && (
          <View style={styles.sectionCard}>
            <View style={[styles.formRow, compact && { flexDirection: 'column' }]}>
              <TextInput style={[styles.input, {flex: 2}]} placeholder="Material (Ex: Cimento)" value={nomeMaterial} onChangeText={setNomeMaterial} />
              <TextInput style={[styles.input, {flex: 1}]} placeholder="Qtd" value={qtdMaterial} onChangeText={setQtdMaterial} />
            </View>
            <View style={[styles.formRow, compact && { flexDirection: 'column' }]}>
              <TextInput style={[styles.input, {flex: 1}]} placeholder="Custo Total (Ex: 150.00)" keyboardType="numeric" value={custoMaterial} onChangeText={setCustoMaterial} />
              <TouchableOpacity style={styles.btnAddMaterial} onPress={adicionarMaterial}>
                <Text style={styles.btnAddText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divisor} />

            {materiais.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum material registrado.</Text>
            ) : (
              materiais.map(item => (
                <View key={item.id} style={styles.listItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.itemTitle}>{item.nome}</Text>
                    <Text style={styles.itemSub}>Qtd: {item.quantidade} • R$ {item.preco_total.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => excluirMaterial(item.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {materiais.length > 0 && (
              <TouchableOpacity style={styles.btnWhatsApp} onPress={solicitarOrcamentoWhatsApp}>
                <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
                <Text style={styles.btnWhatsAppText}>Enviar Relatório (WhatsApp)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ================= CONTEÚDO: CAIXA ================= */}
        {abaAtiva === 'caixa' && (
          <View style={styles.sectionCard}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, tipoTransacao === 'RECEBIMENTO' && styles.toggleBtnActiveReceb]}
                onPress={() => setTipoTransacao('RECEBIMENTO')}
              >
                <Text style={[styles.toggleText, tipoTransacao === 'RECEBIMENTO' && {color: '#fff'}]}>Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, tipoTransacao === 'PAGAMENTO' && styles.toggleBtnActivePag]}
                onPress={() => setTipoTransacao('PAGAMENTO')}
              >
                <Text style={[styles.toggleText, tipoTransacao === 'PAGAMENTO' && {color: '#fff'}]}>Saída</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.formRow, compact && { flexDirection: 'column' }]}>
              <TextInput style={[styles.input, {flex: 2}]} placeholder="Descrição" value={descTransacao} onChangeText={setDescTransacao} />
              <TextInput style={[styles.input, {flex: 1}]} placeholder="R$" keyboardType="numeric" value={valorTransacao} onChangeText={setValorTransacao} />
            </View>
            <TouchableOpacity style={styles.btnAddCaixa} onPress={registrarTransacao}>
              <Text style={styles.btnAddText}>Lançar no Caixa</Text>
            </TouchableOpacity>

            <View style={styles.divisor} />

            {transacoes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma movimentação.</Text>
            ) : (
              transacoes.map(t => (
                <View key={t.id} style={styles.listItem}>
                  <MaterialCommunityIcons
                    name={t.tipo === 'RECEBIMENTO' ? 'trending-up' : 'trending-down'}
                    size={24}
                    color={t.tipo === 'RECEBIMENTO' ? '#10b981' : '#ef4444'}
                  />
                  <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={styles.itemTitle}>{t.descricao}</Text>
                    <Text style={[styles.itemSub, {fontWeight: 'bold', color: t.tipo === 'RECEBIMENTO' ? '#10b981' : '#ef4444'}]}>
                      {t.tipo === 'RECEBIMENTO' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => excluirTransacao(t.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#a1a1aa" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= CONTEÚDO: TAREFAS ================= */}
        {abaAtiva === 'tarefas' && (
          <View style={styles.sectionCard}>
            <View style={[styles.formRow, compact && { flexDirection: 'column' }]}>
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="O que precisa ser feito?"
                value={novaTarefa}
                onChangeText={setNovaTarefa}
              />
              <TouchableOpacity style={styles.btnAddTarefa} onPress={adicionarTarefa}>
                <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.divisor} />

            {tarefas.length === 0 ? (
              <Text style={styles.emptyText}>Sua lista está vazia.</Text>
            ) : (
              tarefas.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.taskItem, t.concluida && styles.taskItemConcluida]}
                  onPress={() => alternarConclusaoTarefa(t.id)}
                >
                  <View style={[styles.checkbox, t.concluida && styles.checkboxConcluida]}>
                    {t.concluida && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                  </View>
                  <Text style={[styles.taskText, t.concluida && styles.taskTextConcluida]}>
                    {t.nome}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f4f4f5' },

  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 20,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e4e4e7'
  },
  btnVoltar: {
    width: 40, height: 40, backgroundColor: '#f4f4f5', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  headerTextContainer: { minWidth: 0, flex: 1 },
  tituloObra: { fontSize: 22, fontWeight: '900', color: '#18181b' },
  subTitulo: { fontSize: 13, color: '#71717a' },

  dashGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  dashCard: {
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#e4e4e7', elevation: 1
  },
  dashLabel: { fontSize: 12, fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase' },
  dashValuePos: { fontSize: 20, fontWeight: '900', color: '#10b981', marginTop: 4 },
  dashValue: { fontSize: 20, fontWeight: '900', color: '#18181b', marginTop: 4 },
  dashValueNeg: { color: '#ef4444' },

  tabContainer: {
    flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#e4e4e7',
    borderRadius: 12, padding: 4, marginBottom: 8
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 8, gap: 6
  },
  tabAtiva: { backgroundColor: '#fff', elevation: 1 },
  tabText: { fontWeight: 'bold', fontSize: 12 },

  scrollArea: { padding: 16, paddingBottom: 60 },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e4e4e7'
  },

  formRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    minWidth: 0,
    backgroundColor: '#f4f4f5', borderRadius: 8, paddingHorizontal: 12,
    height: 48, borderWidth: 1, borderColor: '#d4d4d8', color: '#18181b'
  },
  btnAddMaterial: { minHeight: 48, flex: 1, backgroundColor: '#ea580c', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnAddCaixa: { backgroundColor: '#10b981', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  btnAddTarefa: { backgroundColor: '#2563eb', width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnAddText: { color: '#fff', fontWeight: 'bold' },

  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { flex: 1, height: 40, borderRadius: 8, backgroundColor: '#f4f4f5', justifyContent: 'center', alignItems: 'center' },
  toggleBtnActiveReceb: { backgroundColor: '#10b981' },
  toggleBtnActivePag: { backgroundColor: '#ef4444' },
  toggleText: { fontWeight: 'bold', color: '#71717a' },

  divisor: { height: 1, backgroundColor: '#e4e4e7', marginVertical: 12 },
  emptyText: { textAlign: 'center', color: '#a1a1aa', marginVertical: 20 },

  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f4f4f5' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#18181b' },
  itemSub: { fontSize: 13, color: '#71717a', marginTop: 2 },

  btnWhatsApp: { flexDirection: 'row', backgroundColor: '#25D366', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  btnWhatsAppText: { flexShrink: 1, color: '#fff', fontWeight: 'bold', fontSize: 16 },

  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e4e4e7', marginBottom: 8 },
  taskItemConcluida: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d4d4d8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxConcluida: { backgroundColor: '#10b981', borderColor: '#10b981' },
  taskText: { fontSize: 16, color: '#18181b', flex: 1 },
  taskTextConcluida: { color: '#059669', textDecorationLine: 'line-through' }
});
