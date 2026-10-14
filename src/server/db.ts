import mongoose from "mongoose"

type Cache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

const g = globalThis as unknown as {_mongoose?: Cache};
const cache: Cache = (g._mongoose ??= {conn: null, promise: null});

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if(!uri) 
        throw new Error("Mongo_URI is not set");
    if(cache.conn)  return cache.conn
    cache.promise ??= mongoose.connect(uri);
    try{
        cache.conn = await cache.promise;
    } catch (e) {
        cache.promise = null;
        throw e;
    }
    return cache.conn;
}