import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(
  request: Request,
  { params }: { params: any } // Dynamic typing taaki Next.js version clash na kare
) {
  await dbConnect();

  // Next.js 16 production safe resolver 🎯
  // Agar params ke paas .then hai (yaani woh promise hai) toh await karega, nahi toh direct use karega
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  
  // Strict case matching (Donos me se jo bhi mil jaye)
  const messageId = resolvedParams?.messageid || resolvedParams?.messageId;

  if (!messageId) {
    return Response.json(
      { success: false, message: 'Message ID is missing in request params' },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;
  
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted from database', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted successfully', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}