// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/options";
// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import { User } from "next-auth"
// import mongoose from "mongoose";

// export async function GET(request: Request) {
//     await dbConnect();
//     const session = await getServerSession(authOptions);
//     const user = session?.user as User;

//     if (!session || !session.user) {
//         return Response.json(
//             {
//                 success: false,
//                 message: "Not authenticated",
//             },
//             { status: 401 }
//         );
//     }
//     const userId = new mongoose.Types.ObjectId(user._id)
//     try {
//         const user = await UserModel.aggregate([
//             { $match: { id: userId } },
//             { $unwind: '$messages' },
//             { $sort: { 'messages.createdAt': -1 } },
//             { $group: { _id: '$_id', messages: { $push: '$messages' } } }
//         ])

//         if (!user || user.length === 0) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "User not found",
//                 },
//                 { status: 401 }
//             );
//         }

//         return Response.json(
//             {
//                 success: true,
//                 messages: user[0].messages
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         return Response.json(
//             {
//                 success: false,
//                 message: "Not authenticated",
//             },
//             { status: 500 }
//         );
//     }



// }












// import dbConnect from '@/lib/dbConnect';
// import UserModel from '@/model/User';
// import mongoose from 'mongoose';
// import { User } from 'next-auth';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/options';

// export async function GET(request: Request) {
//     await dbConnect();
//     const session = await getServerSession(authOptions);
//     const _user: User = session?.user;

//     if (!session || !_user) {
//         return Response.json(
//             { success: false, message: 'Not authenticated' },
//             { status: 401 }
//         );
//     }
//     const userId = new mongoose.Types.ObjectId(_user._id);
//     try {
//         const user = await UserModel.aggregate([
//             { $match: { _id: userId } },
//             { $unwind: '$messages' },
//             { $sort: { 'messages.createdAt': -1 } },
//             { $group: { _id: '$_id', messages: { $push: '$messages' } } },
//         ]).exec();

//         if (!user || user.length === 0) {
//             return Response.json(
//                 { message: 'User not found', success: false },
//                 { status: 404 }
//             );
//         }

//         return Response.json(
//             { messages: user[0].messages },
//             {
//                 status: 200,
//             }
//         );
//     } catch (error) {
//         console.error('An unexpected error occurred:', error);
//         return Response.json(
//             { message: 'Internal server error', success: false },
//             { status: 500 }
//         );
//     }
// }


// ok hai ye wala 


// import dbConnect from '@/lib/dbConnect';
// import UserModel from '@/model/User';
// import mongoose from 'mongoose';
// import { User } from 'next-auth';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/options';

// export async function GET(request: Request) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);
//   const _user: User = session?.user;

//   if (!session || !_user) {
//     return Response.json(
//       { success: false, message: 'Not authenticated' },
//       { status: 401 }
//     );
//   }
//   const userId = new mongoose.Types.ObjectId(_user._id);
//   try {
//     const user = await UserModel.aggregate([
//       { $match: { _id: userId } },
//       { $unwind: '$messages' },
//       { $sort: { 'messages.createdAt': -1 } },
//       { $group: { _id: '$_id', messages: { $push: '$messages' } } },
//     ]).exec();

//     if (!user || user.length === 0) {
//       return Response.json(
//         { message: 'User not found', success: false },
//         { status: 404 }
//       );
//     }

//     return Response.json(
//       { messages: user[0].messages },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     console.error('An unexpected error occurred:', error);
//     return Response.json(
//       { message: 'Internal server error', success: false },
//       { status: 500 }
//     );
//   }
// }




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