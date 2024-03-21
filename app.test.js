const request = require('supertest');
const app = require('../app');

//Company Tests

describe('GET /companies', () => {
  test('It should respond with an array of companies', async () => {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('companies');
    expect(Array.isArray(response.body.companies)).toBe(true);
  });
});

describe('GET /companies/:code', () => {
    test('It should respond with details of a specific company', async () => {
      const response = await request(app).get('/companies/someCode'); // Use an actual company code
      expect(response.statusCode).toBe(200);
      expect(response.body.company).toHaveProperty('code');
      expect(response.body.company.code).toBe('someCode'); // Ensure the code matches
    });
  
    test('It should return a 404 for a non-existent company', async () => {
      const response = await request(app).get('/companies/nonExistentCode');
      expect(response.statusCode).toBe(404);
    });
});
  

/// Invoice Tests 

describe('POST /invoices', () => {
    test('It should create a new invoice', async () => {
      const newInvoice = { comp_code: 'someCode', amt: 500 }; 
      const response = await request(app)
        .post('/invoices')
        .send(newInvoice);
      expect(response.statusCode).toBe(201);
      expect(response.body.invoice).toHaveProperty('id');
      expect(response.body.invoice.amt).toEqual(newInvoice.amt);
    });
});
 

describe('PUT /invoices/:id', () => {
    test('It should update an existing invoice', async () => {
      const updatedInvoice = { amt: 600, paid: false };
      const response = await request(app)
        .put('/invoices/1')
        .send(updatedInvoice);
      expect(response.statusCode).toBe(200);
      expect(response.body.invoice.amt).toEqual(updatedInvoice.amt);
    });
  
    test('It should return a 404 for a non-existent invoice', async () => {
      const response = await request(app).put('/invoices/9999').send({ amt: 600, paid: false });
      expect(response.statusCode).toBe(404);
    });
  });
  