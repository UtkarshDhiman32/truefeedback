import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod"
import { usernameValidation } from "@/schemas/signUpSchema"

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

// ye isliye hai ki backend se username check karenge
// frontend se username check karenge ki available hai ya fir nhi

export async function GET(request: Request) {

    // if(request.method !== 'GET') {
    //     return Response.json({
    //         success: false,
    //         message: "Method not allowed"
    //     }, { status: 405 }
    //     )
    // }

    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        if (!result.success) {
            const usernameErrors = result.error.format().username?.errors || []
            return Response.json({
                success: false,
                message: "Invalid username",
                errors: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters',
            }, { status: 400 }
            )
        }

        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken",
            }, { status: 400 }
            )
        }

        return Response.json({
            success: true,
            message: "Username is unique",
        }, { status: 200 })


    } catch (err) {
        console.error("Error checking username", err)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}