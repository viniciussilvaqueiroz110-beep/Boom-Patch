import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';

type Meta = {
  id: number;
  descricao: string;
  status_feita: number;
};

const DATABASE_NAME = 'boom-patch.db';

export default function MetasScreen() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [novaMeta, setNovaMeta] = useState('');
  const [carregando, setCarregando] = useState(true);

  const db = SQLite.useSQLiteContext();

  // Cria a tabela e insere dois registros de exemplo apenas uma vez.
  useEffect(() => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS metas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          descricao TEXT NOT NULL,
          status_feita INTEGER NOT NULL DEFAULT 0
        );
      `);

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

      carregarTarefas();
    } catch (error) {
      console.error('Erro ao inicializar metas:', error);
      Alert.alert('Erro', 'Não foi possível inicializar a tabela de metas.');
      setCarregando(false);
    }
  }, [db]);

  // Aula 14: consulta os dados e exibe no terminal.
  const verDadosBanco = () => {
    try {
      const registros = db.getAllSync<Meta>(
        'SELECT * FROM metas ORDER BY id DESC'
      );

      console.log('Dados do SQLite:', registros);
      Alert.alert(
        'Raio-X do SQLite',
        `${registros.length} registro(s) encontrado(s). Confira o terminal do Expo.`
      );
    } catch (error) {
      console.error('Erro ao consultar banco:', error);
      Alert.alert('Erro', 'Não foi possível consultar os dados.');
    }
  };

  // Atualiza a lista visual usando os dados reais do SQLite.
  const carregarTarefas = useCallback(() => {
    try {
      const registros = db.getAllSync<Meta>(
        'SELECT * FROM metas ORDER BY id DESC'
      );

      setMetas(registros);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setCarregando(false);
    }
  }, [db]);

  // Adiciona uma meta.
  const adicionarMeta = () => {
    const descricao = novaMeta.trim();

    if (!descricao) {
      Alert.alert('Atenção', 'Digite a descrição da meta.');
      return;
    }

    try {
      db.runSync(
        'INSERT INTO metas (descricao) VALUES (?)',
        [descricao]
      );

      setNovaMeta('');
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a meta.');
    }
  };

  // Aula 15: exclui o registro pelo ID e recarrega a lista.
  const excluirMeta = (id: number) => {
    try {
      db.runSync('DELETE FROM metas WHERE id = ?', [id]);
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      Alert.alert('Erro', 'Não foi possível excluir a meta.');
    }
  };

  // Bônus: alterna o status entre pendente (0) e concluída (1).
  const alternarFeita = (meta: Meta) => {
    const novoStatus = meta.status_feita === 1 ? 0 : 1;

    try {
      db.runSync(
        'UPDATE metas SET status_feita = ? WHERE id = ?',
        [novoStatus, meta.id]
      );

      carregarTarefas();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a meta.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Metas</Text>
      <Text style={styles.subtitulo}>
        Aula 14 e 15 — SQLite CRUD
      </Text>

      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma nova meta..."
          value={novaMeta}
          onChangeText={setNovaMeta}
          maxLength={120}
        />

        <Pressable style={styles.botaoAdicionar} onPress={adicionarMeta}>
          <Text style={styles.textoBotao}>Adicionar</Text>
        </Pressable>
      </View>

      <Pressable style={styles.botaoDiagnostico} onPress={verDadosBanco}>
        <Text style={styles.textoBotao}>
          Inspecionar Banco no Terminal
        </Text>
      </Pressable>

      {carregando ? (
        <Text style={styles.mensagem}>Carregando metas...</Text>
      ) : (
        <FlatList
          style={styles.lista}
          data={metas}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.mensagem}>Nenhuma meta cadastrada.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.detalhesMeta}>
                <Text
                  style={[
                    styles.descricao,
                    item.status_feita === 1 && styles.concluida,
                  ]}
                >
                  {item.descricao}
                </Text>

                <Text style={styles.status}>
                  {item.status_feita === 1 ? 'Concluída' : 'Pendente'}
                </Text>
              </View>

              <View style={styles.acoes}>
                <Pressable
                  style={styles.botaoConcluir}
                  onPress={() => alternarFeita(item)}
                >
                  <Text style={styles.textoBotaoPequeno}>
                    {item.status_feita === 1 ? 'Reabrir' : 'Concluir'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.botaoExcluir}
                  onPress={() =>
                    Alert.alert(
                      'Excluir meta',
                      `Deseja excluir "${item.descricao}"?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () => excluirMeta(item.id),
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.textoBotaoPequeno}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7F4',
    padding: 16,
    paddingTop: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1B4332',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 18,
  },
  formulario: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE8DF',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  botaoAdicionar: {
    backgroundColor: '#1B4332',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDiagnostico: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lista: {
    flex: 1,
  },
  mensagem: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCE8DF',
    gap: 12,
  },
  detalhesMeta: {
    gap: 4,
  },
  descricao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  concluida: {
    textDecorationLine: 'line-through',
    color: '#777',
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  botaoConcluir: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  botaoExcluir: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  textoBotaoPequeno: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
});
