import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tripops',
});

async function run() {
  await ds.initialize();
  console.log('Connected');

  // Add coverImage columns if they don't exist yet
  try {
    await ds.query(`ALTER TABLE workspaces ADD COLUMN "coverImage" varchar`);
    console.log('Added coverImage to workspaces');
  } catch {
    console.log('coverImage column already exists on workspaces');
  }

  try {
    await ds.query(`ALTER TABLE trips ADD COLUMN "coverImage" varchar`);
    console.log('Added coverImage to trips');
  } catch {
    console.log('coverImage column already exists on trips');
  }

  // Set cover images for seed data
  await ds.query(`UPDATE workspaces SET "coverImage" = $1 WHERE name = $2`, [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    'Paris Getaway',
  ]);
  await ds.query(`UPDATE workspaces SET "coverImage" = $1 WHERE name = $2`, [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
    'Tokyo Adventure',
  ]);
  await ds.query(`UPDATE trips SET "coverImage" = $1 WHERE title = $2`, [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    'Paris Spring Break',
  ]);
  await ds.query(`UPDATE trips SET "coverImage" = $1 WHERE title = $2`, [
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
    'Tokyo Team Retreat',
  ]);

  console.log('Cover images updated!');
  await ds.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
