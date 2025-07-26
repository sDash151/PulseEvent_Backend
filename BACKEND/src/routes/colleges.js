const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');

// Get all states
router.get('/states', async (req, res) => {
  try {
    const states = await prisma.college.findMany({
      select: {
        state: true
      },
      distinct: ['state'],
      orderBy: {
        state: 'asc'
      }
    });
    
    const stateList = states.map(item => item.state);
    res.json({ states: stateList });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Get districts by state
router.get('/districts/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const districts = await prisma.college.findMany({
      where: {
        state: state
      },
      select: {
        district: true
      },
      distinct: ['district'],
      orderBy: {
        district: 'asc'
      }
    });
    
    const districtList = districts.map(item => item.district);
    res.json({ districts: districtList });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// Get colleges by state and district
router.get('/colleges/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const colleges = await prisma.college.findMany({
      where: {
        state: state,
        district: district
      },
      select: {
        id: true,
        collegeId: true,
        name: true,
        city: true,
        addressLine1: true,
        addressLine2: true,
        pincode: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({ colleges });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Search colleges (for "Other" option)
router.get('/colleges/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ colleges: [] });
    }
    
    const colleges = await prisma.college.findMany({
      where: {
        name: {
          contains: query.trim(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        collegeId: true,
        name: true,
        city: true,
        district: true,
        state: true,
        addressLine1: true,
        addressLine2: true,
        pincode: true
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({ colleges });
  } catch (error) {
    console.error('Error searching colleges:', error);
    res.status(500).json({ error: 'Failed to search colleges' });
  }
});

// Get all degrees
router.get('/degrees', async (req, res) => {
  try {
    const degrees = await prisma.degree.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({ degrees });
  } catch (error) {
    console.error('Error fetching degrees:', error);
    res.status(500).json({ error: 'Failed to fetch degrees' });
  }
});

// Get specializations by degree
router.get('/specializations/:degreeId', async (req, res) => {
  try {
    const { degreeId } = req.params;
    const degreeIdInt = parseInt(degreeId);
    
    if (isNaN(degreeIdInt)) {
      return res.status(400).json({ error: 'Invalid degree ID' });
    }
    
    const specializations = await prisma.specialization.findMany({
      where: {
        degreeId: degreeIdInt
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({ specializations });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

// Search specializations (for "Other" option)
router.get('/specializations/search', async (req, res) => {
  try {
    const { query, degreeId } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ specializations: [] });
    }
    
    const whereClause = {
      name: {
        contains: query.trim(),
        mode: 'insensitive'
      }
    };
    
    if (degreeId && !isNaN(parseInt(degreeId))) {
      whereClause.degreeId = parseInt(degreeId);
    }
    
    const specializations = await prisma.specialization.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        degree: {
          select: {
            name: true
          }
        }
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({ specializations });
  } catch (error) {
    console.error('Error searching specializations:', error);
    res.status(500).json({ error: 'Failed to search specializations' });
  }
});

// Get all data for dropdowns (for frontend initialization)
router.get('/dropdown-data', async (req, res) => {
  try {
    const [states, degrees] = await Promise.all([
      prisma.college.findMany({
        select: { state: true },
        distinct: ['state'],
        orderBy: { state: 'asc' }
      }),
      prisma.degree.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      })
    ]);
    
    res.json({
      states: states.map(s => s.state),
      degrees: degrees
    });
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).json({ error: 'Failed to fetch dropdown data' });
  }
});

module.exports = router; 