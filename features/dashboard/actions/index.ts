"use server";
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";
import { Templates } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Toggle marked status for a problem
export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,

          },
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating problem:", error);
    return { success: false, error: "Failed to update problem" };
  }
};

export const createPlayground = async (data:{
    title: string;
    template: Templates
    description?: string;
}) => {
    const {template, title, description} = data;

    const user = await currentUser();

    try {
        const playground = await db.playground.create({
            data: {
                title,
                description,
                template,
                userId: user?.id!
            }
        });
        return playground;        
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getAllPlaygroundForUser = async() =>{
    const user = await currentUser();

    try {
        const playground = await db.playground.findMany({
            where: {
                userId: user?.id
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId: user?.id
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
        });
        return playground;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const deleteProjectById = async (id: string) => {
    try {
        await db.playground.delete({
            where:{id}
        })
        revalidatePath("/dashboard");
    } catch (error) {
        console.log(error)
    }
}

export const editProjectById = async (id: string, data:{title:string, description:string}) => {
    try {
        await db.playground.update({
            where:{id},
            data: data
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const duplicateProjectById = async (id: string) => {
    try {
        const originalPlayground = await db.playground.findUnique({
            where: { id },
        });

        if(!originalPlayground){
            throw new Error("Playground not found");
        }

        const duplicatedPlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
            },
        });
        revalidatePath("/dashboard");
        return duplicatedPlayground;
    } catch (error) {
        console.log(error);
        return null;
    }
}
