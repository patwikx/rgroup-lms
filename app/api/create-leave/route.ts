import { z } from 'zod';
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from 'next/cache';

// Define the schema for the request body
const schema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string(),
    approverRemarks: z.string().optional(),
    leaveType: z.string(),
    approverId: z.string(),
});

export async function POST(req: Request) {
    try {
        const { startDate, endDate, reason, approverRemarks, leaveType, userId, approverId} = await req.json()

        // Validate the request body against the schema
        schema.parse({ startDate, endDate, reason, approverRemarks, leaveType, userId, approverId });

        // Check if the approverId exists in the User table
        const approverExists = await prisma.user.findUnique({
            where: { id: approverId },
        });

        if (!approverExists) {
            throw new Error('Approver not found');
        }

        const leaves = await prisma.leave.create({
            data: {
                startDate, endDate, reason, approverRemarks, leaveType, userId, approverId
            }
        })

        return NextResponse.json({
            leave: {
                startDate: leaves.startDate,
                endDate: leaves.endDate,
                reason: leaves.reason,
                approverRemarks: leaves.approverRemarks,
                leaveType: leaves.leaveType,
                userId: leaves.userId,
                approverId: leaves.approverId
            }
        })
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({
            status: 'error',
            message: 'An error occurred while processing your request',
        }, { status: 500 });
    }
}