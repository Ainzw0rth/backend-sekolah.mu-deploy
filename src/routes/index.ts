import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    res.json({ message: 'landing page' });
  } catch (error) {
    console.error("Error: ", error);
  }
});

export default router;