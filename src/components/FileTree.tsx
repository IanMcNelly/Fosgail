import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, 
  Plus, Trash2, FileText, FolderPlus, Check, X, Move
} from 'lucide-react';
import { MarkdownFile } from '../types';
import { useAppStore } from '../store/useAppStore';

interface FileTreeProps {
  files: MarkdownFile[];
  activeFileId: string | null;
  folders: string[];
  onSelectFile: (id: string) => void;
  onNewFile: (folder?: string) => void;
  onDeleteFile: (id: string) => void;
  onAddFolder: (folderPath: string) => void;
  onRemoveFolder: (folderPath: string) => void;
  themeInfo: {
    appBg: string;
    sidebarBg: string;
    cardBg: string;
    text: string;
    isDark: boolean;
    headerBg: string;
    footerBg: string;
    editorBg: string;
    borderClass: string;
    activeFileBg: string;
    gutterBg: string;
  };
  searchQuery: string;
  scanErrors?: string[];
  onRefreshWorkspace: () => void;
}

interface TreeNode {
  name: string;
  fullPath: string;
  subfolders: Record<string, TreeNode>;
  files: MarkdownFile[];
}

export default function FileTree({
  files,
  activeFileId,
  folders,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onAddFolder,
  onRemoveFolder,
  themeInfo,
  searchQuery,
  scanErrors,
  onRefreshWorkspace,
}: FileTreeProps) {
  // Folder open/collapsed states
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const workspacePath = useAppStore(state => state.workspacePath);

  // Auto-expand all new folders when they are loaded into the workspace
  React.useEffect(() => {
    setExpandedFolders((prev) => {
      const next = { ...prev };
      let changed = false;
      folders.forEach((f) => {
        if (next[f] === undefined) {
          next[f] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [folders]);

  // Inline folder creation inputs
  const [addingFolderParent, setAddingFolderParent] = useState<string | null>(null); // null means not adding, "" means root, "Docs" means parent path
  const [newFolderName, setNewFolderName] = useState('');

  // Inline deletion confirmation tracking (iframe-safe)
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null);
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState<string | null>(null);

  // Toggle folder expanded status
  const toggleFolder = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Build filtered or raw tree representation
  const tree = useMemo(() => {
    // Filter files based on search first
    const matchedFiles = searchQuery.trim()
      ? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : files;

    const root: TreeNode = {
      name: 'Root',
      fullPath: '',
      subfolders: {},
      files: [],
    };

    // 1. Setup explicit folders in tree (only if not searching, or we match them)
    // We always parse file folders to ensure they are represented. In addition, we load empty folders!
    const activeFoldersSet = new Set<string>();
    folders.forEach((f) => activeFoldersSet.add(f));
    
    // Add file folders too
    files.forEach((file) => {
      if (file.folder) activeFoldersSet.add(file.folder);
    });

    // Populate standard directories structure
    Array.from(activeFoldersSet).forEach((folderPath) => {
      if (!folderPath) return;
      const parts = folderPath.split('/').filter(Boolean);
      let current = root;
      let currentPath = '';
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!current.subfolders[part]) {
          current.subfolders[part] = {
            name: part,
            fullPath: currentPath,
            subfolders: {},
            files: [],
          };
        }
        current = current.subfolders[part];
      });
    });

    // 2. Put files where they belong
    matchedFiles.forEach((file) => {
      const folderPath = file.folder || '';
      if (!folderPath) {
        root.files.push(file);
      } else {
        const parts = folderPath.split('/').filter(Boolean);
        let current: TreeNode | undefined = root;
        parts.forEach((part) => {
          if (current) current = current.subfolders[part];
        });
        if (current) {
          current.files.push(file);
        } else {
          // Fallback if directory wasn't parsed
          root.files.push(file);
        }
      }
    });

    // 3. For searching, prune empty folders so we don't display directories with no matched items
    if (searchQuery.trim()) {
      const pruneEmpty = (node: TreeNode): boolean => {
        const subKeys = Object.keys(node.subfolders);
        subKeys.forEach((key) => {
          const hasChildren = pruneEmpty(node.subfolders[key]);
          if (!hasChildren) {
            delete node.subfolders[key];
          }
        });
        return node.files.length > 0 || Object.keys(node.subfolders).length > 0;
      };
      pruneEmpty(root);
    }

    // 4. Pre-sort subfolders and files so render does not allocate and sort on every frame
    const sortTree = (node: TreeNode) => {
      node.files.sort((a, b) => a.name.localeCompare(b.name));
      const sortedSubfolderKeys = Object.keys(node.subfolders).sort((a, b) => a.localeCompare(b));
      const sortedSubfolders: Record<string, TreeNode> = {};
      sortedSubfolderKeys.forEach((key) => {
        sortTree(node.subfolders[key]);
        sortedSubfolders[key] = node.subfolders[key];
      });
      node.subfolders = sortedSubfolders;
    };
    sortTree(root);

    return root;
  }, [files, folders, searchQuery]);

  // Handle new folder submit
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    // Clean name
    const safeName = newFolderName.trim().replace(/[/\\?%*:|"<>]/g, '-');
    const folderPath = addingFolderParent ? `${addingFolderParent}/${safeName}` : safeName;
    
    onAddFolder(folderPath);
    
    setAddingFolderParent(null);
    setNewFolderName('');
    
    // Auto-expand the newly created folder's parent
    if (addingFolderParent) {
      setExpandedFolders((prev) => ({ ...prev, [addingFolderParent]: true }));
    }
  };

  // Render a folder node recursively
  const renderFolderNode = (node: TreeNode, depth: number) => {
    // Auto-expand all folders when searching, otherwise use the stored state
    const isExpanded = !!searchQuery.trim() || !!expandedFolders[node.fullPath];
    const hasChildren = Object.keys(node.subfolders).length > 0 || node.files.length > 0;
    const isConfirmingDelete = confirmDeletePath === node.fullPath;

    return (
      <div key={node.fullPath} className="space-y-0.5">
        <div 
          onClick={(e) => toggleFolder(node.fullPath, e)}
          className={`group flex items-center justify-between p-1 rounded-lg cursor-pointer transition-colors text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/50 dark:hover:bg-white/5`}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-neutral-400 shrink-0">
              {hasChildren ? (
                isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
              ) : (
                <span className="w-3" /> // spacer
              )}
            </span>
            {isExpanded ? (
              <FolderOpen size={12} className="text-accent shrink-0" />
            ) : (
              <Folder size={12} className="text-accent shrink-0" />
            )}
            <span className="text-[11px] font-semibold truncate select-none">
              {node.name}
            </span>
          </div>

          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isConfirmingDelete ? (
               <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
               <span className="text-[9px] text-rose-500 font-mono font-bold mr-0.5">Delete?</span>
               <button
                 type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   onRemoveFolder(node.fullPath);
                   setConfirmDeletePath(null);
                 }}
                 className="p-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
               >
                 <Check size={9} />
               </button>
               <button
                 type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   setConfirmDeletePath(null);
                 }}
                 className="p-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
               >
                 <X size={9} />
               </button>
             </div>
            ) : (
              <>
                <button
                  type="button"
                  title="New File in Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolders((prev) => ({ ...prev, [node.fullPath]: true }));
                    onNewFile(node.fullPath);
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-accent hover:bg-neutral-200/50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Plus size={11} />
                </button>
                <button
                  type="button"
                  title="New Subfolder"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolders((prev) => ({ ...prev, [node.fullPath]: true }));
                    setAddingFolderParent(node.fullPath);
                    setNewFolderName('');
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-accent hover:bg-neutral-200/50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <FolderPlus size={11} />
                </button>
                <button
                  type="button"
                  title="Delete Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeletePath(node.fullPath);
                    setConfirmDeleteFileId(null);
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-rose-500 hover:bg-neutral-200/50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Trash2 size={11} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inline new folder input for THIS specific parent */}
        {addingFolderParent === node.fullPath && (
          <form
            onSubmit={handleCreateFolder}
            className="flex items-center gap-1.5 py-1 px-2 border border-accent/30 rounded-lg animate-fadeIn"
            style={{ marginLeft: `${(depth + 1) * 10 + 6}px` }}
          >
            <Folder size={11} className="text-accent shrink-0" />
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name..."
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-xs text-neutral-800 dark:text-neutral-200"
            />
            <button
              type="submit"
              className="p-0.5 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer"
              aria-label="Confirm create folder"
            >
              <Check size={11} />
            </button>
            <button
              type="button"
              onClick={() => setAddingFolderParent(null)}
              className="p-0.5 text-neutral-400 hover:bg-neutral-300 dark:hover:bg-[#1f1f23] rounded cursor-pointer"
              aria-label="Cancel create folder"
            >
              <X size={11} />
            </button>
          </form>
        )}

        {/* Collapsible children recursion depth */}
        {isExpanded && hasChildren && (
          <div className="space-y-0.5">
            {/* 1. Recurse Subfolders */}
            {Object.values(node.subfolders).map((subNode) => renderFolderNode(subNode, depth + 1))}

            {/* 2. List Files at this folder layer */}
            {node.files.map((file) => renderFileItem(file, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render a single file row item
  const renderFileItem = (file: MarkdownFile, depth: number) => {
    const isActive = file.id === activeFileId;
    const isConfirmingDelete = confirmDeleteFileId === file.id;

    return (
      <div
        key={file.id}
        id={`file-row-${file.id}`}
        onClick={() => onSelectFile(file.id)}
        className={`group relative flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] origin-left ${
          isActive
            ? themeInfo.activeFileBg
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/50 dark:hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 10 + 6}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 pr-6">
          <FileText
            size={12}
            className={isActive ? 'text-emerald-500 shrink-0' : 'text-neutral-400 shrink-0'}
          />
          <div className="truncate text-xs leading-tight">
            <div className="font-semibold flex items-center truncate">
              <span className="truncate">{file.name}</span>
              {file.isDirty && <span className="ml-1.5 shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-orange-400" title="Unsaved changes"></span>}
            </div>
            <div className="text-[8px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <span>{file.wordCount} words</span>
              {file.isExample && <span className="px-1.5 py-0.2 text-[7px] text-accent/80 bg-accent/10 rounded">Sample</span>}
              {workspacePath && file.filePath && !file.filePath.startsWith(workspacePath) && <span className="px-1.5 py-0.2 text-[7px] text-orange-500/80 bg-orange-500/10 rounded border border-orange-500/20">External</span>}
            </div>
          </div>
        </div>

        {/* If confirming file deletion */}
        {isConfirmingDelete ? (
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-[9px] text-rose-500 font-mono font-bold mr-0.5">Delete?</span>
            <button
              id={`btn-confirm-delete-file-${file.id}`}
              type="button"
              onClick={() => {
                onDeleteFile(file.id);
                setConfirmDeleteFileId(null);
              }}
              className="p-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              aria-label="Confirm delete document draft"
            >
              <Check size={9} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteFileId(null)}
              className="p-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              aria-label="Cancel delete document draft"
            >
              <X size={9} />
            </button>
          </div>
        ) : (
          /* Delete action button */
          <button
            id={`btn-delete-file-${file.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDeleteFileId(file.id);
              setConfirmDeletePath(null);
            }}
            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity p-0.5 rounded cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-white/5"
            title="Delete document draft"
            aria-label="Delete document draft"
          >
            <Trash2 size={11} fill="none" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div id="file-tree-container" className="flex-1 overflow-y-auto space-y-2 mt-2">
      {/* Vault header with quick action trigger */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-bold tracking-wider uppercase text-neutral-400 block">
          Workspace Folders Tree
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefreshWorkspace}
            className="text-[9px] font-bold text-accent hover:text-accent hover:underline flex items-center gap-1 cursor-pointer"
            title="Refresh from disk"
          >
            Refresh
          </button>
          <button
            id="btn-trigger-root-folder"
            type="button"
            onClick={() => setAddingFolderParent(addingFolderParent === "" ? null : "")}
            className="text-[9px] font-bold text-accent hover:text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FolderPlus size={10} />
            New Folder
          </button>
        </div>
      </div>

      {/* Adding folder input at Root layer */}
      {addingFolderParent === "" && (
        <form
          onSubmit={handleCreateFolder}
          className="flex items-center gap-1.5 py-1 px-2 border border-accent/30 rounded-lg mx-1 my-1"
        >
          <Folder size={11} className="text-accent shrink-0" />
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Root Folder Name..."
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-xs text-neutral-800 dark:text-neutral-200"
          />
          <button
            id="btn-confirm-root-folder"
            type="submit"
            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer"
            aria-label="Confirm create root folder"
          >
            <Check size={11} />
          </button>
          <button
            type="button"
            onClick={() => setAddingFolderParent(null)}
            className="p-1 text-neutral-400 hover:bg-neutral-300 dark:hover:bg-[#1f1f23] rounded cursor-pointer"
            aria-label="Cancel create root folder"
          >
            <X size={11} />
          </button>
        </form>
      )}

      {/* Main tree renderer list */}
      <div className="space-y-0.5">
        {/* Render child directories recursively from Root */}
        {(Object.values(tree.subfolders) as TreeNode[])
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((subNode) => renderFolderNode(subNode, 0))}

        {/* Render Root-level files */}
        {tree.files.length > 0 && (
          <div className="space-y-0.5 border-t border-neutral-200/20 dark:border-white/5 pt-1 mt-1">
            {tree.files
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((file) => renderFileItem(file, 0))}
          </div>
        )}

        {/* Empty state */}
        {files.length === 0 && !searchQuery.trim() && (
          <div className="p-4 text-center text-[10px] text-neutral-500 mt-4">
            No drafts in vault workspace
          </div>
        )}

        {/* Scan Errors */}
        {scanErrors && scanErrors.length > 0 && (
          <div className="m-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
            <h3 className="text-red-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Scan Errors</h3>
            <ul className="list-disc pl-3">
              {scanErrors.map((err, i) => (
                <li key={i} className="text-red-300/80 text-[10px] break-words">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
