describe('API Status Code Test', () => {
  it('should return status code 200 and print the response body', async () => {
    const url = 'https://backend-sekolah-mu-development.vercel.app?_vercel_share=OKwwAtmieiLCz43JiqcpJCwUrO9WReIA';
    const headers = {
      'Accept': 'application/json',
      Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`, // Request JSON data
      // Add more headers if needed
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    console.log('Response Body:', await response.text());
    expect(response.status).toBe(200);
  });
});