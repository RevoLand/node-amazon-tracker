const databaseConfig = {
  hostname: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  name: process.env.DB_NAME ?? 'amazon-tracker',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
}

export default databaseConfig;
