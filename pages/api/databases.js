export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, type = 'custom', fields = [] } = req.body;
    
    try {
      // Create new database table
      const defaultFields = getDefaultFields(type);
      
      // In production, this would create actual database tables
      const newDatabase = {
        id: Date.now(),
        name: name,
        type: type,
        fields: [...defaultFields, ...fields],
        created: new Date().toISOString(),
        itemCount: 0
      };

      res.status(200).json({
        success: true,
        database: newDatabase,
        message: `${name} database created successfully!`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create database' });
    }
  } else if (req.method === 'GET') {
    // Return all databases
    const mockDatabases = [
      {
        id: 1,
        name: 'Goals',
        type: 'goals',
        itemCount: 5,
        created: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Garden',
        type: 'garden',
        itemCount: 0,
        created: new Date().toISOString()
      }
    ];
    
    res.status(200).json({ databases: mockDatabases });
  }
}

function getDefaultFields(type) {
  const fieldTemplates = {
    crystal: [
      { name: 'name', type: 'text', required: true },
      { name: 'color', type: 'text' },
      { name: 'properties', type: 'textarea' },
      { name: 'uses', type: 'textarea' },
      { name: 'chakra', type: 'select', options: ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'] },
      { name: 'moon_phase', type: 'text' },
      { name: 'rituals', type: 'textarea' }
    ],
    herb: [
      { name: 'name', type: 'text', required: true },
      { name: 'scientific_name', type: 'text' },
      { name: 'medicinal_uses', type: 'textarea' },
      { name: 'recipes', type: 'textarea' },
      { name: 'harvest_time', type: 'text' },
      { name: 'growing_notes', type: 'textarea' }
    ],
    goals: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea' },
      { name: 'target_date', type: 'date' },
      { name: 'status', type: 'select', options: ['Planning', 'In Progress', 'Completed', 'On Hold'] },
      { name: 'next_actions', type: 'textarea' }
    ],
    custom: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea' },
      { name: 'tags', type: 'text' }
    ]
  };
  
  return fieldTemplates[type] || fieldTemplates.custom;
}
