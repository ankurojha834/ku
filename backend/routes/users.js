const express = require('express')
const prisma = require('../lib/prisma')
const router = express.Router()

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
      },
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: true,
      },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// CREATE new user
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    })
    
    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
})

// UPDATE user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { email, name } = req.body
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        name,
      },
    })
    
    res.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.status(500).json({ error: 'Failed to update user' })
    }
  }
})

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.user.delete({
      where: { id: parseInt(id) },
    })
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting user:', error)
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.status(500).json({ error: 'Failed to delete user' })
    }
  }
})

module.exports = router