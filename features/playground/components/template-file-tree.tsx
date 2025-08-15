"use client"
import React from 'react'
import { ChevronRight, File, Folder, Plus, FilePlus, FolderPlus, MoreHorizontal, Trash2, Edit3 } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import TemplateNode from './template-node'

// Using the provided interfaces
interface TemplateFile {
  filename: string
  fileExtension: string
  content: string
}

/**
 * Represents a folder in the template structure which can contain files and other folders
 */
interface TemplateFolder {
  folderName: string
  items: (TemplateFile | TemplateFolder)[]
}

// Union type for items in the file system
type TemplateItem = TemplateFile | TemplateFolder

interface TemplateFileTreeProps {
  data: TemplateItem
  onFileSelect?: (file: TemplateFile) => void
  selectedFile?: TemplateFile
  title?: string
  onAddFile?: (file: TemplateFile, parentPath: string) => void
  onAddFolder?: (folder: TemplateFolder, parentPath: string) => void
  onDeleteFile?: (file: TemplateFile, parentPath: string) => void
  onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void
  onRenameFile?: (file: TemplateFile, newFilename: string, newExtension: string, parentPath: string) => void
  onRenameFolder?: (folder: TemplateFolder, newFolderName: string, parentPath: string) => void
}

const TemplateFileTree = ({
    data,
    onFileSelect,
    selectedFile,
    title = "Files Explorer",
    onAddFile,
    onAddFolder,
    onDeleteFile,
    onDeleteFolder,
    onRenameFile,
    onRenameFolder,
}: TemplateFileTreeProps) => {
  const isRootFolder = data && typeof data === "object" && "folderName" in data;

  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = React.useState(false)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = React.useState(false)

  const handleAddRootFile = () => {
    setIsNewFileDialogOpen(true)
  }

  const handleAddRootFolder = () => {
    setIsNewFolderDialogOpen(true)
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{title}</SidebarGroupLabel>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <SidebarGroupAction>
                <Plus className="h-4 w-4" />
              </SidebarGroupAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddRootFile}>
                <FilePlus className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddRootFolder}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SidebarGroupContent>
            <SidebarMenu>
                {
                    isRootFolder ? (
                        (data as TemplateFolder).items.map((child, index) => (
                            <TemplateNode
                                key={index}
                                item={child}
                                onFileSelect={onFileSelect}
                                selectedFile={selectedFile}
                                level={0}
                                path=""
                                onAddFile={onAddFile}
                                onAddFolder={onAddFolder}
                                onDeleteFile={onDeleteFile}
                                onDeleteFolder={onDeleteFolder}
                                onRenameFile={onRenameFile}
                                onRenameFolder={onRenameFolder}
                            />
                        ))
                    ) : (
                        <TemplateNode
                            item={data}
                            onFileSelect={onFileSelect}
                            selectedFile={selectedFile}
                            level={0}
                            path=""
                            onAddFile={onAddFile}
                            onAddFolder={onAddFolder}
                            onDeleteFile={onDeleteFile}
                            onDeleteFolder={onDeleteFolder}
                            onRenameFile={onRenameFile}
                            onRenameFolder={onRenameFolder}
                        />
                    )
                }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />

      <NewFileDialog 
        isOpen= {isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        onCreateFile={() => {}}
      />

      <NewFolderDialog 
        isOpen={isNewFolderDialogOpen}
        onClose={() => setIsNewFolderDialogOpen(false)}
        onCreateFolder={() => {}}
      />

      
    </Sidebar>
  );
}

export default TemplateFileTree;

interface NewFileDialogProps{
  isOpen: boolean
  onClose: () => void
  onCreateFile: (filename: string, extension: string) => void
}

export function NewFileDialog({isOpen, onClose, onCreateFile} : NewFileDialogProps) {
  const [filename, setFilename] = React.useState("")
  const [extension, setExtension] = React.useState("js")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filename.trim()) {
      onCreateFile(filename.trim(), extension.trim() || "js")
      setFilename("")
      setExtension("js")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>Enter the filename and extension for the new file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
              <div className='grid grid-col-3 items-center gap-4'>
                <Label htmlFor='filename' className='text-right'>
                  Filename
                </Label>
                <Input
                  id='filename'
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className='col-span-2'
                  autoFocus
                  placeholder='main'
                />
              </div>
              <div className='grid grid-cols-3 items-center gap-4'>
                <Label htmlFor='extension' className='text-right'>
                  Extension
                </Label>
                <Input
                  id='extension'
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  className='col-span-2'
                  placeholder='js'
                />
              </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={!filename.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface NewFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (folderName: string) => void
}

export function NewFolderDialog({isOpen, onClose, onCreateFolder}: NewFolderDialogProps) {
  const [folderName, setFolderName] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Enter the name for the new folder.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='folderName' className='text-right'>
                Folder Name
              </Label>
              <Input
                id='folderName'
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className='col-span-2'
                autoFocus
                placeholder='components'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={!folderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


interface RenameFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (filename: string, extension: string) => void;
  currentFilename: string;
  currentExtension: string;
}

export function RenameFileDialog({
  isOpen,
  onClose,
  onRename,
  currentFilename,
  currentExtension,
}: RenameFileDialogProps) {
  const [filename, setFilename] = React.useState(currentFilename);
  const [extension, setExtension] = React.useState(currentExtension);

  React.useEffect(() => {
    if (isOpen) {
      setFilename(currentFilename);
      setExtension(currentExtension);
    }
  }, [isOpen, currentFilename, currentExtension]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      onRename(filename.trim(), extension.trim() || currentExtension);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
          <DialogDescription>Enter a new name for the file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="rename-filename" className="text-right">
                Filename
              </Label>
              <Input
                id="rename-filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="col-span-2"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="rename-extension" className="text-right">
                Extension
              </Label>
              <Input
                id="rename-extension"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!filename.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RenameFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (folderName: string) => void;
  currentFolderName: string;
}

export function RenameFolderDialog({
  isOpen,
  onClose,
  onRename,
  currentFolderName,
}: RenameFolderDialogProps) {
  const [folderName, setFolderName] = React.useState(currentFolderName);

  React.useEffect(() => {
    if (isOpen) {
      setFolderName(currentFolderName);
    }
  }, [isOpen, currentFolderName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onRename(folderName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for the folder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="rename-foldername" className="text-right">
                Folder Name
              </Label>
              <Input
                id="rename-foldername"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-2"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
