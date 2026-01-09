"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Edit2, Trash2, Save, X, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import authClient from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get<{ tasks: Task[]; total: number }>("/tasks");
      setTasks(response.tasks);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setIsCreating(true);
      setError("");

      await api.post<Task>("/tasks", {
        title: newTaskTitle,
        description: newTaskDescription || null,
      });

      setNewTaskTitle("");
      setNewTaskDescription("");
      await fetchTasks();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to create task");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      setError("");

      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
        )
      );

      await api.put<Task>(`/tasks/${task.id}`, {
        is_completed: !task.is_completed,
      });
    } catch (err) {
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id ? { ...t, is_completed: task.is_completed } : t
        )
      );

      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to update task");
      }
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setError("");
      await api.put<Task>(`/tasks/${taskId}`, {
        title: editTitle,
        description: editDescription || null,
      });
      setEditingTaskId(null);
      await fetchTasks();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to update task");
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to delete task");
      }
    }
  };

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="relative min-h-screen overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20" />
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your tasks and track your progress
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <Badge
                variant="secondary"
                className="text-sm md:text-base px-4 py-2 shadow-lg border-2 border-primary/20 backdrop-blur-sm"
              >
                <motion.span
                  key={completedTasks}
                  initial={{ scale: 1.5, color: "hsl(var(--primary))" }}
                  animate={{ scale: 1, color: "currentColor" }}
                  transition={{ duration: 0.3 }}
                >
                  {completedTasks}
                </motion.span>
                {" / "}
                {totalTasks} completed
              </Badge>
            </motion.div>
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 shadow-sm">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Task Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-20 shadow-2xl border-2 border-primary/20 backdrop-blur-sm bg-background/95 overflow-hidden">
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />

              <CardHeader className="pb-4 pt-6">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Plus className="h-6 w-6 text-primary" />
                  </motion.div>
                  New Task
                </CardTitle>
                <CardDescription className="text-sm md:text-base">Create a new task to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-title" className="text-sm font-medium">Title *</Label>
                    <Input
                      id="new-title"
                      placeholder="Enter task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="new-description"
                      placeholder="Add details (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-md" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-2xl border-2 border-primary/20 backdrop-blur-sm bg-background/95 overflow-hidden">
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-primary" />

              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-emerald-600 to-primary bg-clip-text text-transparent">
                  Your Tasks
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {totalTasks === 0
                    ? "No tasks yet"
                    : `${totalTasks} task${totalTasks !== 1 ? "s" : ""} total`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                    <p className="text-sm md:text-base">Loading tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 p-6 mb-4 shadow-lg"
                    >
                      <CheckCircle2 className="h-12 w-12 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold text-lg md:text-xl mb-2">No tasks yet</h3>
                    <p className="text-sm md:text-base text-muted-foreground max-w-sm">
                      Create your first task using the form on the left to get started!
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {tasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          layout
                        >
                          {editingTaskId === task.id ? (
                            <Card className="border-primary border-2 shadow-lg">
                              <CardContent className="pt-6">
                                <div className="space-y-4">
                                  <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Task title"
                                    className="text-base"
                                  />
                                  <Textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Task description"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEdit(task.id)}
                                      className="shadow-md"
                                    >
                                      <Save className="mr-2 h-4 w-4" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card
                              className={cn(
                                "group transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 backdrop-blur-sm relative overflow-hidden",
                                task.is_completed
                                  ? "bg-muted/30 border-emerald-500/30"
                                  : "hover:border-primary/50"
                              )}
                            >
                              {/* Success indicator for completed tasks */}
                              {task.is_completed && (
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"
                                />
                              )}

                              <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                  <motion.button
                                    onClick={() => handleToggleComplete(task)}
                                    className="mt-0.5"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {task.is_completed ? (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                      >
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                      </motion.div>
                                    ) : (
                                      <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                  </motion.button>
                                  <div className="flex-1 min-w-0">
                                    <h3
                                      className={cn(
                                        "font-semibold text-base md:text-lg mb-1",
                                        task.is_completed &&
                                          "line-through text-muted-foreground"
                                      )}
                                    >
                                      {task.title}
                                    </h3>
                                    {task.description && (
                                      <p
                                        className={cn(
                                          "text-sm md:text-base text-muted-foreground leading-relaxed",
                                          task.is_completed && "line-through"
                                        )}
                                      >
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                      <Badge
                                        variant={
                                          task.is_completed ? "success" : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {task.is_completed ? "Completed" : "Pending"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(task.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleStartEdit(task)}
                                        className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
