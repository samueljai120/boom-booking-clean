// Simple Business Hours API endpoint for testing
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Return static business hours for testing
    const businessHours = [
      { day: 'monday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'tuesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'wednesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'thursday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'friday', open: '09:00', close: '23:00', isOpen: true },
      { day: 'saturday', open: '10:00', close: '23:00', isOpen: true },
      { day: 'sunday', open: '10:00', close: '21:00', isOpen: true }
    ];

    res.status(200).json({
      success: true,
      data: {
        businessHours
      },
      message: 'Static business hours for testing'
    });
    
  } catch (error) {
    console.error('Business hours simple error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
