"use server";
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
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

export const getPlaygroundById = async (id: string) => {
    try {
        const playground = await db.playground.findUnique({
            where: {id},
            select:{
                title: true,
                description: true,
                templateFiles:{
                    select:{
                        content:true
                    }
                }
            }
        });
        return playground;
    } catch (error) {
        console.log(error);  
    }
}

export const SaveUpdatedCode = async(playgroundId: string, data: TemplateFolder) => {
    const user = await currentUser();
    if(!user) return null;

    try {
        const updatedPlayground = await db.templateFile.upsert({
            where:{
                playgroundId 
            },
            update:{
                content: JSON.stringify(data)
            },
            create: {
                playgroundId,
                content: JSON.stringify(data),
            }
        })
    } catch (error) {
        console.error("Error saving updated code:", error);
        throw error;
    }
}