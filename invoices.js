const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query (
            'SELECT id, comp_code FROM invoices'
        );
        res.json({ invoices: result.rows });
    } catch (err) {
        next (err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await db.query (
            `SELECT invoices.id, invoices.amt, invoices.paid, invoices.add_date, invoices.paid_date, companies.code, companies.name, companies.description 
             FROM invoices
             JOIN companies ON invoices.comp_code = companies.code
             WHERE invoices.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        const invoice = result.rows[0];
        const response = {
            invoice: {
                id: invoice.id,
                amt: invoice.amt,
                paid: invoice.paid,
                add_date: invoice.add_date,
                paid_date: invoice.paid_date,
                company: {
                    code: invoice.code,
                    name: invoice.name,
                    description: invoice.description
                }
            }
        }; 
        res.json(response);
    } catch (err) {
        next (err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const add_date = new Date();
        const result = await db.query (
            'INSERT INTO invoices (comp_code, amt, add_date, paid, paid_date) VALUES ($1, $2, $3, false, NULL) RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [comp_code, amt, add_date]
        );
        res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        next (err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const {amt} = req.body;
        const result = await db.query( 
            'UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [amt, id]
        );
        if (result.rows.length === 0 ) {
            return res.status(404).json({ message: 'Invoice not found'});
        }
        res.json({ invoice: result.rows[0] });
    } catch (err) {
        next (err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await db.query (
            'DELETE FROM invoices WHERE id = $1 RETURNING id',
            [id]
        );
        if (result.rowCount === 0 ) {
            return res.status(404).json({ message: 'Invoice not found' })
        }
        res.json({ status: 'deleted' });
    } catch(err) {
        next (err);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyRes = await db.query(
            'SELECT code, name, description FROM companies WHERE code = $1',
            [code]
        );
        if (companyRes.rows.length === 0 ) {
            return res.status(404).json({ message: 'Company/ Business not found' });
        }
        const invoicesRes = await db.query(
            'SELECT id FROM invoices WHERE comp_code = $1',
            [code]
        );
        const company = companyRes.rows[0];
        const invoices = invoicesRes.rows.map(row => row.id);
        res.json({ company: { ...company, invoices } })
    } catch (err) {
        next (err);
    }
});

module.exports = router;