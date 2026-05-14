# CRUD Features Audit 🔍

## 📋 OVERVIEW

Auditing all CRUD (Create, Read, Update, Delete) operations across the application features.

---

## ✅ TASKS FEATURE

### **Store: `useStore.ts`**

#### **State**:
```typescript
tasks: Task[]  // Array of task objects
dailyGoal: number  // Target number of tasks

interface Task {
  id: string
  text: string
  completed: boolean
}
```

#### **CRUD Operations**:

| Operation | Method | Status | Implementation |
|-----------|--------|--------|----------------|
| **CREATE** | `addTask(text: string)` | ✅ Working | Adds new task with timestamp ID |
| **READ** | `tasks` state | ✅ Working | Direct state access |
| **UPDATE** | `updateTask(id, text)` | ⚠️ Defined but NOT USED | Updates task text |
| **UPDATE** | `toggleTask(id)` | ✅ Working | Toggles completed status |
| **DELETE** | `removeTask(id)` | ⚠️ Defined but NOT USED | Removes task from array |

#### **Issues Found**:

1. **❌ Missing DELETE UI**: 
   - `removeTask()` exists in store but no UI to trigger it
   - No delete button in TaskPanel
   - Users cannot remove tasks

2. **❌ Missing EDIT UI**:
   - `updateTask()` exists in store but no UI to trigger it
   - No edit button or inline editing
   - Users cannot edit task text after creation

3. **⚠️ Limited Display**:
   - Only shows first 3 tasks: `tasks.slice(0, 3)`
   - If user has 5+ tasks, some are hidden
   - No way to see all tasks

---

## ✅ TIMER FEATURE

### **Store: `useStore.ts`**

#### **State**:
```typescript
timerMode: 'focus' | 'break'
timeLeft: number  // seconds remaining
isRunning: boolean
deadline: number | null  // timestamp
session: number
pomodorosCompleted: number
totalFocusSeconds: number
breaks: number
```

#### **CRUD Operations**:

| Operation | Method | Status | Implementation |
|-----------|--------|--------|----------------|
| **CREATE** | N/A | N/A | Timer state is initialized |
| **READ** | All state fields | ✅ Working | Direct state access |
| **UPDATE** | `startTimer()` | ✅ Working | Starts timer countdown |
| **UPDATE** | `pauseTimer()` | ✅ Working | Pauses timer |
| **UPDATE** | `resetTimer()` | ✅ Working | Resets to initial duration |
| **UPDATE** | `switchMode()` | ✅ Working | Switches focus/break |
| **UPDATE** | `tick()` | ✅ Working | Updates countdown every 250ms |
| **DELETE** | N/A | N/A | No delete needed |

#### **Status**: ✅ **FULLY FUNCTIONAL**

---

## ✅ MUSIC/SPOTIFY FEATURE

### **Store: `useBridgeStore.ts`**

#### **State**:
```typescript
connected: boolean
nowPlaying: TrackInfo | null

interface TrackInfo {
  isPlaying: boolean
  title: string
  artist: string
  albumArt: string
  progressMs: number
  durationMs: number
}
```

#### **CRUD Operations**:

| Operation | Method | Status | Implementation |
|-----------|--------|--------|----------------|
| **CREATE** | N/A | N/A | Data comes from Spotify API |
| **READ** | `nowPlaying` state | ✅ Working | WebSocket updates |
| **UPDATE** | WebSocket messages | ✅ Working | Real-time updates |
| **DELETE** | N/A | N/A | No delete needed |

#### **Additional Methods**:
- `connect()`: ✅ Establishes WebSocket connection
- `disconnect()`: ✅ Closes WebSocket connection

#### **Status**: ✅ **FULLY FUNCTIONAL**

---

## ✅ DENSITY/UI MODE FEATURE

### **Store: `useDensityStore.ts`**

#### **State**:
```typescript
mode: 'stream' | 'focus' | 'break'
isUserTyping: boolean
leftSidebarCollapsed: boolean
```

#### **CRUD Operations**:

| Operation | Method | Status | Implementation |
|-----------|--------|--------|----------------|
| **CREATE** | N/A | N/A | State is initialized |
| **READ** | All state fields | ✅ Working | Direct state access |
| **UPDATE** | `setMode()` | ✅ Working | Changes density mode |
| **UPDATE** | `setUserTyping()` | ✅ Working | Sets typing state |
| **UPDATE** | `toggleLeftSidebar()` | ✅ Working | Toggles sidebar |
| **DELETE** | N/A | N/A | No delete needed |

