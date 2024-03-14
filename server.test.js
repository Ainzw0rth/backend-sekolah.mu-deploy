const request = require('supertest');
const app = require('./app');

describe('test konten endpoint', () => {
    it("harusnya return isi dari konten", async () => {
        const response = await request('http://localhost:3000').get("/konten");
        expect(response.statusCode).toBe(200);
    });
});