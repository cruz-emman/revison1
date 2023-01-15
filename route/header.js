import express from 'express';
import Header from '../model/Header.js';
const router = express.Router()


router.post('/', async (req,res) => {
    
    const newHeader = new Header(req.body)

    try {
        try {
            const savedHeader = await newHeader.save();
            res.status(200).json(savedHeader);
          } catch (err) {
            res.status(500).json(err);
          }
    } catch (error) {
        
    }
})

router.get("/", async (req, res) => {
  try {
    const header = await Header.find();
    res.status(200).json(header);
  } catch (err) {
    res.status(500).json(err);
  }
});


export default router