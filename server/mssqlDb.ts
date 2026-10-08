import sql from 'mssql';

// MS SQL Server Connection Configuration for ebayjaco_mmarshalldb
export const mssqlConfig: sql.config = {
  server: process.env.MSSQL_SERVER || 'az1-wsq1.my-hosting-panel.com',
  database: process.env.MSSQL_DATABASE || 'ebayjaco_mmarshalldb',
  user: process.env.MSSQL_USER || 'ebayjaco_ellivro',
  password: process.env.MSSQL_PASSWORD || 'Passw0rd#2020',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 8000,
    requestTimeout: 10000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }
  pool = await sql.connect(mssqlConfig);
  return pool;
}

export async function testConnection(): Promise<{ success: boolean; error?: string; tables?: string[] }> {
  try {
    const p = await getDbPool();
    const result = await p.request().query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'');
    const tables = result.recordset.map((r: any) => r.TABLE_NAME);
    return { success: true, tables };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to MS SQL Server' };
  }
}

export async function getMssqlUsers(): Promise<any[]> {
  const p = await getDbPool();
  const result = await p.request().query('SELECT UserID, FirstName, LastName, UserAddEmail, UserReferalCode, UserStatus, UserRole FROM Users');
  return result.recordset;
}

export async function getMssqlMixes(): Promise<any[]> {
  const p = await getDbPool();
  const result = await p.request().query('SELECT * FROM mixes');
  return result.recordset;
}

export async function getMssqlReferralCodes(): Promise<any[]> {
  const p = await getDbPool();
  const result = await p.request().query('SELECT * FROM Referralcodes');
  return result.recordset;
}
