import { DownloadedModel } from '@/constants/Type';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
    try {
        db = await SQLite.openDatabaseAsync('models.db');
        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS downloaded_models (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          modelId TEXT NOT NULL UNIQUE,
          fileName TEXT NOT NULL,
          filePath TEXT NOT NULL,
          size INTEGER NOT NULL,
          format TEXT,
          downloadedAt TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'completed'
        );
      `);
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

export async function getAllDownloadedModels(): Promise<DownloadedModel[]> {
    if (!db) await initDatabase();
    const result = await db!.getAllAsync<DownloadedModel>(
        'SELECT * FROM downloaded_models ORDER BY downloadedAt DESC'
    );
    return result;
}

export async function addDownloadedModel(model: Omit<DownloadedModel, 'id'>): Promise<number> {
    if (!db) await initDatabase();
    const result = await db!.runAsync(
        `INSERT INTO downloaded_models (modelId, fileName, filePath, size, format, downloadedAt, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [model.modelId, model.fileName, model.filePath, model.size, model.format || null,
        model.downloadedAt, model.status]
    );
    return result.lastInsertRowId;
}

export async function updateModelStatus(
    modelId: string,
    status: DownloadedModel['status'],
): Promise<void> {
    if (!db) await initDatabase();
    await db!.runAsync(
        'UPDATE downloaded_models SET status = ? WHERE modelId = ?',
        [status, modelId]
    );
}

export async function deleteDownloadedModel(modelId: string): Promise<void> {
    if (!db) await initDatabase();
    await db!.runAsync('DELETE FROM downloaded_models WHERE modelId = ?', [modelId]);
}

export async function getDownloadedModelById(modelId: string): Promise<DownloadedModel | null> {
    if (!db) await initDatabase();
    const result = await db!.getFirstAsync<DownloadedModel>(
        'SELECT * FROM downloaded_models WHERE modelId = ?',
        [modelId]
    );
    return result || null;
}