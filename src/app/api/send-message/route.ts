// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";

// import { Message } from "@/model/User";

// export async function POST(request: Request) {
//     await dbConnect()
//     const { username, content } = await request.json()
//     try {
//         const user = await UserModel.findOne({ username })
//         if (!user) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "User not found",
//                 },
//                 { status: 401 }
//             );
//         }

//         //is user accepting the messages
//         if (!user.isAcceptingMessage) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "User is not accepting the messages",
//                 },
//                 { status: 403 }
//             );
//         }

//         const newMessage = { content, createdAt: new Date() }
//         user.messages.push(newMessage as Message)
//         await user.save()

//         return Response.json(
//             {
//                 success: true,
//                 message: "Message sent successfully",
//             },
//             { status: 200 }
//         );

//     } catch (error) {

//         return Response.json(
//             {
//                 success: false,
//                 message: "Internal server error",
//             },
//             { status: 500 }
//         );
//     }

// }



import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();

    // 1. Pehle database se check karo ki kya user messages accept kar raha hai ya nahi 🎯
    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // 2. Agar user ne toggle OFF kiya hai, toh message reject kar do 🔒
    if (!user.isAcceptingMessage) {
      return NextResponse.json(
        { success: false, message: 'User is not accepting messages right now' },
        { status: 403 } // Forbidden
      );
    }

    // 3. Agar sab sahi hai, toh naya message array mein push karo
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as any);
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}