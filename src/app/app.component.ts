import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SupabaseService } from './services/supabase.service';
import { NotificationService } from './notification/notification.service';
import { NotificationComponent } from './notification/notification.component';

export interface Todo {
  id: number;
  text: string;
  is_completed: boolean;
  inserted_at?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('todo-app');
  todos: Todo[] = [];
  newTodoText = '';
  loading = false;
  editingId: number | null = null;
  editingTask = '';
  private todoSubscription!: Subscription;

  constructor(
    private readonly supabase: SupabaseService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getTodos();
    this.todoSubscription = this.supabase.todoChanges.subscribe(async (change) => {
      console.log('Change received!', change);
      await this.getTodos();
      this.notificationService.show('Todo list updated!');
    });
  }

  ngOnDestroy(): void {
    if (this.todoSubscription) {
      this.todoSubscription.unsubscribe();
    }
  }

  async getTodos(): Promise<void> {
    this.loading = true;
    try {
      const todos = await this.supabase.getTodos();
      this.todos = todos || [];
    } catch (error: any) {
      this.notificationService.show(`Error: ${error.message}`, 'error');
    } finally {
      this.loading = false;
    }
  }

  async addTodo(): Promise<void> {
    if (this.newTodoText.trim().length === 0) {
      this.notificationService.show('Todo text cannot be empty.', 'error');
      return;
    }
    try {
      await this.supabase.addTodo(this.newTodoText.trim());
      this.newTodoText = '';
    } catch (error: any) {
      this.notificationService.show(`Error adding todo: ${error.message}`, 'error');
    }
  }

  async updateTodo(todo: Todo): Promise<void> {
    try {
      await this.supabase.updateTodo(todo.id, { is_completed: !todo.is_completed });
    } catch (error: any) {
      this.notificationService.show(`Error updating todo: ${error.message}`, 'error');
    }
  }

  async deleteTodo(id: number): Promise<void> {
    try {
      await this.supabase.deleteTodo(id);
    } catch (error: any) {
      this.notificationService.show(`Error deleting todo: ${error.message}`, 'error');
    }
  }

  startEditing(todo: Todo) {
    this.editingId = todo.id;
    this.editingTask = todo.text;
  }

  cancelEditing() {
    this.editingId = null;
    this.editingTask = '';
  }

  async saveEdit(id: number): Promise<void> {
    if (!this.editingTask.trim()) return;
    try {
      await this.supabase.updateTodo(id, { text: this.editingTask.trim() });
      this.cancelEditing();
    } catch (error: any) {
      this.notificationService.show(`Error updating todo: ${error.message}`, 'error');
    }
  }

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    else if (diffDays === 2) return 'Yesterday';
    else if (diffDays <= 7) return `${diffDays - 1} days ago`;
    else return date.toLocaleDateString();
  }

  get completedTodos() {
    return this.todos.filter(todo => todo.is_completed).length;
  }

  get totalTodos() {
    return this.todos.length;
  }
}
