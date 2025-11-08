import {ResultSet, SQLError, Transaction, openDatabase} from 'react-native-sqlite-storage';
import { Model } from '../../utils/types';

const dbRef = openDatabase(
    {
        name: 'llms.db',
        location: 'default',
    },
    () => {
        console.log('Database opened successfully');
    },
    (error: SQLError) => {
        console.error('Error opening database:', error);
    }
);

export const createModelTable = async () => {
    return new Promise<void>((resolve, reject) => {
        dbRef.transaction((tx: Transaction) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS models (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, url TEXT, createdAt TEXT, updatedAt TEXT)',
                [],
                () => {
                    resolve();
                },
                (tx: Transaction, error: SQLError) => {
                    reject(error.message);
                }
            );
        }, (error: SQLError) => {
            reject(error.message);
        });
    });
};  

export const insertModel = async (model: Model): Promise<Model> => {
    return new Promise<Model>((resolve, reject) => {
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        
        dbRef.transaction((tx: Transaction) => {
            tx.executeSql(
                'INSERT INTO models (name, description, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
                [model.name, model.description, model.url, createdAt, updatedAt],
                (tx: Transaction, results: ResultSet) => {
                    // Get the inserted row ID
                    const insertId = results.insertId;
                    // Return the complete model with the generated ID
                    const insertedModel: Model = {
                        id: insertId,
                        name: model.name,
                        description: model.description,
                        url: model.url,
                        createdAt,
                        updatedAt,
                    };
                    resolve(insertedModel);
                },
                (tx: Transaction, error: SQLError) => {
                    reject(error.message);
                }
            );
        }, (error: SQLError) => {
            reject(error.message);
        });
    });
};

export const removeModel = async (modelId: number) => {
    return new Promise<void>((resolve, reject) => {
        dbRef.transaction((tx: Transaction) => {
            tx.executeSql(
                'DELETE FROM models WHERE id = ?',
                [modelId],
                () => {
                    resolve();
                },
                (tx: Transaction, error: SQLError) => {
                    reject(error.message);
                }
            );
        }, (error: SQLError) => {
            reject(error.message);
        });
    });
};

export const getModels = async (): Promise<Model[]> => {
    return new Promise<Model[]>((resolve, reject) => {
        dbRef.transaction((tx: Transaction) => {
            tx.executeSql(
                'SELECT * FROM models',
                [],
                (tx: Transaction, results: ResultSet) => {
                    const models: Model[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        models.push({
                            id: results.rows.item(i).id,
                            name: results.rows.item(i).name,
                            description: results.rows.item(i).description,
                            url: results.rows.item(i).url,
                            createdAt: results.rows.item(i).createdAt,
                            updatedAt: results.rows.item(i).updatedAt,
                        });
                    }
                    resolve(models);
                },
                (tx: Transaction, error: SQLError) => {
                    reject(error.message);
                }
            );
        }, (error: SQLError) => {
            reject(error.message);
        });
    });
};