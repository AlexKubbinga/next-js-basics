import postgres from 'postgres';
import { languages } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedLanguages() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`CREATE TABLE IF NOT EXISTS languages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      preferred_language TEXT NOT NULL ,
      years_of_experience TEXT NOT NULL
    );`;

  const insertedLanguages = await Promise.all(
    languages.map(
      (language) => sql`
        INSERT INTO languages (customer_id, preferred_language, years_of_experience)
        VALUES (${language.customer_id}, ${language.preferred_language}, ${language.years_of_experience})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
  return insertedLanguages;
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [seedLanguages()]);

    return Response.json({ message: 'Language Table seeded successfully' });
  } catch (error) {
    console.error('Seeding failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
