
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import {
  campeonatosIniciais,
  Campeonato,
} from '@/data/campeonatos';

const STORAGE_KEY = '@boom-patch:campeonatos';
const DATABASE_NAME = 'boom-patch.db';

type CampeonatoRow = Omit<Campeonato, 'times'> & {
  times: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function inicializarBanco(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS campeonatos (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      modalidade TEXT NOT NULL,
      dataInicio TEXT NOT NULL,
      dataFim TEXT NOT NULL,
      qtdTimes INTEGER NOT NULL,
      local TEXT NOT NULL,
      status TEXT NOT NULL,
      times TEXT NOT NULL
    );
  `);

  const resultado = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM campeonatos'
  );

  if (resultado?.total === 0) {
    const dadosAntigos = await AsyncStorage.getItem(STORAGE_KEY);

    let campeonatos: Campeonato[];

    if (dadosAntigos !== null) {
      campeonatos = JSON.parse(dadosAntigos);
    } else {
      campeonatos = campeonatosIniciais;
    }

    await db.withTransactionAsync(async () => {
      for (const c of campeonatos) {
        await inserirNoBanco(db, c);
      }
    });

    if (dadosAntigos !== null) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }

  return db;
}

async function obterBanco(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = inicializarBanco().catch((erro) => {
      databasePromise = null;
      throw erro;
    });
  }

  return databasePromise;
}

async function inserirNoBanco(
  db: SQLite.SQLiteDatabase,
  c: Campeonato
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO campeonatos
    (id, nome, modalidade, dataInicio, dataFim,
     qtdTimes, local, status, times)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    c.id,
    c.nome,
    c.modalidade,
    c.dataInicio,
    c.dataFim,
    c.qtdTimes,
    c.local,
    c.status,
    JSON.stringify(c.times)
  );
}

function converterLinha(c: CampeonatoRow): Campeonato {
  return {
    ...c,
    times: JSON.parse(c.times) as string[],
  };
}

export async function carregarCampeonatos(): Promise<Campeonato[]> {
  const db = await obterBanco();

  const linhas = await db.getAllAsync<CampeonatoRow>(
    'SELECT * FROM campeonatos ORDER BY rowid'
  );

  return linhas.map(converterLinha);
}

export async function salvarCampeonatos(
  campeonatos: Campeonato[]
): Promise<void> {
  const db = await obterBanco();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM campeonatos');

    for (const c of campeonatos) {
      await inserirNoBanco(db, c);
    }
  });
}

export async function adicionarCampeonato(
  novoCampeonato: Omit<Campeonato, 'id'>
): Promise<Campeonato[]> {
  const db = await obterBanco();

  const campeonatoComId: Campeonato = {
    ...novoCampeonato,
    id: String(Date.now()),
  };

  await inserirNoBanco(db, campeonatoComId);

  return carregarCampeonatos();
}

export async function buscarCampeonato(
  id: string
): Promise<Campeonato | undefined> {
  const db = await obterBanco();

  const linha = await db.getFirstAsync<CampeonatoRow>(
    'SELECT * FROM campeonatos WHERE id = ?',
    id
  );

  return linha ? converterLinha(linha) : undefined;
}
