const baseURL = 'https://backend-sekolah-mu-development.vercel.app?_vercel_share=OKwwAtmieiLCz43JiqcpJCwUrO9WReIA'

test('fetches data from API', async () => {
    const response = await fetch(baseURL);
    const data = await response.json();
    console.log(data)
    // Assertion
    expect(data).toEqual({ key: 'value' });
});