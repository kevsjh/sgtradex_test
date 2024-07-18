'use client'

import { dummySampleData, type IDummySampleData } from '@repo/shared';
import React from 'react';
import { io } from 'socket.io-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const socket = io(backendUrl);

// const pendingTimerMS = 120000;
// const timeoutTimerMS = 60000;

const pendingTimerMS = 10000;
const timeoutTimerMS = 5000;

/**
 * Different from initial data
 */
const newDummyVesselData: {
    "imo": number;
    "destination": string;
    "lat": number;
    "lng": number;
}[] = [
        {

            "imo": 9741413,
            "lat": 1.272643,
            "lng": 103.773867,
            "destination": "PILOT EAST BOARD GRD P"
        },
        {


            "imo": 9466984,
            "lat": 1.283172,
            "lng": 103.761346,
            "destination": "PILOT EAST BOARD GRD B"
        },
        {


            "imo": 9289087,
            "lat": 1.273077,
            "lng": 103.762411,
            "destination": "SELAT PAUH PETRO ANCH E"
        },
        {
            "imo": 9590694,
            "lat": 1.276677,
            "lng": 103.965579,
            "destination": "PILOT EAST BOARD GRD K"
        }
    ]

enum UpdateStatusEnum {
    pending = 'Pending',
    noPending = 'No Pending',
    updated = 'Updated'
}

/**
 * table with vessels info, track action btn, simulate vessel update btn, and status
   when user clicks track button, a timer starts/resets with timerRef based on pendingTimerMS
   when timer reaches 2min, sends track request to backend with list of tracked vessels imo, a timeout is chained inside sendTrackRequest
   vessel update button is enabled when tracking is enabled
   vessel info is updated based on websocket connection
   if no update is received within timeoutTimerMS, the vessel status is marked to nopending
 */

