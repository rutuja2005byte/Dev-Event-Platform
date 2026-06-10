import connectDB from '@/lib/mongodb';
import {NextRequest, NextResponse} from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event: any;
        
        try {
            const rawEntries = Object.fromEntries(formData.entries());
            
            event = {};
            for (const [key, value] of Object.entries(rawEntries)) {
                const cleanKey = key.replace(/\*$/, '').trim();
                event[cleanKey] = value;
            }
        } catch (e) {
            return NextResponse.json( { message: 'Invalid form data format'}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder:'DevEvent' }, (error, results) => {
                if(error) return reject (error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        if (typeof event.mode === 'string') {
            event.mode = event.mode.toLowerCase().trim();
        }

        if (typeof event.agenda === 'string') {
            try {
                event.agenda = JSON.parse(event.agenda);
            } catch (e) {
                event.agenda = event.agenda.split('\n').map((item: string) => item.trim()).filter(Boolean);
            }
        }

        if (typeof event.tags === 'string') {
            try {
                event.tags = JSON.parse(event.tags);
            } catch (e) {
                event.tags = event.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
            }
        }

        const createdEvent = await Event.create(event);

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message: 'Unknown'}, { status: 400 })
    }
}