import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const OPCOES_MATERIAIS = {
  piso: { nome: "Piso", tipos: ["Porcelanato", "Cerâmica", "Laminado", "Vinílico", "Pedras Naturais"] },
  parede: { nome: "Parede", tipos: ["Bloco cerâmico", "Drywall", "Bloco de concreto", "Tijolo ecológico"] },
  revestimento: { nome: "Revestimento", tipos: ["Textura", "Massa Corrida", "Cerâmica/Azulejo", "Pastilhas"] },
  pintura: { nome: "Pintura", tipos: ["Tinta Acrílica", "Tinta Látex", "Tinta Epóxi", "Selador"] },
};

export default function Calcular({ navigation }) {
  const insets = useSafeAreaInsets();
  const { compact } = useResponsiveLayout();
  const [superficie, setSuperficie] = useState("");
  const [material, setMaterial] = useState("");
  const [medidas, setMedidas] = useState([{ id: 1, altura: "", largura: "" }]);
  const [comprimentoPiso, setComprimentoPiso] = useState("");
  const [larguraPiso, setLarguraPiso] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState("");
  
  const [resultado, setResultado] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState("");
  
  const proximaMedidaId = useRef(2);

  // Carrega os projetos salvos no celular para popular o Picker final
  useEffect(() => {
    const carregarProjetos = async () => {
      try {
        const dados = await AsyncStorage.getItem('@meus_projetos');
        if (dados) setProjetos(JSON.parse(dados));
      } catch (e) {
        console.error("Erro ao carregar projetos", e);
      }
    };
    carregarProjetos();
  }, []);

  /* ================= LÓGICAS DA CALCULADORA ================= */
  const adicionarMedida = () => {
    setResultado(null);
    setMedidas([...medidas, { id: proximaMedidaId.current++, altura: "", largura: "" }]);
  };

  const atualizarMedida = (id, campo, valor) => {
    setMedidas(medidas.map(m => m.id === id ? { ...m, [campo]: valor } : m));
  };

  const removerMedida = (id) => {
    setResultado(null);
    setMedidas(medidas.filter(m => m.id !== id));
  };

  const realizarCalculo = () => {
    if (!superficie || !material) {
      Alert.alert("Aviso", "Selecione uma superfície e um material válidos.");
      return;
    }

    // 1. Somar Área Total
    let areaTotal = 0;
    medidas.forEach(m => {
      const alt = parseFloat(m.altura.replace(',', '.')) || 0;
      const larg = parseFloat(m.largura.replace(',', '.')) || 0;
      areaTotal += (alt * larg);
    });

    if (areaTotal === 0) {
      Alert.alert("Aviso", "Adicione as medidas de altura e largura.");
      return;
    }

    // 2. Adicionar 10% de perda (Quebra)
    const areaComPerda = areaTotal * 1.1;

    // 3. Calcular Custo Total
    const preco = parseFloat(precoUnitario.replace(',', '.')) || 0;
    const custoTotal = areaComPerda * preco;

    // 4. Calcular Peças de Piso (se aplicável)
    let totalPecas = null;
    if (superficie === "piso" && comprimentoPiso && larguraPiso) {
      const compM = parseFloat(comprimentoPiso.replace(',', '.')) / 100 || 0;
      const largM = parseFloat(larguraPiso.replace(',', '.')) / 100 || 0;
      if (compM > 0 && largM > 0) {
        totalPecas = Math.ceil(areaComPerda / (compM * largM));
      }
    }

    setResultado({
      materialNome: material,
      area: areaTotal.toFixed(2),
      quantidade: areaComPerda.toFixed(2),
      unidade: "m²",
      precoTotalEstimado: custoTotal,
      totalPecas
    });
  };

  /* ================= SALVAR NA OBRA ================= */
  const salvarNoProjeto = async () => {
    if (!projetoSelecionado || !resultado) {
      Alert.alert("Aviso", "Selecione um projeto para salvar.");
      return;
    }

    try {
      // Cria a chave específica da obra selecionada
      const chaveMateriais = `@materiais_${projetoSelecionado}`;
      const dadosAtuais = await AsyncStorage.getItem(chaveMateriais);
      const listaMateriais = dadosAtuais ? JSON.parse(dadosAtuais) : [];

      const infoPecas = resultado.totalPecas ? ` (~${resultado.totalPecas} pçs)` : "";
      
      const novoMaterial = {
        id: Date.now().toString(),
        nome: `${superficie.toUpperCase()} - ${resultado.materialNome}`,
        quantidade: `${resultado.quantidade} ${resultado.unidade}${infoPecas}`,
        preco_total: resultado.precoTotalEstimado || 0
      };

      await AsyncStorage.setItem(chaveMateriais, JSON.stringify([novoMaterial, ...listaMateriais]));
      
      Alert.alert("Sucesso", "Material adicionado ao orçamento da obra!");
      
      // Reseta a calculadora
      setResultado(null);
      setSuperficie("");
      setMaterial("");
      setMedidas([{ id: proximaMedidaId.current++, altura: "", largura: "" }]);
      setPrecoUnitario("");
      setComprimentoPiso("");
      setLarguraPiso("");
      navigation.navigate('ProjetosTab'); // Volta pra aba de projetos

    } catch (_e) {
      Alert.alert("Erro", "Não foi possível salvar no projeto.");
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.scrollContent, { width: '100%', maxWidth: 760, alignSelf: 'center' }]} showsVerticalScrollIndicator={false} style={styles.container}>
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="calculator-variant" size={28} color="#ea580c" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Calculadora</Text>
          <Text style={styles.subtitle}>Estime materiais e custos em segundos.</Text>
        </View>
      </View>

      {/* FORMULÁRIO */}
      <View style={styles.card}>
        <Text style={styles.label}>Superfície</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={superficie}
            onValueChange={(itemValue) => {
              setSuperficie(itemValue);
              setMaterial("");
              setResultado(null);
            }}
          >
            <Picker.Item label="Selecione..." value="" color="#a1a1aa" />
            {Object.entries(OPCOES_MATERIAIS).map(([chave, obj]) => (
              <Picker.Item key={chave} label={obj.nome} value={chave} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Tipo de Material</Text>
        <View style={[styles.pickerContainer, !superficie && { backgroundColor: '#f4f4f5' }]}>
          <Picker
            enabled={!!superficie}
            selectedValue={material}
            onValueChange={(itemValue) => {
              setMaterial(itemValue);
              setResultado(null);
            }}
          >
            <Picker.Item label={superficie ? "Selecione o material" : "Escolha a superfície..."} value="" color="#a1a1aa" />
            {superficie ? OPCOES_MATERIAIS[superficie].tipos.map((tipo) => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            )) : null}
          </Picker>
        </View>

        {/* DIMENSÕES DA PEÇA (Apenas para Piso) */}
        {superficie === "piso" && (
          <View style={styles.boxOpcional}>
            <Text style={styles.boxTitle}>Dimensões da Peça em cm (Opcional)</Text>
            <View style={[styles.row, compact && { flexDirection: 'column', alignItems: 'stretch' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelSmall}>Comprimento</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={comprimentoPiso} onChangeText={setComprimentoPiso} placeholder="Ex: 60" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelSmall}>Largura</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={larguraPiso} onChangeText={setLarguraPiso} placeholder="Ex: 60" />
              </View>
            </View>
          </View>
        )}

        {/* CADERNINHO DE MEDIÇÕES */}
        <View style={styles.medicoesHeader}>
          <Text style={styles.label}>Caderninho de Medições</Text>
          <TouchableOpacity style={styles.btnNovaArea} onPress={adicionarMedida}>
            <MaterialCommunityIcons name="plus" size={16} color="#c2410c" />
            <Text style={styles.btnNovaAreaText}>Nova Área</Text>
          </TouchableOpacity>
        </View>

        {medidas.map((medida, index) => (
          <View key={medida.id} style={[styles.medidaRow, compact && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>Altura (m)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={medida.altura} onChangeText={(v) => atualizarMedida(medida.id, 'altura', v)} placeholder="Ex: 3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>Largura (m)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={medida.largura} onChangeText={(v) => atualizarMedida(medida.id, 'largura', v)} placeholder="Ex: 4" />
            </View>
            {medidas.length > 1 && (
              <TouchableOpacity style={styles.btnRemover} onPress={() => removerMedida(medida.id)}>
                <MaterialCommunityIcons name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* PREÇO UNITÁRIO */}
        <View style={[styles.boxOpcional, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', marginTop: 12 }]}>
          <Text style={[styles.boxTitle, { color: '#065f46' }]}>Preço por m² (Opcional)</Text>
          <View style={styles.inputPrecoContainer}>
            <Text style={styles.moeda}>R$</Text>
            <TextInput style={styles.inputPreco} keyboardType="numeric" value={precoUnitario} onChangeText={setPrecoUnitario} placeholder="0,00" />
          </View>
        </View>

        <TouchableOpacity style={styles.btnCalcular} onPress={realizarCalculo}>
          <MaterialCommunityIcons name="calculator" size={24} color="#fff" />
          <Text style={styles.btnCalcularText}>Calcular Total</Text>
        </TouchableOpacity>
      </View>

      {/* RESULTADO E SALVAMENTO */}
      {resultado && (
        <View style={styles.resultadoCard}>
          <View style={styles.resultadoHeader}>
            <MaterialCommunityIcons name="check-decagram" size={24} color="#065f46" />
            <Text style={styles.resultadoTitle}>Resultado Final</Text>
          </View>
          
          <Text style={styles.resultadoMaterial}>{superficie.toUpperCase()} • {resultado.materialNome}</Text>
          <View style={styles.rowResult}>
            <Text style={styles.resultadoValor}>{resultado.quantidade}</Text>
            <Text style={styles.resultadoUnidade}>{resultado.unidade}</Text>
          </View>
          <Text style={styles.resultadoArea}>Área s/ quebra: {resultado.area} m²</Text>

          {resultado.totalPecas && (
            <View style={styles.pecasBox}>
              <Text style={styles.pecasTitle}>Estimativa de Peças:</Text>
              <Text style={styles.pecasValor}>~ {resultado.totalPecas} unidades</Text>
            </View>
          )}

          {resultado.precoTotalEstimado > 0 && (
            <View style={styles.custoBox}>
              <Text style={styles.custoTitle}>Custo Estimado:</Text>
              <Text style={styles.custoValor}>R$ {resultado.precoTotalEstimado.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.salvarBox}>
            <Text style={styles.label}>Vincular a uma Obra Ativa</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                <Picker.Item label="Selecione um projeto..." value="" color="#a1a1aa" />
                {projetos.map((proj) => (
                  <Picker.Item key={proj.id} label={proj.titulo} value={proj.id} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity 
              style={[styles.btnSalvar, !projetoSelecionado && { backgroundColor: '#d4d4d8' }]} 
              onPress={salvarNoProjeto}
              disabled={!projetoSelecionado}
            >
              <MaterialCommunityIcons name="content-save" size={20} color={!projetoSelecionado ? "#71717a" : "#fff"} />
              <Text style={[styles.btnCalcularText, !projetoSelecionado && { color: "#71717a" }]}>Salvar Material na Obra</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5' },
  scrollContent: { paddingBottom: 100 },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 20,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e4e4e7'
  },
  iconBox: { backgroundColor: '#ffedd5', padding: 10, borderRadius: 12, marginRight: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#18181b' },
  subtitle: { fontSize: 13, color: '#71717a' },
  
  card: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e4e4e7' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#18181b', marginBottom: 8 },
  labelSmall: { fontSize: 12, fontWeight: 'bold', color: '#71717a', marginBottom: 4 },
  
  pickerContainer: { borderWidth: 1, borderColor: '#d4d4d8', borderRadius: 8, marginBottom: 16, backgroundColor: '#fff' },
  
  row: { flexDirection: 'row', gap: 12 },
  boxOpcional: { backgroundColor: '#ffedd5', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fdba74', marginBottom: 16 },
  boxTitle: { fontSize: 12, fontWeight: 'bold', color: '#c2410c', marginBottom: 8 },
  
  input: {
    minWidth: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d4d4d8', borderRadius: 8, padding: 12, fontSize: 16 },
  
  medicoesHeader: { flexWrap: 'wrap', gap: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  btnNovaArea: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffedd5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  btnNovaAreaText: { color: '#c2410c', fontWeight: 'bold', fontSize: 12 },
  
  medidaRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', backgroundColor: '#fafafa', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e4e4e7', marginBottom: 12 },
  btnRemover: { backgroundColor: '#fee2e2', width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  inputPrecoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#a7f3d0', borderRadius: 8, paddingHorizontal: 12 },
  moeda: { color: '#047857', fontWeight: 'bold', marginRight: 8 },
  inputPreco: { minWidth: 0, flex: 1, paddingVertical: 12, fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  
  btnCalcular: { flexDirection: 'row', backgroundColor: '#18181b', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 },
  btnCalcularText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  resultadoCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 40, borderRadius: 16, borderWidth: 1, borderColor: '#a7f3d0', overflow: 'hidden' },
  resultadoHeader: { backgroundColor: '#ecfdf5', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderColor: '#d1fae5' },
  resultadoTitle: { fontSize: 18, fontWeight: 'bold', color: '#065f46' },
  resultadoMaterial: { fontSize: 12, fontWeight: 'bold', color: '#047857', marginTop: 16, marginHorizontal: 16 },
  rowResult: { flexWrap: 'wrap', flexDirection: 'row', alignItems: 'baseline', gap: 8, marginHorizontal: 16 },
  resultadoValor: { fontSize: 48, fontWeight: '900', color: '#022c22' },
  resultadoUnidade: { fontSize: 20, fontWeight: 'bold', color: '#022c22' },
  resultadoArea: { fontSize: 12, color: '#047857', marginHorizontal: 16, marginBottom: 16, fontWeight: '500' },
  
  pecasBox: { backgroundColor: '#d1fae5', padding: 12, marginHorizontal: 16, borderRadius: 8, marginBottom: 16 },
  pecasTitle: { fontSize: 12, fontWeight: 'bold', color: '#065f46' },
  pecasValor: { fontSize: 20, fontWeight: '900', color: '#022c22' },
  
  custoBox: { flexWrap: 'wrap', gap: 8, backgroundColor: '#059669', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  custoTitle: { color: '#d1fae5', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  custoValor: { color: '#fff', fontWeight: '900', fontSize: 24 },

  salvarBox: { padding: 16 },
  btnSalvar: { flexDirection: 'row', backgroundColor: '#ea580c', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 }
});