import { deleteProjectById, duplicateProjectById, editProjectById, getAllPlaygroundForUser, toggleStarMarked } from '@/features/dashboard/actions';
import AddNewButton from '@/features/dashboard/components/add-new-button'
import AddRepoButton from '@/features/dashboard/components/add-repo-button'
import ProjectTable from '@/features/dashboard/components/project-table';
import React from 'react'

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <img src="/empty-state.svg" alt="No projects" className="w-48 h-48 mb-4" />
    <h2 className="text-xl font-semibold text-gray-500">No projects found</h2>
    <p className="text-gray-400">Create a new project to get started!</p>
  </div>
);

const Page = async() => {
  const playgrounds = await getAllPlaygroundForUser();
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepoButton />
      </div>

      <div className='mt-10 flex flex-col justify-center items-center w-full'>
      {
        playgrounds && playgrounds.length === 0 ? (
          <EmptyState  />
        ) : (
          <ProjectTable 
          // @ts-ignore
              projects={playgrounds || []}
              onDeleteProject={deleteProjectById}
              onUpdateProject={editProjectById}
              onDuplicateProject={duplicateProjectById}
              onMarkasFavorite={toggleStarMarked}
            />
        )
      }
      </div>
    </div>
  )
}

export default Page