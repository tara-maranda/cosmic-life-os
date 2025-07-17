import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, type = 'custom', fields = [] } = req.body;
    
    try {
      console.log('Creating database:', { name, type });
      
      // For now, return success (in production, you'd create actual tables)
      const newDatabase = {
        id: Date.now(),
        name: name,
        type: type,
        itemCount: 0,
        created: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        database: newDatabase,
        message: `${name} database created successfully!`
      });
    } catch (error) {
      console.error('Error creating database:', error);
      res.status(500).json({ error: 'Failed to create database' });
    }
  } else if (req.method === 'GET') {
    // Return mock databases for now
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
