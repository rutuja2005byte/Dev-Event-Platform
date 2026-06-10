import connectDB from '@/lib/mongodb';
import {NextRequest, NextResponse} from 'next/server';
import Event from '@database/event.model';

export async function POST(req: NextRequest) {
    try {
        
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message: 'Unknown'}, { status: 400 })
    }
}