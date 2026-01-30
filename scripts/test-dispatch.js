const axios = require('axios');

/**
 * SIMULATED EXTERNAL DISPATCH SCRIPT
 * Run this to simulate an external application sending a patient location.
 */
async function simulateExternalDispatch() {
    const url = 'http://localhost:3001/api/dispatch/new-emergency'; // Adjust port if needed

    const payload = {
        patient_latitude: 40.7580,
        patient_longitude: -73.9855,
        patient_address: 'Times Square, New York, NY',
        emergency_type: 'CARDIAC ARREST',
        priority: 'critical',
        caller_phone: '+1 212-555-0199',
        caller_name: 'Bystander',
        notes: 'Patient collapsed near the subway entrance. Unconscious.'
    };

    console.log('--- SENDING EXTERNAL DISPATCH ---');
    console.log('URL:', url);

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'emergency-dispatch-key-2024'
            }
        });

        console.log('\n--- SUCCESS ---');
        console.log('Emergency ID:', response.data.emergency_id);
        console.log('Assigned Driver:', response.data.assigned_driver.name);
        console.log('ETA:', response.data.assigned_driver.eta);
        console.log('\nCheck the Driver Dashboard now!');

    } catch (error) {
        console.error('\n--- FAILED ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', error.response.data.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

simulateExternalDispatch();
