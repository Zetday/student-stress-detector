import newman from 'newman';
import fs from 'fs';

const collection = JSON.parse(fs.readFileSync('./postman/CekTenang.postman_collection.json', 'utf8'));
const environment = JSON.parse(fs.readFileSync('./postman/CekTenang-API.postman_environment.json', 'utf8'));

// Ensure a valid binary JPEG dummy image exists for upload tests
const base64Jpg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
fs.writeFileSync('./postman/dummy.jpg', Buffer.from(base64Jpg, 'base64'));


newman.run({
    collection,
    environment,
    reporters: 'cli'
}).on('request', function (err, args) {
    if (args.response && args.response.code >= 400) {
        console.log('\n========================================');
        console.log(`FAILED REQUEST: ${args.request.method} ${args.request.url.toString()}`);
        console.log(`Response Status: ${args.response.code} ${args.response.status}`);
        console.log(`Response Body: ${args.response.stream.toString()}`);
        console.log('========================================\n');
    }
}).on('done', function (err, summary) {
    if (err) { throw err; }
    const failures = summary.run.failures;
    console.log('--- FAILURES ---');
    failures.forEach((f, i) => {
        console.log(`${i+1}. ${f.source.name} - ${f.error.message}`);
    });
    console.log('--- END FAILURES ---');
});
