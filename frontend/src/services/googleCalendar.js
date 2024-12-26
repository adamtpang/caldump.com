import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

class GoogleCalendarService {
    constructor() {
        this.auth = getAuth();
        this.db = getFirestore();
        console.log('GoogleCalendarService initialized');
    }

    async init() {
        console.log('Initializing Google Calendar service...');
        return Promise.resolve();
    }

    async getToken() {
        console.log('Getting token for Google Calendar API...');
        const user = this.auth.currentUser;

        if (!user) {
            console.error('No user signed in');
            throw new Error('No user signed in');
        }

        try {
            console.log('Fetching user document from Firestore:', user.uid);
            const userDoc = await getDoc(doc(this.db, 'users', user.uid));

            if (!userDoc.exists()) {
                console.error('User document not found in Firestore');
                throw new Error('User data not found');
            }

            const userData = userDoc.data();
            console.log('User data retrieved:', {
                hasGoogleAuth: !!userData.googleAuth,
                hasAccessToken: !!userData.googleAuth?.accessToken,
                lastUpdated: userData.googleAuth?.lastUpdated
            });

            const accessToken = userData.googleAuth?.accessToken;

            if (!accessToken) {
                console.error('No access token found in user data');
                throw new Error('No access token found. Please sign in again.');
            }

            console.log('Successfully retrieved access token');
            return accessToken;
        } catch (error) {
            console.error('Error getting token:', error);
            throw error;
        }
    }

    async findAvailableSlots(startTime, endTime, durationMinutes) {
        console.log('Finding available slots...', { startTime, endTime, durationMinutes });

        const token = await this.getToken();
        console.log('Token obtained for finding slots');

        const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
                items: [{ id: 'primary' }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('FreeBusy API error:', errorText);
            throw new Error('Failed to fetch free/busy information');
        }

        const data = await response.json();
        console.log('FreeBusy API response:', data);

        const busySlots = data.calendars.primary.busy;
        console.log('Busy slots:', busySlots);

        // Find available slots
        const availableSlots = [];
        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

            // Check if this slot overlaps with any busy periods
            const isSlotAvailable = !busySlots.some(busy => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return (currentTime < busyEnd && slotEnd > busyStart);
            });

            if (isSlotAvailable && slotEnd <= endTime) {
                availableSlots.push({
                    start: new Date(currentTime),
                    end: slotEnd,
                });
            }

            currentTime = slotEnd;
        }

        return availableSlots;
    }

    async createEvents(slots, tasks) {
        console.log('Creating events...', { slots, tasks });

        const token = await this.getToken();
        console.log('Token obtained for creating events');

        const user = this.auth.currentUser;

        const createPromises = slots.map((slot, index) => {
            if (!tasks[index]) return null;

            const event = {
                summary: tasks[index],
                start: {
                    dateTime: slot.start.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: slot.end.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                description: `Created by ${user.displayName || user.email} via caldump.com`,
            };

            console.log('Creating event:', event);

            return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }).then(async response => {
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to create event:', errorText);
                    throw new Error('Failed to create event');
                }
                return response.json();
            });
        });

        await Promise.all(createPromises.filter(Boolean));
        console.log('All events created successfully');
    }
}

export const googleCalendarService = new GoogleCalendarService();