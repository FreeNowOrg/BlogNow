import {
  MongoClient,
  Db,
  Collection,
  FilterQuery,
  UpdateWriteOpResult,
  DeleteWriteOpResultObject,
  InsertOneWriteOpResult,
} from 'mongodb'
const dbName = process.env.BLOG_NOW_DB || 'blog-now'
const uri = process.env.MONGODB_URI || 'mongodb://localhost'

declare module 'mongodb' {
  export interface Db {
    _client: MongoClient
  }
  export interface Collection {
    _client: MongoClient
  }
}

function dbConnect(): Promise<Db> {
  return new Promise((next, reject) => {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    client.connect(async (error) => {
      if (error) {
        client.close()
        return reject(error)
      }
      const db = client.db(dbName)
      db._client = client
      next(db)
    })
  })
}

function dbCollection(collection: string): Promise<Collection> {
  return new Promise(async (next, reject) => {
    const db = await dbConnect()
    db.collection(collection, async (error, col) => {
      if (error) {
        await db._client.close()
        return reject(error)
      }
      col._client = db._client
      next(col)
    })
  })
}

function dbFind(
  colName: string,
  find = {},
  project = {},
  sort = {},
  sortDir = 1
): Promise<any[]> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(colName)
    col
      .find(find)
      .project(project)
      .sort(sort, sortDir)
      .toArray(async (error, docs) => {
        if (error) {
          await col._client.close()
          return reject(error)
        }
        await col._client.close()
        next(docs)
      })
  })
}

function dbInsertOne(
  colName: string,
  doc: any
): Promise<InsertOneWriteOpResult<any>> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(colName)
    try {
      const res = await col.insertOne(doc)
      await col._client.close()
      next(res)
    } catch (err) {
      await col._client.close()
      return reject(err)
    }
  })
}

function dbUpdateOne(
  colName: string,
  filter = {},
  update = {}
): Promise<UpdateWriteOpResult> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(colName)
    try {
      const res = await col.updateOne(filter, update)
      await col._client.close()
      next(res)
    } catch (err) {
      await col._client.close()
      reject(err)
    }
  })
}

function dbDeleteOne(
  colName: string,
  filter = {}
): Promise<DeleteWriteOpResultObject> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(colName)
    col.deleteOne(filter, async (err, res) => {
      if (err) {
        await col._client.close()
        return reject(err)
      }
      await col._client.close()
      next(res)
    })
  })
}

export {
  dbConnect,
  dbCollection,
  dbFind,
  dbInsertOne,
  dbUpdateOne,
  dbDeleteOne,
}
