import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { adicionarCampeonato } from '@/lib/storage';

export default function AdicionarScreen() {
  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [qtdTimes, setQtdTimes] = useState('');
  const [local, setLocal] = useState('');

  const salvar = async () => {
    // TAREFA (Aula 07): valide os campos antes de salvar.
    if (!nome.trim() || !modalidade.trim()) {
      Alert.alert('Atenção', 'Preencha ao menos o nome e a modalidade.');
      return;
    }

    // TAREFA (Aula 15): na Fase 3, migre o salvamento para SQLite.
    await adicionarCampeonato({
      nome: nome.trim(),
      modalidade: modalidade.trim(),
      dataInicio: dataInicio.trim() || 'A definir',
      dataFim: dataFim.trim() || 'A definir',
      qtdTimes: Number(qtdTimes) || 0,
      local: local.trim() || 'A definir',
      status: 'Agendado',
      times: [],
    });

    Alert.alert('Campeonato criado!', 'Campeonato salvo no SQLite.');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nome do campeonato *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Boom Cup 2027"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Modalidade *</Text>
        <TextInput
          style={styles.input}
          value={modalidade}
          onChangeText={setModalidade}
          placeholder="Ex.: Futsal, Vôlei, Xadrez"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Data de início</Text>
        <TextInput
          style={styles.input}
          value={dataInicio}
          onChangeText={setDataInicio}
          placeholder="Ex.: 05/10/2026"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Data de fim</Text>
        <TextInput
          style={styles.input}
          value={dataFim}
          onChangeText={setDataFim}
          placeholder="Ex.: 30/11/2026"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Quantidade de times</Text>
        <TextInput
          style={styles.input}
          value={qtdTimes}
          onChangeText={setQtdTimes}
          placeholder="Ex.: 8"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Local</Text>
        <TextInput
          style={styles.input}
          value={local}
          onChangeText={setLocal}
          placeholder="Ex.: Ginásio do Bairro"
          placeholderTextColor="#9CA3AF"
        />

        <Pressable style={styles.button} onPress={salvar}>
          <Text style={styles.buttonText}>Criar Campeonato</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F7F4',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE8DF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1B4332',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
