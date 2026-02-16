const express = require('express')
const sql = require('mssql')
const config = require('../dbconfig')

const router = express.Router()

/**
 * GET /api/telefonok
 * Lekéri az adatbázisból a telefonok listáját, JSON válaszban visszaadja.
 */
router.get('/', async (req, res) => {
    try {
        const pool = await sql.connect(config)
        const result = await pool.request().query(`
            SELECT TelefonId, Marka, Kiadas, Tipus, Ar
            FROM dbo.Telefonok
            ORDER BY Marka, Kiadas, Tipus
        `)
        res.json({ success: true, data: result.recordset })
    } catch (err) {
        console.error('Adatbázis hiba (GET /api/telefonok):', err.message)
        res.status(500).json({
            success: false,
            error: 'Az adatbázis lekérdezés sikertelen.',
            details: err.message
        })
    }
})

/**
 * Validáció: kiszűri a hiányzó vagy érvénytelen bemenetet.
 * Visszatérés: { valid: true } vagy { valid: false, error: string, statusCode: number }
 */
function validateTelefonBody(body) {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'A kérés törzse érvénytelen vagy hiányzik.', statusCode: 400 }
    }
    const { marka, kiadas, tipus, ar } = body

    if (marka == null || typeof marka !== 'string') {
        return { valid: false, error: 'A "marka" mező kötelező és szöveg típusú kell legyen.', statusCode: 400 }
    }
    if (String(marka).trim() === '') {
        return { valid: false, error: 'A "marka" mező nem lehet üres.', statusCode: 400 }
    }
    if (kiadas == null || typeof kiadas !== 'string') {
        return { valid: false, error: 'A "kiadas" mező kötelező és szöveg típusú kell legyen.', statusCode: 400 }
    }
    if (String(kiadas).trim() === '') {
        return { valid: false, error: 'A "kiadas" mező nem lehet üres.', statusCode: 400 }
    }
    if (tipus == null || typeof tipus !== 'string') {
        return { valid: false, error: 'A "tipus" mező kötelező és szöveg típusú kell legyen.', statusCode: 400 }
    }
    if (String(tipus).trim() === '') {
        return { valid: false, error: 'A "tipus" mező nem lehet üres.', statusCode: 400 }
    }
    if (ar == null) {
        return { valid: false, error: 'Az "ar" mező kötelező.', statusCode: 400 }
    }
    const arNum = Number(ar)
    if (!Number.isInteger(arNum) || arNum <= 0) {
        return { valid: false, error: 'Az "ar" mező pozitív egész szám kell legyen.', statusCode: 400 }
    }

    return { valid: true, data: { marka: String(marka).trim(), kiadas: String(kiadas).trim(), tipus: String(tipus).trim(), ar: arNum } }
}

/**
 * POST /api/telefonok
 * Új telefon rögzítése. Validáció után beszúrás; hibás bemenet esetén nincs adatbázis művelet.
 */
router.post('/', async (req, res) => {
    const validation = validateTelefonBody(req.body)
    if (!validation.valid) {
        return res.status(validation.statusCode).json({ success: false, error: validation.error })
    }

    const { marka, kiadas, tipus, ar } = validation.data

    try {
        const pool = await sql.connect(config)
        await pool.request()
            .input('marka', sql.NVarChar(50), marka)
            .input('kiadas', sql.NVarChar(50), kiadas)
            .input('tipus', sql.NVarChar(80), tipus)
            .input('ar', sql.Int, ar)
            .query(`
                INSERT INTO dbo.Telefonok (Marka, Kiadas, Tipus, Ar)
                VALUES (@marka, @kiadas, @tipus, @ar)
            `)
        res.status(201).json({
            success: true,
            message: 'A telefon sikeresen rögzítve.',
            data: { marka, kiadas, tipus, ar }
        })
    } catch (err) {
        console.error('Adatbázis hiba (POST /api/telefonok):', err.message)

        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({
                success: false,
                error: 'Ez a telefon (márka, kiadás, típus) már szerepel az adatbázisban.'
            })
        }
        if (err.number === 547) {
            return res.status(400).json({
                success: false,
                error: 'Az adat nem felel meg az adatbázis kényszereknek (pl. ár pozitív).'
            })
        }

        res.status(500).json({
            success: false,
            error: 'A beszúrás sikertelen.',
            details: err.message
        })
    }
})

module.exports = router