#### **Status**: ✅ **FULLY FUNCTIONAL**

---

## 🚨 CRITICAL ISSUES

### **1. Tasks: Missing DELETE Functionality** 🔴

**Problem**: Users cannot delete tasks once created

**Impact**: 
- Task list grows indefinitely
- No way to remove completed tasks
- No way to remove mistakes

**Solution Needed**:
```tsx
// Add delete button to TaskPanel
<button onClick={() => removeTask(task.id)}>
  <Trash2 size={14} />
</button>
```

---

### **2. Tasks: Missing EDIT Functionality** 🔴

**Problem**: Users cannot edit task text after creation

**Impact**:
- Typos cannot be fixed
- Tasks cannot be updated
- Must delete and recreate (but delete doesn't work!)

**Solution Needed**:
```tsx
// Add edit mode to TaskPanel
const [editingId, setEditingId] = useState<string | null>(null)

// Double-click to edit
<span onDoubleClick={() => setEditingId(task.id)}>
  {task.text}
</span>

// Or add edit button
<button onClick={() => setEditingId(task.id)}>
  <Edit2 size={14} />
</button>
```

---

### **3. Tasks: Limited Display (Only 3 Tasks)** 🟡

**Problem**: Only first 3 tasks shown: `tasks.slice(0, 3)`

**Impact**:
- Tasks 4+ are hidden
- No way to see all tasks
- No scrolling or pagination

**Solution Options**:

**Option A**: Show all tasks with scrolling
```tsx
<div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
  {tasks.map((task) => (
    // task item
  ))}
</div>
```

**Option B**: Add "Show More" button
```tsx
{tasks.length > 3 && (
  <button onClick={() => setShowAll(!showAll)}>
    Show {showAll ? 'Less' : `${tasks.length - 3} More`}
  </button>
)}
```

**Option C**: Keep 3 visible, add task count indicator
```tsx
<span>Showing 3 of {tasks.length} tasks</span>
```

---

## 📊 CRUD COMPLETENESS MATRIX

| Feature | Create | Read | Update | Delete | Score |
|---------|--------|------|--------|--------|-------|
| **Tasks** | ✅ | ✅ | ⚠️ Partial | ❌ | 50% |
| **Timer** | N/A | ✅ | ✅ | N/A | 100% |
| **Music** | N/A | ✅ | ✅ | N/A | 100% |
| **Density** | N/A | ✅ | ✅ | N/A | 100% |

**Overall CRUD Score**: 87.5% (7/8 operations working)

---

## 🔧 RECOMMENDED FIXES

### **Priority 1: Add Task Delete** 🔴

**File**: `src/components/TaskPanel.tsx`

**Changes**:
1. Import `Trash2` icon from lucide-react
2. Import `removeTask` from store
3. Add delete button to each task item
4. Add confirmation (optional)

**Code**:
```tsx
import { Plus, GripVertical, Trash2 } from 'lucide-react'

const removeTask = useStore((s) => s.removeTask)

// In task item:
<button
  onClick={() => removeTask(task.id)}
  className="opacity-0 group-hover:opacity-100 transition-opacity"
  style={{ color: '#ef4444' }}
  title="Delete task"
>
  <Trash2 size={14} />
</button>
```

---

### **Priority 2: Add Task Edit** 🔴

**File**: `src/components/TaskPanel.tsx`

**Changes**:
1. Import `Edit2` icon from lucide-react
2. Import `updateTask` from store
3. Add edit state management
4. Add inline editing or modal

**Code**:
```tsx
import { Plus, GripVertical, Trash2, Edit2, Check, X } from 'lucide-react'

const updateTask = useStore((s) => s.updateTask)
const [editingId, setEditingId] = useState<string | null>(null)
const [editText, setEditText] = useState('')

const startEdit = (task: Task) => {
  setEditingId(task.id)
  setEditText(task.text)
}

const saveEdit = () => {
  if (editingId && editText.trim()) {
    updateTask(editingId, editText.trim())
    setEditingId(null)
  }
}

const cancelEdit = () => {
  setEditingId(null)
  setEditText('')
}

// In task item:
{editingId === task.id ? (
  <input
    value={editText}
    onChange={(e) => setEditText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') saveEdit()
      if (e.key === 'Escape') cancelEdit()
    }}
    className="flex-1 px-2 py-1 rounded"
    autoFocus
  />
  <button onClick={saveEdit}><Check size={14} /></button>
  <button onClick={cancelEdit}><X size={14} /></button>
) : (
  <>
    <span onDoubleClick={() => startEdit(task)}>{task.text}</span>
    <button onClick={() => startEdit(task)}><Edit2 size={14} /></button>
  </>
)}
```

---

### **Priority 3: Show All Tasks** 🟡

**File**: `src/components/TaskPanel.tsx`

**Option A**: Scrollable list (Recommended)
```tsx
<div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
  {tasks.map((task) => (
    // task item
  ))}
</div>

// Add scrollbar styling
<style>
  .task-list::-webkit-scrollbar {
    width: 4px;
  }
  .task-list::-webkit-scrollbar-thumb {
    background: rgba(250,204,21,0.3);
    border-radius: 2px;
  }
</style>
```

**Option B**: Show more button
```tsx
const [showAll, setShowAll] = useState(false)

{(showAll ? tasks : tasks.slice(0, 3)).map((task) => (
  // task item
))}

{tasks.length > 3 && (
  <button onClick={() => setShowAll(!showAll)}>
    {showAll ? 'Show Less' : `Show ${tasks.length - 3} More`}
  </button>
)}
```

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Critical Fixes** (30 minutes)
1. ✅ Add delete button to tasks
2. ✅ Wire up `removeTask()` action
3. ✅ Test delete functionality

### **Phase 2: Important Fixes** (45 minutes)
4. ✅ Add edit button to tasks
5. ✅ Implement inline editing
6. ✅ Wire up `updateTask()` action
7. ✅ Test edit functionality

### **Phase 3: Enhancement** (15 minutes)
8. ✅ Add scrolling to task list
9. ✅ Style scrollbar
10. ✅ Test with 10+ tasks

**Total Time**: ~90 minutes

---

## 📝 TESTING CHECKLIST

### **Tasks - Create**:
- [ ] Click + button opens input
- [ ] Type task text
- [ ] Press Enter adds task
- [ ] Press Escape cancels
- [ ] Empty text doesn't add task
- [ ] New task appears in list
- [ ] Input clears after adding

### **Tasks - Read**:
- [ ] All tasks display correctly
- [ ] Task text shows properly
- [ ] Completed status shows
- [ ] Progress bar updates
- [ ] Task count accurate

### **Tasks - Update (Toggle)**:
- [ ] Click checkbox toggles status
- [ ] Completed tasks show strikethrough
- [ ] Completed tasks change color
- [ ] Progress bar updates
- [ ] Count updates

### **Tasks - Update (Edit)**:
- [ ] Click edit button starts editing
- [ ] Double-click starts editing
- [ ] Input shows current text
- [ ] Press Enter saves changes
- [ ] Press Escape cancels
- [ ] Changes persist
- [ ] Empty text doesn't save

### **Tasks - Delete**:
- [ ] Delete button appears on hover
- [ ] Click delete removes task
- [ ] Task disappears from list
- [ ] Progress bar updates
- [ ] Count updates
- [ ] Deletion persists

### **Tasks - Display**:
- [ ] Shows all tasks (not just 3)
- [ ] Scrolling works if many tasks
- [ ] Scrollbar styled correctly
- [ ] No layout issues

---

## 🎉 SUMMARY

### **Current State**:
- ✅ Timer: Fully functional
- ✅ Music: Fully functional
- ✅ Density: Fully functional
- ⚠️ Tasks: 50% functional (missing edit/delete)

### **Issues Found**:
1. 🔴 **Critical**: No delete functionality
2. 🔴 **Critical**: No edit functionality
3. 🟡 **Important**: Only 3 tasks visible

### **Recommended Actions**:
1. Add delete button with `removeTask()`
2. Add edit button with `updateTask()`
3. Add scrolling or "show more" for tasks

### **Impact**:
- Better user experience
- Complete CRUD functionality
- Professional task management
- No workarounds needed

---

**Status**: Ready to implement fixes! 🚀

**Estimated Time**: 90 minutes for all fixes

**Priority**: High (missing core functionality)
