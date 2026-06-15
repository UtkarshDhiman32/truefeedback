import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    // PRE-CHECK: Pehle check karo ki user sach mein exist karta hai ya nahi 🎯
    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Agar user ke paas koi message hai hi nahi (Naya User), toh direct empty array bhej do
    if (!userExists.messages || userExists.messages.length === 0) {
      return Response.json(
        { messages: [] },
        { status: 200 }
      );
    }

    // Agar messages hain, tabhi aggregation pipeline chalegi messages sort karne ke liye ⚡
    const userWithSortedMessages = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    // Safe check agar pipeline mein kuch ajeeb ho
    if (!userWithSortedMessages || userWithSortedMessages.length === 0) {
      return Response.json(
        { messages: [] },
        { status: 200 }
      );
    }

    return Response.json(
      { messages: userWithSortedMessages[0].messages },
      { status: 200 }
    );

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}