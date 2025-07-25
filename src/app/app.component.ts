import { Component, OnInit } from '@angular/core';
import { SupabaseService, Todo } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  todos: Todo[] = [];
  newTask: string = '';
  loading: boolean = false;
  editingId: number | null = null;
  editingTask: string = '';
  title = 'todo-app';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadTodos();
  }

  async loadTodos() {
    this.loading = true;
    const { data, error } = await this.supabaseService.getTodos();
    
    if (error) {
      console.error('Error loading todos:', error);
    } else if (data) {
      this.todos = data;
    }
    
    this.loading = false;
  }

  async addTodo() {
    if (!this.newTask.trim()) return;
    
    this.loading = true;
    const { data, error } = await this.supabaseService.createTodo(this.newTask.trim());
    
    if (error) {
      console.error('Error creating todo:', error);
    } else if (data && data[0]) {
      this.todos.unshift(data[0]);
      this.newTask = '';
    }
    
    this.loading = false;
  }

  async toggleComplete(todo: Todo) {
    if (!todo.id) return;
    
    const { data, error } = await this.supabaseService.toggleComplete(todo.id, !todo.completed);
    
    if (error) {
      console.error('Error updating todo:', error);
    } else {
      todo.completed = !todo.completed;
    }
  }

  async deleteTodo(todoId: number) {
    const { error } = await this.supabaseService.deleteTodo(todoId);
    
    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      this.todos = this.todos.filter(todo => todo.id !== todoId);
    }
  }

  startEditing(todo: Todo) {
    this.editingId = todo.id || null;
    this.editingTask = todo.task;
  }

  cancelEditing() {
    this.editingId = null;
    this.editingTask = '';
  }

  async saveEdit(todoId: number) {
    if (!this.editingTask.trim()) return;
    
    const { data, error } = await this.supabaseService.updateTodo(todoId, { 
      task: this.editingTask.trim() 
    });
    
    if (error) {
      console.error('Error updating todo:', error);
    } else {
      const todoIndex = this.todos.findIndex(todo => todo.id === todoId);
      if (todoIndex !== -1) {
        this.todos[todoIndex].task = this.editingTask.trim();
      }
      this.cancelEditing();
    }
  }

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id || index;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  get completedTodos() {
    return this.todos.filter(todo => todo.completed).length;
  }

  get totalTodos() {
    return this.todos.length;
  }
}