export default function VesselTable() {
    const [vessels, setVessels] = React.useState<IDummySampleData[]>(dummySampleData);
    const [trackedVesselsIMO, setTrackedVesselsIMO] = React.useState<number[]>([]);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const trackedVesselsIMORef = React.useRef<number[]>([]);

    // add status to dummy data
    const [pendingUpdates, setPendingUpdates] = React.useState(dummySampleData.map(vessel => ({
        ...vessel,
        status: UpdateStatusEnum.pending
    })));

    const sendTrackRequest = React.useCallback(async () => {
        try {
            await fetch(`${backendUrl}/api/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackedIMOs: trackedVesselsIMORef.current
                })
            });
            // Chain timeout inside sendTrackRequest

            setTimeout(() => {
                setPendingUpdates(prev => {
                    const updatedVessels = prev.map(vessel =>
                        trackedVesselsIMORef.current.includes(vessel.imo) && vessel.status === UpdateStatusEnum.pending
                            ? { ...vessel, status: UpdateStatusEnum.noPending }
                            : vessel
                    );

                    if (updatedVessels.every(vessel =>
                        vessel.status === UpdateStatusEnum.noPending || vessel.status === UpdateStatusEnum.updated
                    )) {
                        resetTimer();
                    }

                    return updatedVessels;
                });
            }, timeoutTimerMS);


        } catch (error) {
            console.error('Error sending track request:', error);

        }
    }, [pendingUpdates, trackedVesselsIMORef.current]);

    /**
     * Reset the timer to send track request
     */
    const resetTimer = React.useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setInterval(sendTrackRequest, pendingTimerMS); // 2 minutes
    }, [sendTrackRequest, timerRef.current]);

    /**
     * Track a vessel request by adding the IMO to the trackedVesselsIMO array
     * @param imo - IMO of the vessel
     */
    const trackVessel = React.useCallback((imo: number) => {
        setTrackedVesselsIMO(prev => Array.from(new Set([...prev, imo])));
        if (timerRef.current === null) {
            resetTimer();
        }
    }, []);

    /**
     * Untrack a vessel request by removing the IMO from the trackedVesselsIMO array
     * @param imo - IMO of the vessel
     * 
     */
    const untrackVessel = React.useCallback((imo: number) => {
        setTrackedVesselsIMO(prev => prev.filter(trackedImo => trackedImo !== imo));
        resetTimer();
    }, []);

    /**
     * Simulate a vessel update by fetching the updatedVesselInformation API endpoint
     * @param i - index of the element in newDummyVesselData
     */
    const simulateVesselUpdate = React.useCallback(async ({ i }: {
        i: number
    }) => {
        // get element from newDummyVesselData based on index
        const updatedVessel = newDummyVesselData[i];

        try {

            await fetch(`${backendUrl}/api/updated-vessel-information`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imo: updatedVessel.imo,
                    destination: updatedVessel.destination,
                    lat: updatedVessel.lat,
                    lng: updatedVessel.lng
                })

            });
            resetTimer();
            toast.success("Vessel Updated");


        } catch (error) {
            console.error('Error simulating vessel update:', error);
            toast.error('Oopsie! Something went wrong');
        }
    }, [])

    // web socket connection
    React.useEffect(() => {
        socket.on('vesselUpdate', (updatedVessel) => {

            setVessels(prevVessels =>
                prevVessels.map(vessel =>
                    vessel.imo === updatedVessel.imo ? { ...vessel, ...updatedVessel } : vessel
                )
            );

            setPendingUpdates(prev => {
                const pendingUpdates = [...prev];
                // get the index of the vessel in the pendingUpdates array
                const index = prev.findIndex(vessel => vessel.imo === updatedVessel.imo);
                if (index === -1) {
                    return pendingUpdates;
                }
                // update the status of the vessel in the pendingUpdates array
                pendingUpdates[index].status = UpdateStatusEnum.updated;

                // check if pendingUpdates status is updated for all vessels
                // if all status are updated/nopending, reset the timer
                const allUpdated = pendingUpdates.every(vessel => vessel.status === UpdateStatusEnum.noPending || vessel.status === UpdateStatusEnum.updated);
                if (allUpdated) {
                    resetTimer();
                }
                return pendingUpdates;
            });

        });
        return () => {
            socket.off('vesselUpdate');
        };
    }, []);

    React.useEffect(() => {
        trackedVesselsIMORef.current = trackedVesselsIMO;
    }, [trackedVesselsIMO]);

    return (
        <div className='w-full overflow-auto'>
            <Table className='text-xs '>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>IMO</TableHead>
                        <TableHead>Latitude</TableHead>
                        <TableHead>Longitude</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className='text-center'>Simulate Update</TableHead>
                        <TableHead className=''>Pending Update</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vessels.map((vessel, i) => (
                        <TableRow key={vessel.id}>
                            <TableCell>{vessel.name}</TableCell>
                            <TableCell>{vessel.imo}</TableCell>
                            <TableCell>{vessel.lat}</TableCell>
                            <TableCell>{vessel.lng}</TableCell>
                            <TableCell>{vessel.destination}</TableCell>
                            <TableCell>
                                {trackedVesselsIMO.includes(vessel.imo) ? (
                                    <button onClick={() => untrackVessel(vessel.imo)}>Untrack</button>
                                ) : (
                                    <button onClick={() => trackVessel(vessel.imo)}>Track</button>
                                )}
                            </TableCell>
                            <TableCell className='flex justify-center'>
                                <Button
                                    disabled={!trackedVesselsIMO.includes(vessel.imo)}

                                    size='sm'

                                    className='w-fit '
                                    onClick={() => {
                                        simulateVesselUpdate({
                                            i
                                        })
                                    }}
                                >
                                    Vessel Update
                                </Button>
                            </TableCell>
                            <TableCell className=''>
                                {
                                    pendingUpdates[i].status
                                }

                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>


        </div>
    );
}