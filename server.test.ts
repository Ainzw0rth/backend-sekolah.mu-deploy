import request from 'supertest';
const baseURL = 'https://backend-sekolah-mu-development.vercel.app?_vercel_share=OKwwAtmieiLCz43JiqcpJCwUrO9WReIA'

describe('test konten endpoint', () => {
    it("harusnya return isi dari konten", async () => {
        const response = await request(baseURL).get("/");
        expect(response.statusCode).toBe(200);
    });
});