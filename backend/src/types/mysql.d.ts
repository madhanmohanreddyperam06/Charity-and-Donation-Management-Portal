declare module 'mysql2' {
  export interface RowDataPacket {
    [key: string]: any;
  }
  
  export interface ResultSetHeader {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    info: string;
    serverStatus: number;
    warningStatus: number;
  }
  
  export interface Connection {
    query(sql: string, params?: any[]): Promise<any>;
    execute(sql: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
  
  export function createConnection(config: any): Promise<Connection>;
}

declare module 'mysql2/promise' {
  export function createConnection(config: any): Promise<any>;
}
