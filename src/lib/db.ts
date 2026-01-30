// This is a minimal mock database client for demonstration purposes.
// In a real application, you would use 'pg' or 'postgres.js' to connect to Postgres.
// Since we don't have a running DB instance we can connect to, we'll verify logic using mocks.

type QueryResult = {
    rows: any[];
    rowCount: number;
};

// Mock in-memory store for simulation usage if needed, 
// though the API routes will mostly focus on structure.
const store: any = {
    users: [],
    sessions: [],
    loginAttempts: []
};

export const db = {
    query: async (text: string, params?: any[]): Promise<QueryResult> => {
        console.log(`[DB Query]: ${text}`, params);

        // --- SIMULATED LOGIC FOR AUTH FLOW ---
        // This allows the user to actually test the "Register" -> "Login" flow in the UI
        // without a real database.

        const cleanText = text.toLowerCase();

        // 1. Check for existing user (Registration check)
        if (cleanText.includes('select id from users where email')) {
            const email = params![0];
            const exists = store.users.find((u: any) => u.email === email);
            return { rows: exists ? [{ id: exists.id }] : [], rowCount: exists ? 1 : 0 };
        }

        if (cleanText.includes('select id from users where unit_id')) {
            const unit = params![0];
            const exists = store.users.find((u: any) => u.unit_id === unit);
            return { rows: exists ? [{ id: exists.id }] : [], rowCount: exists ? 1 : 0 };
        }

        if (cleanText.includes('select id from users where certification_number')) {
            const cert = params![0];
            const exists = store.users.find((u: any) => u.certification_number === cert);
            return { rows: exists ? [{ id: exists.id }] : [], rowCount: exists ? 1 : 0 };
        }

        // --- NEW: Find Available Drivers ---
        if (cleanText.includes("where status = 'available'")) {
            // Include some mock drivers if none exist to make testing easier
            const available = store.users.filter((u: any) => u.status === 'available');

            // If none, let's pretend there's at least one at a specific location for testing
            if (available.length === 0) {
                const mockDriver = {
                    id: "DRV-101",
                    full_name: "Test Driver (Auto-Generated)",
                    unit_id: "AMB-101-NYC",
                    current_latitude: 40.7128,
                    current_longitude: -74.0060,
                    status: 'available',
                    is_active: true
                };
                return { rows: [mockDriver], rowCount: 1 };
            }

            return { rows: available, rowCount: available.length };
        }

        // --- NEW: Update Driver Location ---
        if (cleanText.includes('update users set current_latitude =')) {
            const lat = params![0];
            const lng = params![1];
            const acc = params![2];
            const spd = params![3];
            const hdg = params![4];
            const driverId = params![5];

            const user = store.users.find((u: any) => u.id === driverId);
            if (user) {
                user.current_latitude = lat;
                user.current_longitude = lng;
                user.current_accuracy = acc;
                user.current_speed = spd;
                user.current_heading = hdg;
            }
            return { rows: [], rowCount: 1 };
        }

        if (cleanText.includes('insert into driver_locations')) {
            // Simulate storing history
            return { rows: [], rowCount: 1 };
        }

        // --- NEW: Update Driver Status ---
        if (cleanText.includes('update users set status =')) {
            const status = params![0];
            const userId = params![1];
            const user = store.users.find((u: any) => u.id === userId);
            if (user) user.status = status;
            return { rows: [], rowCount: 1 };
        }

        // --- NEW: Insert Emergency ---
        if (cleanText.includes('insert into emergency_dispatches')) {
            // Just simulate success
            return { rows: [], rowCount: 1 };
        }

        // 2. Insert new user
        if (cleanText.includes('insert into users')) {
            // Very basic simulation of insert
            const newUser = {
                id: params![0],
                email: params![1],
                phone: params![2],
                password_hash: params![3],
                full_name: params![4],
                unit_id: params![5],
                certification_number: params![6],
                is_active: true
            };
            store.users.push(newUser);
            return { rows: [], rowCount: 1 };
        }

        // 3. Select user for Login
        if (cleanText.includes('select * from users where email')) {
            const email = params![0];
            const user = store.users.find((u: any) => u.email === email);
            return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
        }

        return { rows: [], rowCount: 0 };
    }
};
