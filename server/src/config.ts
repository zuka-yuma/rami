import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET
const port = process.env.PORT
const databaseURL = process.env.DATABASE_URL
export const isProduction = process.env.NODE_ENV === 'production'
if (!jwtSecret) {
    throw new Error("JWT_SECRET")
} else if (!port) {
    throw new Error("PORT")
} else if (!databaseURL) {
    throw new Error("DATABASE_URL")
}

export const config = {
    jwt: {
        secret: jwtSecret,
        access: {
            algorithm: "HS256",
            expiresIn: "15m"
        } as const,
        refresh: {
            algorithm: "HS256",
            expiresIn: "7d"
        } as const
    },
    port: parseInt(port),
    databaseURL: databaseURL
}