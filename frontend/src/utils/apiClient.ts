// TODO: use Map object
interface Cache<T> {
    [key: string]: T
}

class API {
    private cache: Cache<object> = {}
    private static instance: API

    public static getInstance(): API {
        if (!API.instance) {
            API.instance = new API()
        }
        return API.instance
    }

    async fetchFromBackend(url: string): Promise<object> {
        if (url in this.cache) {
            return this.cache[url]
        }
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        console.log(data)
        this.cache[url] = data
        return data
    }
}

export const ApiClient = API.getInstance()
