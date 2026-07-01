import { MongoClient } from 'mongodb'

// Lazy connection — never construct the client at module load, otherwise
// Vercel's "collect page data" step will crash when MONGO_URL is undefined
// during the build. We only touch env vars when a request actually comes in.

let clientPromise = null

function getClientPromise() {
  if (clientPromise) return clientPromise
  const uri = process.env.MONGO_URL
  if (!uri) {
    throw new Error('MONGO_URL is not set. Configure it in the Vercel project environment variables.')
  }
  if (process.env.NODE_ENV !== 'production') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    clientPromise = new MongoClient(uri).connect()
  }
  return clientPromise
}

export async function getDb() {
  const client = await getClientPromise()
  const dbName = process.env.DB_NAME || 'failuresays'
  return client.db(dbName)
}
