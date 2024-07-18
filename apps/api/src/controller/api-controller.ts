import { type IDummySampleData } from '@repo/shared';
import type { Request, Response } from 'express';
import { getIO } from '../socket';




export const trackVessels = async (req: Request, res: Response) => {
    const { trackedIMOs } = req.body;

    if (trackedIMOs === undefined) {
        return res.status(400).send({
            error: 'Invalid request'
        });
    }
    console.log(`Tracking vessels request received at ${new Date().toISOString()} for IMOs:`, trackedIMOs);
    res.status(200).send();
}


export const updatedVesselInformation = async (req: Request, res: Response) => {
    const io = getIO();

    const { imo, destination, lat, lng } = req.body;

    if (!io) {
        return res.status(500).send({
            error: 'Socket.IO is not initialized'
        });
    }


    io.emit('vesselUpdate', { imo, destination, lat, lng });
    res.status(200).send();
}




