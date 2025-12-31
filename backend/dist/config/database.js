"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const promise_1 = require("mysql2/promise");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'charity_donation_portal',
    port: parseInt(process.env.DB_PORT || '3306')
};
class Database {
    constructor() {
        this.connection = null;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            this.connection = await (0, promise_1.createConnection)(config);
            console.log('Database connected successfully');
        }
        catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }
    getConnection() {
        if (!this.connection) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.connection;
    }
    async query(sql, params) {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
    async insert(sql, params) {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result;
        }
        catch (error) {
            console.error('Database insert error:', error);
            throw error;
        }
    }
    async update(sql, params) {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result;
        }
        catch (error) {
            console.error('Database update error:', error);
            throw error;
        }
    }
    async delete(sql, params) {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result;
        }
        catch (error) {
            console.error('Database delete error:', error);
            throw error;
        }
    }
}
exports.Database = Database;
