import { createConnection } from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
}

const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'charity_donation_portal',
    port: parseInt(process.env.DB_PORT || '3306')
};

export class Database {
    private static instance: Database;
    private connection: any = null;

    private constructor() {}

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        try {
            this.connection = await createConnection(config);
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }

    public getConnection(): any {
        if (!this.connection) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.connection;
    }

    public async query(sql: string, params?: any[]): Promise<RowDataPacket[]> {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows as RowDataPacket[];
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    public async insert(sql: string, params?: any[]): Promise<ResultSetHeader> {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result as ResultSetHeader;
        } catch (error) {
            console.error('Database insert error:', error);
            throw error;
        }
    }

    public async update(sql: string, params?: any[]): Promise<ResultSetHeader> {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result as ResultSetHeader;
        } catch (error) {
            console.error('Database update error:', error);
            throw error;
        }
    }

    public async delete(sql: string, params?: any[]): Promise<ResultSetHeader> {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result as ResultSetHeader;
        } catch (error) {
            console.error('Database delete error:', error);
            throw error;
        }
    }
}
