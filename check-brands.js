const http = require('http');

async function checkBrands() {
    try {
        console.log('Checking brands from API...');
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/brands',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.success && jsonData.data && jsonData.data.brands) {
                        console.log('Available brands:');
                        jsonData.data.brands.forEach(brand => {
                            console.log(`- ID: ${brand.id}, Name: ${brand.name}, Slug: "${brand.slug}"`);
                        });
                    } else {
                        console.log('No brands found or API error:', jsonData);
                    }
                } catch (parseError) {
                    console.error('Error parsing response:', parseError.message);
                    console.log('Raw response:', data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error fetching brands:', error.message);
        });

        req.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkBrands();
