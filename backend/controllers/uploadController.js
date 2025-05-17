import { PinataSDK } from "pinata";
import { Blob } from 'buffer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create a Blob from the file buffer
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    // Create a File object from the Blob
    const file = new File([blob], req.file.originalname, { 
      type: req.file.mimetype 
    });

    // Upload to Pinata
    const upload = await pinata.upload.public.file(file);
    res.status(200).json({
      success: true,
      ipfsHash: upload.IpfsHash,
      url: `${process.env.GATEWAY_URL}/ipfs/${upload.cid}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}; 