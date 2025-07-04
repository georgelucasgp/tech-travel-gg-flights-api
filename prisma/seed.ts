import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const airports = [
    {
      iata_code: 'BSB',
      name: 'Aeroporto de Brasília - Presidente Juscelino Kubitschek',
      city: 'Brasília',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    },
    {
      iata_code: 'GRU',
      name: 'Aeroporto Internacional de São Paulo/Guarulhos',
      city: 'Guarulhos',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    },
    {
      iata_code: 'GIG',
      name: 'Aeroporto Internacional do Rio de Janeiro - Galeão',
      city: 'Rio de Janeiro',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    },
    {
      iata_code: 'IMP',
      name: 'Aeroporto de Imperatriz - Prefeito Renato Moreira',
      city: 'Imperatriz',
      country: 'Brasil',
      timezone: 'America/Fortaleza',
    },
  ];

  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iataCode: airport.iata_code },
      update: {},
      create: {
        iataCode: airport.iata_code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        timezone: airport.timezone,
      },
    });
  }

  const airlines = [
    { name: 'LATAM Airlines', iata_code: 'LA' },
    { name: 'Azul Linhas Aéreas', iata_code: 'AD' },
    { name: 'Gol Linhas Aéreas', iata_code: 'G3' },
  ];

  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { iataCode: airline.iata_code },
      update: {},
      create: {
        name: airline.name,
        iataCode: airline.iata_code,
      },
    });
  }

  const users = [
    { name: 'John Doe', email: 'john.doe@example.com' },
    { name: 'Maria Silva', email: 'maria.silva@example.com' },
    { name: 'Carlos Souza', email: 'carlos.souza@example.com' },
    { name: 'Ana Paula', email: 'ana.paula@example.com' },
    { name: 'Lucas Oliveira', email: 'lucas.oliveira@example.com' },
  ];
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  const moreAirlines = [
    { name: 'Avianca Brasil', iata_code: 'O6' },
    { name: 'Passaredo Linhas Aéreas', iata_code: '2Z' },
    { name: 'Voepass Linhas Aéreas', iata_code: '8V' },
    { name: 'Itapemirim Transportes Aéreos', iata_code: '8I' },
  ];
  for (const airline of moreAirlines) {
    await prisma.airline.upsert({
      where: { iataCode: airline.iata_code },
      update: {},
      create: {
        name: airline.name,
        iataCode: airline.iata_code,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
