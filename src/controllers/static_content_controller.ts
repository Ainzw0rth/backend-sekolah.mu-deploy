import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const PDF_BASE_PATH = path.resolve(__dirname, '../../contents/pdfs/');
const IMAGE_BASE_PATH = path.resolve(__dirname, '../../contents/images/');

interface StaticContentController {
    getPdf: (req: Request, res: Response) => Promise<void>;
    getImage: (req: Request, res: Response) => Promise<void>;
}

const staticContentController: StaticContentController = {
    // suppose the request is {baseUrl}/static/pdf/{filepath}
    // get the filepath part, and search it in local directory
    getPdf: async (req, res) => {
        try {
            const filepath = req.params.filepath;
            const filePath = path.resolve(PDF_BASE_PATH, filepath);

            // if the file is not found, return 404
            if (!fs.existsSync(filePath)) {
                res.status(404).json({ msg: 'File not found' });
                return;
            }

            // if the file is found, return the file
            res.sendFile(filePath);
            return;
        } catch (error) {
            res.status(500).json({ msg: error.msg });
            return;
        }
    },

    getImage: async (req, res) => {
        try {
            const filepath = req.params.filepath;
            const filePath = path.resolve(IMAGE_BASE_PATH, filepath);

            if (!fs.existsSync(filePath)) {
                res.status(404).json({ msg: 'File not found' });
                return;
            }

            res.sendFile(filePath);
            return;
        } catch (error) {
            res.status(500).json({ msg: error.msg });
            return;
        }
    }
}

export default staticContentController;