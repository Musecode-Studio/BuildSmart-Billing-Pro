use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct Client {
    pub id: String,
    pub client_name: String,
    pub debt_code: Option<String>,
    pub users: i32,
    pub billing_model: String,
    pub currency: String,
    pub jan: f64,
    pub feb: f64,
    pub mar: f64,
    pub apr: f64,
    pub may: f64,
    pub jun: f64,
    pub jul: f64,
    pub aug: f64,
    pub sep: f64,
    pub oct: f64,
    pub nov: f64,
    pub dec: f64,
    pub total: f64,
    pub comments: Option<String>,
    pub deal_start_date: String,
    pub anniversary_month: Option<i32>,
    pub billing_frequency: Option<String>,
    pub installment_months: Option<i32>,
    pub monthly_factor: Option<f64>,
    pub implementation_fee: Option<f64>,
    pub implementation_months: Option<i32>,
    pub implementation_start_date: Option<String>,
    pub implementation_complete_date: Option<String>,
    pub subscription_duration: Option<i32>,
    pub subscription_start_date: Option<String>,
    pub monthly_license_rate: Option<f64>,
    pub commission_rate: Option<f64>,
    pub var_partner: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub custom_increase_rate: Option<f64>,
    pub future_year_data: Option<String>,
    pub base_year_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VarPartner {
    pub id: String,
    pub name: String,
    pub region: String,
    pub contact_person: String,
    pub email: String,
    pub phone: Option<String>,
    pub commission_rate: f64,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VarClient {
    pub id: String,
    pub client_name: String,
    pub debt_code: Option<String>,
    pub users: i32,
    pub billing_model: String,
    pub currency: String,
    pub jan: f64,
    pub feb: f64,
    pub mar: f64,
    pub apr: f64,
    pub may: f64,
    pub jun: f64,
    pub jul: f64,
    pub aug: f64,
    pub sep: f64,
    pub oct: f64,
    pub nov: f64,
    pub dec: f64,
    pub total: f64,
    pub comments: Option<String>,
    pub deal_start_date: String,
    pub anniversary_month: Option<i32>,
    pub billing_frequency: Option<String>,
    pub installment_months: Option<i32>,
    pub monthly_factor: Option<f64>,
    pub implementation_fee: Option<f64>,
    pub implementation_months: Option<i32>,
    pub implementation_start_date: Option<String>,
    pub implementation_complete_date: Option<String>,
    pub subscription_duration: Option<i32>,
    pub var_partner_id: String,
    pub commission_rate: f64,
    pub is_active: bool,
    pub created_at: String,
    pub custom_increase_rate: Option<f64>,
    pub future_year_data: Option<String>,
    pub base_year_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AdditionalLicense {
    pub id: String,
    pub client_id: String,
    pub license_type: String,
    pub quantity: i32,
    pub price_per_unit: f64,
    pub start_date: String,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VarClientInvoice {
    pub id: String,
    pub var_client_id: String,
    pub var_partner_id: String,
    pub billing_month: String,
    pub users: i32,
    pub client_revenue: f64,
    pub commission_rate: f64,
    pub commission_amount: f64,
    pub invoice_date: Option<String>,
    pub invoice_status: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VarInvoiceTracking {
    pub var_client_id: String,
    pub is_invoiced: bool,
    pub invoiced_date: Option<String>,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init()?;
        Ok(db)
    }

    fn init(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "CREATE TABLE IF NOT EXISTS clients (
                id TEXT PRIMARY KEY,
                client_name TEXT NOT NULL,
                debt_code TEXT,
                users INTEGER NOT NULL,
                billing_model TEXT NOT NULL,
                currency TEXT NOT NULL,
                jan REAL NOT NULL DEFAULT 0,
                feb REAL NOT NULL DEFAULT 0,
                mar REAL NOT NULL DEFAULT 0,
                apr REAL NOT NULL DEFAULT 0,
                may REAL NOT NULL DEFAULT 0,
                jun REAL NOT NULL DEFAULT 0,
                jul REAL NOT NULL DEFAULT 0,
                aug REAL NOT NULL DEFAULT 0,
                sep REAL NOT NULL DEFAULT 0,
                oct REAL NOT NULL DEFAULT 0,
                nov REAL NOT NULL DEFAULT 0,
                dec REAL NOT NULL DEFAULT 0,
                total REAL NOT NULL DEFAULT 0,
                comments TEXT,
                deal_start_date TEXT NOT NULL,
                anniversary_month INTEGER,
                billing_frequency TEXT,
                installment_months INTEGER,
                monthly_factor REAL,
                implementation_fee REAL,
                implementation_months INTEGER,
                implementation_start_date TEXT,
                implementation_complete_date TEXT,
                subscription_duration INTEGER,
                subscription_start_date TEXT,
                monthly_license_rate REAL,
                commission_rate REAL,
                var_partner TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                custom_increase_rate REAL,
                future_year_data TEXT,
                base_year_data TEXT
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS var_partners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                region TEXT NOT NULL,
                contact_person TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                commission_rate REAL NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS var_clients (
                id TEXT PRIMARY KEY,
                client_name TEXT NOT NULL,
                debt_code TEXT,
                users INTEGER NOT NULL,
                billing_model TEXT NOT NULL,
                currency TEXT NOT NULL,
                jan REAL NOT NULL DEFAULT 0,
                feb REAL NOT NULL DEFAULT 0,
                mar REAL NOT NULL DEFAULT 0,
                apr REAL NOT NULL DEFAULT 0,
                may REAL NOT NULL DEFAULT 0,
                jun REAL NOT NULL DEFAULT 0,
                jul REAL NOT NULL DEFAULT 0,
                aug REAL NOT NULL DEFAULT 0,
                sep REAL NOT NULL DEFAULT 0,
                oct REAL NOT NULL DEFAULT 0,
                nov REAL NOT NULL DEFAULT 0,
                dec REAL NOT NULL DEFAULT 0,
                total REAL NOT NULL DEFAULT 0,
                comments TEXT,
                deal_start_date TEXT NOT NULL,
                anniversary_month INTEGER,
                billing_frequency TEXT,
                installment_months INTEGER,
                monthly_factor REAL,
                implementation_fee REAL,
                implementation_months INTEGER,
                implementation_start_date TEXT,
                implementation_complete_date TEXT,
                subscription_duration INTEGER,
                var_partner_id TEXT NOT NULL,
                commission_rate REAL NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                custom_increase_rate REAL,
                future_year_data TEXT,
                base_year_data TEXT,
                FOREIGN KEY (var_partner_id) REFERENCES var_partners (id)
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS additional_licenses (
                id TEXT PRIMARY KEY,
                client_id TEXT NOT NULL,
                license_type TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price_per_unit REAL NOT NULL,
                start_date TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY (client_id) REFERENCES clients (id)
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS var_client_invoices (
                id TEXT PRIMARY KEY,
                var_client_id TEXT NOT NULL,
                var_partner_id TEXT NOT NULL,
                billing_month TEXT NOT NULL,
                users INTEGER NOT NULL,
                client_revenue REAL NOT NULL,
                commission_rate REAL NOT NULL,
                commission_amount REAL NOT NULL,
                invoice_date TEXT,
                invoice_status TEXT NOT NULL DEFAULT 'pending',
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (var_client_id) REFERENCES var_clients (id),
                FOREIGN KEY (var_partner_id) REFERENCES var_partners (id)
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS var_invoice_tracking (
                var_client_id TEXT PRIMARY KEY,
                is_invoiced INTEGER NOT NULL DEFAULT 0,
                invoiced_date TEXT,
                FOREIGN KEY (var_client_id) REFERENCES var_clients (id)
            )",
            [],
        )?;

        Ok(())
    }

    pub fn get_clients(&self) -> Result<Vec<Client>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, client_name, debt_code, users, billing_model, currency,
             jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, total,
             comments, deal_start_date, anniversary_month, billing_frequency,
             installment_months, monthly_factor, implementation_fee, implementation_months,
             implementation_start_date, implementation_complete_date, subscription_duration,
             subscription_start_date, monthly_license_rate, commission_rate, var_partner,
             is_active, created_at, custom_increase_rate, future_year_data, base_year_data
             FROM clients WHERE is_active = 1"
        )?;

        let clients = stmt.query_map([], |row| {
            Ok(Client {
                id: row.get(0)?,
                client_name: row.get(1)?,
                debt_code: row.get(2)?,
                users: row.get(3)?,
                billing_model: row.get(4)?,
                currency: row.get(5)?,
                jan: row.get(6)?,
                feb: row.get(7)?,
                mar: row.get(8)?,
                apr: row.get(9)?,
                may: row.get(10)?,
                jun: row.get(11)?,
                jul: row.get(12)?,
                aug: row.get(13)?,
                sep: row.get(14)?,
                oct: row.get(15)?,
                nov: row.get(16)?,
                dec: row.get(17)?,
                total: row.get(18)?,
                comments: row.get(19)?,
                deal_start_date: row.get(20)?,
                anniversary_month: row.get(21)?,
                billing_frequency: row.get(22)?,
                installment_months: row.get(23)?,
                monthly_factor: row.get(24)?,
                implementation_fee: row.get(25)?,
                implementation_months: row.get(26)?,
                implementation_start_date: row.get(27)?,
                implementation_complete_date: row.get(28)?,
                subscription_duration: row.get(29)?,
                subscription_start_date: row.get(30)?,
                monthly_license_rate: row.get(31)?,
                commission_rate: row.get(32)?,
                var_partner: row.get(33)?,
                is_active: row.get::<_, i32>(34)? == 1,
                created_at: row.get(35)?,
                custom_increase_rate: row.get(36)?,
                future_year_data: row.get(37)?,
                base_year_data: row.get(38)?,
            })
        })?;

        clients.collect()
    }

    pub fn add_client(&self, client: Client) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO clients (
                id, client_name, debt_code, users, billing_model, currency,
                jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, total,
                comments, deal_start_date, anniversary_month, billing_frequency,
                installment_months, monthly_factor, implementation_fee, implementation_months,
                implementation_start_date, implementation_complete_date, subscription_duration,
                subscription_start_date, monthly_license_rate, commission_rate, var_partner,
                is_active, created_at, custom_increase_rate, future_year_data, base_year_data
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
                      ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30,
                      ?31, ?32, ?33, ?34, ?35, ?36, ?37, ?38, ?39)",
            params![
                client.id, client.client_name, client.debt_code, client.users,
                client.billing_model, client.currency, client.jan, client.feb,
                client.mar, client.apr, client.may, client.jun, client.jul,
                client.aug, client.sep, client.oct, client.nov, client.dec,
                client.total, client.comments, client.deal_start_date,
                client.anniversary_month, client.billing_frequency,
                client.installment_months, client.monthly_factor,
                client.implementation_fee, client.implementation_months,
                client.implementation_start_date, client.implementation_complete_date,
                client.subscription_duration, client.subscription_start_date,
                client.monthly_license_rate, client.commission_rate,
                client.var_partner, if client.is_active { 1 } else { 0 },
                client.created_at, client.custom_increase_rate,
                client.future_year_data, client.base_year_data
            ],
        )?;
        Ok(())
    }

    pub fn update_client(&self, client: Client) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE clients SET
                client_name = ?2, debt_code = ?3, users = ?4, billing_model = ?5,
                currency = ?6, jan = ?7, feb = ?8, mar = ?9, apr = ?10, may = ?11,
                jun = ?12, jul = ?13, aug = ?14, sep = ?15, oct = ?16, nov = ?17,
                dec = ?18, total = ?19, comments = ?20, deal_start_date = ?21,
                anniversary_month = ?22, billing_frequency = ?23, installment_months = ?24,
                monthly_factor = ?25, implementation_fee = ?26, implementation_months = ?27,
                implementation_start_date = ?28, implementation_complete_date = ?29,
                subscription_duration = ?30, subscription_start_date = ?31,
                monthly_license_rate = ?32, commission_rate = ?33, var_partner = ?34,
                is_active = ?35, custom_increase_rate = ?36, future_year_data = ?37,
                base_year_data = ?38
             WHERE id = ?1",
            params![
                client.id, client.client_name, client.debt_code, client.users,
                client.billing_model, client.currency, client.jan, client.feb,
                client.mar, client.apr, client.may, client.jun, client.jul,
                client.aug, client.sep, client.oct, client.nov, client.dec,
                client.total, client.comments, client.deal_start_date,
                client.anniversary_month, client.billing_frequency,
                client.installment_months, client.monthly_factor,
                client.implementation_fee, client.implementation_months,
                client.implementation_start_date, client.implementation_complete_date,
                client.subscription_duration, client.subscription_start_date,
                client.monthly_license_rate, client.commission_rate,
                client.var_partner, if client.is_active { 1 } else { 0 },
                client.custom_increase_rate, client.future_year_data,
                client.base_year_data
            ],
        )?;
        Ok(())
    }

    pub fn delete_client(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE clients SET is_active = 0 WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn get_var_partners(&self) -> Result<Vec<VarPartner>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, region, contact_person, email, phone, commission_rate, is_active
             FROM var_partners WHERE is_active = 1"
        )?;

        let partners = stmt.query_map([], |row| {
            Ok(VarPartner {
                id: row.get(0)?,
                name: row.get(1)?,
                region: row.get(2)?,
                contact_person: row.get(3)?,
                email: row.get(4)?,
                phone: row.get(5)?,
                commission_rate: row.get(6)?,
                is_active: row.get::<_, i32>(7)? == 1,
            })
        })?;

        partners.collect()
    }

    pub fn add_var_partner(&self, partner: VarPartner) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO var_partners (id, name, region, contact_person, email, phone, commission_rate, is_active)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                partner.id, partner.name, partner.region, partner.contact_person,
                partner.email, partner.phone, partner.commission_rate,
                if partner.is_active { 1 } else { 0 }
            ],
        )?;
        Ok(())
    }

    pub fn update_var_partner(&self, partner: VarPartner) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE var_partners SET name = ?2, region = ?3, contact_person = ?4,
             email = ?5, phone = ?6, commission_rate = ?7, is_active = ?8
             WHERE id = ?1",
            params![
                partner.id, partner.name, partner.region, partner.contact_person,
                partner.email, partner.phone, partner.commission_rate,
                if partner.is_active { 1 } else { 0 }
            ],
        )?;
        Ok(())
    }

    pub fn delete_var_partner(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE var_partners SET is_active = 0 WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn get_var_clients(&self) -> Result<Vec<VarClient>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, client_name, debt_code, users, billing_model, currency,
             jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, total,
             comments, deal_start_date, anniversary_month, billing_frequency,
             installment_months, monthly_factor, implementation_fee, implementation_months,
             implementation_start_date, implementation_complete_date, subscription_duration,
             var_partner_id, commission_rate, is_active, created_at, custom_increase_rate,
             future_year_data, base_year_data
             FROM var_clients WHERE is_active = 1"
        )?;

        let clients = stmt.query_map([], |row| {
            Ok(VarClient {
                id: row.get(0)?,
                client_name: row.get(1)?,
                debt_code: row.get(2)?,
                users: row.get(3)?,
                billing_model: row.get(4)?,
                currency: row.get(5)?,
                jan: row.get(6)?,
                feb: row.get(7)?,
                mar: row.get(8)?,
                apr: row.get(9)?,
                may: row.get(10)?,
                jun: row.get(11)?,
                jul: row.get(12)?,
                aug: row.get(13)?,
                sep: row.get(14)?,
                oct: row.get(15)?,
                nov: row.get(16)?,
                dec: row.get(17)?,
                total: row.get(18)?,
                comments: row.get(19)?,
                deal_start_date: row.get(20)?,
                anniversary_month: row.get(21)?,
                billing_frequency: row.get(22)?,
                installment_months: row.get(23)?,
                monthly_factor: row.get(24)?,
                implementation_fee: row.get(25)?,
                implementation_months: row.get(26)?,
                implementation_start_date: row.get(27)?,
                implementation_complete_date: row.get(28)?,
                subscription_duration: row.get(29)?,
                var_partner_id: row.get(30)?,
                commission_rate: row.get(31)?,
                is_active: row.get::<_, i32>(32)? == 1,
                created_at: row.get(33)?,
                custom_increase_rate: row.get(34)?,
                future_year_data: row.get(35)?,
                base_year_data: row.get(36)?,
            })
        })?;

        clients.collect()
    }

    pub fn add_var_client(&self, client: VarClient) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO var_clients (
                id, client_name, debt_code, users, billing_model, currency,
                jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, total,
                comments, deal_start_date, anniversary_month, billing_frequency,
                installment_months, monthly_factor, implementation_fee, implementation_months,
                implementation_start_date, implementation_complete_date, subscription_duration,
                var_partner_id, commission_rate, is_active, created_at, custom_increase_rate,
                future_year_data, base_year_data
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
                      ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30,
                      ?31, ?32, ?33, ?34, ?35, ?36, ?37)",
            params![
                client.id, client.client_name, client.debt_code, client.users,
                client.billing_model, client.currency, client.jan, client.feb,
                client.mar, client.apr, client.may, client.jun, client.jul,
                client.aug, client.sep, client.oct, client.nov, client.dec,
                client.total, client.comments, client.deal_start_date,
                client.anniversary_month, client.billing_frequency,
                client.installment_months, client.monthly_factor,
                client.implementation_fee, client.implementation_months,
                client.implementation_start_date, client.implementation_complete_date,
                client.subscription_duration, client.var_partner_id,
                client.commission_rate, if client.is_active { 1 } else { 0 },
                client.created_at, client.custom_increase_rate,
                client.future_year_data, client.base_year_data
            ],
        )?;
        Ok(())
    }

    pub fn update_var_client(&self, client: VarClient) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE var_clients SET
                client_name = ?2, debt_code = ?3, users = ?4, billing_model = ?5,
                currency = ?6, jan = ?7, feb = ?8, mar = ?9, apr = ?10, may = ?11,
                jun = ?12, jul = ?13, aug = ?14, sep = ?15, oct = ?16, nov = ?17,
                dec = ?18, total = ?19, comments = ?20, deal_start_date = ?21,
                anniversary_month = ?22, billing_frequency = ?23, installment_months = ?24,
                monthly_factor = ?25, implementation_fee = ?26, implementation_months = ?27,
                implementation_start_date = ?28, implementation_complete_date = ?29,
                subscription_duration = ?30, var_partner_id = ?31, commission_rate = ?32,
                is_active = ?33, custom_increase_rate = ?34, future_year_data = ?35,
                base_year_data = ?36
             WHERE id = ?1",
            params![
                client.id, client.client_name, client.debt_code, client.users,
                client.billing_model, client.currency, client.jan, client.feb,
                client.mar, client.apr, client.may, client.jun, client.jul,
                client.aug, client.sep, client.oct, client.nov, client.dec,
                client.total, client.comments, client.deal_start_date,
                client.anniversary_month, client.billing_frequency,
                client.installment_months, client.monthly_factor,
                client.implementation_fee, client.implementation_months,
                client.implementation_start_date, client.implementation_complete_date,
                client.subscription_duration, client.var_partner_id,
                client.commission_rate, if client.is_active { 1 } else { 0 },
                client.custom_increase_rate, client.future_year_data,
                client.base_year_data
            ],
        )?;
        Ok(())
    }

    pub fn delete_var_client(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE var_clients SET is_active = 0 WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn get_additional_licenses(&self, client_id: &str) -> Result<Vec<AdditionalLicense>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, client_id, license_type, quantity, price_per_unit, start_date, is_active, created_at
             FROM additional_licenses WHERE client_id = ?1 AND is_active = 1"
        )?;

        let licenses = stmt.query_map(params![client_id], |row| {
            Ok(AdditionalLicense {
                id: row.get(0)?,
                client_id: row.get(1)?,
                license_type: row.get(2)?,
                quantity: row.get(3)?,
                price_per_unit: row.get(4)?,
                start_date: row.get(5)?,
                is_active: row.get::<_, i32>(6)? == 1,
                created_at: row.get(7)?,
            })
        })?;

        licenses.collect()
    }

    pub fn add_additional_license(&self, license: AdditionalLicense) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO additional_licenses (id, client_id, license_type, quantity, price_per_unit, start_date, is_active, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                license.id, license.client_id, license.license_type, license.quantity,
                license.price_per_unit, license.start_date,
                if license.is_active { 1 } else { 0 }, license.created_at
            ],
        )?;
        Ok(())
    }

    pub fn update_additional_license(&self, license: AdditionalLicense) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE additional_licenses SET client_id = ?2, license_type = ?3, quantity = ?4,
             price_per_unit = ?5, start_date = ?6, is_active = ?7
             WHERE id = ?1",
            params![
                license.id, license.client_id, license.license_type, license.quantity,
                license.price_per_unit, license.start_date,
                if license.is_active { 1 } else { 0 }
            ],
        )?;
        Ok(())
    }

    pub fn delete_additional_license(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE additional_licenses SET is_active = 0 WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn get_var_client_invoices(&self) -> Result<Vec<VarClientInvoice>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, var_client_id, var_partner_id, billing_month, users,
             client_revenue, commission_rate, commission_amount, invoice_date,
             invoice_status, notes, created_at, updated_at
             FROM var_client_invoices
             ORDER BY billing_month DESC, created_at DESC"
        )?;

        let invoices = stmt.query_map([], |row| {
            Ok(VarClientInvoice {
                id: row.get(0)?,
                var_client_id: row.get(1)?,
                var_partner_id: row.get(2)?,
                billing_month: row.get(3)?,
                users: row.get(4)?,
                client_revenue: row.get(5)?,
                commission_rate: row.get(6)?,
                commission_amount: row.get(7)?,
                invoice_date: row.get(8)?,
                invoice_status: row.get(9)?,
                notes: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })?;

        let mut result = Vec::new();
        for invoice in invoices {
            result.push(invoice?);
        }
        Ok(result)
    }

    pub fn create_var_client_invoice(&self, invoice: VarClientInvoice) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO var_client_invoices
             (id, var_client_id, var_partner_id, billing_month, users,
              client_revenue, commission_rate, commission_amount, invoice_date,
              invoice_status, notes, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                invoice.id,
                invoice.var_client_id,
                invoice.var_partner_id,
                invoice.billing_month,
                invoice.users,
                invoice.client_revenue,
                invoice.commission_rate,
                invoice.commission_amount,
                invoice.invoice_date,
                invoice.invoice_status,
                invoice.notes,
                invoice.created_at,
                invoice.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn update_var_client_invoice(&self, invoice: VarClientInvoice) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE var_client_invoices
             SET var_client_id = ?2, var_partner_id = ?3, billing_month = ?4,
                 users = ?5, client_revenue = ?6, commission_rate = ?7,
                 commission_amount = ?8, invoice_date = ?9, invoice_status = ?10,
                 notes = ?11, updated_at = ?12
             WHERE id = ?1",
            params![
                invoice.id,
                invoice.var_client_id,
                invoice.var_partner_id,
                invoice.billing_month,
                invoice.users,
                invoice.client_revenue,
                invoice.commission_rate,
                invoice.commission_amount,
                invoice.invoice_date,
                invoice.invoice_status,
                invoice.notes,
                invoice.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn delete_var_client_invoice(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM var_client_invoices WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn toggle_var_invoice_status(&self, var_client_id: &str, is_invoiced: bool) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "INSERT INTO var_invoice_tracking (var_client_id, is_invoiced)
             VALUES (?1, ?2)
             ON CONFLICT(var_client_id) DO UPDATE SET is_invoiced = ?2",
            params![var_client_id, if is_invoiced { 1 } else { 0 }],
        )?;
        Ok(())
    }

    pub fn get_var_invoice_tracking(&self) -> Result<Vec<VarInvoiceTracking>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT var_client_id, is_invoiced, invoiced_date
             FROM var_invoice_tracking",
        )?;

        let tracking_iter = stmt.query_map([], |row| {
            Ok(VarInvoiceTracking {
                var_client_id: row.get(0)?,
                is_invoiced: row.get::<_, i32>(1)? == 1,
                invoiced_date: row.get(2)?,
            })
        })?;

        let mut tracking = Vec::new();
        for item in tracking_iter {
            tracking.push(item?);
        }

        Ok(tracking)
    }
}
