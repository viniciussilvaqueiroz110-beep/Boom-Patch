import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { carregarCampeonatos, Campeonato } from '@/lib/storage';

export default function ListaScreen() {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);

  // Recarrega os campeonatos quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarCampeonatos().then(setCampeonatos).catch((erro) => {
        console.error('Erro ao carregar campeonatos:', erro);
      });
    }, [])
  );

  // Aula 14: inspecionar os dados do SQLite
  const verDadosBanco = () => {
    try {
      const db = SQLite.openDatabaseSync('boom-patch.db');

      db.execSync(`
        CREATE TABLE IF NOT EXISTS metas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          descricao TEXT NOT NULL,
          status_feita INTEGER NOT NULL DEFAULT 0
        );
      `);

      // Insere os exemplos apenas se ainda não existirem
      db.runSync(
        `INSERT INTO metas (descricao)
         SELECT ?
         WHERE NOT EXISTS (
           SELECT 1 FROM metas WHERE descricao = ?
         )`,
        ['Estudar SQLite', 'Estudar SQLite']
      );

      db.runSync(
        `INSERT INTO metas (descricao)
         SELECT ?
         WHERE NOT EXISTS (
           SELECT 1 FROM metas WHERE descricao = ?
         )`,
        ['Concluir a Aula 14', 'Concluir a Aula 14']
      );

      const registros = db.getAllSync(
        'SELECT * FROM metas ORDER BY id'
      );

      console.log('Dados do SQLite:', registros);

      Alert.alert(
        'Banco consultado!',
        `Foram encontrados ${registros.length} registros. Confira o terminal do Expo.`
      );
    } catch (error) {
      console.error('Erro ao consultar SQLite:', error);

      Alert.alert(
        'Erro',
        'Não foi possível consultar o banco. Confira o terminal do Expo.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={campeonatos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum campeonato cadastrado ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() =>
              router.push({
                pathname: '/detalhe/[id]',
                params: { id: item.id },
              })
            }
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemNome}>{item.nome}</Text>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Em andamento' && styles.statusAtivo,
                ]}
              >
                <Text style={styles.statusTexto}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.itemInfo}>
              {item.modalidade} · {item.qtdTimes} times
            </Text>

            <Text style={styles.itemData}>
              {item.dataInicio} → {item.dataFim}
            </Text>
          </Pressable>
        )}
      />

      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.debugButton}
          onPress={verDadosBanco}
        >
          <Text style={styles.debugButtonText}>
            Inspecionar Banco no Terminal
          </Text>
        </Pressable>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/adicionar')}
        >
          <Text style={styles.addButtonText}>
            + Criar Campeonato
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7F4',
  },
  listContent: {
    padding: 16,
    paddingBottom: 160,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 16,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE8DF',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusAtivo: {
    backgroundColor: '#BBF7D0',
  },
  statusTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14532D',
  },
  itemInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  itemData: {
    fontSize: 13,
    color: '#1B4332',
    marginTop: 4,
    fontWeight: '600',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  debugButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#1B4332',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
